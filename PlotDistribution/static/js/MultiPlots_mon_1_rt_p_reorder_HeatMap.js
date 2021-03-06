var req;
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = document.getElementById("degreeCount").offsetWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var plotNames = ["degreeCount_HeatMap", "degreePagerank_HeatMap", "pagerankCount_HeatMap", "ev1ev2_HeatMap", "ev2ev3_HeatMap"]; //"degreeRadius_HeatMap",
var origPlotNames = ["degreeCount", "degreePagerank", "pagerankCount", "degreeRadius", "ev1ev2", "ev2ev3"];

var svgMap = {};
svgMap["degreeCount_HeatMap"] = drawPlot("#degreeCount", "degreeCount_HeatMap", true, true, false, "log(Degree)", "log(Count)");
svgMap["degreePagerank_HeatMap"] = drawPlot("#degreePagerank", "degreePagerank_HeatMap", true, true, true, "log(Degree)", "log(PageRank)");
svgMap["pagerankCount_HeatMap"] = drawPlot("#radiusCount", "pagerankCount_HeatMap", true, true, false, "log(PageRank)", "log(Count)");
svgMap["degreeRadius_HeatMap"] = drawPlot("#degreeRadius", "degreeRadius_HeatMap", false, false, true, "src", "dst");
svgMap["ev1ev2_HeatMap"] = drawPlot("#ev1ev2", "ev1ev2_HeatMap", false, false, true, "Eigenvector 1", "Eigenvector 2");
svgMap["ev2ev3_HeatMap"] = drawPlot("#ev2ev3", "ev2ev3_HeatMap", false, false, true, "Eigenvector 2", "Eigenvector 3");

var domainXMap = {}, domainYMap = {};

var prevClickDotsSet = {};

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

var x2RealVal = function(d, origDataMap) {
  return origDataMap[d].split('t')[0].replace('_','.');
};
var y2RealVal = function(d, origDataMap) {
  return origDataMap[d].split('t')[1].replace('_','.');
};

// egonet paras
var prevLinks = {},
    nodes = {};
var width_egonet = document.getElementById("egonet").offsetWidth - margin.left - margin.right,
    height_egonet = 500 - margin.top - margin.bottom;

var color_egonet = d3.scale.category20();
var svg_egonet = d3.select("#egonet").append("svg")
    .attr("width", width_egonet)
    .attr("height", height_egonet)
    .attr("id", "svg_egonet");

// add show anomaly button
var showADiv0 = document.getElementById("showAnomaly0");
var newB0 = document.createElement('button');
newB0.onclick = function() {
  clickShowAnomaly(0);
}
newB0.type = "button";
newB0.innerHTML = "GFADD with grid size = 0";
showADiv0.appendChild(newB0);
//---------------------------------//
var showADiv8 = document.getElementById("showAnomaly8");
var newB8 = document.createElement('button');
newB8.onclick = function() {
  clickShowAnomaly(8);
}
newB8.type = "button";
newB8.innerHTML = "GFADD with grid size = 8";
showADiv8.appendChild(newB8);
//---------------------------------//
var showADiv16 = document.getElementById("showAnomaly16");
var newB16 = document.createElement('button');
newB16.onclick = function() {
  clickShowAnomaly(16);
}
newB16.type = "button";
newB16.innerHTML = "GFADD with grid size = 16";
showADiv16.appendChild(newB16);
//---------------------------------//
var showADiv32 = document.getElementById("showAnomaly32");
var newB32 = document.createElement('button');
newB32.onclick = function() {
  clickShowAnomaly(32);
}
newB32.type = "button";
newB32.innerHTML = "GFADD with grid size = 32";
showADiv32.appendChild(newB32);


console.log('script ends');

