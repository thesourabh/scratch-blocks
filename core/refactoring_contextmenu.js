'use strict';

goog.provide('Blockly.ContextMenu.Refactoring');

goog.require('Blockly.ContextMenu');



Blockly.ContextMenu.introduceVariableOption2 = function(block) {
	var introduceVarOption = {
		text : 'Introduce variable',
		enabled : true,
		callback : function() {
			console.log('TODO introduce variable');
			var transformationSeq = Blockly.RefactoringUtils.introduceVariable(block);
			Blockly.RefactoringUtils.performTransformation(transformationSeq);
		}
	};

	return introduceVarOption;
};

Blockly.ContextMenu.introduceVariableOption = function(block) {
	var introduceVarOption = {
		text : 'Introduce variable',
		enabled : true,
		callback : block.extractExpAndDragCallback()
	};

	return introduceVarOption;
};