var debug = false;

// ----------------------------------------------------------------------------------------------- COMMUNICATION

var socket = new WebSocket("ws://localhost:8081");

socket.onopen = openSocket;
socket.onclose = closeSocket;
socket.onmessage = newData;

function openSocket() {
	console.log("Socket Open");
}

function closeSocket() {
	console.log("Socket Closed")
}

function newData(result) {  
	var theData = result.data;
	if(debug){console.log("js newData:" + theData);}
	recentLines.add("SNSR: " + theData);
	if(theData[0] == "S"){
		scan.doNextPoint();
	}
	if(theData[0] == "M" || theData[1] == "M"){
		if(debug){console.log("in M-message");}
		var dtp = dataPoint(theData); // dataPoint returns object
		dataPoints.push(dtp); // puts object in array of objects
	}
}

// ----------------------------------------------------------------------------------------------- TEXT TERMINAL

function handleCommands(input){
	if(debug){console.log("js handleCommands: " + input);}
	switch(input){
		default:
			socket.send(input);
			break;
		case "gaussian set":
			generateGaussianSet();
			break;
		case "gaussian":
			generateGaussian();
			break;

	}
	// DO IT WITH EVENTS <------------------
}

document.getElementById('commandIn').addEventListener('keydown', keyPressed); // referencing HTML element we wrote w/ this ID

function keyPressed(event){
	if(event.keyCode == 13){
		event.preventDefault();
		commandLineInput();
	}
}

function commandLineInput(){
	var input = document.getElementById("commandIn").value;
	if(debug){console.log(input);}
	recentLines.add("USER: "+ input);
	handleCommands(input);
	document.getElementById("commandIn").value = ""; // clear input
}

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
		if(debug){console.log(this.lines);}
	}
}

// ----------------------------------------------------------------------------------------------- DATA

var dataPoints = new Array();

function dataPoint(data){ // writes points on receipt of M-messages

	var a = parseFloat(data.slice(data.indexOf("A")+1, data.indexOf("B")));
	var b = parseFloat(data.slice(data.indexOf("B")+1, data.indexOf("D")));
	var distance = parseFloat(data.slice(data.indexOf("D")+1, data.indexOf("R")));
	var radiant = parseFloat(data.slice(data.indexOf("R")+1, data.length));

	var x = Math.sin(Math.radians(b))*Math.cos(Math.radians(-a));
	var y = Math.sin(Math.radians(b))*Math.sin(Math.radians(-a));
	var z = Math.cos(Math.radians(b));

	var pos = {
		"x": -distance*x*1,
		"y": -distance*z*1,
		"z": distance*y*1
	};

	var tempColour = mapTemp(radiant);

	var theDataPoint = {
		"a": a,
		"b": b,
		"distance": distance,
		"radiant": radiant,
		"pos": pos,
		"tc": tempColour
	};

	if(debug){console.log(theDataPoint);}
	threeAddNewPoint(theDataPoint);
	return theDataPoint;
}

function mapTemp(temp) { // used by dataPoint to build temp->color

	var tempMid = 26.5;
	var tempLow = 24.0;
	var tempHigh = 29.0;

	var r, g, b; // for colours

	r = Math.map(temp, tempLow, tempHigh, 0, 255);

    if (temp > tempMid) { 
		g = Math.map(temp, tempMid, tempHigh, 255, 0);
	} else if (temp < tempMid) {
		g = Math.map(temp, tempLow, tempMid, 0, 255);
	} else {
		g = 0;
	}

	b = Math.map(temp, tempLow, tempHigh, 255, 0);

	var tempColour = {
		"r": r,
		"b": b,
		"g": g
	};

	return tempColour;
}

// ----------------------------------------------------------------------------------------------- DATA MANAGEMENT

function saveData(){
	if (dataPoints.length < 1){
		recentLines.add("THR3: dataPoints array is of length 0")
	} else {
		recentLines.add("THR3: saving data...");
		var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataPoints));
		recentLines.add("THR3: " + '<a href="data:' + data + '" download="data.json">Download JSON</a>');
	}
}

function loadData(){
	recentLines.add("THR3: loading not implemented atm");
}

function loadScanPatter(){
	recentLines.add("THR3: loading scans not implemented atm");
}

// ----------------------------------------------------------------------------------------------- SCAN MANAGEMENT

var scanPattern;

function loadJSON(callback){
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', './scanParams/pyOutTest.json', true);
	xobj.onreadystatechange = function(){
		if(xobj.readyState == 4 && xobj.status == "200"){
			callback(xobj.responseText);
		}
	}
	xobj.send(null);
}

loadJSON(function(response){
	scanPattern = JSON.parse(response);
	console.log(scanPattern[0]);
	console.log(scanPattern.length);
});

var scan = {

	"isRunning": false,

	"scanIndices": [],

	init: function(){
		this.isRunning = true;
		recentLines.add("THR3: Scanning...");
		this.doNextPoint();
		console.log("SCAN INIT: " + scanPattern);
	},

	doNextPoint: function(){
		if(this.scanIndices.length > scanPattern.length){
			recentLines.add("THR3: Scan complete")
			this.isRunning = false;
			saveData();
		} else if (this.scanIndices.length < 1) { // this can only run once per scan
			this.scanIndices.push(0); // initialize
		} else {
			this.scanIndices[this.scanIndices.length] = this.scanIndices.length;
			console.log("pushed new");
			console.log(this.scanIndices.length);
		}
		socket.send("MS" + "A" + scanPattern[this.scanIndices[0]].x + "B" + "20");//scanPattern[this.scanIndices[0]].y); // should have a, b structure in scanPattern
	},

	doBoundsCheck: function(a,b){
		var aBounds = [-95, 95];
		var bBounds = [-120, 120];

		if(a < aBounds[0] || a > aBounds[1] || b < bBounds [0] || b > bBounds[1]){
			return false;
		} else {
			return true;
		}
	},
}

