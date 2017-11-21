'use strict'; 
 
goog.require('goog.testing'); 
goog.require('goog.testing.MockControl'); 
 
var mockControl_; 
var workspace; 
 
function test_setUp() { 
  workspace = new Blockly.Workspace(); 
  mockControl_ = new goog.testing.MockControl(); 
}

function test_setUpWithMockBlocks() { 
 test_setUp(); 
 workspace = new Blockly.Workspace(); 
  
 Blockly.defineBlocksWithJsonArray([{ 
  "type": 'some_block' 
  }]); 
  
}
 
function test_tearDown() { 
  mockControl_.$tearDown(); 
  workspace.dispose(); 
} 
 
function test_tearDownWithMockBlocks() { 
  test_tearDown(); 
  delete Blockly.Blocks['some_block']; 
}

function test_variableDeclationEvent() { 
  test_setUpWithMockBlocks();
  var block = new Blockly.Block(workspace, 'some_block'); 
  var transformationsSeq = Blockly.RefactorUtils.introduceVariable(block);
  
  Blockly.RefactorUtils.performTransformation(transformationsSeq); 
  var allVars = workspace.getAllVariables(); 
  assertEquals("should find a variable temp", 1, allVars.length); 
  test_tearDownWithMockBlocks(); 
} 
 
