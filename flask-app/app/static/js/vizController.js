var bubbleCharts = []
var clusters = [[],[],[]]
var clusterInfo = []
var clusterData = []
var allData = []

function showBase(id) {
  var myBubbleChart = bubbleChart();
  bubbleCharts.push(myBubbleChart);
  myBubbleChart(id, allData);
}

function showWithData(id, data, index) {
  var myBubbleChart = bubbleChart();
  bubbleCharts[index] = myBubbleChart;
  myBubbleChart(id, data);
}

function showViz1() {
  $('#viz2Container').hide();
  $('#viz3Container').hide();
  $('#viz1Container').show();

  if (bubbleCharts.length == 0) {
    showBase('#viz1Container');
  }
}

function showViz2() {
  $('#viz1Container').hide();
  $('#viz3Container').hide();
  $('#viz2Container').show();

  if (bubbleCharts.length <= 1) {
    if (clusters[1].length == 0) {
      showBase('#viz2Container');
    } else {
      var data = [];
      for (i = 0; i < clusters[1].length; i++) {
        var attr = clusters[1][i];
        for (j = 0; j < clusterData[attr].length; j++) {
          data.push(clusterData[attr][j]);
        }
      }
      hideViz2();
      showWithData('#viz2Container', data, 1);
      $('#tab2').show();
    }
  } else if (clusters[1].length > 0) {
    var data = [];
      for (i = 0; i < clusters[1].length; i++) {
        var attr = clusters[1][i];
        for (j = 0; j < clusterData[attr].length; j++) {
          data.push(clusterData[attr][j]);
        }
      }
      hideViz2();
      showWithData('#viz2Container', data, 1);
      $('#tab2').show();
  }
}

function showViz3() {
  $('#viz1Container').hide();
  $('#viz2Container').hide();
  $('#viz3Container').show();

  if (bubbleCharts.length <= 2) {
    if (clusters[2].length == 0) {
      showBase('#viz3Container');
    } else {
      var data = [];
      for (i = 0; i < clusters[2].length; i++) {
        var attr = clusters[2][i];
        for (j = 0; j < clusterData[attr].length; j++) {
          data.push(clusterData[attr][j]);
        }
      }
      hideViz3()
      showWithData('#viz3Container', data, 2);
      $('#tab3').show();
    }
  } else if (clusters[2].length > 0) {
    var data = [];
      for (i = 0; i < clusters[2].length; i++) {
        var attr = clusters[2][i];
        for (j = 0; j < clusterData[attr].length; j++) {
          data.push(clusterData[attr][j]);
        }
      }
      hideViz3()
      showWithData('#viz3Container', data, 2);
      $('#tab3').show();
  }
}

function hideViz2() {
  hideViz3();
  $('#tab2').hide();
  $('#attribute2').val('-1');
  clusters[1] = [];

  if (bubbleCharts.length > 1) {
    bubbleCharts.splice(1, 1);
    $('#viz2Container').html('');
  }
}

function hideViz3() {
  $('#tab3').hide();
  $('#attribute3').val('-1');
  clusters[2] = [];

  if (bubbleCharts.length > 2) {
    bubbleCharts.splice(2, 1);
    $('#viz3Container').html('');
  }
}

function updateViz1(value) {
  if (value == -1) {
    bubbleCharts[0].toggleDisplay("all");
  } else if (attributes[value] == "Genre") {
    bubbleCharts[0].toggleDisplay("genre");
    var clustersDict = gatherClusterInformation(allData, 'genre');

    if (clusterInfo.length == 0) {
      clusterInfo.push(clustersDict.clusterInfo);
    } else {
      clusterInfo[0] = clustersDict.clusterInfo;
    }

    if (clusterData.length == 0) {
      clusterData.push(clustersDict.clusterData);
    } else {
      clusterData[0] = clustersDict.clusterData;
    }

    $('#viz1Container .title').click(function() {
      clusters[1].push($(this).text());
      console.log(clusters);
    });
  }
  
}

function updateViz2(value) {
  if (value == -1) {
    bubbleCharts[1].toggleDisplay("all");
  } else if (attributes[value] == "Genre") {
    bubbleCharts[1].toggleDisplay("genre");
    var clustersDict = gatherClusterInformation(allData, 'genre');

    if (clusterInfo.length == 0) {
      clusterInfo.push(clustersDict.clusterInfo);
    } else {
      clusterInfo[0] = clustersDict.clusterInfo;
    }

    if (clusterData.length == 0) {
      clusterData.push(clustersDict.clusterData);
    } else {
      clusterData[0] = clustersDict.clusterData;
    }

    $('#viz2Container .title').click(function() {
      clusters[2].push($(this).text());
      console.log(clusters);
    });
  }
  
}

function updateViz3(value) {
  if (value == -1) {
    bubbleCharts[2].toggleDisplay("all");
  } else if (attributes[value] == "Genre") {
    bubbleCharts[2].toggleDisplay("genre");
    var clustersDict = gatherClusterInformation(allData, 'genre');

    if (clusterInfo.length == 0) {
      clusterInfo.push(clustersDict.clusterInfo);
    } else {
      clusterInfo[0] = clustersDict.clusterInfo;
    }

    if (clusterData.length == 0) {
      clusterData.push(clustersDict.clusterData);
    } else {
      clusterData[0] = clustersDict.clusterData;
    }

  }

}


$('#attribute1').change(function() {
  var selectedValue = $(this).val();
  if (selectedValue == -1) {
    hideViz2();
  } else {
    $('#tab2').show();
  }

  showViz1();
  updateViz1(selectedValue);
});

$('#attribute2').change(function() {
  var selectedValue = $(this).val();
  if (selectedValue == -1) {
    hideViz3();
  } else {
    $('#tab3').show();
  }
  showViz2();
  updateViz2(selectedValue);
});

$('#attribute3').change(function() {
  var selectedValue = $(this).val();
  showViz3();
  updateViz3(selectedValue);
});

$('#tab1').click(function() {
  showViz1();
})

$('#tab2').click(function() {
  showViz2();
})

$('#tab3').click(function() {
  showViz3();
})

$('#tab1').show();
$('#tab2').hide();
$('#tab3').hide();

$('#viz2Container').hide();
$('#viz3Container').hide();
$('#viz1Container').show();

$.getJSON('/getAllMovies', function(data, error) {
  allData = data;

  showViz1();
  
});

