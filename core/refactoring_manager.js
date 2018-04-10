// refactoring_manager.js
goog.provide('Blockly.RefactoringManager');
goog.require('Blockly.RefactoringUtils');

// isTest is set to true when the instance of refactoring manager is 
// instantiated 
Blockly.RefactoringManager = function(workspace) {
    this.blockSelection = [];
    this.startBlockSelection = null;
    this.endBlockSelection = null;

    this.workspace = workspace;
    // only if vm is not present (for testing locally in scratch-blocks)
    if(window.testSocket){
        this.remoteMsg_ = window.testSocket;// || new TestRemoteMsg(workspace);
        this.workspace.addChangeListener(this.blockListener.bind(this));
    }
};

Blockly.RefactoringManager.prototype.blockListener = function(e) {
    if (['extract_var','extract_procedure'].indexOf(e.type) !== -1) {
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

            // var invMsg = {
            //     'ws_id': ws.id,
            //     'exp_id': expBlock.id,
            //     'type': 'extract_var'
            // };
            // // console.log(invMsg);

            Blockly.Events.fire(new Blockly.Events.ExtractVar(expBlock));

            // Blockly.Events.fire(new Blockly.Events.BlockDelete(block));

            // Blockly.RemoteMsg.sendInvocationInfo(invMsg);
        }, 0);
    }
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
      //create a new array for marked blocks
      if( ws.marks == undefined ) {
        ws.marks = [];
      }
      // don't add duplicates of a block in marked
      if (Blockly.RefactoringUtils.existsIn(block.id, ws.marks) === false) {
        ws.marks.push(expBlock);
      }
      console.log(`Block ${expBlock.id} added to marked`);
    }, 0);
  }
};

Blockly.RefactoringManager.prototype.getStartBlockSelection = function(){
  return this.startBlockSelection;
};

Blockly.RefactoringManager.prototype.getEndBlockSelection = function(){
  return this.endBlockSelection;
};


Blockly.RefactoringManager.prototype.blockStartSelectionCallBack = function(block) {
  var selectedBlock = block;
  
  var ws = selectedBlock.workspace;
  var svgRootOld = selectedBlock.getSvgRoot();
  if (!svgRootOld) {
    throw new Error('selected block is not rendered.');
  }
  
  this.startBlockSelection = selectedBlock;
  console.log(`Select block ${selectedBlock.id} as the start block`);
};

Blockly.RefactoringManager.prototype.blockEndSelectionCallBack = function(block) {
  var selectedBlock = block;
    
  var ws = selectedBlock.workspace;
  var svgRootOld = selectedBlock.getSvgRoot();
  if (!svgRootOld) {
    throw new Error('selected block is not rendered.');
  }
  
  this.endBlockSelection = selectedBlock;
  console.log(`Select block ${selectedBlock.id} as the end block`);
};

Blockly.RefactoringManager.prototype.clearBlockSelectionCallBack = function() {
  this.startBlockSelection = null;
  this.endBlockSelection = null;
  console.log(`clear selection`);
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


Blockly.RefactoringManager.prototype.extractProcedureCallback = function(block) {
    var targetBlockIDs = [];
    targetBlockIDs.push(this.startBlockSelection.id);
    targetBlockIDs.push(this.endBlockSelection.id);

    //check if not expression don't show menu
    console.log("refactoring with local build works!");
    // return function(e) {
        console.log("callback to execute now!");
        setTimeout(function() {
            var ws = block.workspace;
            var svgRootOld = block.getSvgRoot();
                if (!svgRootOld) {
                  throw new Error('expBlock is not rendered.');
                }

            Blockly.Events.fire(new Blockly.Events.ExtractProcedure(ws.id, targetBlockIDs));
        }, 0);
    // }
};