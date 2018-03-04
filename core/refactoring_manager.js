// refactoring_manager.js
goog.provide('Blockly.RefactoringManager');
goog.require('Blockly.RefactoringUtils');
goog.require('TestRemoteMsg');

// isTest is set to true when the instance of refactoring manager is 
// instantiated 
Blockly.RefactoringManager = function(workspace, isTest) {
    this.isTest = isTest;
    this.workspace = workspace;
    // only if vm is not present (for testing locally in scratch-blocks)
    if(isTest){
        this.remoteMsg_ = new TestRemoteMsg(workspace);
        this.workspace.addChangeListener(this.blockListener.bind(this));
    }
};

Blockly.RefactoringManager.prototype.blockListener = function(e) {
    if (['extract_var'].indexOf(e.type) !== -1) {
        console.log(e);

        let targets = {};
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        var xmlString = Blockly.Xml.domToPrettyText(xml);
        targets['_stage_'] = xmlString; 
        e['targets'] =  targets;
        this.remoteMsg_.sendEvent(e);
    }
};

Blockly.RefactoringManager.extractVarCallback = function(block) {
    var expBlock = block;
    //check if not expression don't show menu
    console.log("refactoring with local build works!");
    return function(e) {
        console.log("callback to execute now!");
        setTimeout(function() {
            var ws = expBlock.workspace;
            var svgRootOld = expBlock.getSvgRoot();
                if (!svgRootOld) {
                  throw new Error('expBlock is not rendered.');
                }
            // var targetBlockPosWs = expBlock.getParent().getRelativeToSurfaceXY();

            var invMsg = {
                'ws_id': ws.id,
                'exp_id': expBlock.id,
                'type': 'extract_var'
            };
            // console.log(invMsg);

            Blockly.RefactoringUtils.test();

            Blockly.Events.fire(new Blockly.Events.ExtractVar(expBlock));

            // Blockly.Events.fire(new Blockly.Events.BlockDelete(block));

            // Blockly.RemoteMsg.sendInvocationInfo(invMsg);
        }, 0);
    }
};
// Blockly.RefactoringManager.extractExpAndDragCallback = function(block) {
//   var expBlock = block;
//   //[ ] 1 Util: check if expBlock is an expression block
//   //[ ] return UI function: show invalid refactoring invocation
//   //[ ] 2 Msg: build a remote request
//   //[ ] 3 BlockHandler executes a sequence of transformations
//   //4 return a callback function
//    // [ ] extract a list of hard-coded JSON message
//   return function(e) {
//     // Give the context menu a chance to close.
//     setTimeout(function() {
//       var ws = expBlock.workspace;
//       var svgRootOld = expBlock.getSvgRoot();
//       if (!svgRootOld) {
//         throw new Error('expBlock is not rendered.');
//       }
//       var targetBlockPosWs = expBlock.getParent().getRelativeToSurfaceXY();
//       // send message to server
//       var invMsg = {
//         'ws_id' : ws.id,
//         'exp_id' : expBlock.id,
//         'type' : 'extract_var'
//       };
//       Blockly.RemoteMsg.sendInvocationInfo(invMsg);
//       //get transformation sequence (this will be eventually handled by the server (server response))
//       var seq = Blockly.RefactoringUtils.getTestExtractVarTransformSeq(ws.id,expBlock.id);
//       Blockly.RefactoringManager.doTransform(seq);
//       var varBlock = ws.getBlockById('var_temp_id');
//       var targetBlockId = varBlock.getParent().id;
//       var movedBlockId = 'set_var_id';
//       var targetBlock = ws.getBlockById(targetBlockId);
//       var movedBlock = ws.getBlockById(movedBlockId);
//       movedBlock.moveBy(targetBlockPosWs.x, targetBlockPosWs.y);
//       ws.setResizesEnabled(false);
//       //todo: preserve the position of the existing block
//       movedBlock.nextConnection.connect(targetBlock.previousConnection);
//     }, 0);
//   };
// };
// Blockly.RefactoringManager.doTransform = function(seq){
//   Blockly.RefactoringUtils.VarDeclare(seq[0]);
//   var setVarBlock = Blockly.RefactoringUtils.VarAssign(seq[1]);
//   var VarReadBlock = Blockly.RefactoringUtils.VarReadBlock(seq[2]);
//   Blockly.RefactoringUtils.ReplaceValue(seq[3]);
//   //snap setVarBlock above a given block id
// };
// Blockly.RefactoringManager.markBlockForExtraction = function(block) {
//   var expBlock = block;
//   return function(e) {
//     // Give the context menu a chance to close.
//     setTimeout(function() {
//       var ws = expBlock.workspace;
//       var svgRootOld = expBlock.getSvgRoot();
//       if (!svgRootOld) {
//         throw new Error('expBlock is not rendered.');
//       }
//       //create a new array for marked blocks
//       if( ws.marks == undefined ) {
//         ws.marks = [];
//       }
//       // don't add duplicates of a block in marked
//       if (Blockly.RefactoringUtils.existsIn(block.id, ws.marks) === false) {
//         ws.marks.push(expBlock);
//       }
//       console.log(`Block ${expBlock.id} added to marked`);
//     }, 0);
//   }
// };
// Blockly.RefactoringManager.extractSelectedBlocksCallback = function(block) {
//   var expBlock = block;
//   return function(e) {
//     // Give the context menu a chance to close.
//     setTimeout(function() {
//       var ws = expBlock.workspace;
//       var svgRootOld = expBlock.getSvgRoot();
//       if (!svgRootOld) {
//         throw new Error('expBlock is not rendered.');
//       }
//       Blockly.RefactoringUtils.extractMarkedBlocks(expBlock);
//     }, 0);
//   }
// };