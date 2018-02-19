// refactoring_manager.js

goog.provide('Blockly.RefactoringManager');

goog.require('Blockly.RefactoringUtils');

Blockly.RefactoringManager = function(){};

Blockly.RefactoringManager.extractExpAndDragCallback = function(block) {
  var expBlock = block;

  //[ ] 1 Util: check if expBlock is an expression block

  //[ ] return UI function: show invalid refactoring invocation

  //[ ] 2 Msg: build a remote request

  //[ ] 3 BlockHandler executes a sequence of transformations

  //4 return a callback function
  	// [ ] extract a list of hard-coded JSON message

  return function(e) {
    // Give the context menu a chance to close.
    setTimeout(function() {
      var ws = expBlock.workspace;
      var svgRootOld = expBlock.getSvgRoot();
      if (!svgRootOld) {
        throw new Error('expBlock is not rendered.');
      }

      var targetBlockPosWs = expBlock.getParent().getRelativeToSurfaceXY();


      // send message to server
      Blockly.RemoteMsg.sendInvocationInfo();

      //get transformation sequence (this will be eventually handled by the server (server response))
      var seq = Blockly.RefactoringUtils.getTestExtractVarTransformSeq(ws.id,expBlock.id);


      Blockly.RefactoringManager.doTransform(seq);

      var varBlock = ws.getBlockById('var_temp_id');
      var targetBlockId = varBlock.getParent().id;

      var movedBlockId = 'set_var_id';
      var targetBlock = ws.getBlockById(targetBlockId);
      var movedBlock = ws.getBlockById(movedBlockId);

      movedBlock.moveBy(targetBlockPosWs.x, targetBlockPosWs.y);
      ws.setResizesEnabled(false);
      //todo: preserve the position of the existing block
      movedBlock.nextConnection.connect(targetBlock.previousConnection);
  // moveBlock.previousConnection.connect(setVarBlock.nextConnection);

      // Blockly.RefactoringUtils.VarDeclare(seq[0]);

      // var setVarBlock = Blockly.RefactoringUtils.VarAssign(seq[1]);

      // var VarReadBlock = Blockly.RefactoringUtils.VarReadBlock(seq[2]);

      // UI logic: needs update
      // The position of the old block in workspace coordinates. (for ui control logic)





      //this is ui logic for initial dragging position of the duplicated block

      // Place the new block as the same position as the old block.
      // TODO: Offset by the difference between the mouse position and the upper
      // left corner of the block.
      // [] hard to separate transformation & ui logic
      // setVarBlock.moveBy(expBlockPosWs.x, expBlockPosWs.y);

      // The position of the old block in pixels relative to the main
      // workspace's origin.
      // var expBlockPosPixels = expBlockPosWs.scale(ws.scale);

      // The offset in pixels between the main workspace's origin and the upper left
      // corner of the injection div.
      // var mainOffsetPixels = ws.getOriginOffsetInPixels();

      // The position of the old block in pixels relative to the upper left corner
      // of the injection div.
      // var finalOffsetPixels = goog.math.Coordinate.sum(mainOffsetPixels,
        // expBlockPosPixels);

      // var injectionDiv = ws.getInjectionDiv();
      // Bounding rect coordinates are in client coordinates, meaning that they
      // are in pixels relative to the upper left corner of the visible browser
      // window.  These coordinates change when you scroll the browser window.
      // var boundingRect = injectionDiv.getBoundingClientRect();

      // ws.refactoringManager.inProgress = true;
      console.log('start refactoring');
      // e is not a real mouseEvent/touchEvent/pointerEvent.  It's an event
      // created by the context menu and doesn't have the correct coordinates.
      // But it does have some information that we need.

      // var fakeEvent = {
      //   clientX : finalOffsetPixels.x + boundingRect.left,
      //   clientY : finalOffsetPixels.y + boundingRect.top,
      //   type : 'mousedown',
      //   preventDefault : function() {
      //     e.preventDefault();
      //   },
      //   stopPropagation : function() {
      //     e.stopPropagation();
      //   },
      //   target : e.target
      // };
      // ws.startDragWithFakeEvent(fakeEvent, setVarBlock);
    }, 0);
  };
};

Blockly.RefactoringManager.doTransform = function(seq){
  Blockly.RefactoringUtils.VarDeclare(seq[0]);

  var setVarBlock = Blockly.RefactoringUtils.VarAssign(seq[1]);

  var VarReadBlock = Blockly.RefactoringUtils.VarReadBlock(seq[2]);

  Blockly.RefactoringUtils.ReplaceValue(seq[3]);

  //snap setVarBlock above a given block id

};

Blockly.RefactoringManager.markBlockForExtraction = function(block) {
  var expBlock = block;
  return function(e) {
    // Give the context menu a chance to close.
    setTimeout(function() {
      var ws = expBlock.workspace;
      var svgRootOld = expBlock.getSvgRoot();
      if (!svgRootOld) {
        throw new Error('expBlock is not rendered.');
      }
      // create a new array for marked blocks
      if( ws.marks == undefined ) {
        ws.marks = [];
      }
      // reset
      if(ws.marks.length == 2){
        ws.marks = undefined;
      }
      if (ws.marks !== undefined){
        // don't add duplicates of a block in marked
        if (Blockly.RefactoringUtils.existsIn(block.id, ws.marks) === false) {
          ws.marks.push(expBlock);
        }
        console.log(`Block ${expBlock.id} added to marked`);
      }
    }, 0);
  }
};

Blockly.RefactoringManager.extractSelectedBlocksCallback = function(block) {
  var expBlock = block;
  return function(e) {
    // Give the context menu a chance to close.
    setTimeout(function() {
      var ws = expBlock.workspace;
      var svgRootOld = expBlock.getSvgRoot();
      if (!svgRootOld) {
        throw new Error('expBlock is not rendered.');
      }
      Blockly.RefactoringUtils.extractMarkedBlocks(expBlock);
    }, 0);
  }
};
