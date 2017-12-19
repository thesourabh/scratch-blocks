'use strict';

goog.provide('Blockly.BlockSvg.RefactoringGesture');

goog.require('Blockly.RefactoringManager');
goog.require('Blockly.BlockSvg');
goog.require('Blockly.RefactoringUtils'); 

// a modification of Blockly.BlockSvg.prototype.duplicateAndDragCallback


Blockly.BlockSvg.prototype.extractExpAndDragCallback = function() {
	var expBlock = this;
	return function(e) {
		// Give the context menu a chance to close.
		setTimeout(function() {
			var ws = expBlock.workspace;
			var svgRootOld = expBlock.getSvgRoot();
			if (!svgRootOld) {
				throw new Error('expBlock is not rendered.');
			}
			ws.setResizesEnabled(false);
			
			// declare var

			var json = Blockly.RefactoringUtils.constructNewVariableEventJSON_("temp", workspace.id);
			var varCreateEvent = Blockly.RefactoringUtils.constructNewVariableEvent(json);
			varCreateEvent.run(true);
			
			// create a variable assignment
			
			
			// set var block
			ws.setResizesEnabled(false);
			var setVarBlock = Blockly.RefactoringUtils.createSetVar('temp');
			Blockly.RefactoringUtils.setInputName(setVarBlock, 'VALUE', expBlock);	//this will duplicate

			// replace all expressions with the var
			// idenfity connection
			var parentConnection = expBlock.outputConnection.targetConnection;
			expBlock.unplug(true,true);
			
			var varReadExpBlock = Blockly.RefactoringUtils.createVarRead('temp');
			parentConnection.connect(varReadExpBlock.outputConnection);
			
			
			// The position of the old block in workspace coordinates.
			var expBlockPosWs = expBlock.getRelativeToSurfaceXY();
			
			// delete expBlock
			expBlock.dispose();

			// Place the new block as the same position as the old block.
			// TODO: Offset by the difference between the mouse position and the upper
			// left corner of the block.
			setVarBlock.moveBy(expBlockPosWs.x, expBlockPosWs.y);

			// The position of the old block in pixels relative to the main
			// workspace's origin.
			var expBlockPosPixels = expBlockPosWs.scale(ws.scale);

			// The offset in pixels between the main workspace's origin and the upper left
			// corner of the injection div.
			var mainOffsetPixels = ws.getOriginOffsetInPixels();

			// The position of the old block in pixels relative to the upper left corner
			// of the injection div.
			var finalOffsetPixels = goog.math.Coordinate.sum(mainOffsetPixels,
				expBlockPosPixels);

			var injectionDiv = ws.getInjectionDiv();
			// Bounding rect coordinates are in client coordinates, meaning that they
			// are in pixels relative to the upper left corner of the visible browser
			// window.  These coordinates change when you scroll the browser window.
			var boundingRect = injectionDiv.getBoundingClientRect();

			ws.refactoringManager.inProgress = true;
			console.log('start refactoring');
			// e is not a real mouseEvent/touchEvent/pointerEvent.  It's an event
			// created by the context menu and doesn't have the correct coordinates.
			// But it does have some information that we need.
			var fakeEvent = {
				clientX : finalOffsetPixels.x + boundingRect.left,
				clientY : finalOffsetPixels.y + boundingRect.top,
				type : 'mousedown',
				preventDefault : function() {
					e.preventDefault();
				},
				stopPropagation : function() {
					e.stopPropagation();
				},
				target : e.target
			};
			ws.startDragWithFakeEvent(fakeEvent, setVarBlock);
		}, 0);
	};
};