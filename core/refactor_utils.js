'use strict';

goog.provide('Blockly.RefactorUtils');

Blockly.RefactorUtils.introduceVariable = function(block) {
	console.log("calling Blockly.RefactorUtils");
	//analyze and generate sequence of transformation as Blockly.Events 

	var transformations = [];
	//hard-coded 

	var varCreateEvent = Blockly.RefactorUtils.constructNewVariableEventJSON_("temp", block.workspace.id);
	transformations.push(varCreateEvent);

	//TODO: insert variable set before its usage 
	//     Blockly.Refactoring.setVarToBlockExp 

	//make a call to refactoring support to get sequence of transformation 
	//execute the transformation 

	return transformations;
};

Blockly.RefactorUtils.constructNewVariableEventJSON_ = function(name, wsId) {
	var varCreateJson = {
		type : "var_create",
		varType : "",
		varName : name,
		varId : Blockly.utils.genUid(),
		workspaceId : wsId
	};
	return varCreateJson;
};

Blockly.RefactorUtils.constructNewVariableEvent = function(varCreateJson) {
	var varCreateEvent = new Blockly.Events.VarCreate(null);
	varCreateEvent.fromJson(varCreateJson);
	varCreateEvent.workspaceId = varCreateJson.workspaceId;
	return varCreateEvent;
};

Blockly.RefactorUtils.performTransformation = function(transformationSeq) {
	for (var ei = 0; ei < transformationSeq.length; ei++) {
		var transformationEvent = null;
		if (transformationSeq[ei].type == 'var_create') {
			transformationEvent = Blockly.RefactorUtils.constructNewVariableEvent(transformationSeq[ei]);
		}
		if (transformationEvent == null) {
			return; //unknown transformation event 
		}
		transformationEvent.run(true); //forward
	}
};

// todo: supply with variable for the shadow menu option
// todo: make it generalizable as addBlock
Blockly.RefactorUtils.addVarBlock = function() {
	var blockText = `<xml><block type="data_setvariableto" gap="20">
	<value name="VARIABLE">
		<shadow type="data_variablemenu"></shadow>
	</value>
	<value name="VALUE">
		<shadow type="text">
			<field name="TEXT">0</field>
		</shadow>
	</value>
</block></xml>`;

	var block = Blockly.Xml.textToDom(blockText).firstChild;
	return block;
};

Blockly.RefactorUtils.addVarBlock2 = function(varName, blockId) {
	var id = blockId || Blockly.utils.genUid();
	var blockText = `<xml><block type="data_setvariableto" gap="20">
		<field name="VARIABLE" id="${id}" variabletype="">${varName}</field>
	<value name="VALUE">
		<shadow type="text">
			<field name="TEXT">0</field>
		</shadow>
	</value>
</block></xml>`;

	var block = Blockly.Xml.textToDom(blockText).firstChild;
	return block;
};


Blockly.RefactorUtils.removeInput = function(blockInput) {
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


Blockly.RefactorUtils.removeInputName = function(blockParent, inputName) {
	var blockInput = blockParent.getInputTargetBlock(inputName);
	this.removeInput(blockInput);
};

Blockly.RefactorUtils.setInputName = function(parentBlock, inputName, childBlock, noInputReplicate) {
	//	childBlock = childBlock || Blockly.Xml.blockToDomWithXY(Blockly.selected);
	//	console.log(childBlock);


	Blockly.Events.setGroup(true);

	childBlock = childBlock || this.createTestExpBlock();
	
	
	if(!noInputReplicate){
		// duplicate expression block
		var xml = Blockly.Xml.blockToDom(childBlock);
		workspace.setResizesEnabled(false);
		childBlock = Blockly.Xml.domToBlock(xml, workspace);
	}

	//	Blockly.RefactorUtils.removeInputName(parentBlock, inputName);

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

Blockly.RefactorUtils.createTestExpBlock = function() {
	var xml = `<xml><block type="operator_add" id="ab"><value name="NUM1"><shadow type="math_number" id="8f|x6*:cfUhX$U?11K;4"><field name="NUM"></field></shadow></value><value name="NUM2"><shadow type="math_number" id="F5^}i3t|h:njN?1Oz*#^"><field name="NUM"></field></shadow></value></block></xml>`;
	var dom = Blockly.Xml.textToDom(xml).firstChild;
	return Blockly.Xml.domToBlock(dom, workspace);
};

Blockly.RefactorUtils.createTestProgram = function() {
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


Blockly.RefactorUtils.createSetVar = function(varName) {
	var setVarDom = Blockly.RefactorUtils.addVarBlock2(varName);
	var block = Blockly.Xml.domToBlock(setVarDom, workspace);
	return block;
};

Blockly.RefactorUtils.varReadDom = function(varName, varId) {
	var blockId = Blockly.utils.genUid();
	varId = varId || Blockly.utils.genUid();
	var xml = `<xml><block type="data_variable" id="${blockId}" x="0" y="0">
						<field name="VARIABLE" id="${varId}" variabletype="">${varName}</field>
					</block>
				</xml>`;
	var block = Blockly.Xml.textToDom(xml).firstChild;
	return block;
};

Blockly.RefactorUtils.createVarRead = function(varName) {
	var varReadDom = Blockly.RefactorUtils.varReadDom(varName);
	var block = Blockly.Xml.domToBlock(varReadDom, workspace);
	return block;
};


Blockly.RefactorUtils.testRefactoring = function() {
	// populate test program
	Blockly.RefactorUtils.createTestProgram();

	// identify block expression id to extract to a variable
	var exp_block = workspace.getBlockById('operator_exp_block');

	// declare var
	var json = Blockly.RefactorUtils.constructNewVariableEventJSON_("temp", workspace.id);
	var varCreateEvent = Blockly.RefactorUtils.constructNewVariableEvent(json);
	varCreateEvent.run(true);

	// set var block
	var setVarBlock = Blockly.RefactorUtils.createSetVar('temp')

	
	Blockly.RefactorUtils.setInputName(setVarBlock, 'VALUE', exp_block);

	//replace expression with var

	//assign
	var moveBlock = workspace.getBlockById('motion_block');

	// connect move block after set var
	//set new parent
	moveBlock.previousConnection.connect(setVarBlock.nextConnection);
	
	var varReadExpBlock = Blockly.RefactorUtils.createVarRead('temp');
	Blockly.RefactorUtils.setInputName(moveBlock, 'STEPS', varReadExpBlock, true);
	exp_block.dispose();

};