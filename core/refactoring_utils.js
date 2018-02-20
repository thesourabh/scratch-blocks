'use strict';

goog.provide('Blockly.RefactoringUtils');
goog.require('Blockly.utils');
goog.require('Blockly.Xml');
goog.require('Blockly.Events');
goog.require('Blockly.Connection');

Blockly.RefactoringUtils.test = function(){
	console.log("RefactoringUtils");
};

Blockly.RefactoringUtils.introduceVariable = function(block) {
	console.log("calling Blockly.RefactoringUtils");
	//analyze and generate sequence of transformation as Blockly.Events

	var transformations = [];
	//hard-coded

	var varCreateEvent = this.constructNewVariableEventJSON_("temp", block.workspace.id);
	transformations.push(varCreateEvent);

	//TODO: insert variable set before its usage
	//     Blockly.Refactoring.setVarToBlockExp

	//make a call to refactoring support to get sequence of transformation
	//execute the transformation

	return transformations;
};

Blockly.RefactoringUtils.constructNewVariableEventJSON_ = function(name, wsId) {
	var varCreateJson = {
		type : "var_create",
		varType : "",
		varName : name,
		varId : Blockly.utils.genUid(),
		workspaceId : wsId
	};
	return varCreateJson;
};

Blockly.RefactoringUtils.constructNewVariableEvent = function(varCreateJson) {
	var varCreateEvent = new Blockly.Events.VarCreate(null);
	varCreateEvent.fromJson(varCreateJson);
	varCreateEvent.workspaceId = varCreateJson.workspaceId;
	return varCreateEvent;
};

Blockly.RefactoringUtils.performTransformation = function(transformationSeq) {
	for (var ei = 0; ei < transformationSeq.length; ei++) {
		var transformationEvent = null;
		if (transformationSeq[ei].type == 'var_create') {
			transformationEvent = this.constructNewVariableEvent(transformationSeq[ei]);
		}
		if (transformationEvent == null) {
			return; //unknown transformation event
		}
		transformationEvent.run(true); //forward
	}
};

// // todo: supply with variable for the shadow menu option
// // todo: make it generalizable as addBlock
Blockly.RefactoringUtils.addVarBlock = function(varName, blockId) {
	var id = blockId || Blockly.utils.genUid();
	var fieldId = Blockly.utils.genUid();
	fieldId = "";
	var blockText = `<xml><block type="data_setvariableto" id="${id}" gap="20">
		<field name="VARIABLE" id="${fieldId}" variabletype="">${varName}</field>
	<value name="VALUE">
		<shadow type="text">
			<field name="TEXT">0</field>
		</shadow>
	</value>
</block></xml>`;

	var block = Blockly.Xml.textToDom(blockText).firstChild;
	return block;
};


Blockly.RefactoringUtils.removeInput = function(blockInput) {
	//check if shadow block
	if (blockInput.isShadow()) {
		var parentBlock = blockInput.getParent();
		var parentConnection = Blockly.Connection.singleConnection_(parentBlock, blockInput);
		var shadowDom = parentConnection.getShadowDom();
		// Temporarily set the shadow DOM to null so it does not respawn.
		parentConnection.setShadowDom(null);

		//		Blockly.Events.setGroup(true);
		var event = new Blockly.Events.BlockMove(blockInput);
		event.run(true);
		blockInput.dispose();
		//		Blockly.Events.setGroup(false);
		// Restore the shadow DOM.
		parentConnection.setShadowDom(shadowDom);
	}
};


Blockly.RefactoringUtils.removeInputName = function(blockParent, inputName) {
	var blockInput = blockParent.getInputTargetBlock(inputName);
	this.removeInput(blockInput);
};

Blockly.RefactoringUtils.setInputName = function(parentBlock, inputName, childBlock, noInputReplicate) {
   // console.log("calling atmosphere: "+Blockly.RemoteMsg.info);
	//	childBlock = childBlock || Blockly.Xml.blockToDomWithXY(Blockly.selected);
	//	console.log(childBlock);
	var workspace = parentBlock.workspace;

	Blockly.Events.setGroup(true);

	childBlock = childBlock || this.createTestExpBlock();


	if(!noInputReplicate){
		// duplicate expression block
		var xml = Blockly.Xml.blockToDom(childBlock);
		workspace.setResizesEnabled(false);
		childBlock = Blockly.Xml.domToBlock(xml, workspace);
	}

	//	Blockly.RefactoringUtils.removeInputName(parentBlock, inputName);

	var evt = new Blockly.Events.BlockMove(childBlock);
	var json = {
		blockId : childBlock.id,
		newParentId : parentBlock.id,
		newInputName : inputName
	};
	evt.fromJson(json);
	evt.run(true);

	Blockly.Events.setGroup(false);

};