function drawPlot(divId, fileName, xLog, yLog, heatMap, xLabelName, yLabelName){
    // add the graph canvas to the corresponding div of the webpage
    var svg = d3.select(divId).append("svg")
        .attr("width", width + margin.left + margin.right + 40)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // add the tooltip area to the webpage
    var tooltip = d3.select(divId).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    d3.text("/static/data/mon_1_rt_p_reorder_HeatMap/" + fileName, "text/csv", function(text) {
      var data = d3.tsv.parseRows(text);
      console.log("corresponding nodes num: " + data.length);

      var origDataMap = {};
      data.forEach(function(d) {
        //console.log(d);
        /*if(fileName == "degreePagerank"){
          console.log(d);
          console.log(origDataMap);
        }*/
        var origData = d[0].replace('.', '_')+'t'+d[1].replace('.', '_');
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
        origDataMap[d] = origData;
      });

      console.log("-------------");
      console.log(data[0]);

      if (heatMap) {
        var cValue = function(d) { return d[2];},
        color = d3.scale.quantize().range([
                "rgb(128,0,128)",
                "rgb(0,0,255)",
                "rgb(0,255,255)",
                "rgb(0,255,0)",
                "rgb(255,255,0)",
                "rgb(255,165,0)",
                "rgb(255,0,0)"]);

//        color = d3.scale.quantize().range([
//                "rgb(198,219,239)",
//                "rgb(158,202,225)",
//                "rgb(107,174,214)",
//                "rgb(66,146,198)",
//                "rgb(33,113,181)",
//                "rgb(8,81,156)",
//                "rgb(8,48,107)"]);
        color.domain(d3.extent([d3.min(data, zValue), d3.max(data, zValue)]));

//        var colorScale = d3.scale.log().domain([d3.min(data, zValue), d3.max(data, zValue)]).interpolate(d3.interpolateHsl).range([d3.rgb(198,219,239), d3.rgb(8,48,107)]);
        var colorScale = d3.scale.log().domain([d3.min(data, zValue), d3.max(data, zValue)]).interpolate(d3.interpolateHsl).range([d3.rgb(0,154,154), d3.rgb(255,0,0)]);
      }
      

      // don't want dots overlapping axis, so add in buffer to data domain
      domainXMap[fileName] = [d3.min(data, xValue), d3.max(data, xValue)];
      domainYMap[fileName] = [d3.min(data, yValue), d3.max(data, yValue)];
      xScale.domain(domainXMap[fileName]);
      yScale.domain(domainYMap[fileName]);

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

      if(heatMap){
        var numLayers = 100;
        for(i = 0; i <= numLayers; i ++){

          svg.append("rect")
          .attr("x", width - margin.left + 10)
          .attr("y", i - 70)
          .attr("height", 1)
          .attr("width", 8)
          .attr("fill", colorScale( d3.max(data, zValue) - ((d3.max(data, zValue) - d3.min(data, zValue))/numLayers * (i-1)) ) )
          .attr("class", "colorBar")
          .attr("transform", "translate(" + margin.left + "," + (height-margin.left)/2 + ")");

          if(i % 25 == 0){
            svg.append("text")
            
              .text(parseFloat(d3.max(data, zValue) - (d3.max(data, zValue) - d3.min(data, zValue))/numLayers * (i-1)).toFixed(2)    )
              .attr("x", width - margin.left + 17)
              .attr("transform", "translate(" + margin.left + "," + (height-margin.left)/2 + ")")
              .attr("y", i - 70)
              .attr("dy", ".35em")
              //.style("text-anchor", "end")
              .attr("font-family", "sans-serif")
              .attr("font-size", "11px")
              .attr("fill", "black")
          }; 

        }
      }


      // draw dots
      svg.selectAll(".dot")
          .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 2)
          .attr("cx", xMap)
          .attr("cy", yMap)
          .attr("id", function(d){ return "pt_" + origDataMap[d]; })
          .attr("origColor", heatMap? function(d){ return colorScale(cValue(d))} : "rgb(0,154,154)" )
          .style("fill", heatMap? function(d){ return colorScale(cValue(d))} : "rgb(0,154,154)" )
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("(" + (x2RealVal(d, origDataMap))
               + ", " + (y2RealVal(d, origDataMap)) + ")")
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
            req.onreadystatechange = handleResponse;
            req.open("GET", "../PlotDistribution/ClickPlot/?plot="+fileName+"&x="
              +(x2RealVal(d, origDataMap))
              + "&y=" + (y2RealVal(d, origDataMap)), true);
            req.send(); 
          })
    });
    return svg;
}

