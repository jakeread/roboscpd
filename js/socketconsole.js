// ----- CONSOLE
/*
TBD
commands, in and out
buffers, rings, etc
*/

function SocketConsole() {

	// ------------------------- THE WEBSOCKET

	var sckt = new WebSocketLayer(); // homeboy
	this.socket = sckt; // external ref

	// ------------------------ USER INPUT

	document.getElementById('commandIn').addEventListener('keydown', keyPressed); // referencing HTML element we wrote w/ this ID

	function keyPressed(event){
		if(event.keyCode == 13){
			event.preventDefault();
			commandLineInput();
		}
	}

	function commandLineInput(){
		var input = document.getElementById("commandIn").value;
		recentLines.add("USER: "+ input);
		document.getElementById("commandIn").value = ""; // clear input

		if(sckt.isOpen){
			sckt.send(input);
		} else {
			console.log("Socket is closed");
		}

		if(input == "open port"){
			console.log("Opening socket...");
			sckt.open();
		}

		if(input == "close port"){
			sckt.close();
		}
	}

	// ------------------------- RECENT LINE DISPLAY

	var recentLines = { // lines display obj
		lines: new Array(),
		domLines: document.getElementById("cli"),

		add: function(newLine){
			if(this.lines.push(newLine) > 15){
				this.lines.splice(0, 1);
			}
			this.domLines.innerHTML = ""; // clear it
			for(i = 0; i < this.lines.length; i ++){
				this.domLines.innerHTML += this.lines[i] + "</br>"; // re-write
			}
		}
	}

	// ----------------------- DAS BUFFER

	this.newLineIn = function(data){
		recentLines.add("ROBO: " + data);
		// -> STARTING HERE
	}

}