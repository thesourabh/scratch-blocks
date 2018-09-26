goog.provide('Blockly.BlockTransformer');

Blockly.BlockTransformer = function(workspace) {
    this.workspace = workspace;
};


Blockly.BlockTransformer.prototype.doTransform = function(refactorable){
    console.log(refactorable);
    for (var action of refactorable.transforms){
        this.apply(action);
      }
};

Blockly.BlockTransformer.prototype.apply = function(action){
    const actionType = action.type;
    this[actionType](action);
};

Blockly.BlockTransformer.prototype.VarDeclareAction = function(action){
    console.log(action);
}

Blockly.BlockTransformer.prototype.BlockCreateAction = function(action){
	console.log(action);
};