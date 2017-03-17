var req;
var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
      // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} ();

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { return d[0];}, // data -> value
    xScale1 = d3.scale.linear().range([0, width]), // value -> display
    xScale2 = d3.scale.linear().range([0, width]), // value -> display
    xMap1 = function(d) { return xScale1(xValue(d));}, // data -> display
    xMap2 = function(d) { return xScale2(xValue(d));}, // data -> display
    xAxis1 = d3.svg.axis().scale(xScale1).orient("bottom");
    xAxis2 = d3.svg.axis().scale(xScale2).orient("bottom");

// setup y
var yValue = function(d) { return d[1];}, // data -> value
    yScale1 = d3.scale.linear().range([height, 0]), // value -> display
    yScale2 = d3.scale.linear().range([height, 0]), // value -> display
    yMap1 = function(d) { return yScale1(yValue(d));}, // data -> display
    yMap2 = function(d) { return yScale2(yValue(d));}, // data -> display
    yAxis1 = d3.svg.axis().scale(yScale1).orient("left");
    yAxis2 = d3.svg.axis().scale(yScale2).orient("left");

/* // setup fill color
var cValue = function(d) { return d[1];},
    color = d3.scale.category10();
*/

// add the graph canvas to the body of the webpage
var svg1 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.text("/static/data/" + QueryString.fileName1, "text/csv", function(text) {
   var data = d3.tsv.parseRows(text);

  // change string (from TSV) into number format
  data.forEach(function(d) {
    d[0] = +d[0];
    // d[0] = Math.log10(d[0]);
    d[1] = +d[1];
    // d[1] = Math.log10(d[1]);
    // console.log(d);
  });
  var addPartX = 2*(0 - d3.min(data, xValue));
  var addPartY = 2*(0 - d3.min(data, yValue));
  data.forEach(function(d) {
    d[0] = addPartX+d[0];
    d[0] = Math.log10(d[0]);
    d[1] = addPartY+d[1];
    d[1] = Math.log10(d[1]);
    // console.log(d);
  });
  // don't want dots overlapping axis, so add in buffer to data domain
  xScale1.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale1.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg1.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis1)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(QueryString.xLabel1);

  // y-axis
  svg1.append("g")
      .attr("class", "y axis")
      .call(yAxis1)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(QueryString.yLabel1);

  // draw dots
  svg1.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap1)
      .attr("cy", yMap1)
      .style("fill", 'SteelBlue') 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html("(" + Math.round(Math.pow(10,xValue(d))) 
           + ", " + Math.round(Math.pow(10,yValue(d))) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      })
      .on("click", function(d){
        console.log('enter click');
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = handleResponse1;
        req.open("GET", "../Update/?plot=1&x="
          + Math.round(Math.pow(10,xValue(d)))
          + "&y=" + Math.round(Math.pow(10,yValue(d))), true);
        req.send(); 
        

      });

/*
  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})
*/      
});

function handleResponse1() {
    console.log("enter handleResponse1")
    if (req.readyState != 4 || req.status != 200) {
        return;
    }

    // restore the original plot color
    svg2.selectAll("circle")
    .style("fill",'SteelBlue');

    // Parses the Text response
    var textData = req.responseText;
    if (textData.length > 0) {
      textData = textData.substring(0,textData.length - 1);
    }
    var res = textData.split(";");
    console.log("corresponding nodes num: " + res.length);
    res.forEach(function(d) {
      // console.log(d);
      d = d.split("\t");
      d[0] = +d[0];
      d[0] = Math.log10(d[0]);
      d[1] = +d[1];
      d[1] = Math.log10(d[1]);
      // update dots
      var dots2Update = svg2.select("circle[cx='" + xMap2(d) + "'][cy='" + yMap2(d) + "']");
      dots2Update.style("fill", 'red');
      // console.log(d);
    });
    
}

d3.text("/static/data/" + QueryString.fileName2, "text/csv", function(text) {
   var data = d3.tsv.parseRows(text);

  // change string (from TSV) into number format
  data.forEach(function(d) {
    d[0] = +d[0];
    // d[0] = Math.log10(d[0]);
    d[1] = +d[1];
    // d[1] = Math.log10(d[1]);
    // console.log(d);
  });
  var addPartX = 2*(0 - d3.min(data, xValue));
  var addPartY = 2*(0 - d3.min(data, yValue));
  data.forEach(function(d) {
    d[0] = addPartX+d[0];
    d[0] = Math.log10(d[0]);
    d[1] = addPartY+d[1];
    d[1] = Math.log10(d[1]);
    // console.log(d);
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale2.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale2.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis2)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(QueryString.xLabel2);

  // y-axis
  svg2.append("g")
      .attr("class", "y axis")
      .call(yAxis2)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(QueryString.yLabel2);

  // draw dots
  svg2.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap2)
      .attr("cy", yMap2)
      .style("fill", 'SteelBlue') 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html("(" + Math.round(Math.pow(10,xValue(d))) 
           + ", " + Math.round(Math.pow(10,yValue(d))) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      })
      .on("click", function(d){
        console.log('enter click');
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = handleResponse2;
        req.open("GET", "../Update/?plot=2&x="
          + Math.round(Math.pow(10,xValue(d)))
          + "&y=" + Math.round(Math.pow(10,yValue(d))), true);
        req.send(); 
        

      });    
});

function handleResponse2() {
    console.log("enter handleResponse2")
    if (req.readyState != 4 || req.status != 200) {
        return;
    }
    // restore the original plot color
    svg1.selectAll("circle")
    .style("fill",'SteelBlue');

    // Parses the Text response
    var textData = req.responseText;
    if (textData.length > 0) {
      textData = textData.substring(0,textData.length - 1);
    }
    var res = textData.split(";");
    console.log("corresponding nodes num: " + res.length);
    res.forEach(function(d) {
      // console.log(d);
      d = d.split("\t");
      d[0] = +d[0];
      d[0] = Math.log10(d[0]);
      d[1] = +d[1];
      d[1] = Math.log10(d[1]);
      // update dots
      var dots2Update = svg1.select("circle[cx='" + xMap1(d) + "'][cy='" + yMap1(d) + "']");
      dots2Update.style("fill", 'red');
      // console.log(d);
    });
}