Blockly.RefactoringUtils.createTestExpBlock = function() {
	var xml = `<xml><block type="operator_add" id="ab"><value name="NUM1"><shadow type="math_number" id="8f|x6*:cfUhX$U?11K;4"><field name="NUM"></field></shadow></value><value name="NUM2"><shadow type="math_number" id="F5^}i3t|h:njN?1Oz*#^"><field name="NUM"></field></shadow></value></block></xml>`;
	var dom = Blockly.Xml.textToDom(xml).firstChild;
	return Blockly.Xml.domToBlock(dom, workspace);
};

Blockly.RefactoringUtils.createTestProgram = function(workspace) {
	var text = `<xml xmlns="http://www.w3.org/1999/xhtml">
  <variables></variables>
  <block type="motion_movesteps" id="motion_block" x="67" y="140">
    <value name="STEPS">
      <shadow type="math_number" id="num_shadow1">
        <field name="NUM">10</field>
      </shadow>
      <block type="operator_add" id="operator_exp_block">
        <value name="NUM1">
          <shadow type="math_number" id="num_shadow2">
            <field name="NUM">3</field>
          </shadow>
        </value>
        <value name="NUM2">
          <shadow type="math_number" id="num_shadow3">
            <field name="NUM">4</field>
          </shadow>
        </value>
      </block>
    </value>
  </block>
</xml>`;

	var xml = Blockly.Xml.textToDom(text);
	Blockly.Xml.domToWorkspace(xml, workspace);
};

// how to create a program
Blockly.RefactoringUtils.createSimpleProgram = function(workspace) {
	var text = `<xml xmlns="http://www.w3.org/1999/xhtml">
                <variables></variables>
                <block type="event_whenflagclicked" id="abc1" x="165" y="160">
                  <next>
                  <block type="motion_pointindirection" id="abc2">
                    <value name="DIRECTION">
                      <shadow type="math_angle" id="abc3">
                        <field name="NUM">90</field>
                      </shadow>
                    </value>
                  </block>
                  </next>
                </block>
              </xml> `;

	var xml = Blockly.Xml.textToDom(text);
	Blockly.Xml.domToWorkspace(xml, workspace);
};

Blockly.RefactoringUtils.createTestProgramForExtractVar = function(workspace) {
		var text = `<xml xmlns="http://www.w3.org/1999/xhtml">
  <variables></variables>
  <block type="event_whenflagclicked" id="when_flag_clicked_1" x="179" y="-170">
    <next>
      <block type="motion_movesteps" id="move_steps_1">
        <value name="STEPS">
          <block type="operator_add" id="operator_add_1">
            <value name="NUM1">
              <shadow type="math_number" id="math_num_1">
                <field name="NUM">1</field>
              </shadow>
            </value>
            <value name="NUM2">
              <shadow type="math_number" id="math_num_2">
                <field name="NUM">2</field>
              </shadow>
            </value>
          </block>
        </value>
      </block>
    </next>
  </block>
</xml>`;

	var xml = Blockly.Xml.textToDom(text);
	Blockly.Xml.domToWorkspace(xml, workspace);
};


Blockly.RefactoringUtils.testRefactoring = function(workspace) {
	console.log(workspace);
	// populate test program
	Blockly.RefactoringUtils.createTestProgram(workspace);

	// identify block expression id to extract to a variable
	var exp_block = workspace.getBlockById('operator_exp_block');

	// declare var
	var json = Blockly.RefactoringUtils.constructNewVariableEventJSON_("temp", workspace.id);
	var varCreateEvent = Blockly.RefactoringUtils.constructNewVariableEvent(json);
	varCreateEvent.run(true);

	// set var block
	var setVarBlock = Blockly.RefactoringUtils.createSetVar_('temp', workspace.id);


	Blockly.RefactoringUtils.setInputName(setVarBlock, 'VALUE', exp_block);

	//replace expression with var

	//assign
	var moveBlock = workspace.getBlockById('motion_block');

	// connect move block after set var
	//set new parent
	moveBlock.previousConnection.connect(setVarBlock.nextConnection);

	var varReadExpBlock = Blockly.RefactoringUtils.createVarRead('temp');
	Blockly.RefactoringUtils.setInputName(moveBlock, 'STEPS', varReadExpBlock, true);
	exp_block.dispose();

};


Blockly.RefactoringUtils.VarDeclare = function(json_event){
	var json = Blockly.RefactoringUtils.constructNewVariableEventJSON_(json_event.var_name, json_event.ws_id);
    var varCreateEvent = Blockly.RefactoringUtils.constructNewVariableEvent(json);
    varCreateEvent.run(true);
};

Blockly.RefactoringUtils.VarAssign = function(assignVarJSON){
	var ws = Blockly.Workspace.getById(assignVarJSON['ws_id']);
	var expBlock = ws.getBlockById(assignVarJSON['value']); //todo get block from id
	var setVarBlock = Blockly.RefactoringUtils.createSetVar_(
		assignVarJSON['var_name'],
		assignVarJSON['block_id'],
		assignVarJSON['ws_id']);
    Blockly.RefactoringUtils.setInputName(setVarBlock, 'VALUE', expBlock);  //this will duplicate
    return setVarBlock;
};

