var bubbleCharts = []
var clusters = [new Set(), new Set(), new Set()]
var prevClusters = [new Set(), new Set(), new Set()]
var allData = []

function eqSet(as, bs) {
  if (as.size !== bs.size) return false;
  for (var a of as) if (!bs.has(a)) return false;
  return true;
}

function showBase(id) {
  console.log("generating base viz")
  console.log(bubbleCharts)
  console.log(clusters)
  var myBubbleChart = bubbleChart();
  bubbleCharts.push(myBubbleChart);
  myBubbleChart(id, allData, null);
}

function showWithNodes(id, nodes, index) {
  console.log("generating viz " + (index+1).toString())
  console.log(bubbleCharts)
  console.log(clusters)
  console.log(nodes)
  var myBubbleChart = bubbleChart();
  bubbleCharts[index] = myBubbleChart;
  myBubbleChart(id, null, nodes);
}

function showViz1() {
  console.log("showing viz 1")
  console.log(bubbleCharts)
  console.log(clusters)
  $('#viz2Container').hide();
  $('#viz3Container').hide();
  $('#viz1Container').show();

  if (bubbleCharts.length == 0) {
    showBase('#viz1Container');
  }
}

function showViz2() {
  console.log("showing viz 2")
  console.log(bubbleCharts)
  console.log(clusters)
  $('#viz1Container').hide();
  $('#viz3Container').hide();
  $('#viz2Container').show();

  if (bubbleCharts.length <= 1 || !eqSet(clusters[1], prevClusters[1])) {
    prevClusters[1].clear();
    for (let cluster of clusters[1]) {
      prevClusters[1].add(cluster);
    }
    hideViz2();
    if (clusters[1].size == 0) {
      showBase('#viz2Container');
      $('#tab2').show();
    } else {
      var nodes = [];
      for (let cluster of clusters[1]) {
        var clusterData = bubbleCharts[0].getClusterData();
        console.log(clusterData)
        for (j = 0; j < clusterData[cluster].length; j++) {
          nodes.push(clusterData[cluster][j]);
        }
      }
      showWithNodes('#viz2Container', nodes, 1);
      $('#tab2').show();
    }
  }
}

function showViz3() {
  console.log("showing viz 3")
  console.log(bubbleCharts)
  console.log(clusters)
  $('#viz1Container').hide();
  $('#viz2Container').hide();
  $('#viz3Container').show();

  if (bubbleCharts.length <= 2 || !eqSet(clusters[2], prevClusters[2])) {
    prevClusters[2].clear();
    for (let cluster of clusters[2]) {
      prevClusters[2].add(cluster);
    }
    hideViz3();
    if (clusters[2].size == 0) {
      showBase('#viz3Container');
      $('#tab3').show();
    } else {
      var nodes = [];
      for (let cluster of clusters[2]) {
        var clusterData = bubbleCharts[1].getClusterData();
        console.log(clusterData)
        for (j = 0; j < clusterData[cluster].length; j++) {
          nodes.push(clusterData[cluster][j]);
        }
      }
      showWithNodes('#viz3Container', nodes, 2);
      $('#tab3').show();
    }
  }
}

function hideViz2() {
  console.log("hiding viz 2")
  console.log(bubbleCharts)
  console.log(clusters)
  hideViz3();
  $('#tab2').hide();
  $('#attribute2').val('-1');

  if (bubbleCharts.length > 1) {
    bubbleCharts.splice(1, 1);
    $('#viz2Container').html('');
  }
}

function hideViz3() {
  console.log("hiding viz 3")
  console.log(bubbleCharts)
  console.log(clusters)
  $('#tab3').hide();
  $('#attribute3').val('-1');

  if (bubbleCharts.length > 2) {
    bubbleCharts.splice(2, 1);
    $('#viz3Container').html('');
  }
}

function updateViz1(value) {
  console.log("updating viz 1")
  console.log(bubbleCharts)
  console.log(clusters)
  if (value == -1) {
    bubbleCharts[0].toggleDisplay("all");
  } else {
    bubbleCharts[0].toggleDisplay(attributes[value]);
    var clustersDict = bubbleCharts[0].getClusterData();


    $('#viz1Container .title').click(function() {
      $(this).toggleClass('clicked');
      if (clusters[1].has($(this).attr('key'))) {
        clusters[1].delete($(this).attr('key'));
      } else {
        clusters[1].add($(this).attr('key'));
      }
      console.log(clusters);
    });

    $('#viz1Container .title').hover(function() {
      var key = $(this).attr('key')
      var nodes = clustersDict[key]

      clusterAverages = {}

      d3.nest()
        .key(function(d) {return 1;})
        .rollup(function(v) { 
          clusterAverages= {
            count: v.length,
            avgRev: d3.mean(v, function(d) {return d.revenue;}),
            avgNoms: d3.mean(v, function(d) {return d.nominations;}),
            avgWins: d3.mean(v, function(d) {return d.wins;}),
            avgRunT: d3.mean(v, function(d) {return d.runtime;})
          };
        })
        .entries(nodes);

      console.log(clusterAverages)
    });

  }
  
}

function updateViz2(value) {
  console.log("updating viz 2")
  console.log(bubbleCharts)
  console.log(clusters)
  if (value == -1) {
    bubbleCharts[1].toggleDisplay("all");
  } else {
    bubbleCharts[1].toggleDisplay(attributes[value]);
    var clustersDict = bubbleCharts[1].getClusterData();

    $('#viz2Container .title').click(function() {
      $(this).toggleClass('clicked');
      if (clusters[2].has($(this).attr('key'))) {
        clusters[2].delete($(this).attr('key'));
      } else {
        clusters[2].add($(this).attr('key'));
      }
      console.log(clusters);
    });

    $('#viz2Container .title').hover(function() {
      var key = $(this).attr('key')
      var nodes = clustersDict[key]

      clusterAverages = {}

      d3.nest()
        .key(function(d) {return 1;})
        .rollup(function(v) { 
          clusterAverages= {
            count: v.length,
            avgRev: d3.mean(v, function(d) {return d.revenue;}),
            avgNoms: d3.mean(v, function(d) {return d.nominations;}),
            avgWins: d3.mean(v, function(d) {return d.wins;}),
            avgRunT: d3.mean(v, function(d) {return d.runtime;})
          };
        })
        .entries(nodes);

      console.log(clusterAverages)
    });
  }
  
}

function updateViz3(value) {
  console.log("updating viz 3")
  console.log(bubbleCharts)
  console.log(clusters)
  if (value == -1) {
    bubbleCharts[2].toggleDisplay("all");
  } else {
    bubbleCharts[2].toggleDisplay(attributes[value]);
  }

}


$('#attribute1').change(function() {
  var selectedValue = $(this).val();
  clusters[1].clear();
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
  clusters[2].clear();
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

