
/**
 * Based on Blockly.warning object originally authored by @author fraser@google.com (Neil Fraser)  
 * @fileoverview Object representing a hint.
 */
'use strict';

goog.provide('Blockly.Hint');

goog.require('Blockly.Bubble');
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
  // Triangle with rounded corners.
  Blockly.utils.createSvgElement('path',
      {
        'class': 'blocklyIconShape',
        'd': 'M2,15Q-1,15 0.5,12L6.5,1.7Q8,-1 9.5,1.7L15.5,12Q17,15 14,15z'
      },
      group);
  // Can't use a real '!' text character since different browsers and operating
  // systems render it differently.
  // Body of exclamation point.
  Blockly.utils.createSvgElement('path',
      {
        'class': 'blocklyIconSymbol',
        'd': 'm7,4.8v3.16l0.27,2.27h1.46l0.27,-2.27v-3.16z'
      },
      group);
  // Dot of exclamation point.
  Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyIconSymbol',
        'x': '7',
        'y': '11',
        'height': '2',
        'width': '2'
      },
      group);
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
 * Show or hide the hint bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Hint.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  Blockly.Events.fire(
      new Blockly.Events.Ui(this.block_, 'warningOpen', !visible, visible));
  if (visible) {
    // Create the bubble to display all hints.
    var paragraph = Blockly.Hint.textToDom_(this.getText());
    this.bubble_ = new Blockly.Bubble(
        /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
        paragraph, this.block_.svgPath_, this.iconXY_, null, null);
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
