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
 
Blockly.RefactorUtils.constructNewVariableEventJSON_ = function(name, wsId){ 
  var varCreateJson = { 
    type: "var_create", 
    varType: "", 
    varName: name, 
    varId: Blockly.utils.genUid(), 
    workspaceId: wsId 
  }; 
  return varCreateJson; 
}; 
 
Blockly.RefactorUtils.constructNewVariableEvent = function(varCreateJson){ 
  var varCreateEvent = new Blockly.Events.VarCreate(null); 
  varCreateEvent.fromJson(varCreateJson); 
  varCreateEvent.workspaceId = varCreateJson.workspaceId; 
  return varCreateEvent; 
}; 
 
Blockly.RefactorUtils.performTransformation = function(transformationSeq){ 
  for(var ei = 0; ei < transformationSeq.length; ei++){ 
    var transformationEvent = null; 
    if(transformationSeq[ei].type=='var_create'){ 
      transformationEvent = Blockly.RefactorUtils.constructNewVariableEvent(transformationSeq[ei]); 
    } 
    if(transformationEvent==null){ 
      return; //unknown transformation event 
    } 
    transformationEvent.run(true); //forward 
  } 
}; 