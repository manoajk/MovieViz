    
/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */

function bubbleChart() {
  // Constants for sizing
  var width = 2800;
  var height = 2100;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('gates_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  // var yearCenters = {
  //   2005: { x: width / 3, y: height / 2 },
  //   2010: { x: width / 2, y: height / 2 },
  //   2016: { x: 2 * width / 3, y: height / 2 }
  // };

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

  var genreTitlePositions = {};/*{
    Thriller: {x: 353, y:182},
    'Sci-Fi': {x: 802, y:182},
    Romance: {x: 1291, y:173},
    Mystery: {x: 1726, y:202},
    Horror: {x: 353, y: 405},
    Fantasy: {x: 802, y: 455},
    Drama: {x: 1291, y: 411},
    Documentary: {x: 1726, y: 585},
    Crime: {x: 353, y: 706},
    Comedy: {x: 802, y: 693},
    Biography: {x: 1291, y: 780},
    Adventure: {x: 1717, y: 723},
    Action: {x: 353, y: 1010},
    Western: {x: 842, y: 1210},
    Animation: {x: 1291, y: 1210},
    Family: {x: 1676, y: 1210}
  };*/

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

  // @v4 strength to apply to the position forces
  var forceStrength = 0.1;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];
  var attributes = ['genre', 'runtime', 'userRating', 'mpaaRating', 'principleCast', 'releaseMonth', 'filmingLocation', 'budget'];
  var selectedAttribute = attributes[0];

  // Charge function that is called for each node.
  // As part of the ManyBody force.
  // This is what creates the repulsion between nodes.
  //
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  //
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  //
  // Charge is negative because we want nodes to repel.
  // @v4 Before the charge was a stand-alone attribute
  //  of the force layout. Now we can use it as a separate force!
  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  // Here we create a force layout and
  // @v4 We create a force simulation now and
  //  add forces to it.
  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  // @v4 Force starts up automatically,
  //  which we don't want as there aren't any nodes yet.
  simulation.stop();


  // Nice looking colors - no reason to buck the trend
  // @v4 scales now have a flattened naming scheme
  // var fillColor = d3.scaleOrdinal()
  //   .domain([runtime])
  //   .range(['#d84b2a', '#beccae', '#7aa25c']);


  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  function createNodes(rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    var maxAmount = d3.max(rawData, function (d) { return +(d.wins + 0.5*d.nominations); });

    var minAmount = d3.min(rawData, function(d) {return +(d.wins + 0.5*d.nominations); });

    var maxAmount2 = d3.max(rawData, function (d) { return +d.revenue - (+d.budget); });

    var minAmount2 = d3.min(rawData, function(d) {return +d.revenue - (+d.budget); });

    //var clusterInformation = gatherClusterInformation(rawData, selectedAttribute);

    // Sizes bubbles based on area.
    // @v4: new flattened scale names.
    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 30])
      .domain([minAmount2, maxAmount2]);

    var fillColor = d3.scaleLinear()
    .domain([0, maxAmount])
    .range(['orange',  'purple']);

    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function (d) {
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
    myNodes.sort(function (a, b) { return b.revenue - a.revenue; });

    return myNodes;
  }

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  function createNodesFromNodes(nodeData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    var maxAmount = d3.max(nodeData, function (d) { return +(d.wins + 0.5*d.nominations); });

    var minAmount = d3.min(nodeData, function(d) {return +(d.wins + 0.5*d.nominations); });

    var maxAmount2 = d3.max(nodeData, function (d) { return +d.revenue - (+d.budget); });

    var minAmount2 = d3.min(nodeData, function(d) {return +d.revenue - (+d.budget); });

    //var clusterInformation = gatherClusterInformation(rawData, selectedAttribute);

    // Sizes bubbles based on area.
    // @v4: new flattened scale names.
    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 30])
      .domain([minAmount2, maxAmount2]);

    var fillColor = d3.scaleLinear()
    .domain([0, maxAmount])
    .range(['orange',  'purple']);

    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = nodeData.map(function (d) {
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
    myNodes.sort(function (a, b) { return b.revenue - a.revenue; });

    return myNodes;
  }

  function gatherClusterInformation(rawData, selectedAttribute) {
    clusterInfo = [];

    switch(selectedAttribute) {
      case 'genre':
        clusterInfo = d3.nest()
        .key(function(d) {return d.genre1;})
        .rollup(function(v) {return {
          count: v.length,
          avgRev: d3.mean(v, function(d) {return d.revenue;}),
          avgNoms: d3.mean(v, function(d) {return d.nominations;}),
          avgWins: d3.mean(v, function(d) {return d.wins;}),
          avgRunT: d3.mean(v, function(d) {return d.runtimeMinutes;})
        };  })
        .entries(rawData);
      case 'runtime':
        clusterInfo = d3.nest()
      default:
        console.log("default clause in switch case");
    }
    console.log(clusterInfo);
  }

  function createAllCenters(rawData) {

    runtimeMax = d3.max(rawData, function(d) {return +d.runtime;});
    runtimeMin = d3.min(rawData, function(d) {return +d.runtime;});

    budgetMin = d3.min(rawData, function(d) {return +d.budget;});
    budgetMax = d3.max(rawData, function(d) {return +d.budget;});

    budgetBuckets = createBuckets(budgetMax, budgetMin, 9);
    runtimeBuckets = createBuckets(runtimeMax, runtimeMin, 9);

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

    console.log(userRatingCenters)

    $.getJSON('/cluster', function(data, error){
      console.log("got cluster data")
      
      var userRatingClusters = data["0"]["clusters"]
      var runtimeClusters = data["1"]["clusters"]
      var budgetClusters = data["2"]["clusters"]

      for (i = 0; i < userRatingClusters.length; i++) {
        var name = userRatingClusters[i]
        userRatingCenters[name] = {x: (i%3 + 1)*width/4 , y: (Math.floor(i/3) + 1) * height/4};
        userRatingTitlePositions[name + " stars"] = {x: userRatingCenters[name].x, y: i > 6 ? userRatingCenters[name].y - 50 : userRatingCenters[name].y - 280, key: name};
      }

      for (i = 0; i < runtimeClusters.length; i++) {
        var name = runtimeClusters[i]
        runtimeCenters[name] = {name: name, x:(i%3 + 1)*width/4 , y: (Math.floor(i/3) + 1) * height/4};
        runtimeTitlePositions[name + " mins"] = {x: runtimeCenters[name].x, y: i > 4 ? runtimeCenters[name].y - 50 : runtimeCenters[name].y - 300, key: name};
      }

      for (i = 0; i < budgetClusters.length; i++) {
        var name = budgetClusters[i]
        budgetCenters[name] = {name: name, x:(i%3 + 1)*width/4 , y: (Math.floor(i/3) + 1) * height/4};
        budgetTitlePositions[name + " ($M)"] = {x: budgetCenters[name].x, y: i > 2 ? budgetCenters[name].y - 50 : budgetCenters[name].y - 340, key: name};
      }

      for (d in rawData) {
        rawData[d]["userRatingCluster"] = userRatingClusters[data["0"][rawData[d].id]]
        rawData[d]["runtimeCluster"] = runtimeClusters[data["1"][rawData[d].id]]
        rawData[d]["budgetCluster"] = budgetClusters[data["2"][rawData[d].id]]
        console.log(rawData[d].tconst)
        console.log(rawData[d])
      }

      console.log("finished cluster data")
      console.log(rawData)
    });

    console.log(userRatingCenters)

  }

  function createBuckets(maxVal, minVal, numBuckets) {
    bucketRange = Math.floor((maxVal - minVal) / numBuckets);
    buckets = [];
    minVal = Math.floor(minVal);
    buckets.push(String(minVal) + '-' + String(bucketRange + minVal));
    for (i = 1; i < numBuckets - 1; i++) {
      buckets.push(String(bucketRange*i + minVal + 1) + '-' + String(bucketRange*(i+1) + minVal));
    }
    buckets.push((bucketRange*(i) + minVal + 1) + '-' + String(maxVal));
    return buckets;
  }
  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData, nodeData) {
    if (nodeData == null) {
      // convert raw data into nodes data
      nodes = createNodes(rawData);
    } else {
      nodes = createNodesFromNodes(nodeData);
    }

    createAllCenters(nodes);
    console.log(nodes)

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    // @v4 Selections are immutable, so lets capture the
    //  enter selection to apply our transtition to below.
    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return d.color; })
      .attr('stroke', function (d) { return d3.rgb(d.color).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail)
      .on('click', clusterClicked);

    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!
    simulation.nodes(nodes);

    // Set initial layout to single group.
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

  function clusterClicked(d) {
    console.log()
  }

  var clusterData = {}
  var clusterInfo = {}

  /*
   * Callback function that is called after every tick of the
   * force simulation.
   * Here we do the acutal repositioning of the SVG circles
   * based on the current x and y values of their bound node data.
   * These x and y values are modified by the force simulation.
   */
  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }


  function nodeGenreXPos(d) {
    //console.log(d);
    if (d.genre1 in clusterData) {
      clusterData[d.genre1].push(d);
    } else {
      clusterData[d.genre1] = [d];
    }
    
    return genreCenters[d.genre1].x;
  }

  function nodeGenreYPos(d) {
    return genreCenters[d.genre1].y;
  }

  function nodeRuntimeXPos(d) {
    

    // minRuntime = parseInt(runtimeCenters[0].name.split("-")[0]);
    // maxRuntime = parseInt(runtimeCenters[runtimeCenters.length - 1].name.split("-")[1]);
    // binSize = parseInt(runtimeCenters[0].name.split("-")[1] - runtimeCenters[0].name.split("-")[0]);
    // bucketIndex = Math.floor((d.runtime - minRuntime) / binSize);
    // if (bucketIndex > 8) bucketIndex = 8;

    if (d.runtimeCluster in clusterData) {
      clusterData[d.runtimeCluster].push(d);
    } else {
      clusterData[d.runtimeCluster] = [d];
    }

    // return runtimeCenters[bucketIndex].x;
    return runtimeCenters[d.runtimeCluster].x;
  }

  function nodeRuntimeYPos(d) {
    // minRuntime = parseInt(runtimeCenters[0].name.split("-")[0]);
    // maxRuntime = parseInt(runtimeCenters[runtimeCenters.length - 1].name.split("-")[1]);
    // binSize = parseInt(runtimeCenters[0].name.split("-")[1] - runtimeCenters[0].name.split("-")[0]);
    // bucketIndex = Math.floor((d.runtime - minRuntime) / binSize);
    // if (bucketIndex > 8) bucketIndex = 8;
    // return runtimeCenters[bucketIndex].y;
    return runtimeCenters[d.runtimeCluster].y;
  }

  function nodeBudgetXPos(d) {
    // minBudget = parseInt(budgetCenters[0].name.split("-")[0]);
    // maxBudget = parseInt(budgetCenters[budgetCenters.length - 1].name.split("-")[1]);
    // binSize = parseInt(budgetCenters[0].name.split("-")[1] - budgetCenters[0].name.split("-")[0]);
    // bucketIndex = Math.floor((d.budget - minBudget) / binSize);
    // if (bucketIndex > 8) bucketIndex = 8;

    if (d.budgetCluster in clusterData) {
      clusterData[d.budgetCluster].push(d);
    } else {
      clusterData[d.budgetCluster] = [d];
    }

    // return budgetCenters[bucketIndex].x;
    return budgetCenters[d.budgetCluster].x;
  }

  function nodeBudgetYPos(d) {
    // minBudget = parseInt(budgetCenters[0].name.split("-")[0]);
    // maxBudget = parseInt(budgetCenters[budgetCenters.length - 1].name.split("-")[1]);
    // binSize = parseInt(budgetCenters[0].name.split("-")[1] - budgetCenters[0].name.split("-")[0]);
    // bucketIndex = Math.floor((d.budget - minBudget) / binSize);
    // if (bucketIndex > 8) bucketIndex = 8;
    // return budgetCenters[bucketIndex].y;

    return budgetCenters[d.budgetCluster].y;
  }

  function nodeReleaseMonthXPos(d) {

    if (d.month in clusterData) {
      clusterData[d.month].push(d);
    } else {
      clusterData[d.month] = [d];
    }

    return releaseMonthCenters[d.month].x;
  }

  function nodeReleaseMonthYPos(d) {
    return releaseMonthCenters[d.month].y;
  }

  function nodeUserRatingXPos(d) {
    // userRating = 0;
    // if (isNaN(d.userRating)) { userRating = 1; }
    // else if (+d.userRating >= 10) {userRating = 9;}
    // else userRating = Math.floor(+d.userRating);

    if (d.userRatingCluster in clusterData) {
      clusterData[d.userRatingCluster].push(d);
    } else {
      clusterData[d.userRatingCluster] = [d];
    }

    // return userRatingCenters[userRating - 1].x;
    return userRatingCenters[d.userRatingCluster].x;
  }

  function nodeUserRatingYPos(d) {
    // userRating = 0;
    // if (isNaN(d.userRating)) { userRating = 1; }
    // else if (+d.userRating >= 10) {userRating = 9;}
    // else userRating = Math.floor(+d.userRating);
    // return userRatingCenters[userRating - 1].y;
    return userRatingCenters[d.userRatingCluster].y;
  }


  chart.getClusterData = function () {
    return clusterData;
  }

  chart.getClusterInfo = function () {
    return clusterInfo;
  }

  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    console.log("Grouping bubbles");

    hideTitles();

    // @v4 Reset the 'x' force to draw the bubbles to the center.
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
    simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }


  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * yearCenter of their data's year.
   */
  function splitBubbles(attr) {
    clusterData = {}
    clusterInfo = {}
    if (attr == "genre") {
      hideTitles();
      showTitles(genreTitlePositions);
      //showYearTitles();

      // @v4 Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeGenreXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeGenreYPos));

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    } else if (attr == "runtime") {
      hideTitles();
      showTitles(runtimeTitlePositions);

      // @v4 Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeRuntimeXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeRuntimeYPos));

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    } else if (attr == "budget") {
      hideTitles();
      showTitles(budgetTitlePositions);

      // @v4 Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeBudgetXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeBudgetYPos));

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    } else if (attr == "releaseMonth") {
      hideTitles();
      showTitles(releaseMonthTitlePositions);

      // @v4 Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeReleaseMonthXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeReleaseMonthYPos));

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    } else if (attr == "userRating") {
      hideTitles(); 
      showTitles(userRatingTitlePositions);

      // @v4 Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeUserRatingXPos));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodeUserRatingYPos));

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(1).restart();
    }
  }

  /*
   * Hides Year title displays.
   */
  function hideTitles() {
    svg.selectAll('.title').remove();
  }

  function showTitles(titlePositions) {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var genreData = d3.keys(titlePositions);
    var genres = svg.selectAll('.title')
      .data(genreData);

    genres.enter().append('text')
      .attr('class', 'title')
      .attr('key', function (d) { return titlePositions[d].key; })
      .attr('x', function (d) { return titlePositions[d].x; })
      .attr('y', function (d) { return titlePositions[d].y; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

  function truncate(num) {
    num = num.toString(); //If it's not already a String
    num = num.slice(0, (num.indexOf("."))+3); //With 3 exposing the hundredths place
    Number(num);
    return num;
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'year' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'all') {
      groupBubbles();
    } else {
      splitBubbles(displayName);
    }
  };


  // return the chart function from closure.
  return chart;
}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  var x = nStr.split(' ');
  var x1 = x[0];
  var x2 = x.length > 1 ? ', ' + x[1] : '';
  var x3 = x.length > 2 ? ', ' + x[2] : '';

  return x1 + x2 + x3;
}

