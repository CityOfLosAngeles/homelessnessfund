// inspiration from https://bl.ocks.org/mbostock/3885304

// function to run on the data
plotData = function(error, data, dataType) {
  if (error) throw error;

  /* Initial setup. Then draw axes using percentage scale, fiscal years, draw bars with height 0 */

  // Constants for sizing
  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;

  // maintain a ratio of 2.5 width to 1 height, but scale to window. Max width of 1000.
  var width = d3.min([1000, y * 1.2, x * 0.75]);
  var height = width / 2.5;

  // scale the toolbars
  var label_size = d3.min([d3.max([12, (height / 15)]), 18]) + "px",
      entry_size = d3.min([d3.max([10, (height / 20)]), 16]) + "px",
      heading_size = d3.min([d3.max([16, (height / 10)]), 46]) + "px";
  d3.selectAll('#heading').style('font-size', heading_size);
  d3.selectAll('.toolbar_label').attr('style', "padding:0px 0px 0px 10px; font-weight: bold; font-size: " + label_size);
  d3.selectAll('.btn-group').selectAll('.btn').attr('style', "font-size: " + entry_size);
  
  var svg = d3.select("#vis")
    .append("svg")
    .attr('height', height)
    .attr('width', width);

  var graphMargin = {top: 40, right: width * 0.4, bottom: 20, left: 80},
    graphWidth = width - graphMargin.left - graphMargin.right,
    graphHeight = height - graphMargin.top - graphMargin.bottom;

  var x = d3.scaleBand().rangeRound([0, graphWidth]).padding(0.1),
      y = d3.scaleLinear().rangeRound([graphHeight, 0]);

  var axisTextSize = d3.min([d3.max([8, (graphHeight / 20)]), 15]) + "px"

  var graph = svg.append("g")
    .attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top + ")");

  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0, 500]);

  // first year of data
  var beginning_year = d3.min(data.map(function(d){return d.year}));


  // draw x axis
  graph.append("g")
      .style('font-size', axisTextSize)
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(d3.axisBottom(x));

  // draw y axis
  graph.append("g")
      .style('font-size', axisTextSize)
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(12))
      .append("text")
      .classed('yAxisText', true)
      .attr('x', 10)
      .attr('y', -30)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("");

  /* draw bars with height 0 */

  // total funds in the background. draw the combined height; only (total - reserve) = BSF will show up.
  // graph.selectAll('tBar')
  //   .data(data)
  //   .enter().append('rect')
  //   .attr('class', 'bar tBar')
  //   .attr('x', function(d) {return x(d.year)})
  //   .attr('y', graphHeight)
  //   .attr('width', x.bandwidth()/2)
  //   .attr('height', 0)
  //   .attr('fill', 'skyblue')
  //   .on('mouseenter', showFloatingTooltip)
  //   .on('mouseleave', function() {
  //     graph.select('.outline').remove();
  //     floating_tooltip.hideTooltip();
  //   });

  // bar for reserve fund
  graph.selectAll(".rBar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar rBar")
      .attr("x", function(d) { return x(d.year); })
      .attr("y", graphHeight)
      .attr("width", x.bandwidth()/2)
      .attr("height", 0)
      .attr('fill', 'steelblue')
      .on('mouseenter', showFloatingTooltip)
      .on('mouseleave', function() {
        graph.select('.outline').remove();
        floating_tooltip.hideTooltip();
      });

  // draw legend
  // legend = graph.append('g');
  // legendX = width * 0.6;
  // legendY = graphHeight * 0.25
  // legendSize = 0.8 * x.bandwidth()/2;

  // // voter-approved debt
  // legend.append('rect')
  //   .attr('x', legendX)
  //   .attr('y', legendY + legendSize)
  //   .attr('width', legendSize)
  //   .attr('height', legendSize)
  //   .attr('fill', 'skyblue');

  // legend.append('text')
  //   .attr('x', legendX + 1.5 * legendSize)
  //   .attr('y', legendY + 1.6 * legendSize)
  //   .attr('font-size', axisTextSize)
  //   .text('Budget Stabilization Fund');

  // // reserve fund
  // legend.append('rect')
  //   .attr('x', legendX)
  //   .attr('y', legendY + 2.5 * legendSize)
  //   .attr('width', legendSize)
  //   .attr('height', legendSize)
  //   .attr('fill', 'steelblue');

  // legend.append('text')
  //   .attr('x', legendX + 1.5 * legendSize)
  //   .attr('y', legendY + 3.1 * legendSize)
  //   .attr('font-size', axisTextSize)
  //   .text('Reserve Fund');


  function drawValues() {
    // change y axis (immmediate, no transition)
    var y = d3.scaleLinear().rangeRound([graphHeight, 0]).domain([0, 500]);
    d3.selectAll('.axis--y')
        .call(d3.axisLeft(y).ticks(12));

    d3.selectAll('.yAxisText')
        .text('$ (Millions)');

    // // transition total funds bars
    // graph.selectAll('.tBar')
    //   .transition()
    //   .duration(500)
    //   .attr('y', function(d) {return y(d.total / 1e6)})
    //   .attr('height', function(d) {return graphHeight - y(d.total / 1e6); });

    // transition reserve fund bars
    graph.selectAll(".rBar")
      //.transition()
      //.duration(500)
      .attr("y", function(d) { return y(d.reserve_fund / 1e6); })
      .attr("height", function(d) { return graphHeight - y(d.reserve_fund / 1e6); });

    // draw line
    //var pLine = d3.line()
      //.x(function(d) { return x(d.year) + (0.5 * x.bandwidth()); })
      //.y(function(d) { return y(0.05 * d.general_fund / 1e6); });
    //d3.selectAll('.pLine')
      //.transition()
      //.duration(500)
      //.attr('d', pLine);

    // place the label
    //d3.selectAll('.policyText')
      //.transition()
      //.duration(500)
      //.attr('y', y(270))
  }


  /* tooltip for displaying data on each item */
  var floating_tooltip = floatingTooltip('floatingTooltip', "200px");

  function showFloatingTooltip(d) {
    // get the active view
    //view = d3.select('#view_toolbar').selectAll('.btn').filter('.active').attr('id');

    // set the height
     //if (view=='values') {
      var y = d3.scaleLinear().rangeRound([graphHeight, 0]).domain([0, 500]);
      var h = y(d.reserve_fund / 1e6);
    //}

    // outline the bar for that year
    graph.append('rect')
      .attr('class', 'outline')
      .attr('x', x(d.year))
      .attr('y', h)
      .attr('width', x.bandwidth()/2)
      .attr('height', graphHeight - h)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    var content = '<span class="heading"><p style="text-align: center">Fiscal Year ' + d.year + '</p></span>' + 
                  '<table><tr><td style="padding: 0px 10px 0px 20px">Total Allocated Dollars for Homelessness</td></tr><td style="text-align: center">' + formatAmount(d.reserve_fund) + '</td></tr></table>';
    // display tooltip
    floating_tooltip.revealTooltip(content, d3.event);
  }

  // Sets up the buttons to allow for toggling between modes
  //d3.selectAll('.btn-group')
    //.selectAll('.btn')
    //.on('click', function() {
        // set all buttons on the clicked toolbar as inactive, then activate the clicked button
      //  var p = d3.select(this.parentNode);
        //p.selectAll('.btn').classed('active', false);
        //d3.select(this).classed('active', true);
  
        // toggle
       // if (d3.select(this).attr('id')=='values') {
          drawValues();
        //}
      //});


}

d3.csv("homelessnessfund.csv", function(d) {
  d.year = +d.fiscal_year;
  d.reserve_fund = +d.Total * 1e6;
  //d.general_fund = +d.general_fund * 1e6;
  //d.total = +d.total *1e6;
  return d;
}, plotData);

