var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = document.getElementById("degreeCount").offsetWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

drawPlot("#degreeCount", "degreeCount", true, true, false, "log(Degree)", "log(Count)");
drawPlot("#degreePagerank", "degreePagerank", true, true, true, "log(Degree)", "log(PageRank)");
drawPlot("#radiusCount", "radiusCount", false, true, false, "Radius", "log(Count)");
drawPlot("#degreeRadius", "degreeRadius", true, false, true, "log(Degree)", "Radius");
drawPlot("#ev1ev2", "ev1ev2", false, false, false, "Eigenvalue 1", "Eigenvalue 2");
drawPlot("#ev2ev3", "ev2ev3", false, false, false, "Eigenvalue 2", "Eigenvalue 3");


function drawPlot (divId, fileName, xLog, yLog, heatMap, xLabelName, yLabelName) {
    // setup x 
    var xValue = function(d) { return d[0];}, // data -> value
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        
    // setup y
    var yValue = function(d) { return d[1];}, // data -> value
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    var zValue = function(d) { return d[2]; };
        
    
    // add the graph canvas to the corresponding div of the webpage
    var svg = d3.select(divId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // add the tooltip area to the webpage
    var tooltip = d3.select(divId).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    d3.text("/static/data/" + fileName, "text/csv", function(text) {
      var data = d3.tsv.parseRows(text);
      console.log("corresponding nodes num: " + data.length);
      data.forEach(function(d) {
        // console.log(d);
        d[0] = +d[0];
        if (xLog) {
          // degree
          d[0] = Math.log10(d[0]+1);
        }
        d[1] = +d[1];
        if (yLog) {
          // pagerank or count
          d[1] = Math.log10(d[1]);
        }
        if (heatMap) {
          // color
          d[2] = +d[2];
        }
        
      });

      if (heatMap) {
        var cValue = function(d) { return d[2];},
        color = d3.scale.quantize().range([
                "rgb(198,219,239)",
                "rgb(158,202,225)",
                "rgb(107,174,214)",
                "rgb(66,146,198)",
                "rgb(33,113,181)",
                "rgb(8,81,156)",
                "rgb(8,48,107)"]);
        color.domain(d3.extent([d3.min(data, zValue), d3.max(data, zValue)]));

        var colorScale = d3.scale.log().domain([d3.min(data, zValue), d3.max(data, zValue)]).interpolate(d3.interpolateHsl).range([d3.rgb(198,219,239), d3.rgb(8,48,107)]);
      }
      

      // don't want dots overlapping axis, so add in buffer to data domain
      xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
      yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

      // x-axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text(xLabelName);

      // y-axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(yLabelName);

      // draw dots
      svg.selectAll(".dot")
          .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 3.5)
          .attr("cx", xMap)
          .attr("cy", yMap)
          .style("fill", heatMap? function(d){ return colorScale(cValue(d))} : "SteelBlue" )
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("(" + (xLog?(Math.round(Math.pow(10,xValue(d))-1)):xValue(d))
               + ", " + (yLog?(Math.pow(10,yValue(d))):yValue(d)) + ")")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });
    });
}

