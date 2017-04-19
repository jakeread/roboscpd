
// ----------------------------------------------------------------------------------------------- CHART

var linearData = new Array();

for (x = 0; x <= 1; x += 0.01){
	linearData.push({'x': x, 'y': 2+3*x+generateGaussian(0,0.5)}); 	
	// y = 2 + 3x + c 
	//where c is a gaussian random variable with a standard deviation of 0.5
}

Chart.pluginService.register({
	beforeInit: function(chart) {
        var data = chart.config.data;
        for (var i = 0; i < data.datasets.length; i++) {
            for (var j = 0; j < data.labels.length; j++) {
            	var fct = data.datasets[i].function,
                	x = data.labels[j],
                	y = fct(x);
                data.datasets[i].data.push(y);
            }
        }
    }
});

var soln = doVSolve(linearData);

var linearChartContext = document.getElementById("linearChart");

var linearChart = new Chart(linearChartContext, {
    type: 'line',
    data: {
        datasets: [{
            label: 'y=2+3x+c',
            data: linearData,
            showLine: false
        },
        {
        	label: 'f(x) = ' + soln.M + 'x + ' + soln.b,
        	borderColor: "rgba(152,102,255,1)",
        	data: [{'x': 0, 'y': soln.b}, {'x': 1, 'y': soln.M*1 + soln.b}],
        	fill: false,
        	showLine: true
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


function chartDataToArray(data){

	var outData = new Array();

	for (i = 0; i < data.length; i ++){
		outData[i] = new Array(data[i].x, data[i].y);
	}
	console.log(outData);
	return outData;
}

var nonLinearData = new Array();

for(x = 0; x <= 2; x += 0.01){
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

/*
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
*/
