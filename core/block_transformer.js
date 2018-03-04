goog.provide('Blockly.BlockTransformer');
goog.require('Blockly.RefactoringUtils');

Blockly.BlockTransformer = function(workspace) {
    this.workspace = workspace;
};

const testResp = {
  "type": "transformation",
  "body": [
    {
      "name": "tempVar1",
      "ID": "fec8d3a8-a596-4cc0-8cca-c762d380bbd4",
      "target": "_stage_",
      "type": "VarDeclareAction"
    },
    {
      "blockXML": "<xml><block type=\"data_setvariableto\" id=\"24331d30-c862-4a40-98d1-f50a3e59083a\" x=\"0\" y=\"0\"><field name=\"VARIABLE\" id=\"fec8d3a8-a596-4cc0-8cca-c762d380bbd4\" variabletype=\"\">tempVar1</field><value name=\"VALUE\"><block type=\"operator_add\" id=\"]|^dno=m}Q;s+OH0mdtb\" x=\"0\" y=\"0\"><value name=\"NUM1\"><shadow type=\"math_number\"><field name=\"NUM\">0</field></shadow></value><value name=\"NUM2\"><shadow type=\"math_number\"><field name=\"NUM\">0</field></shadow></value></block></value></block></xml>",
      "type": "BlockCreateAction"
    },
    {
      "targetBlock": "gbqn5F}D3e!PPSG59$+G",
      "insertedBlock": "24331d30-c862-4a40-98d1-f50a3e59083a",
      "type": "InsertBlockAction"
    },
    {
      "targetBlock": "]|^dno=m}Q;s+OH0mdtb",
      "replaceWith": "2cc8a777-9ad4-4157-b2a9-d597de0f496c",
      "type": "ReplaceAction"
    }
  ]
};


Blockly.BlockTransformer.prototype.doTransform = function(resp){
    resp = resp || testResp;
    console.log('Perform transformation');
    console.log(resp);

    // current structure : resp = {"type": refactoring, "body": {"type": "trasformation", "body": [{action1}, {action2}]}}
    // perhaps change to resp = {"type": "", "content": {"type": "", "trans": {}}}
    const actions = JSON.parse(resp["body"])["body"];
	this.varDeclareAction(actions[0]);
	this.blockCreateAction(actions[1]);
	this.insertBlockAction(actions[2]);
  this.blockCreateAction(actions[3]);
  this.replaceAction(actions[4]);
};

Blockly.BlockTransformer.prototype.varDeclareAction = function(action){
	let varCreateJson = {
		type : "var_create",
		varType : "",
		varName : action.name,
		varId : action.ID
	};

	let varCreateEvent = new Blockly.Events.VarCreate(null);
	varCreateEvent.fromJson(varCreateJson);
	varCreateEvent.workspaceId = this.workspace.id;
	varCreateEvent.run(true);
};

// put in a temporary place in the workspace (0,0)?
Blockly.BlockTransformer.prototype.blockCreateAction = function(action){
	let dom = Blockly.Xml.textToDom(action.blockXML).firstChild;
	let block = Blockly.Xml.domToBlock(dom, this.workspace);
};


Blockly.BlockTransformer.prototype.insertBlockAction = function(action){
	let targetBlock = this.workspace.getBlockById(action.targetBlock);
	let insertedBlock = this.workspace.getBlockById(action.insertedBlock);
	targetBlock.previousConnection.connect(insertedBlock.nextConnection);

	//handle the case when there's a block connected to the block target
};


Blockly.BlockTransformer.prototype.replaceAction = function(action){
  var targetBlock = this.workspace.getBlockById(action.targetBlock);
  var replaceWith = this.workspace.getBlockById(action.replaceWith);

  var parentConnection = targetBlock.outputConnection.targetConnection;
  targetBlock.unplug(true,true);

  parentConnection.connect(replaceWith.outputConnection);

  // delete old value
  targetBlock.dispose();
};
