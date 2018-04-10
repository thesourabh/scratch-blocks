
TestRemoteMsg = function(){
	// this.socket = new SockJS('http://localhost:8080/service-endpoint');
	// this.socket = new WebSocket('http://localhost:8080/service-endpoint');
	// window._socket = this.socket;

	// ws:// url need /websocket after endpoint if the server uses sockjs
	this.stompClient = Stomp.client('ws://localhost:8080/service-endpoint');		
	// this.stompClient = Stomp.client('ws://engine-env.ytkwr5npba.us-east-1.elasticbeanstalk.com:8080/service-endpoint/websocket');
	// this.stompClient.debug = null;

	this.stompClient.connect({}, "", this.connectCallBack.bind(this), this.errorCallBack.bind(this));
	this.attemptCount = 0;
};

TestRemoteMsg.prototype.connectCallBack = function() {
	console.log('Connected to the refactoring endpoint');
	this.stompClient.subscribe('/user/queue/request', function (serverMsg) {
	this.receiveMessage(serverMsg);}.bind(this));
};

TestRemoteMsg.prototype.errorCallBack = function(error) {
	console.log(error);
	// this.socket = new SockJS('http://localhost:8080/service-endpoint');
	// this.stompClient = Stomp.over(this.socket);
	// setTimeout(function(){ 
		// this.stompClient.connect({}, "", this.connectCallBack.bind(this), this.errorCallBack.bind(this));
		// }, 3000);
	
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