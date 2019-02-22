
/**
 * Based on Blockly.warning object originally authored by @author fraser@google.com (Neil Fraser)  
 * @fileoverview Object representing a hint.
 */
'use strict';

goog.provide('Blockly.Hint');

goog.require('Blockly.HintBubble');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');


/**
 * Class for a hint.
 * @param {!Blockly.Block} block The block associated with this hint.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Hint = function(block) {
  Blockly.Hint.superClass_.constructor.call(this, block);
  this.createIcon();
  // The text_ object can contain multiple hints.
  this.text_ = {};
};
goog.inherits(Blockly.Hint, Blockly.Icon);

/**
 * Does this icon get hidden when the block is collapsed.
 */
Blockly.Hint.prototype.collapseHidden = false;

/**
 * Draw the hint icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Hint.prototype.drawIcon_ = function(group) {
  // Blockly.utils.createSvgElement('rect',
  //     {
  //       'class': 'blocklyResizeLine',
  //       'x': 0,
  //       'y': 0,
  //       'rx': 2,
  //       'ry': 2,
  //       'width': 10,
  //       'height':10
  //     },
  //     group);  
};


// Override renderIcon from Blocky.Icon so that the comment bubble is
// anchored correctly on the block. This function takes in the top margin
// as an input instead of setting an arbitrary one.
/**
 * Render the icon.
 * @param {number} cursorX Horizontal offset at which to position the icon.
 * @param {number} topMargin Vertical offset from the top of the block to position the icon.
 * @return {number} Horizontal offset for next item to draw.
 * @package
 */
Blockly.Hint.prototype.renderIcon = function(cursorX, topMargin) {
  if (this.collapseHidden && this.block_.isCollapsed()) {
    this.iconGroup_.setAttribute('display', 'none');
    return cursorX;
  }
  this.iconGroup_.setAttribute('display', 'block');

  var width = this.SIZE;
  if (this.block_.RTL) {
    cursorX -= width;
  }
  this.iconGroup_.setAttribute('transform',
      'translate(' + cursorX + ',' + topMargin + ')');
  this.computeIconLocation();
  if (this.block_.RTL) {
    cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
  } else {
    cursorX += width + Blockly.BlockSvg.SEP_SPACE_X;
  }

  return cursorX;
};

/**
 * Create the text for the hint's bubble.
 * @param {string} text The text to display.
 * @return {!SVGTextElement} The top-level node of the text.
 * @private
 */
Blockly.Hint.textToDom_ = function(text) {
  var paragraph = /** @type {!SVGTextElement} */
      (Blockly.utils.createSvgElement(
          'text',
          {
            'class': 'blocklyText blocklyBubbleText',
            'y': Blockly.Bubble.BORDER_WIDTH
          },
          null)
      );
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var tspanElement = Blockly.utils.createSvgElement('tspan',
        {'dy': '1em', 'x': Blockly.Bubble.BORDER_WIDTH}, paragraph);
    var textNode = document.createTextNode(lines[i]);
    tspanElement.appendChild(textNode);
  }
  return paragraph;
};

/**
 * Size this hint's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Hint.prototype.setBubbleSize = function(width, height) {
  if (this.textarea_) {
    this.bubble_.setBubbleSize(width, height);
  } else {
    this.width_ = width;
    this.height_ = height;
  }
};


/**
 * Show or hide the hint bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Hint.prototype.setVisible = function(visible, hintType) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  
  if (visible) {
    // Create the bubble to display all hints.
    var paragraph = Blockly.Hint.textToDom_(this.getText());
    var content = paragraph;
    content = this.createHintIcon_();
    this.bubble_ = new Blockly.HintBubble(
        /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
        content, this.block_.svgPath_, this.iconXY_, null, null);
    // specific for hint
    if (hintType === "edit_procedure") {
      this.bubble_.registerContextMenuCallback(this.showEditContextMenu_.bind(this));
    } else {
      this.bubble_.registerContextMenuCallback(this.showContextMenu_.bind(this));
      this.bubble_.registerMouseOverCallback(this.showCodeHint_.bind(this));
      this.bubble_.registerMouseOutCallback(this.hideCodeHint_.bind(this));
    }

    if (this.block_.RTL) {
      // Right-align the paragraph.
      // This cannot be done until the bubble is rendered on screen.
      var maxWidth = paragraph.getBBox().width;
      for (var i = 0, textElement; textElement = paragraph.childNodes[i]; i++) {
        textElement.setAttribute('text-anchor', 'end');
        textElement.setAttribute('x', maxWidth + Blockly.Bubble.BORDER_WIDTH);
      }
    }
    this.updateColour();
    // Bump the hint into the right location.
    var size = this.bubble_.getBubbleSize();
    this.bubble_.setBubbleSize(size.width, size.height);
  } else {
    // Dispose of the bubble.
    this.bubble_.dispose();
    this.bubble_ = null;
    this.body_ = null;
  }
};

/**
 * Show the context menu for this comment's bubble.
 * @param {!Event} e The mouse event
 * @private
 */
