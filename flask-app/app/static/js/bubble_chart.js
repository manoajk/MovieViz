function bubbleChart() {
  // Size
  var width = 2800;
  var height = 1800;

  // Tooltip
  var tooltip = floatingTooltip('gates_tooltip', 240);

  // Initial Center
  var center = { x: 2*width/5 , y: height / 4 };

  // Pre-determined genre centers
  var genreCenters = {
    Thriller: {x: width/5, y:height/5},
    'Sci-Fi': {x: 2*width/5, y:height/5},
    Romance: {x: 3*width/5, y:height/5},
    Mystery: {x: 4*width/5, y:height/5},
    Horror: {x: width/5, y: 2*height/5},
    Fantasy: {x: 2*width/5, y: 2*height/5},
    Drama: {x: 3*width/5, y: 2*height/5},
    Documentary: {x: 4*width/5, y: 2*height/5},
    Crime: {x: width/5, y: 3*height/5},
    Comedy: {x: 2*width/5, y: 3*height/5},
    Biography: {x: 3*width/5, y: 3*height/5},
    Adventure: {x: 4*width/5, y: 3*height/5},
    Action: {x: width/5, y: 4*height/5},
    Western: {x: 2*width/5, y: 4*height/5},
    Animation: {x: 3*width/5, y: 4*height/5},
    Family: {x: 4*width/5, y: 4*height/5}
  };

  var genreTitlePositions = {};

  // Pre-determined release month centers
  var releaseMonthCenters = {
    Jan: {x: width/5, y:height/4},
    Feb: {x: 2*width/5, y:height/4},
    Mar: {x: 3*width/5, y:height/4},
    Apr: {x: 4*width/5, y:height/4},
    May: {x: width/5, y: 2*height/4},
    Jun: {x: 2*width/5, y: 2*height/4},
    Jul: {x: 3*width/5, y: 2*height/4},
    Aug: {x: 4*width/5, y: 2*height/4},
    Sep: {x: width/5, y: 3*height/4},
    Oct: {x: 2*width/5, y: 3*height/4},
    Nov: {x: 3*width/5, y: 3*height/4},
    Dec: {x: 4*width/5, y: 3*height/4},
  };

  var releaseMonthTitlePositions = {};

  var runtimeCenters = {};

  var runtimeTitlePositions = {};

  var budgetCenters = {};

  var budgetTitlePositions = {};

  var userRatingCenters = {};

  var userRatingTitlePositions = {};

  // force strength to apply on the nodes
  var forceStrength = 0.1;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  // Create the force simulation
  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  // Prevent simulation from starting immediately
  simulation.stop();


  /*
   * Creates the nodes based on a raw dictionary of the data
   */
  function createNodes(rawData) {

    var maxWinsNominations = d3.max(rawData, function (d) { return +(d.wins + 0.5*d.nominations); });

    var maxProfit = d3.max(rawData, function (d) { return +d.revenue - (+d.budget); });

    var minProfit = d3.min(rawData, function(d) {return +d.revenue - (+d.budget); });

    // Size of bubble is based on profit
    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 30])
      .domain([minProfit, maxProfit]);

    // Color of bubble is based on wins and nominations
    var fillColor = d3.scaleLinear()
    .domain([0, maxWinsNominations])
    .range(['orange',  'purple']);

    // Convert raw data to nodes
    var newNodes = rawData.map(function (d) {
      return {
        id: d.tconst,
        year: +d.startYear,
        month: d.month,
        day: d.day,
        radius: radiusScale(+d.revenue - (+d.budget)),
        runtime: +d.runtimeMinutes,
        name: d.primaryTitle,
        color: fillColor(+ (d.wins + 0.5*d.nominations)),
        genre1: d.genre1,
        genre2: d.genre2,
        genre3: d.genre3,
        wins: +d.wins,
        nominations: +d.nominations,
        userRating: +d.userRating,
        budget: +d.budget,
        revenue: +d.revenue,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    newNodes.sort(function (a, b) { return b.revenue - a.revenue; });

    return newNodes;
  }

  /*
   * Creates the nodes based on the passed in node data
   */
  function createNodesFromNodes(nodeData) {
    var maxWinsNominations = d3.max(nodeData, function (d) { return +(d.wins + 0.5*d.nominations); });

    var maxProfit = d3.max(nodeData, function (d) { return +d.revenue - (+d.budget); });

    var minProfit = d3.min(nodeData, function(d) {return +d.revenue - (+d.budget); });

    // Size of bubble is based on profit
    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 30])
      .domain([minProfit, maxProfit]);

    // Color of bubble is based on wins and nominations
    var fillColor = d3.scaleLinear()
    .domain([0, maxWinsNominations])
    .range(['orange',  'purple']);

    // Copy the node data to new nodes
    var newNodes = nodeData.map(function (d) {
      return {
        id: d.id,
        year: +d.year,
        month: d.month,
        day: d.day,
        radius: radiusScale(+d.revenue - (+d.budget)),
        runtime: +d.runtime,
        name: d.name,
        color: fillColor(+ (d.wins + 0.5*d.nominations)),
        genre1: d.genre1,
        genre2: d.genre2,
        genre3: d.genre3,
        wins: +d.wins,
        nominations: +d.nominations,
        userRating: +d.userRating,
        budget: +d.budget,
        revenue: +d.revenue,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    newNodes.sort(function (a, b) { return b.revenue - a.revenue; });

    return newNodes;
  }

  // Creates the center locations for all clusters and their corresponding titles
  function createAllCenters(rawData) {

    runtimeMax = d3.max(rawData, function(d) {return +d.runtime;});
    runtimeMin = d3.min(rawData, function(d) {return +d.runtime;});

    budgetMin = d3.min(rawData, function(d) {return +d.budget;});
    budgetMax = d3.max(rawData, function(d) {return +d.budget;});

    i = 1
    for (genre in genreCenters) {
      genreTitlePositions[genre] = {x: genreCenters[genre].x, y: i <= 10 ? genreCenters[genre].y - 235 : i > 13 ? genreCenters[genre].y - 50 : genreCenters[genre].y - 140, key: genre};
      i+=1;
    }

    i = 1;
    for (month in releaseMonthCenters) {
      releaseMonthTitlePositions[month] = {x: releaseMonthCenters[month].x, y: i <= 8 ? releaseMonthCenters[month].y - 220 : releaseMonthCenters[month].y - 100, key: month};
      i+=1;
    }


    // An api call is made to dynamically determine the number of clusters to split into based on the input data
    $.post('/cluster', {"data":JSON.stringify(rawData)}, function(data, error){
      
      var userRatingClusters = data["0"]["clusters"]
      var runtimeClusters = data["1"]["clusters"]
      var budgetClusters = data["2"]["clusters"]

      for (i = 0; i < userRatingClusters.length; i++) {
        var name = userRatingClusters[i]
        userRatingCenters[name] = {x: (i%3 + 1)*width/4 , y: (Math.floor(i/3) + 1) * height/4};
        userRatingTitlePositions[name + " stars"] = {x: userRatingCenters[name].x, y: i > 6 ? userRatingCenters[name].y - 50 : userRatingCenters[name].y - 380, key: name};
      }

      for (i = 0; i < runtimeClusters.length; i++) {
        var name = runtimeClusters[i]
        runtimeCenters[name] = {name: name, x:(i%3 + 1)*width/4 , y: (Math.floor(i/3) + 1) * height/4};
        runtimeTitlePositions[name + " mins"] = {x: runtimeCenters[name].x, y: runtimeCenters[name].y - 380, key: name};
      }

      for (i = 0; i < budgetClusters.length; i++) {
        var name = budgetClusters[i]
        budgetCenters[name] = {name: name, x:(i%3 + 1)*width/4 , y: (Math.floor(i/3) + 1) * height/4};
        budgetTitlePositions[name + " ($M)"] = {x: budgetCenters[name].x, y: i > 2 ? budgetCenters[name].y - 50 : budgetCenters[name].y - 380, key: name};
      }

      for (d in rawData) {
        rawData[d]["userRatingCluster"] = userRatingClusters[data["0"][rawData[d].id]]
        rawData[d]["runtimeCluster"] = runtimeClusters[data["1"][rawData[d].id]]
        rawData[d]["budgetCluster"] = budgetClusters[data["2"][rawData[d].id]]
      }

    }, "json");

  }

  /*
   * Creates a function that can be run to initialize a bubble chart
   */
  var chart = function chart(selector, rawData, nodeData) {
    // If nodes are not passed in
    if (nodeData == null) {
      // convert raw data into nodes data
      nodes = createNodes(rawData);
    } else {
      // copy the node data into new nodes
      nodes = createNodesFromNodes(nodeData);
    }

    createAllCenters(nodes);

    // Create the svg element in the input selector div
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create a legend for the coloring scheme
    colorScale = d3.scaleLinear().domain([0, 5]).range(['orange',  'purple']);

    var legend = svg.selectAll(".legend")
    .data(colorScale.ticks(9).reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + (50) + "," + (20 + i * 20) + ")"; });

    legend.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", colorScale);

    legend.append("text")
    .attr("x", 26)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text(function (d, i) {
        if (i == 0) {
          return "High Awards & Nominations";
        }
        if (i == 10) {
          return "Low Awards & Nominations";
        }
        return "";
      ;});


    // Create the bubbles in the svg with the input nodes
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create the circle elements for the bubbles
    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return d.color; })
      .attr('stroke', function (d) { return d3.rgb(d.color).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    bubbles = bubbles.merge(bubblesE);

    // Make the bubbles fade in
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // Add the nodes to the simulation
    simulation.nodes(nodes);

    // Initially group the bubbles into one big cluster
    groupBubbles();
  };

  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Title: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Genres: </span><span class="value">' +
                  addCommas(d.genre1 + " " + d.genre2 + " " + d.genre3) +
                  '</span><br/>' +
                  '<span class="name">Revenue($M): </span><span class="value">' +
                  truncate(d.revenue) +
                  '</span><br/>' +
                  '<span class="name">Budget($M): </span><span class="value">' +
                  d.budget + 
                  '</span><br/>' +
                  '<span class="name">IMDB Rating: </span><span class="value">' +
                  d.userRating + 
                  '</span><br/>' +
                  '<span class="name">Runtime (Mins): </span><span class="value">' +
                  d.runtime + 
                  '</span><br/>' +
                  '<span class="name">Nominations: </span><span class="value">' +
                  d.nominations + 
                  '</span><br/>' +                 
                  '<span class="name">Wins: </span><span class="value">' +
                  d.wins + 
                  '</span>';

    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(d.color).darker());

    tooltip.hideTooltip();
  }

  // Stores the which nodes are in which cluster if the bubbles are ever split
  var clusterData = {}

  // Allow access to the cluster data outside of this variable
  chart.getClusterData = function () {
    return clusterData;
  }

  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }


  // Function to determine the x position of a node based on its genre
  function nodeGenreXPos(d) {
    if (d.genre1 in clusterData) {
      clusterData[d.genre1].push(d);
    } else {
      clusterData[d.genre1] = [d];
    }
    
    return genreCenters[d.genre1].x;
  }

  // Function to determine the y position of a node based on its genre
  function nodeGenreYPos(d) {
    return genreCenters[d.genre1].y;
  }

  // Function to determine the x position of a node based on its runtime
  function nodeRuntimeXPos(d) {
    if (d.runtimeCluster in clusterData) {
      clusterData[d.runtimeCluster].push(d);
    } else {
      clusterData[d.runtimeCluster] = [d];
    }

    return runtimeCenters[d.runtimeCluster].x;
  }

  // Function to determine the y position of a node based on its runtime
  function nodeRuntimeYPos(d) {
    return runtimeCenters[d.runtimeCluster].y;
  }

  // Function to determine the x position of a node based on its budget
  function nodeBudgetXPos(d) {
    if (d.budgetCluster in clusterData) {
      clusterData[d.budgetCluster].push(d);
    } else {
      clusterData[d.budgetCluster] = [d];
    }

    return budgetCenters[d.budgetCluster].x;
  }

  // Function to determine the y position of a node based on its budget
  function nodeBudgetYPos(d) {

    return budgetCenters[d.budgetCluster].y;
  }

  // Function to determine the x position of a node based on its release month
  function nodeReleaseMonthXPos(d) {

    if (d.month in clusterData) {
      clusterData[d.month].push(d);
    } else {
      clusterData[d.month] = [d];
    }

    return releaseMonthCenters[d.month].x;
  }

  // Function to determine the y position of a node based on its release month
  function nodeReleaseMonthYPos(d) {
    return releaseMonthCenters[d.month].y;
  }

  // Function to determine the x position of a node based on its user rating
  function nodeUserRatingXPos(d) {
    if (d.userRatingCluster in clusterData) {
      clusterData[d.userRatingCluster].push(d);
    } else {
      clusterData[d.userRatingCluster] = [d];
    }

    return userRatingCenters[d.userRatingCluster].x;
  }

  // Function to determine the y position of a node based on its user rating
  function nodeUserRatingYPos(d) {
    return userRatingCenters[d.userRatingCluster].y;
  }


  // Group the bubbles into one big cluster in the center
  function groupBubbles() {
    hideTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
    simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));

    // restart the simulation
    simulation.alpha(1).restart();
  }


  /*
   * Splits the bubbles based on the input attribute
   */
  function splitBubbles(attr) {
    clusterData = {}
    clusterInfo = {}
    if (attr == "genre") {
      hideTitles();
      showTitles(genreTitlePositions);

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeGenreXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeGenreYPos));

      simulation.alpha(1).restart();
    } else if (attr == "runtime") {
      hideTitles();
      showTitles(runtimeTitlePositions);

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeRuntimeXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeRuntimeYPos));

      simulation.alpha(1).restart();
    } else if (attr == "budget") {
      hideTitles();
      showTitles(budgetTitlePositions);

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeBudgetXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeBudgetYPos));

      simulation.alpha(1).restart();
    } else if (attr == "releaseMonth") {
      hideTitles();
      showTitles(releaseMonthTitlePositions);

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeReleaseMonthXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeReleaseMonthYPos));

      simulation.alpha(1).restart();
    } else if (attr == "userRating") {
      hideTitles(); 
      showTitles(userRatingTitlePositions);

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeUserRatingXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeUserRatingYPos));

      simulation.alpha(1).restart();
    }
  }

  // Hides the titles for the clusters
  function hideTitles() {
    svg.selectAll('.title').remove();
  }

  // Shows the titles for the clusters based on the input title positions
  function showTitles(titlePositions) {

    var attrData = d3.keys(titlePositions);
    var titles = svg.selectAll('.title')
      .data(attrData);

    titles.enter().append('text')
      .attr('class', 'title')
      .attr('key', function (d) { return titlePositions[d].key; })
      .attr('x', function (d) { return titlePositions[d].x; })
      .attr('y', function (d) { return titlePositions[d].y; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

  // Converts a float number to a string with 3 decimal places
  function truncate(num) {
    num = num.toString();
    num = num.slice(0, (num.indexOf("."))+3); 
    Number(num);
    return num;
  }

  // Allows the bubble chart to be updated from outside this variable
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'all') {
      groupBubbles();
    } else {
      splitBubbles(displayName);
    }
  };

  return chart;
}

// Converts a number to a string and adds commas for readability
function addCommas(nStr) {
  var x = nStr.split(' ');
  var x1 = x[0];
  var x2 = x.length > 1 ? ', ' + x[1] : '';
  var x3 = x.length > 2 ? ', ' + x[2] : '';

  return x1 + x2 + x3;
}
