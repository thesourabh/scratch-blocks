'use strict';

goog.provide('Blockly.RemoteMsg');

goog.require('atmosphere');

//constructor
Blockly.RemoteMsg.socket = atmosphere;

Blockly.RemoteMsg.subsocket = null;


//establish remote connection before being added as a workspace listener
Blockly.RemoteMsg.connect = function(){
    Blockly.RemoteMsg.subSocket = Blockly.RemoteMsg.socket.subscribe(Blockly.RemoteMsg.request);
    console.log("Connecting using " + 'websocket' + " with optional fallback to " + Blockly.RemoteMsg.request.fallbackTransport + " ...");
    setTimeout(function() {
            if (!Blockly.RemoteMsg.isOpen) {
                console.log("Unable to open a connection. Terminated.");
                process.exit(0);
            }
    }, 3000);
};

Blockly.RemoteMsg.hostURL = 'http://localhost:8080/refactoring4blocks/playground/messaging';

Blockly.RemoteMsg.request = { url: Blockly.RemoteMsg.hostURL,
                contentType : "application/json",
                transport : 'websocket',
                logLevel : 'debug',
                fallbackTransport: 'long-polling',
                trackMessageLength: true,
                reconnectInterval : 5000};

Blockly.RemoteMsg.isOpen = false;

Blockly.RemoteMsg.request.onOpen = function(response) {
    Blockly.RemoteMsg.isOpen = true;
    console.log('Connected using ' + response.transport);
};

Blockly.RemoteMsg.request.onMessage = function (response) {
    var message = response.responseBody;
    try {
        var json = JSON.parse(message);
    } catch (e) {
        console.log('Invalid response: ', message);
        return;
    }
    // if (json.author == json.message) {
    //     // console.log(json.author + " joined the room");
    // } else {
    //     console.log(json.author + " says '" + json.message + "'");
    // }
    if(json.message){
        console.log("received message:"+json.message);
    }
};


Blockly.RemoteMsg.info = function() {
   // console.log('atmosphere'+atmosphere);
};

Blockly.RemoteMsg.listener = function(e) {
    // console.log(Blockly.RemoteMsg.socket);
    Blockly.RemoteMsg.sendCodeChangesInfo(e);
};

Blockly.RemoteMsg.sendInvocationInfo = function(e) {
    console.log('invocation info sent');
};

Blockly.RemoteMsg.sendCodeChangesInfo = function(e) {
    //send compatible message 
    Blockly.RemoteMsg.sendBlockEvent(e);

};

Blockly.RemoteMsg.sendBlockEvent = function(e) {

    if(e['xml']){
        e['xml'] = e['xml']['outerHTML'];
        // console.log(e['xml']);
        // blockEvent.xml = blockEvent['xml'];
    }
    var blockEvent = JSON.stringify(e, null, 2);
    
    

    var msg = atmosphere.util.stringifyJSON({
        'message' : blockEvent,
        'type' : 'synchronization'
    });
    
    if(Blockly.RemoteMsg.isOpen){
        Blockly.RemoteMsg.subSocket.push(msg);
    }

};

Blockly.RemoteMsg.request.onReconnect = function(response) {
    console.log('Reconnecting ...');
};

Blockly.RemoteMsg.request.onReopen = function(response) {
    Blockly.RemoteMsg.isOpen = true;
    console.log('Reconnected using ' + response.transport);
};

Blockly.RemoteMsg.request.onClose = function(response) {
    Blockly.RemoteMsg.isOpen = false;
};

Blockly.RemoteMsg.request.onError = function(response) {
    console.log("Sorry, something went wrong: " + response.responseBody);
};