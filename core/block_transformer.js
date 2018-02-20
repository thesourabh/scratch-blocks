goog.provide('Blockly.BlockTransformer');
goog.require('Blockly.RefactoringUtils');

Blockly.BlockTransformer = function(workspace) {
    this.workspace = workspace;
};

Blockly.BlockTransformer.prototype.doTransform = function(seq){
    console.log('Perform transformation');
    console.log(seq);
};
