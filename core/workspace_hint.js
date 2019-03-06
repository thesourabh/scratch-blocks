'use strict';

goog.provide('Blockly.WorkspaceHint');

goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');



Blockly.WorkspaceHint = function (workspace) {
    this.workspace_ = workspace;
    this.createHint();
};

Blockly.WorkspaceHint.prototype.WIDTH_ = 20;
Blockly.WorkspaceHint.prototype.HEIGHT_ = 20;
Blockly.WorkspaceHint.prototype.MARGIN_TOP_ = 30;
Blockly.WorkspaceHint.prototype.MARGIN_BOTTOM_ = 12;
Blockly.WorkspaceHint.prototype.MARGIN_SIDE_ = 12;
Blockly.WorkspaceHint.prototype.HEIGHT_ = 124;

Blockly.WorkspaceHint.prototype.createHint = function () {
    console.log("todo: create hint");
    this.iconGroup_ = this.createHintIcon_();
    this.workspace_.svgGroup_.appendChild(this.iconGroup_);
    this.position();
    Blockly.bindEventWithChecks_(
        this.iconGroup_, 'mouseup', this,
        function () {
            console.log("clicked");
        }
        // this.iconClick_
    );
};

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
