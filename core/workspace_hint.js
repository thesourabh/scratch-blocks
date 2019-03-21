'use strict';

goog.provide('Blockly.WorkspaceHint');

goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');



Blockly.WorkspaceHint = function (workspace) {
    this.workspace_ = workspace;
};

Blockly.WorkspaceHint.prototype.WIDTH_ = 20;
Blockly.WorkspaceHint.prototype.HEIGHT_ = 20;
Blockly.WorkspaceHint.prototype.MARGIN_TOP_ = 80;
Blockly.WorkspaceHint.prototype.MARGIN_BOTTOM_ = 12;
Blockly.WorkspaceHint.prototype.MARGIN_SIDE_ = 20;
Blockly.WorkspaceHint.prototype.HEIGHT_ = 124;

Blockly.WorkspaceHint.prototype.getId = function () {
    return this.hintData.id;
}

/**
 * To be removed, after Blockly.Hint 
 */
Blockly.WorkspaceHint.prototype.getText = function () {
    return null;
}

Blockly.WorkspaceHint.prototype.setHint = function (hintData) {
    console.log("todo: create hint");
    this.hintData = hintData;
    this.iconGroup_ = this.createHintIcon_();
    this.workspace_.svgGroup_.appendChild(this.iconGroup_);
    this.position();

    Blockly.bindEventWithChecks_(
        this.iconGroup_, 'mousedown', this, this.pathMouseDown_);
};

Blockly.WorkspaceHint.prototype.setVisible = function(visible){
    if(visible){
        if(!this.iconGroup_ && this.hintData){
            this.setHint(this.hintData);
        }
    }else{
        goog.dom.removeNode(this.iconGroup_);
        this.iconGroup_ = null;
    }
}


Blockly.WorkspaceHint.prototype.position = function () {
    this.bottom_ = this.MARGIN_BOTTOM_;
    var metrics = this.workspace_.getMetrics();
    if (!metrics) {
        // There are no metrics available (workspace is probably not visible).
        return;
    }
    if (this.workspace_.RTL) {
        this.left_ = this.MARGIN_SIDE_ + Blockly.Scrollbar.scrollbarThickness;
        if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
            this.left_ += metrics.flyoutWidth;
            if (this.workspace_.toolbox_) {
                this.left_ += metrics.absoluteLeft;
            }
        }
    } else {
        this.left_ = metrics.viewWidth + metrics.absoluteLeft -
            this.WIDTH_ - this.MARGIN_SIDE_ - Blockly.Scrollbar.scrollbarThickness;

        if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
            this.left_ -= metrics.flyoutWidth;
        }
    }

    this.top_ = metrics.absoluteTop + this.MARGIN_TOP_;


    this.iconGroup_.setAttribute('transform',
        'translate(' + this.left_ + ',' + this.top_ + ')');

}

Blockly.WorkspaceHint.prototype.pathMouseDown_ = function(e) {
    var gesture = this.workspace_.getGesture(e);
    if (gesture) {
      gesture.handleWorkspaceHintStart(e, this);
    }
  };

Blockly.WorkspaceHint.prototype.createHintIcon_ = function () {
    let iconGroup_ = Blockly.utils.createSvgElement('g', { 'class': 'blocklyIconGroup' }, null);
    let WIDTH_ = 8 * Blockly.BlockSvg.GRID_UNIT;
    let HEIGHT_ = 8 * Blockly.BlockSvg.GRID_UNIT;
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
        this.workspace_.options.pathToMedia + lightbulbSvgPath);

    return iconGroup_;
}

Blockly.WorkspaceHint.hintImproveOption = function(hint) {
    let wsId = hint.workspace_.id;
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

Blockly.WorkspaceHint.prototype.showContextMenu_ = function (e) {
    var menuOptions = [];
    menuOptions.push(Blockly.WorkspaceHint.hintImproveOption(this));

    Blockly.ContextMenu.show(e, menuOptions, this.workspace_.RTL);

}