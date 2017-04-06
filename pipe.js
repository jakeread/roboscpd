var debug = false; 

//----------------------------------------- readline
// command-line / terminal inputs are handled
// just as inputs from web terminal
// communications are kept human-friendly at network layer
// at some speed cost, but very development friendly

const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', parseLineIn);

function parseLineIn(data){
	if(debug){console.log("rl: parseLineIn" + data);}
	writeToPort(data);
}

//----------------------------------------- SerialPort
// serial port: talks to the teensy via UART

var serialport = require('serialport'),
	SerialPort = serialport,
	portname = 'COM9'; //'/dev/ttyACM0'; // to do direct
	//process.argv[2]; // to read serial port name from command line

var myPort = new SerialPort(portname, { 
	baudrate: 115200,
	dataBits: 8,
	parity: 'none',
	flowControl: false, 
	parser: serialport.parsers.readline("\r\n") // sets readline function to call only when new line
});

myPort.on('open', function() {
	console.log('PIPE: Serialport Open');
});

myPort.on('close', function() {
	console.log('PIPE: Serialport Closed');
});

myPort.on('error', function() {
	console.log('PIPE: Serialport Error');
});

myPort.on('data', serialDataIn); // on data event, do this function

function serialDataIn(data) { // from PORT
	if(debug){console.log("PIPE: serialDataIn: " + data);}
	console.log("SNSR: " + data);
	publish(data); // send to websocket
};

function writeToPort(data){ // to PORT
	if(debug){console.log("PIPE: writeToPort: " + data);}
	console.log("USER: " + data);
	myPort.write(data + '\n'); // send to arduino
}

//----------------------------------------- WebSocketServer

//websocket, ? talks to the browser-side
var WebSocketServer = require('ws').Server;
var SERVER_PORT = 8081;
var wss = new WebSocketServer({port: SERVER_PORT});
var connections = new Array; // handles the multiple connections

wss.on('connection', handleConnection);

function handleConnection(client) {
	console.log("PIPE: wss new connection");
	connections.push(client); // add client to connections array
	
	client.on('message', writeToPort); // when we get a message, parse & do stuff
	
	client.on('close', function() {
		console.log("PIPE: wss connection closed");
		var position = connections.indexOf(client); // index of connection in array of connections
		connections.splice(position, 1); // remove from array
	});
}

function publish(data){ // To WebSocket, all connections
	if(debug){console.log("PIPE: sentToWeb: "+data);}
	if (connections.length > 0) {
		sendData(data);
	}
}
	
function sendData(data){ // To WebSocket, per connection
	for (connection in connections){ // plurals!
		if(debug){console.log("PIPE: sent to connection #: " + connection + " this data: " + data);}
		connections[connection].send(data);
	}
}