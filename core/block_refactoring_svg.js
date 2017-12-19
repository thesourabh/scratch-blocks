'use strict';

goog.provide('Blockly.BlockSvg.RefactoringGesture');

goog.require('Blockly.RefactoringManager');
goog.require('Blockly.BlockSvg');
goog.require('Blockly.RefactorUtils'); 
/*
 * need to extend block_svg.js
 * 
 */



// A flyout connected to a workspace doesn't have its own current gesture.
//	this.workspace.getGesture = this.targetWorkspace_.getGesture.bind(this.targetWorkspace_);

// Blockly.BlockSvg.prototype.duplicateAndDragCallback_ = function() {


Blockly.BlockSvg.prototype.CtrlDrag = function() {};


Blockly.BlockSvg.prototype.extractExpAndDragCallback = function() {
	var oldBlock = this;
	return function(e) {
		// Give the context menu a chance to close.
		setTimeout(function() {
			console.log("let's do the drag");
			
			var ws = oldBlock.workspace;
			var svgRootOld = oldBlock.getSvgRoot();
			if (!svgRootOld) {
				throw new Error('oldBlock is not rendered.');
			}

			// declare var
			var transformationSeq = Blockly.RefactorUtils.introduceVariable(oldBlock);
			Blockly.RefactorUtils.performTransformation(transformationSeq);
			
			// create a variable assignment
			ws.setResizesEnabled(false);
			
			var blockDom = Blockly.RefactorUtils.addVarBlock();
			
			var newBlock = Blockly.Xml.domToBlock(blockDom, ws);
			newBlock.setFieldValue('temp','VARIABLE');
			
			// Scratch-specific: Give shadow dom new IDs to prevent duplicating on paste
			// Blockly.utils.changeObscuredShadowIds(newBlock);

			var svgRootNew = newBlock.getSvgRoot();
			if (!svgRootNew) {
				throw new Error('newBlock is not rendered.');
			}

			// The position of the old block in workspace coordinates.
			var oldBlockPosWs = oldBlock.getRelativeToSurfaceXY();

			// Place the new block as the same position as the old block.
			// TODO: Offset by the difference between the mouse position and the upper
			// left corner of the block.
			newBlock.moveBy(oldBlockPosWs.x, oldBlockPosWs.y);

			// The position of the old block in pixels relative to the main
			// workspace's origin.
			var oldBlockPosPixels = oldBlockPosWs.scale(ws.scale);

			// The offset in pixels between the main workspace's origin and the upper left
			// corner of the injection div.
			var mainOffsetPixels = ws.getOriginOffsetInPixels();

			// The position of the old block in pixels relative to the upper left corner
			// of the injection div.
			var finalOffsetPixels = goog.math.Coordinate.sum(mainOffsetPixels,
				oldBlockPosPixels);

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
			ws.startDragWithFakeEvent(fakeEvent, newBlock);
		}, 0);
	};
};