function handleResponse() {
    console.log("enter handleResponse--->>>:)")
    if (req.readyState != 4 || req.status != 200) {
        return;
    }
    console.log(":::::::::::::");
    console.log(prevClickDotsSet);
    // restore the original plot color
    for (dotId in prevClickDotsSet) {
      console.log("===============:)==================");
      var dot = prevClickDotsSet[dotId];
      dot.style("fill", dot.attr('origColor'));
      dot.attr("r", 2);
    }
    prevClickDotsSet = {};
    
     // Parses the Text response
    var textData = req.responseText;
    console.log(textData);
    var responseJson = JSON.parse(textData)
    
    plotNames.forEach(function(pName){
      console.log("In 289???");
      console.log(responseJson);
      xScale.domain(domainXMap[pName]);
      yScale.domain(domainYMap[pName]);
      if (responseJson[pName].length > 0) {
        console.log(responseJson[pName]);
        responseJson[pName] = responseJson[pName].substring(0,responseJson[pName].length - 1);
      }
      var curSvg = svgMap[pName];
      var res = responseJson[pName].split(";");
      console.log(res);
      res.forEach(function(d) {
        if(d == "5\t6.230822116510728E-6"){
          console.log(d);
        }
        //console.log(d);
        // update dots color
        var position = "#pt_" + d.replace('\t', 't').replace(/\./g,'_');
        var dot2Update = curSvg.select(position);
        //console.log("-=-=-=-=-=-=-=-=-=-=-=-=");
        //console.log(curSvg.select(position).empty());
        //console.log("#circle_" + d.replace('\t', 't').replace(/\./g,'_'));
        //console.log(dot2Update);
        dot2Update.style("fill", "rgb(0,231,231)") //"darkgreen")
                  .attr("r", 4);
        if(d == "5\t6.230822116510728E-6"){
          console.log("still there.");
          console.log(dot2Update);
          console.log(dot2Update.select('id'));
          console.log(dot2Update.length);
        }
        if(d == "5\t6.436653696782822E-6"){
          console.log("still there.::))");
          console.log(typeof dot2Update);
          console.log(dot2Update.select('id'));
          console.log(dot2Update.length);
        }
        if(!curSvg.select(position).empty()){
          prevClickDotsSet[dot2Update.attr('id')] = dot2Update;
        }
        if(d == "5\t6.230822116510728E-6"){
          console.log("still there :(.");
        }  

      });
    console.log(":::::::::::::");
    console.log(prevClickDotsSet);
    });

    // console info
    console.log("process console info")
    var infoStr = '';
    var consoleDiv = document.getElementById("consoleContent");
    // clear prev console
    while (consoleDiv.lastChild) {
      consoleDiv.removeChild(consoleDiv.lastChild);
    }
    var sampleNodes = responseJson['sampleNodes'];
    sampleNodes.forEach(function(n){
      console.log(n);
      var newA = document.createElement('a');
      newA.onclick = function() {
        click2ShowEgonet(n.nodeId);
      }
      newA.title = 'Click to show coresponding Egonet';
      newA.href = "javascript:void(0);";
      infoStr = '</br>NodeId: '+n.nodeId+': </br>Degree: '+n.inoutdegree+', PageRank: '+n.pagerank+', Radius: '
                +n.radius+', Eigen Value 1: '+n.ev1+', Eigen Value 2: '+n.ev2+', Eigen Value 3: '+n.ev3+'</br>';
      newA.innerHTML = infoStr;
      consoleDiv.appendChild(newA);
    });
    
}


function handleResponseAnomalies() {
    console.log("enter handleResponseShowAnomalies: Anomalies returned");
    if (req.readyState != 4 || req.status != 200) {
        return;
    }
    console.log(":::)))--->");
    // Parses the Text response
    var textData = req.responseText;
    console.log(textData);
    var parts = textData.split('\t');
    // console.log("corresponding edges num: " + links.length);
    console.log("----------------------------->----------------");
    console.log(parts[0]);
    var origData = parts[1].replace('.', '_')+'t'+parts[2].replace('.', '_');
    plotName = parts[0] + "_HeatMap"
    var dot2Update = svgMap[plotName].select("#pt_" + origData);
    dot2Update.style("fill", 'rgb(154,0,0)')  // red
      .attr("r", 4);
    prevClickDotsSet[dot2Update.attr('id')] = dot2Update;
}


