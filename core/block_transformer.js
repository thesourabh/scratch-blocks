goog.provide('Blockly.BlockTransformer');

Blockly.BlockTransformer = function (workspace) {
    this.workspace = workspace;
};


Blockly.BlockTransformer.prototype.doTransform = function (refactorable) {
    // Fire a create event.
      Blockly.Events.setGroup(true);
    try {
        console.log(refactorable);
        for (var action of refactorable.transforms) {
            this.apply(action);
        }
    } finally {
        Blockly.Events.setGroup(false);
    }
    
};

Blockly.BlockTransformer.prototype.apply = function (action) {
    const actionType = action.type;
    this[actionType](action);
};

Blockly.BlockTransformer.prototype.VarDeclareAction = function (action) {
    console.log(action);
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

Blockly.BlockTransformer.prototype.BlockCreateAction = function (action) {
    console.log(action);
    let dom = Blockly.Xml.textToDom(action.block_xml).firstChild;
    let block = Blockly.Xml.domToBlock(dom, this.workspace);
    return true;
};

Blockly.BlockTransformer.prototype.InsertBlockAction = function (action) {
    let targetBlock = this.workspace.getBlockById(action.target_block);
    let insertedBlock = this.workspace.getBlockById(action.inserted_block);
    
    //handle the case when there's a block connected to the block target
    let previousBlock = targetBlock.previousConnection.targetBlock();
    let firstChildOfCBlock = previousBlock.childBlocks_.indexOf(targetBlock)===0; 
    if (previousBlock) {
        if(firstChildOfCBlock){
            previousBlock.getFirstStatementConnection().connect(insertedBlock.previousConnection);
        }else{
            previousBlock.nextConnection.connect(insertedBlock.previousConnection);
        }
    } else {
        // place inserted block close to the postion of the target block to avoid block jump
        let xy = targetBlock.getRelativeToSurfaceXY();
        insertedBlock.moveBy(xy.x, xy.y);
    }
    targetBlock.previousConnection.connect(insertedBlock.nextConnection);
    return true;
};

Blockly.BlockTransformer.prototype.ReplaceAction = function (action) {
    var targetBlock = this.workspace.getBlockById(action.target_block);
    var targetBlockList = action.targetBlockList;
    var replaceWith = this.workspace.getBlockById(action.replace_with);
    // if(!targetBlock){
    // 	return;
    // }
    if (targetBlock) {
        var parentConnection = targetBlock.outputConnection.targetConnection;
        targetBlock.unplug(true, true);
        parentConnection.connect(replaceWith.outputConnection);
        // delete old value
        targetBlock.dispose();
    }

    //todo handle when targetBlockList has one block to replace (e.g. if block)
    if (targetBlockList) {
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
        let nextBlock = lastBlock.nextConnection.targetBlock();
        if (nextBlock) {
            let nextConn = lastBlock.nextConnection.targetBlock().previousConnection;
            lastBlock.unplug(); //must be unplugged before nextConn can connect to the inserted block
            insertedBlock.nextConnection.connect(nextConn);
        }

        // dispose the fragment
        while (targetBlocks.length > 0) {
            var toDispose = targetBlocks.pop();
            toDispose.dispose();
        }

    }

};