Blockly.Hint.prototype.showEditContextMenu_ = function(e) {
  var menuOptions = [];
  var block = this.block_;
  var _this = this;
  menuOptions.push({
    enabled: true,
    text: Blockly.Msg.EDIT_PROCEDURE,
    callback: function() {
      Blockly.Procedures.editProcedureCallback_(block);
      _this.setVisible(false, "edit_procedure");
    }
  });
  Blockly.ContextMenu.show(e, menuOptions, block.RTL);
};

/**
 * Show the context menu for this comment's bubble.
 * @param {!Event} e The mouse event
 * @private
 */
Blockly.Hint.prototype.showContextMenu_ = function(e) { 
  var menuOptions = [];
  // menuOptions.push(Blockly.ContextMenu.commentDeleteOption(this, Blockly.Msg.DELETE));
  menuOptions.push(Blockly.Hint.hintImproveOption(this));
  menuOptions.push(Blockly.Hint.hintLearnMoreOption(this));

  Blockly.ContextMenu.show(e, menuOptions, this.block_.RTL);
};

Blockly.Hint.prototype.showCodeHint_ = function(e) {
  var event = new Blockly.Events.HintClick(this,"mouseover");
      event.workspaceId = this.block_.workspace.id;
      Blockly.Events.fire(event);
  // this.block_.workspace.highlightBlock(this.block_.id, true);

};
Blockly.Hint.prototype.hideCodeHint_ = function(e) {
  var event = new Blockly.Events.HintClick(this,"mouseout");
      event.workspaceId = this.block_.workspace.id;
      Blockly.Events.fire(event);
  // this.block_.workspace.highlightBlock(this.block_.id, false);

};

/**
 * Make a context menu option for action resolving the hint
 * @param {!Blockly.Hint} hint The hint where the
 *     right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.Hint.hintImproveOption = function(hint) {
  let wsId = hint.block_.workspace.id;
  var hintOption = {
    text: "Help me improve!",
    enabled: true,
    callback: function() {
      console.log("Hint callback to improve get invoked");
      var event = new Blockly.Events.HintClick(hint, "improve_option_click");
      event.workspaceId = wsId;
      Blockly.Events.fire(event);
    }
  };
  return hintOption;
};


/**
 * Make a context menu option for action learn more about the hint
 * @param {!Blockly.Hint} hint The hint where the
 *     right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.Hint.hintLearnMoreOption = function() {
  var hintOption = {
    text: "Learn more",
    enabled: true,
    callback: function() {
      console.log("TODO: call to learn more about this hint")
    }
  };
  return hintOption;
};

Blockly.Hint.prototype.setText = function(text, id) {
  //NOOP
}


Blockly.Hint.prototype.createHintIcon_ = function(){
  let iconGroup_ =  Blockly.utils.createSvgElement('g', {'class': 'blocklyIconGroup'}, null);
  let WIDTH_ = 8*Blockly.BlockSvg.GRID_UNIT;
  let HEIGHT_ = 8*Blockly.BlockSvg.GRID_UNIT;
  let lightbulbSvgPath = '/icons/set-led_yellow.svg';
  var lightbulbSvg = Blockly.utils.createSvgElement(
      'image',
      {
        'width': WIDTH_,
        'height': HEIGHT_
      },
      iconGroup_
    );
  lightbulbSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
  this.block_.workspace.options.pathToMedia + lightbulbSvgPath);

  return iconGroup_;
}

/**
 * Bring the hint to the top of the stack when clicked on.
 * @param {!Event} _e Mouse up event.
 * @private
 */
Blockly.Hint.prototype.bodyFocus_ = function(_e) {
  this.bubble_.promote_();
};

/**
 * Set this hint's text.
 * @param {string} text Hint text (or '' to delete).
 * @param {string} id An ID for this text entry to be able to maintain
 *     multiple hints.
 */
Blockly.Hint.prototype.setText = function(text, id) {
  if (this.text_[id] == text) {
    return;
  }
  if (text) {
    this.text_[id] = text;
  } else {
    delete this.text_[id];
  }
  if (this.isVisible()) {
    this.setVisible(false);
    this.setVisible(true);
  }
};

/**
 * Get this hint's texts.
 * @return {string} All texts concatenated into one string.
 */
Blockly.Hint.prototype.getText = function() {
  var allHins = [];
  for (var id in this.text_) {
    allHins.push(this.text_[id]);
  }
  return allHins.join('\n');
};

/**
 * Dispose of this hint.
 */
Blockly.Hint.prototype.dispose = function() {
  this.block_.hint = null;
  Blockly.Icon.prototype.dispose.call(this);
};


