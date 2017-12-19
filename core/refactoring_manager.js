/**
 * 
 */


goog.provide('Blockly.RefactoringManager');


/**
 * Class for refactoring manager.
 * @param {Object} target_blocks List of blocks that are the refactoring invocation target
 * @constructor
 */

Blockly.RefactoringManager = function(target_blocks){
  this.target_blocks = target_blocks;
  this.current_invocation = null;  //what refactoring
  this.inProgress = false;
};

Blockly.RefactoringManager.prototype.isValid = function(target){
	return true;
};

Blockly.RefactoringManager.prototype.queryPostCondition = function(target){
	if(target.type.includes('move')){
		return true;
	}
	
	return false;
};