Blockly.RefactoringUtils.varReadDom_ = function(varName, varId, blockId) {
	var blockId = blockId || Blockly.utils.genUid();
	varId = varId || Blockly.utils.genUid();
	var xml = `<xml><block type="data_variable" id="${blockId}" x="0" y="0">
						<field name="VARIABLE" variabletype="">${varName}</field>
					</block>
				</xml>`;

	//eliminate id <field name="VARIABLE" id = ${varId} variabletype="">${varName}</field> for now
	//server-side could provide var id when declare and need to make this matched
	//otherwise scratch-blocks will attempt to lookup by name
	var block = Blockly.Xml.textToDom(xml).firstChild;
	return block;
};

Blockly.RefactoringUtils.VarReadBlock = function(createVarReadJSON){
	var ws = Blockly.Workspace.getById(createVarReadJSON['ws_id']);
	var varReadDom = Blockly.RefactoringUtils.varReadDom_(
		createVarReadJSON['var_name'],
		null,
		createVarReadJSON['block_id']);
	var block = Blockly.Xml.domToBlock(varReadDom, ws);
	return block;
};

Blockly.RefactoringUtils.createSetVar_ = function(varName, block_id, wsId) {
	var ws = Blockly.Workspace.getById(wsId);
	var setVarDom = Blockly.RefactoringUtils.addVarBlock(varName,block_id);
	var block = Blockly.Xml.domToBlock(setVarDom, ws);
	return block;
};


Blockly.RefactoringUtils.ReplaceValue = function(replaceValueJSON){
	var ws = Blockly.Workspace.getById(replaceValueJSON['ws_id']);
	var oldValue = ws.getBlockById(replaceValueJSON['old_value']);
	var newValue = ws.getBlockById(replaceValueJSON['new_value']);

	// replace new with old
	// idenfity connection
	var parentConnection = oldValue.outputConnection.targetConnection;
	oldValue.unplug(true,true);

	parentConnection.connect(newValue.outputConnection);

	// delete old value
	oldValue.dispose();
};


Blockly.RefactoringUtils.getTestExtractVarTransformSeq = function(ws_id, exp_block_id){
	var seq = [
		{
	      	'var_name': 'temp2',
	      	'ws_id': ws_id,
	      	'type': 'declareVar'
      	},
      	{
	      	'var_name' : 'temp2',
	      	'block_id' : 'set_var_id',
	      	'ws_id' : ws_id,
	      	'value' : exp_block_id,
	      	'type': 'assignVar'
      	},
      	{
	      	'block_id' : 'var_temp_id',
	      	'var_name' : 'temp2',
	      	'ws_id' : ws_id,
	      	'px' : 0,
	      	'py' : 0,
	      	'type': 'varReadBlock'
      	},
      	{
	      	'ws_id' : ws_id,
	      	'old_value' : exp_block_id,
	      	'new_value' : 'var_temp_id',
	      	'type' : 'replaceValue'
      	}

	];

	return seq;
};

Blockly.RefactoringUtils.createExtractedBlocksFromXML = function(rootBlock_xml, ws) {
  var newBlock = Blockly.Xml.domToBlock(rootBlock_xml, ws);
  var svgRootNew = newBlock.getSvgRoot();
  if (!svgRootNew) {
    throw new Error('newBlock is not rendered.');
  }
};


/*
Utility function which checks if an id exists in an iterable/array
 */
Blockly.RefactoringUtils.existsIn = function( block_id, marked ) {
  for  ( let ele of marked   ){
    if ( ele.id === block_id ){
      return true;
    }
  }

  return false; // no match found
};


Blockly.RefactoringUtils.deleteUnmarkedChildBlocks = function( rootBlock_xml, marked ) {
  console.log("recur");
  for (var i = 0, child; child = rootBlock_xml.childNodes[i]; i++) {
    if (child.nodeName.toLowerCase() == 'next') {
      if (Blockly.RefactoringUtils.existsIn(child.firstChild.id, marked) === false) {
        rootBlock_xml.removeChild(child);
      }
      break;
    }
  }
  for (var i = 0, child; child = rootBlock_xml.childNodes[i]; i++) {
    Blockly.RefactoringUtils.deleteUnmarkedChildBlocks( child, marked);
  }

};

Blockly.RefactoringUtils.extractMarkedBlocks = function(expBlock) {
  var oldBlock = expBlock;
  var ws = oldBlock.workspace;

  if(ws.marks == undefined){
    throw new Error('No block marked for extraction');
  }
  let rootBlock = ws.marks[0]; //first marked block to be used as root

  //converted to xml for copying
  var rootBlock_copy_xml = Blockly.Xml.blockToDom(rootBlock, false);
  Blockly.RefactoringUtils.deleteUnmarkedChildBlocks( rootBlock_copy_xml, ws.marks );
  Blockly.RefactoringUtils.createExtractedBlocksFromXML(rootBlock_copy_xml, ws);

  //reset marked blocks to empty
  ws.marks = undefined;
};