// ----------------------------------------------------------------------------------------------- CHART

var linearData = new Array();

for (x = 0; x <= 1; x += 0.01){
	linearData.push({'x': x, 'y': 2+3*x+generateGaussian(0,0.5)}); 	
	// y = 2 + 3x + c 
	//where c is a gaussian random variable with a standard deviation of 0.5
}

var linearChartContext = document.getElementById("linearChart");

var linearChart = new Chart(linearChartContext, {
    type: 'line',
    data: {
        datasets: [{
            label: 'y=2+3x+c',
            data: linearData,
            showLine: false
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom'
            }]
        }
    }
});

var nonLinearData = new Array();

for(x = 0; x <= 1; x += 0.01){
	nonLinearData.push({'x': x, 'y': Math.sin(2 + 3*x) + generateGaussian(0,0.1)});
	// y = sin(2 + 3x) + c
	// where c is a gaussian random variable with a standard deviation of 0.5
}

var nonLinearChartContext = document.getElementById("nonLinearChart");

var nonLinearChart = new Chart(nonLinearChartContext, {
    type: 'line',
    data: {
        datasets: [{
            label: 'y=sin(2+3x)+c',
            data: nonLinearData,
            showLine: false
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom'
            }]
        }
    }
}); 


// using Marsaglia polar method to generate normal distribution
// https://en.wikipedia.org/wiki/Marsaglia_polar_method
// wants to wrap this in a generateGaussianSet(number, mean, std dev) funtion l8er

var gausData = new Array(); // the datas

function generateGaussianSet(){
	for(var i = gausData.length; i > 0; i--){
		gausData.pop();
	} 
	while(gausData.length < 100){
		gausData.push({'x': generateGaussian(0, 1), 'y': 0});
		distChart.update();
	}
	console.log(gausData);
}

var spareReady = false;
var spare;

function generateGaussian(mean = 0, stdDev = 0.5){
	if(spareReady){
		spareReady = false;
		console.log(spare * stdDev + mean);
		return spare * stdDev + mean;
	} else {
		var s = 0;
		var x, y;
		while(s >= 1 || s ==0 ){ // goes until s fits
			x = Math.random()*2 - 1;
			y = Math.random()*2 - 1;
			s = x*x + y*y;
		}
		mul = Math.sqrt(-2 * Math.log(s) / s);
		spare = y * mul;
		spareReady = true;
		return x * mul * stdDev + mean;
	}
}

var gausChartContext = document.getElementById("gausChart");

var distChart = new Chart(gausChartContext, {
	type: 'line',
	data: {
		datasets: [{
			label: 'gaussian generator...',
			data: gausData,
			showLine: false
		}]
	},
    options: {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom'
            }]
        }
    }
});

// ----------------------------------------------------------------------------------------------- GRAPHICS

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, controls, scene, renderer;

var width = window.innerWidth-715;
var height = window.innerHeight-25;

// init, animate

initThree();
animate();

function initThree(){
	
	// camera

	camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
	camera.position.x = -5;
	camera.position.y = -5;
	camera.position.z = 5;
	camera.lookAt(0,0,0);
	camera.up.set(0,0,1);

	controls = new THREE.TrackballControls(camera, container);

	controls.rotateSpeed = 2.0;
	controls.zoomSpeed = 2.0;
	controls.panSpeed = 1.2;

	controls.noZoom = false;
	controls.noPan = false;	

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [65, 83, 68];

	controls.addEventListener('change', render);

	// werld

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xf5f5f5 );

	var origin = new THREE.AxisHelper( 1 ); 
	origin.position.set(0,0,0);
	scene.add( origin );

	// renderer

	renderer = new THREE.WebGLRenderer({antialias: false});
	renderer.setSize(width, height);

	container = document.getElementById('container');
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);

	render();

}

function onWindowResize(){

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);

	controls.handleResize();

	render();
}

function animate(){
	requestAnimationFrame(animate);
	controls.update();	
}

function render(){
	renderer.render(scene, camera);
}

function threeAddNewPoint(dataPoint){

	var pointGeometry = new THREE.Geometry();

	var pos = new THREE.Vector3();

	pos.x = dataPoint.pos.x;
	pos.y = dataPoint.pos.y;
	pos.z = dataPoint.pos.z;

	pointGeometry.vertices.push(pos);

	var pointColor = new THREE.Color();
	pointColor.setRGB(dataPoint.tc.r, dataPoint.tc.g, dataPoint.tc.b);

	var pointMaterial = new THREE.PointsMaterial({color: pointColor, size: 0.5})

	var pointField = new THREE.Points( pointGeometry, pointMaterial );

	scene.add( pointField );

	render();

}

// ----------------------------------------------------------------------------------------------- UTILS

Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};

Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};

Math.map = function(value, inLow, inHigh, outLow, outHigh) {
	if(value <= inLow){
		return outLow;
	} else if(value >= inHigh) {
		return outHigh;
	} else {
		return ((value - inLow)/(inHigh - inLow))*(outHigh-outLow)+outLow;
	}
};