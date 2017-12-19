'use strict';

goog.provide('Blockly.ContextMenu.Refactoring');

goog.require('Blockly.ContextMenu');



Blockly.ContextMenu.introduceVariableOption = function(block) {
	var introduceVarOption = {
		text : 'Introduce variable',
		enabled : true,
		callback : block.extractExpAndDragCallback()
	};

	return introduceVarOption;
};