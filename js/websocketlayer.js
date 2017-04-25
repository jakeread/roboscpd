// ----- WEBSOCKET
/*
does websocket things
*/

function WebSocketLayer() {

	console.log("WSL");

	this.isOpen = false;
	this.theSocket;

	this.open = function(){
		this.theSocket = new WebSocket("ws://localhost:8081");
		this.isOpen = true;
		this.theSocket.onopen = openSocket;
		this.theSocket.onclose = closeSocket;
		this.theSocket.onmessage = newData;
	}

	this.close = function (){
		this.theSocket.close();
	}

	function openSocket() {
		console.log("Socket Open");
	}

	function closeSocket() {
		console.log("Socket Closed")
	}

	function newData(result) {  
		var theData = result.data;
		recentLines.add("ROBO: " + theData);
		socketconsole.newLineIn(theData); // ------------------------ INPUT LAUNCHPOINT
	}

	this.send = function(data){
		this.theSocket.send(data);
	}
}