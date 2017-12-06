    
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
  var width = 2100;
  var height = 1400;

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

  var genreTitlePositions = {
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
  };


    var yearCenters = {
    2000: {x: width/5, y:height/5},
    2001: {x: 2*width/5, y:height/5},
    2002: {x: 3*width/5, y:height/5},
    2003: {x: 4*width/5, y:height/5},
    2004: {x: width/5, y: 2*height/5},
    2005: {x: 2*width/5, y: 2*height/5},
    2006: {x: 3*width/5, y: 2*height/5},
    2007: {x: 4*width/5, y: 2*height/5},
    2008: {x: width/5, y: 3*height/5},
    2009: {x: 2*width/5, y: 3*height/5},
    2010: {x: 3*width/5, y: 3*height/5},
    2011: {x: 4*width/5, y: 3*height/5},
    2012: {x: width/5, y: 4*height/5},
    2013: {x: 2*width/5, y: 4*height/5},
    2014: {x: 3*width/5, y: 4*height/5},
    '2015-16': {x: 4*width/5, y: 4*height/5}
  };

  var yearTitlePositions = {
    2000: {x: 353, y:162},
    2001: {x: 802, y:162},
    2002: {x: 1291, y:153},
    2003: {x: 1726, y:162},
    2004: {x: 353, y: 465},
    2005: {x: 802, y: 465},
    2006: {x: 1291, y: 481},
    2007: {x: 1726, y: 485},
    2008: {x: 353, y: 746},
    2009: {x: 812, y: 753},
    2010: {x: 1291, y: 780},
    2011: {x: 1717, y: 983},
    2012: {x: 353, y: 1090},
    2013: {x: 842, y: 1220},
    2014: {x: 1291, y: 1220},
    '2015-16': {x: 1706, y: 1210}
  };

  // X locations of the year titles.
  var yearsTitleX = {
    2005: 160,
    2010: width / 2,
    2016: width - 160
  };

  // @v4 strength to apply to the position forces
  var forceStrength = 0.1;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];
  var attributes = ['genre', 'runtime', 'userRating', 'mpaaRating', 'principleCast', 'releaseDate', 'filmingLocation', 'budget'];
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

    var maxAmount2 = d3.max(rawData, function (d) { return +d.revenue; });

    var minAmount2 = d3.min(rawData, function(d) {return +d.revenue; });

    var clusterInformation = gatherClusterInformation(rawData, selectedAttribute);

    // Sizes bubbles based on area.
    // @v4: new flattened scale names.
    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 20])
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
        radius: radiusScale(+d.revenue),
        runtime: +d.runtimeMinutes,
        name: d.primaryTitle,
        color: fillColor(+ (d.wins + 0.5*d.nominations)),
        genre1: d.genre1,
        wins: +d.wins,
        nominations: +d.nominations,
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
  var chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    console.log(rawData)
    nodes = createNodes(rawData);

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
                  '<span class="name">Genre: </span><span class="value">' +
                  addCommas(d.genre1) +
                  '</span><br/>' +
                  '<span class="name">Revenue($M): </span><span class="value">' +
                  truncate(d.revenue) +
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

  /*
   * Provides a x value for each node to be used with the split by year
   * x force.
   */
  function nodeYearPos(d) {
    var yr;
    if (d.year <= 2005) {
      yr = 2005;
    } else if (d.year <= 2010) {
      yr = 2010;
    } else {
      yr = 2016;
    }
    return yearCenters[yr].x;
  }

  function nodeGenreXPos(d) {
    //console.log(d);
    return genreCenters[d.genre1].x;
  }

  function nodeGenreYPos(d) {
    return genreCenters[d.genre1].y;
  }

  function nodeYearXPos(d) {
    //console.log(d);
    var yr;
    if (d.year >= 2015) {
      yr = '2015-16';
    } else if (d.year < 2000) {
      yr = 2000;
    } else {
      yr = d.year;
    }
    console.log(yr);
    return yearCenters[yr].x;
  }

  function nodeYearYPos(d) {
    var yr;
    if (d.year >= 2015) {
      yr = '2015-16';
    } else if (d.year < 2000) {
      yr = 2000;
    } else {
      yr = d.year;
    }
    return yearCenters[yr].y;
  }


  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideYearTitles();

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
    showGenreTitles();
    //showYearTitles();

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(forceStrength).x(/*nodeYearXPos*/nodeGenreXPos));
    simulation.force('y', d3.forceY().strength(forceStrength).y(/*nodeYearYPos*/ nodeGenreYPos));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  /*
   * Hides Year title displays.
   */
  function hideYearTitles() {
    svg.selectAll('.title').remove();
  }

  /*
   * Shows Year title displays.
   */
  function showYearTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var yearsData = d3.keys(yearTitlePositions);
    var years = svg.selectAll('.title')
      .data(yearsData);

    years.enter().append('text')
      .attr('class', 'title')
      .attr('x', function (d) { return yearTitlePositions[d].x; })
      .attr('y', function (d) { return yearTitlePositions[d].y; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

  function showGenreTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var genreData = d3.keys(genreTitlePositions);
    var genres = svg.selectAll('.title')
      .data(genreData);

    genres.enter().append('text')
      .attr('class', 'title')
      .attr('x', function (d) { return genreTitlePositions[d].x; })
      .attr('y', function (d) { return genreTitlePositions[d].y; })
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
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
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
      case 'runtime':
        clusterInfo = d3.nest()
      default:
        console.log("default clause in switch case");
    }
    return {'clusterInfo':clusterInfo, 'clusterData': clusterData};
  }
