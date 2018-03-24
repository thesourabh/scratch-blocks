
TestRemoteMsg = function(){
	this.socket = new SockJS('http://localhost:8080/service-endpoint');
	this.stompClient = Stomp.over(this.socket);
	this.stompClient.debug = null;

	this.stompClient.connect({}, function (frame) {
		// connection established
		console.log('Connected to the refactoring endpoint');
		
		// subscribe upon connection
		this.stompClient.subscribe('/user/queue/request', function (serverMsg) {
			this.receiveMessage(serverMsg);
		}.bind(this));

	}.bind(this));
};

TestRemoteMsg.prototype.receiveMessage = function(serverMsg) {
	const msg = JSON.parse(serverMsg.body);
	workspace.blockTransformer.doTransform(msg);
};

TestRemoteMsg.prototype.sendEvent = function(event) {
	let message = {};
    let request = {"refactoring": event['type'], 
    				"targetBlockExpId": event['blockId'],
    				"targetBlockIDs": event['targetBlockIDs']
    			};
	let body = {"request":request, "targets":event["targets"]};
   
    message['type'] = "invocation";
    message['body'] = JSON.stringify(body);

    console.log(JSON.stringify(message));
	this.stompClient.send("/app/request", {}, JSON.stringify(message));
};