function clickShowAnomaly(gSize) {
  console.log('enter clickShowAnomaly with g size = ' + gSize);
  // restore the original plot color
  for (dotId in prevClickDotsSet) {
    var dot = prevClickDotsSet[dotId];
    dot.style("fill", dot.attr('origColor'));
    dot.attr("r", 2);
  }
  prevClickDotsSet = {};
  plotNames.forEach(function(pName){
    d3.text("/static/data/mon_1_rt_p_reorder_HeatMap/" + gSize + "/" + pName + "_anomaly.txt", "text/csv", function(text) {
        var data = d3.tsv.parseRows(text);
        console.log("corresponding dots num: " + data.length);
        data.forEach(function(d) {
          // console.log(d);
          var origData = d[0].replace('.', '_')+'t'+d[1].replace('.', '_');
          var dot2Update = svgMap[pName].select("#pt_" + origData);
          dot2Update.style("fill", 'rgb(154,0,0)')  // red
            .attr("r", 4);
          prevClickDotsSet[dot2Update.attr('id')] = dot2Update;
        });
    });
  });
  // d3.text("/static/data/" + "GFADD_degreePageRank_g8", "text/csv", function(text) {
  //     var data = d3.tsv.parseRows(text);
  //     console.log("corresponding dots num: " + data.length);
  //     data.forEach(function(d) {
  //       // console.log(d);
  //       var origData = d[1].replace('.', '_')+'t'+d[2].replace('.', '_');
  //       var dot2Update = svgMap['degreePagerank'].select("#circle_" + origData);
  //       dot2Update.style("fill", 'red');
  //       prevClickDotsSet[dot2Update.attr('id')] = dot2Update;
  //     });
  // });
}

function click2ShowEgonet(nodeid) {
  console.log('Egonet node ID: ' + nodeid);
  if (window.XMLHttpRequest) {
      req = new XMLHttpRequest();
  } else {
      req = new ActiveXObject("Microsoft.XMLHTTP");
  }
  req.onreadystatechange = handleResponseEgonet;
  req.open("GET", "../PlotDistribution/GetEgonet/?nodeid=" + nodeid, true);
  req.send();
}

function handleResponseEgonet() {
    console.log("enter handleResponseEgonet: GetEgonet returned")
    if (req.readyState != 4 || req.status != 200) {
        return;
    }

    // Parses the Text response
    var textData = req.responseText;
    var links = d3.tsv.parseRows(textData);
    // console.log("corresponding edges num: " + links.length);

    // clear previous data
    prevLinks = {};
    nodes = {};
    console.log("still there.")
    showEgonet(links)
}

function handleResponseEgonetExpand() {
    console.log("enter handleResponseEgonetExpand: GetEgonet returned")
    if (req.readyState != 4 || req.status != 200) {
        return;
    }

    // Parses the Text response
    var textData = req.responseText;
    var links = d3.tsv.parseRows(textData);
    // console.log("corresponding edges num: " + links.length);
    showEgonet(links);
}

function showEgonet(links) {
  // clear the original canvas
  d3.select('#svg_egonet').text('');
    
  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
      // console.log(link);
      link.source = link[0];
      link.target = link[1];
      link.source = nodes[link.source] || 
          (nodes[link.source] = {id: link.source});
      link.target = nodes[link.target] || 
          (nodes[link.target] = {id: link.target});
      prevLinks[link] = link;
  });

  var prevLinksArray = [];
  for (d in prevLinks) {
    prevLinksArray.push(prevLinks[d]);
  }

  var force = d3.layout.force()
  .nodes(d3.values(nodes))
  .links(prevLinksArray)
  .size([width_egonet, height_egonet])
  .linkDistance(100)
  .charge(-300)
  .on("tick", tick)
  .start();


  // build the arrow.
  svg_egonet.append("svg:defs").selectAll("marker")
      .data(["end"])
    .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  // add the links and the arrows
  var path = svg_egonet.append("svg:g").selectAll("path")
      .data(force.links())
    .enter().append("svg:path")
      .attr("class", "link")
      .attr("marker-end", "url(#end)");

  // define the nodes
  var node = svg_egonet.selectAll(".node")
      .data(force.nodes())
    .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  // add the nodes
  node.append("circle")
      .attr("r", 4)
      .style("fill", function(d) { return color_egonet(d.id); })
      .on("click", function(d){
        console.log('enter click');
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = handleResponseEgonetExpand;
        req.open("GET", "../PlotDistribution/GetEgonet/?nodeid=" + d.id, true);
        req.send(); 
      });

  // add the text 
  node.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.id; });

  // add the curvy lines
  function tick() {
      path.attr("d", function(d) {
          var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + 
              d.source.x + "," + 
              d.source.y + "A" + 
              dr + "," + dr + " 0 0,1 " + 
              d.target.x + "," + 
              d.target.y;
      });

      node
          .attr("transform", function(d) { 
              return "translate(" + d.x + "," + d.y + ")"; });
  }
}