function gatherClusterInformation(rawData, selectedAttribute) {
    clusterInfo = [];
    clusterData = {};

    switch(selectedAttribute) {
      case 'genre':
        d3.nest()
        .key(function(d) {return d.genre1;})
        .rollup(function(v) { 
          clusterDict = {};
          clusterDict[v[0].genre1] = {
            count: v.length,
            avgRev: d3.mean(v, function(d) {return d.revenue;}),
            avgNoms: d3.mean(v, function(d) {return d.nominations;}),
            avgWins: d3.mean(v, function(d) {return d.wins;}),
            avgRunT: d3.mean(v, function(d) {return d.runtimeMinutes;})
          };
          clusterInfo.push(clusterDict);

          clusterData[v[0].genre1] = v;

        })
        .entries(rawData);
      case 'userRating':
        d3.nest()
        .key(function(d) {
          userRating = 0;
          if (isNaN(d.userRating)) { userRating = 1; }
          else if (+d.userRating >= 10) {userRating = 9;}
          else userRating = Math.floor(+d.userRating);
          return userRating;
        })
        .rollup(function(v) { 
          clusterDict = {};
          userRating = 0;
          if (isNaN(d.userRating)) { userRating = 1; }
          else if (+d.userRating >= 10) {userRating = 9;}
          else userRating = Math.floor(+d.userRating);
          clusterDict[userRating + ' stars'] = {
            count: v.length,
            avgRev: d3.mean(v, function(d) {return d.revenue;}),
            avgNoms: d3.mean(v, function(d) {return d.nominations;}),
            avgWins: d3.mean(v, function(d) {return d.wins;}),
            avgRunT: d3.mean(v, function(d) {return d.runtimeMinutes;})
          };
          clusterInfo.push(clusterDict);

          clusterData[userRating + ' stars'] = v;

        })
        .entries(rawData);
      case 'runtime':
        d3.nest()
        .key(function(d) {
          userRating = 0;
          if (isNaN(d.userRating)) { userRating = 1; }
          else if (+d.userRating >= 10) {userRating = 9;}
          else userRating = Math.floor(+d.userRating);
          return userRating;
        })
        .rollup(function(v) { 
          clusterDict = {};
          userRating = 0;
          if (isNaN(d.userRating)) { userRating = 1; }
          else if (+d.userRating >= 10) {userRating = 9;}
          else userRating = Math.floor(+d.userRating);
          clusterDict[userRating + ' stars'] = {
            count: v.length,
            avgRev: d3.mean(v, function(d) {return d.revenue;}),
            avgNoms: d3.mean(v, function(d) {return d.nominations;}),
            avgWins: d3.mean(v, function(d) {return d.wins;}),
            avgRunT: d3.mean(v, function(d) {return d.runtimeMinutes;})
          };
          clusterInfo.push(clusterDict);

          clusterData[userRating + ' stars'] = v;

        })
        .entries(rawData);
      default:
        console.log("default clause in switch case");
    }
    return {'clusterInfo':clusterInfo, 'clusterData': clusterData};
  }
