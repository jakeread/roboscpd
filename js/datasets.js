//  CHART
/*
TBD
use it, and you will discover what-2-develop
3D Display?
Better function-display implementation?
*/

Chart.pluginService.register({ // for Chart.js , extends to make lines that follow functions
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

function DataSet(context = "chartOne", label = "unlabelled"){ // atm we are assuming data is of type line

    var theData = new Array();

    var chartContext = document.getElementById(context);

    var theChart = new Chart(chartContext, {
        type: 'line',
        data: {
            datasets: [{
                label: label,
                data: theData,
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

    this.setData = function(data){
        theData = data;
        theChart.update();
    }

    this.addDataPoint = function(dataPoint){ // up to you to make sure you keep your data shit together over there
        theData.push(dataPoint);
        theChart.update();
    }

    this.returnData = function(){
        return theData;
    }

    this.dataChartToArray = function(theData){
        var outData = new Array();
        for (i = 0; i < data.length; i ++){
            outData[i] = new Array(data[i].x, data[i].y);
        }
        return outData;
    }
}