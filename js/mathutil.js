// MATH UTILITIES
/*
TBD
use it
add vector, matrix, rotation things, all you will need for physics
robot modelling
etc
quaternions!
*/

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


function doSvd(A){
	console.log(numeric.svd(A));
}

function s2wi(S){ // single values to W-inverse
	var W = [[1/S[0], 0],[0, 1/S[1]]]; // check dis first // not dimensionally agnostic
	return W;
}

function doVSolve(Data){ // on the data, a: assumes it is linear, y = a1(x) + a2 is our game, data is in (x, y) points

	var A = new Array(); // A matrix, will be svd'd
	var b = new Array(); // the data pts

	for(var i = 0; i < Data.length; i ++){
		A.push(new Array(Data[i].x, 1)); // 2nd value in A matrix is 1 - as per neil
		b.push(Data[i].y);
	}

	var svd = numeric.svd(A);

	var Ut = numeric.transpose(svd.U); // U transpose
	var Wi = s2wi(svd.S);

	var dotOne = numeric.dotMMbig(svd.V, Wi); // is it Vtranspose that comes out of SVD ?
	var dotTwo = numeric.dotMV(Ut, b);

	var dotThree = numeric.dotMV(dotOne, dotTwo);

	console.log("M: ", dotThree[0], "b: ", dotThree[1]);

	return {"M": dotThree[0], "b": dotThree[1]};
}

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