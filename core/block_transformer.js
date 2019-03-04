goog.provide('Blockly.BlockTransformer');

Blockly.BlockTransformer = function (workspace) {
    this.workspace = workspace;
};


Blockly.BlockTransformer.prototype.doTransform = function (refactorable) {
    for (var action of refactorable.transforms) {
        try {
            this.apply(action);
            Blockly.Events.fireNow_();
        } catch (err) {
            throw "failed to apply transformation:" +
            JSON.stringify(action)
            + "\n" + err.message;
        }
    }
};

Blockly.BlockTransformer.prototype.executeAction = function (action) {
    let result = true;
    try {
        result = this.apply(action);
    } catch (err) {
        throw "failed to apply transformation:" +
        JSON.stringify(action)
        + "\n" + err.message;
    }
    return result;
};

Blockly.BlockTransformer.prototype.apply = function (action) {
    const actionType = action.type;
    return this[actionType](action);
};

Blockly.BlockTransformer.prototype.VarDeclareAction = function (action) {
    let varCreateJson = {
        type: "var_create",
        varType: "",
        varName: action.name,
        varId: action.id
    };

    let varCreateEvent = new Blockly.Events.VarCreate(null);
    varCreateEvent.fromJson(varCreateJson);
    varCreateEvent.workspaceId = this.workspace.id;
    varCreateEvent.run(true);
    return true;
}

Blockly.BlockTransformer.prototype.VarRename = function (action) {
    let varRenameJson = {
        type: "var_rename",
        varId: action.id,
        oldName: action.oldName,
        newName: action.newName
    };

    let varRenameEvent = new Blockly.Events.VarRename(null);
    varRenameEvent.fromJson(varRenameJson);
    varRenameEvent.workspaceId = this.workspace.id;
    varRenameEvent.run(true);
    return true;
}

Blockly.BlockTransformer.prototype.BlockCreateAction = function (action) {
    let dom = Blockly.Xml.textToDom(action.block_xml).firstChild;
    let block = Blockly.Xml.domToBlock(dom, this.workspace);
    if (block.type === "procedures_definition") {
      return block;
      // Blockly.Procedures.editProcedureCallback_(block);
    }
    return true
};

Blockly.BlockTransformer.prototype.InsertBlockAction = function (action) {
    Blockly.Events.setGroup(true);
    try {
        let targetBlock = this.workspace.getBlockById(action.target_block);
        let insertedBlock = this.workspace.getBlockById(action.inserted_block);
        let previousBlock = targetBlock.previousConnection.targetBlock();
        
        let moveEventJsonSpec = null;

        if(!action.before_target){
            moveEventJsonSpec = {
                type: "move",
                blockId: action.inserted_block,
                newParentId: targetBlock.id
            }
        }
        
        if (previousBlock &&action.before_target) {
            let newInputName = previousBlock.getInputWithBlock(targetBlock)? previousBlock.getInputWithBlock(targetBlock).name:"";
            moveEventJsonSpec = {
                type: "move",
                blockId: action.inserted_block,
                newParentId: previousBlock.id,
                newInputName: newInputName
            }
           
        }
        if(!previousBlock &&action.before_target) { //target block is the top block
            let targetBlockXY = targetBlock.getRelativeToSurfaceXY();
            // first move the inserted block close to the target first to prevent existing block jumping to connect to the new inserted block
            let moveCloseToTargetEventJsonSpec = {
                type: "move",
                blockId: action.inserted_block,
                newCoordinate: targetBlockXY.x + "," + targetBlockXY.y
            }
            let moveBlockToTargetEvent = new Blockly.Events.Move(null);
            moveBlockToTargetEvent.fromJson(moveCloseToTargetEventJsonSpec);
            moveBlockToTargetEvent.workspaceId = this.workspace.id;
            moveBlockToTargetEvent.run(true);

            moveEventJsonSpec = {
                type: "move",
                blockId: targetBlock.id,
                newParentId: action.inserted_block
            }           
        }

         let moveBlockEvent = new Blockly.Events.Move(null);
            moveBlockEvent.fromJson(moveEventJsonSpec);
            moveBlockEvent.workspaceId = this.workspace.id;
            moveBlockEvent.run(true);

    } finally {
        Blockly.Events.setGroup(false);
    }

    //TODO: when previous block is null because the inserted block become the top block
    // place inserted block close to the postion of the target block to avoid block jump 
    return true;
};

Blockly.BlockTransformer.prototype.ReplaceSeqAction = function (action) {
    let action2 = {};
    action2.targetBlockList = action.target_blocks;
    action2.replace_with = action.replace_with;
    this.ReplaceAction(action2);
}

Blockly.BlockTransformer.prototype.ReplaceAction = function (action) {
    Blockly.Events.setGroup(true);
    var targetBlock = this.workspace.getBlockById(action.target_block);
    var replaceWith = this.workspace.getBlockById(action.replace_with);
    if (targetBlock) { //replacing expression input of block
        try {
            if (targetBlock) {
                var parentConnection = targetBlock.outputConnection.targetConnection;
                // targetBlock.unplug(true, true);
                parentConnection.connect(replaceWith.outputConnection);
                // delete old value
                targetBlock.dispose();
            }
        } finally {
            Blockly.Events.setGroup(false);
        }
    }

    var targetBlockList = action.targetBlockList;
    //todo handle when targetBlockList has one block to replace (e.g. if block)
    if (targetBlockList) {  // replacing sequence of statements
        try {
            var targetBlocks = [];
            for (var blockID of targetBlockList) {
                targetBlocks.push(this.workspace.getBlockById(blockID));
            }

            //get previous conn of top most block
            var topmostBlock = targetBlocks[0];

            let targetBlock = topmostBlock;
            let insertedBlock = replaceWith;

            //handle the case when there's a block connected to the block target
            // let previousBlock = targetBlock.previousConnection.targetBlock();
            let prevConn = targetBlock.previousConnection.targetConnection;
            if (prevConn) {
                prevConn.connect(insertedBlock.previousConnection);
            } else {
                // place inserted block close to the postion of the target block to avoid block jump
                let xy = targetBlock.getRelativeToSurfaceXY();
                insertedBlock.moveBy(xy.x, xy.y);
            }

            // unplug bottom block
            let lastBlock = targetBlocks[targetBlocks.length - 1];

            // the block after the replaced fragment
            if(lastBlock.nextConnection){
                let nextBlock = lastBlock.nextConnection.targetBlock();
                if (nextBlock) {
                    let nextConn = lastBlock.nextConnection.targetBlock().previousConnection;
                    lastBlock.unplug(); //must be unplugged before nextConn can connect to the inserted block
                    insertedBlock.nextConnection.connect(nextConn);
                }
            }
            // dispose the fragment
            while (targetBlocks.length > 0) {
                var toDispose = targetBlocks.pop();
                toDispose.dispose();
            }
        } finally {
            Blockly.Events.setGroup(false);
        }
    }

};

// Blockly.Workspace.prototype.createVariable
// Blockly.Workspace.prototype.deleteVariableById