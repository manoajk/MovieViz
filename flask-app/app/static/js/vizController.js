var bubbleCharts = []
var baseData = []

function showBase(id) {
  $.getJSON('/getAllMovies', function(data, error) {
    if (error) {
      console.log(error);
    }
    
    var myBubbleChart = bubbleChart();
    bubbleCharts.push(myBubbleChart);
    myBubbleChart(id, data);
    
    baseData.push(data);
    console.log(myBubbleChart);

  });
}