var req;
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = document.getElementById("degreeCount").offsetWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var plotNames = ["degreeCount_HeatMap", "degreePagerank_HeatMap", "pageRankCount_HeatMap", "ev1ev2_HeatMap", "ev2ev3_HeatMap", "ev3ev4_HeatMap"]; //"degreeRadius_HeatMap",
var origPlotNames = ["degreeCount", "degreePagerank", "pageRankCount", "degreeRadius", "ev1ev2", "ev2ev3", "ev3ev4"];

var click_node_id=-1;

var svgMap = {};

deleteMatrixFiles();

svgMap["degreeCount_HeatMap"] = drawPlot("#degreeCount", "degreeCount_HeatMap", true, true, false, "log(Degree)", "log(Count)");
svgMap["degreePagerank_HeatMap"] = drawPlot("#degreePagerank", "degreePagerank_HeatMap", true, true, true, "log(Degree)", "log(PageRank)");
svgMap["pageRankCount_HeatMap"] = drawPlot("#pageRankCount", "pageRankCount_HeatMap", true, true, false, "log(PageRank)", "log(Count)");
// svgMap["degreeRadius_HeatMap"] = drawPlot("#degreeRadius", "degreeRadius_HeatMap", false, false, true, "src", "dst");
svgMap["ev1ev2_HeatMap"] = drawPlot("#ev1ev2", "ev1ev2_HeatMap", false, false, true, "Eigenvector 1", "Eigenvector 2");
svgMap["ev2ev3_HeatMap"] = drawPlot("#ev2ev3", "ev2ev3_HeatMap", false, false, true, "Eigenvector 2", "Eigenvector 3");
svgMap["ev3ev4_HeatMap"] = drawPlot("#ev3ev4", "ev3ev4_HeatMap", false, false, true, "Eigenvector 3", "Eigenvector 4");

var domainXMap = {}, domainYMap = {};

var prevClickDotsSet = {};
var prevClickAdjDotsSet = {};

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
var width_egonet = document.getElementById("egonet_svg").offsetWidth - margin.left - margin.right,
    height_egonet = 500 - margin.top - margin.bottom;

var color_egonet = d3.scale.category20();
var svg_egonet = d3.select("#egonet_svg").append("svg")
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
    
    var power = [0,0,0,0], power_count = 0, power_result = [];
    var x1=0,x2=0,y1=0,y2=0;

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
      d3.text("/static/data/tmp2_ID_final_HeatMap/" + fileName, "text/csv", function(text) {
      var data = d3.tsv.parseRows(text);
      console.log("corresponding nodes num: " + data.length);

      var origDataMap = {};

      data.forEach(function(d) {


        /*Fitting line*/
        
        if (divId == '#degreeCount' || divId =='#degreePagerank' || divId =='#pageRankCount'){
          //console.log(d);
          a = +d[0];
          aa = Math.log10(a+1);
          b = +d[1];
          bb = Math.log10(b);

          power[0] += aa; //X
          power[1] += aa * bb; //XY
          power[2] += bb; //Y
          power[3] += aa * aa; //X^2
          power_count += 1;
          //console.log(power_count);

        }

        
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

      if(divId == '#degreeCount' || divId=='#degreePagerank' || divId=='#pageRankCount'){
        var B = (power_count * power[1] - power[0] * power[2]) / (power_count * power[3] - power[0] * power[0]);
        var A = (power[2]-B * power[0])/power_count;
        console.log(A,B);
        //y = B x + A
        //console.log(x1,y1,x2,y2);
      }



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
      domainXMap[fileName] = [d3.min(data, xValue), d3.max(data, xValue) + (d3.max(data, xValue)-d3.min(data, xValue)) * 0.2];
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
          .attr("x", width - margin.left - 50)
          .attr("y", i - 70)
          .attr("height", 1)
          .attr("width", 8)
          .attr("fill", colorScale( d3.max(data, zValue) - ((d3.max(data, zValue) - d3.min(data, zValue))/numLayers * (i-1)) ) )
          .attr("class", "colorBar")
          .attr("transform", "translate(" + margin.left + "," + (height-margin.left)/2 + ")");

          if(i % 25 == 0){
            svg.append("text")
            
              .text(kFormatter (parseInt(d3.max(data, zValue) - (d3.max(data, zValue) - d3.min(data, zValue))/numLayers * (i-1))) )
              .attr("x", width - margin.left - 40)
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
            .style("top", (d3.event.pageY - 128) + "px");
          // d3.select(this).attr("r", 10).style("fill", "red");  // color when mouse over
        })
        .on("mouseout", function(d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
          // d3.select(this).attr("r", 2).style("fill", heatMap? function(d){ return colorScale(cValue(d))} : "rgb(0,154,154)" );
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

      //Mark
      if (divId =='#degreeCount' || divId =='#pageRankCount'){
        console.log(domainXMap[fileName],domainYMap[fileName]);
        x1 = 0;
        y1 = B*domainXMap[fileName][0]+A;
            //y1 = A;
        x2 = -A/B;
        y2 = 0;
        console.log(x1,y1,x2,y2);
        var templine = svg.append("line")
          .attr("x1",0)
          .attr("y1",height/(domainYMap[fileName][1]-domainYMap[fileName][0])*(domainYMap[fileName][1]-y1))
          .attr("x2",width/(domainXMap[fileName][1]-domainXMap[fileName][0])*(x2-domainXMap[fileName][0]))
          .attr("y2",height)
          .attr("stroke-width",0.5)
          .attr("stroke","black")
        svg.append("svg:text")
          .append('svg:tspan')
          .attr("x",20)
          .attr("dy","1.2em")
          .attr("font-family", "sans-serif")
          .style("font-size", "12px")
          .attr("fill", "black")
          .text(function(d){return "slope = " + B.toString()})
          .append('svg:tspan')
          .attr("x",20)
          .attr("dy","1.2em")
          .style("font-size", "12px")
          .attr("fill", "black")
          .text(function(d){return "intercept = " + A.toString()})

      }
      if (divId =='#degreePagerank'){
        console.log(domainXMap[fileName],domainYMap[fileName]);
        x1 = domainXMap[fileName][0];
        y1 = B*domainXMap[fileName][0]+A;
        x2 = domainXMap[fileName][1];
        y2 = B*domainXMap[fileName][1]+A;
        console.log(x1,y1,x2,y2);
        var templine = svg.append("line")
          .attr("x1",0)
          .attr("y1",height/(domainYMap[fileName][1]-domainYMap[fileName][0])*(domainYMap[fileName][1]-y1))
          .attr("x2",width)
          .attr("y2",height/(domainYMap[fileName][1]-domainYMap[fileName][0])*(domainYMap[fileName][1]-y2))
          .attr("stroke-width",0.5)
          .attr("stroke","black")
        svg.append("svg:text")
          .append('svg:tspan')
          .attr("x",20)
          .attr("dy","1.2em")
          .attr("font-family", "sans-serif")
          .style("font-size", "12px")
          .attr("fill", "black")
          .text(function(d){return "slope = " + B.toString()})
          .append('svg:tspan')
          .attr("x",20)
          .attr("dy","1.2em")
          .style("font-size", "12px")
          .attr("fill", "black")
          .text(function(d){return "intercept = " + A.toString()})
      }


    });
    return svg;
}

function kFormatter(num) {
    return num > 999 ? (num/1000).toFixed(1) + 'k' : num
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
      dot.attr("r", 2)
        .on("mouseover", function(d) {
          // d3.select(this).attr("r", 10).style("fill", "red"); /// color when mouse over
        })
        .on("mouseout", function(d) {
          // var colorVal = d3.select(this).attr('origColor');
        d3.select(this).attr("r", 2)
          .style("fill", colorVal);
        });
    }
    prevClickDotsSet = {};
    
     // Parses the Text response
    var textData = req.responseText;
    console.log(textData);
    var responseJson = JSON.parse(textData)
    
    plotNames.forEach(function(pName){
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
    var consoleDiv = document.getElementById("consoleTable");
    // clear prev console rows
    while (consoleDiv.lastChild) {
      consoleDiv.removeChild(consoleDiv.lastChild);
    }
    var tableHeader = document.createElement('tr');
    tableHeader.innerHTML = ' \
                      <th>NodeID</th> <th>Degree</th> <th>PageRank</th> <th>Eigenvector 1</th>\
                      <th>Eigenvector 2</th> <th>Eigenvector 3</th> <th>Partial Egonet</th> <th>Adjacency Matrix</th>\
                      ';
    consoleDiv.appendChild(tableHeader);

    var sampleNodes = responseJson['sampleNodes'];
    sampleNodes.forEach(function(n){
      console.log(n);
      var newA = document.createElement('tr');
      // newA.style.cursor = "pointer";
      // newA.onclick = function() {
      //   click2ShowEgonet(n.nodeId);
      //   // adjacency();
      // }
      newA.onmouseover = function(){
        newA.style.backgroundColor = 'gray';
        newA.style.fontWeight = 'bold';
        // newA.style.fontSize = 'larger';
      }
      console.log("font size: " + newA.style.fontSize);
      newA.onmouseout = function(){
        newA.style.backgroundColor = 'white';
        // newA.style.fontWeight = 'normal';
        // newA.style.fontSize = 'smaller';
      }
      // get the numeric value and fix the precision
      var pr = parseFloat(n.pagerank);
      var ev1 = parseFloat(n.ev1), ev2 = parseFloat(n.ev2), ev3 = parseFloat(n.ev3);
      pr = parseFloat(pr.toPrecision(4)); ev1 = parseFloat(ev1.toPrecision(4)); 
      ev2 = parseFloat(ev2.toPrecision(4)); ev3 = parseFloat(ev3.toPrecision(4));
      // ordered by: NodeID, degree, Pagerank, eigenvector 1, 2, 3
      var infoStr = '<td>' + n.nodeId + '</td>' + '<td>' + n.inoutdegree + '</td>'  
      + '<td>' + pr.toExponential() + '</td>' + '<td>' + ev1.toExponential() + '</td>' + '<td>' + ev2.toExponential() + '</td>' 
      + '<td>' + ev3.toExponential() + '</td>' + '<td>' + '<button id="ego' + (n.nodeId).toString() +'">' + "EgoNet" + '</button>' + '</td>' 
      + '<td>' + '<button id="adjMatrix' + (n.nodeId).toString() + '">' + "AdjMatrix" + '</button>' + '</td>';

      newA.innerHTML = infoStr;
      consoleDiv.appendChild(newA);

      var newA1 = document.getElementById('ego' + (n.nodeId).toString());
      newA1.onclick = function() {
        click2ShowEgonet(n.nodeId);
        // adjacency();
      }
      newA1.href = "javascript:void(0);";

      var newA2 = document.getElementById('adjMatrix' + (n.nodeId).toString());
      newA2.onclick = function() {
        createAdjacencyMatrix(n.nodeId);
      }
      newA2.href = "javascript:void(0);";
    });
    
}


function handleResponseAnomalies() {
    console.log("enter handleResponseShowAnomalies: Anomalies returned");
    if (req.readyState != 4 || req.status != 200) {
        return;
    }
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
    d3.text("/static/data/tmp2_ID_final_HeatMap/" + gSize + "/" + pName + "_anomaly.txt", "text/csv", function(text) {
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
  click_node_id = nodeid;
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

function deletenodes(nodeid) {
  // clear the original canvas
  d3.select('#svg_egonet').text('');

  var len = nodeid.length;
  var i;
  //console.nodes;
  var prevLinksArray = [];
  for (d in prevLinks) {
    var flag = true;
    for (i=0;i<len;i++){
      if (prevLinks[d][0] == nodeid[i] || prevLinks[d][1]==nodeid[i])
        flag=false;
    }
    if (flag==true)
      prevLinksArray.push(prevLinks[d]);  
  }

  var prevNodesArray = [];
  

  for (d in nodes){
    //console.log(nodes[d]);
    var flag = true
    for (i=0;i<len;i++){
      if(nodes[d].id == nodeid[i])
        flag=false;
    }
    
    if (flag == true)
      prevNodesArray.push(nodes[d]); 
  }

  for ( i=0;i<len;i++){
    delete nodes[nodeid[i]];
  }
  prevLinks=prevLinksArray;
  //nodes=prevNodesArray;

  var force = d3.layout.force()
  //.nodes(d3.values(nodes))
  .nodes(prevNodesArray)
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
  

  //brush part start
  var w = 500,
    h = 500,
    fill = d3.scale.category20()
    trans=[0,0]
    scale=1;

  var brush = d3.svg.brush()
     .on("brushstart", brushstart)
     .on("brush", brushing)
     .on("brushend", brushend);
  
  //set brush constraints to full width 
  brushX=d3.scale.linear().range([0, w]), 
  brushY=d3.scale.linear().range([0, h]);

  var vis=svg_egonet
    .append("svg:svg")
      .attr("width", w)
      .attr("height", h)
      .attr("pointer-events", "all")
    .append('svg:g')
      .attr('class', 'brush') 
      .call(brush.x(brushX).y(brushY))
      .style({"fill": "c4c4ff"});

  console.log(vis);


  function brushstart(){
    console.log("brushstart!!!")
  }
  function brushing(){
    //console.log("brushing!!!")
    var e = brush.extent();

    svg_egonet.selectAll("ellipse").remove()
    console.log(node)
    node.filter(function (d){
          return  e[0][0] <= brushX.invert(d.x) && brushX.invert(d.x) <= e[1][0]
            && e[0][1] <= brushY.invert(d.y) && brushY.invert(d.y) <= e[1][1]})
      .append("ellipse")
        .attr("cx",0)
        .attr("cy",0)
        .attr("rx",5)
        .attr("ry",5)
        .style({"fill": "0000ff"})
        .on("click", function(d){
        if(!shift){
        console.log('enter click');
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = handleResponseEgonetExpand;
        req.open("GET", "../PlotDistribution/GetEgonet/?nodeid=" + d.id, true);
        req.send(); 
        }else{
          console.log('shift click');
          console.log(d.id);
          var click_node = []
          click_node.push(d.id)
          deletenodes(click_node);
        }
      });
  }
  function brushend(){
    var e = brush.extent();
    console.log("brushend!!!");
    if(shift){
      var brush_node=[]
      node.filter(function (d){
          if (e[0][0] <= brushX.invert(d.x) && brushX.invert(d.x) <= e[1][0]
               && e[0][1] <= brushY.invert(d.y) && brushY.invert(d.y) <= e[1][1])
            brush_node.push(d.id);
          return  e[0][0] <= brushX.invert(d.x) && brushX.invert(d.x) <= e[1][0]
               && e[0][1] <= brushY.invert(d.y) && brushY.invert(d.y) <= e[1][1]})
      
      console.log(brush_node)
      deletenodes(brush_node);
    }
  }
  //brush part end

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
      .attr("id",function(d){
        return d.id;
      })
      .call(force.drag);

  // add the nodes
  node.append("circle")
      .attr("r", function(d){
          return 4;
      })
      .style("fill", function(d) { 
        if (d.id == click_node_id)
          return '#d62728';
        else
          return '#7f7f7f';
        })
      .on("click", function(d){
        if(!shift){
        console.log('enter click');
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = handleResponseEgonetExpand;
        req.open("GET", "../PlotDistribution/GetEgonet/?nodeid=" + d.id, true);
        req.send(); 
        }else{
          console.log('shift click');
          console.log(d.id);
          var click_node = []
          click_node.push(d.id)
          deletenodes(click_node);
        }
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

function showEgonet(links) {
  // clear the original canvas
  d3.select('#svg_egonet').text('');
  
  shift = false;
  d3.select("body")
    .on("keydown",function(){
      if (d3.event.shiftKey)
        shift = true
      else
        shift = false})
    .on("keyup",function(){
      if (d3.event.shiftKey)
        shift = true
      else
        shift = false})
  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
      link.source = link[0];
      link.target = link[1];
      link.source = nodes[link.source] || 
          (nodes[link.source] = {id: link.source});
      link.target = nodes[link.target] || 
          (nodes[link.target] = {id: link.target});
      prevLinks[link] = link;
      //console.log(nodes[link.source]);
      //console.log(link);
      //console.log(nodes);
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
  

  //brush part start
  var w = 500,
    h = 500,
    fill = d3.scale.category20()
    trans=[0,0]
    scale=1;

  var brush = d3.svg.brush()
     .on("brushstart", brushstart)
     .on("brush", brushing)
     .on("brushend", brushend);
  
  //set brush constraints to full width 
  brushX=d3.scale.linear().range([0, w]), 
  brushY=d3.scale.linear().range([0, h]);

  var vis=svg_egonet
    .append("svg:svg")
      .attr("width", w)
      .attr("height", h)
      .attr("pointer-events", "all")
    .append('svg:g')
      .attr('class', 'brush') 
      .call(brush.x(brushX).y(brushY))
      .style({"fill": "c4c4ff"});

  console.log(vis);


  function brushstart(){
    console.log("brushstart!!!")
  }
  function brushing(){
    //console.log("brushing!!!")
    var e = brush.extent();

    svg_egonet.selectAll("ellipse").remove()
    console.log(node)
    node.filter(function (d){
          return  e[0][0] <= brushX.invert(d.x) && brushX.invert(d.x) <= e[1][0]
            && e[0][1] <= brushY.invert(d.y) && brushY.invert(d.y) <= e[1][1]})
      .append("ellipse")
        .attr("cx",0)
        .attr("cy",0)
        .attr("rx",5)
        .attr("ry",5)
        .style({"fill": "0000ff"})
        .on("click", function(d){
        if(!shift){
        console.log('enter click');
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = handleResponseEgonetExpand;
        req.open("GET", "../PlotDistribution/GetEgonet/?nodeid=" + d.id, true);
        req.send(); 
        }else{
          console.log('shift click');
          console.log(d.id);
          var click_node = []
          click_node.push(d.id)
          deletenodes(click_node);
        }
      });
  }
  function brushend(){
    var e = brush.extent();
    console.log("brushend!!!");
    if(shift){
      var brush_node=[]
      node.filter(function (d){
          if (e[0][0] <= brushX.invert(d.x) && brushX.invert(d.x) <= e[1][0]
               && e[0][1] <= brushY.invert(d.y) && brushY.invert(d.y) <= e[1][1])
            brush_node.push(d.id);
          return  e[0][0] <= brushX.invert(d.x) && brushX.invert(d.x) <= e[1][0]
               && e[0][1] <= brushY.invert(d.y) && brushY.invert(d.y) <= e[1][1]})
      
      console.log(brush_node)
      deletenodes(brush_node);
    }
  }
  //brush part end

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
      .attr("id",function(d){
        return d.id;
      })
      .call(force.drag);

  // add the nodes
  node.append("circle")
      .attr("r", function(d){
          return 4;
      })
      .style("fill", function(d) { 
        if (d.id == click_node_id)
          return '#d62728';
        else
          return '#7f7f7f';
        })
      .on("click", function(d){
        if(!shift){
        console.log('enter click');
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = handleResponseEgonetExpand;
        req.open("GET", "../PlotDistribution/GetEgonet/?nodeid=" + d.id, true);
        req.send(); 
        }else{
          console.log('shift click');
          console.log(d.id);
          var click_node = []
          click_node.push(d.id)
          deletenodes(click_node);
        }
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

function fileExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

function createAdjacencyMatrix(nodeId) {
  console.log('Enter createAdjacencyMatrix()');
  if (window.XMLHttpRequest) {
      req = new XMLHttpRequest();
  } else {
      req = new ActiveXObject("Microsoft.XMLHTTP");
  }
  req.onreadystatechange = handleCreateAdjacencyMatrix;
  req.open("GET", "../PlotDistribution/GetAdj/?nodeid=" + nodeId, true);
  req.send();
}

function handleCreateAdjacencyMatrix(){
  console.log("enter handleCreateAdjacencyMatrix()")
  if (req.readyState != 4 || req.status != 200) {
      return;
  }
  var textData = req.responseText;
  var responseJson = JSON.parse(textData)

  var edges = responseJson['edges'].split(";");
  var nodes1 = responseJson['nodes_src'].split(";");
  var nodes2 = responseJson['nodes_dst'].split(";");

  var edgeHash = {};
  for (x in edges) {
    var id = edges[x].replace('\t', '-');
    var obj = {}
    edgeHash[id] = edges[x];
  }
  // console.log(edgeHash);
  // console.log('nodes1');
  matrix = [];
  // console.log(nodes1);
  // console.log('nodes2');
  // console.log(nodes2);

  //create all possible edges
  for (a in nodes1) {
    for (b in nodes2) {
      var grid = {id: nodes1[a] + "-" + nodes2[b], x: b, y: a, weight: 0};
      if (edgeHash[grid.id]) {
        grid.weight = 1;
      }
      matrix.push(grid);
    }
  }
  console.log(matrix);
      
      //d3.select("svg")
      // d3.select("#vizcontainer_svg").remove();
      // if
  d3.select("#vizcontainer_svg g").remove();
  d3.select("#vizcontainer_svg")
  .append("g")
  .attr("transform", "translate(50,50)")
  .attr("id", "adjacencyG")
  .selectAll("rect")
  .data(matrix)
  .enter()
  .append("rect")
  .attr("width", 10)
  .attr("height", 10)
  .attr("x", function (d) {return d.x * 10})
  .attr("y", function (d) {return d.y * 10})
  // .style("stroke", "black")
  // .style("stroke-width", "1px")
  .style("fill", "DarkBlue")
  .style("fill-opacity", function (d) {return d.weight * .2})
      
  var scaleSize1 = nodes1.length * 10;
  var scaleSize2 = nodes2.length * 10;
  var nameScale1 = d3.scale.ordinal().domain(nodes1.map(function (el) {return el})).rangePoints([0,scaleSize1],1);
  var nameScale2 = d3.scale.ordinal().domain(nodes2.map(function (el) {return el})).rangePoints([0,scaleSize2],1);
      
  xAxis = d3.svg.axis().scale(nameScale2).orient("top").tickSize(4);    
  yAxis = d3.svg.axis().scale(nameScale1).orient("left").tickSize(4);    
  d3.select("#adjacencyG").append("g").attr("id", "xaxis").call(xAxis).selectAll("text").style("text-anchor", "end").attr("transform", "translate(-10,-10) rotate(90)");
  d3.select("#adjacencyG").append("g").attr("id", "yaxis").call(yAxis);
      
  console.log('test');
  d3.select("#xaxis")
  .selectAll("text")
  .filter(function(d){ return typeof(d) == "string"; })
  .style("fill", "red")
  .style("cursor", "pointer")
  .on("click", function(d){
      adjShowReverse(d,1);
  });
  d3.select("#yaxis")
  .selectAll("text")
  .filter(function(d){ return typeof(d) == "string"; })
  .style("fill", "red")
  .style("cursor", "pointer")
  .on("click", function(d){
      adjShowReverse(d,2);
  });



    
}

function adjacency() {
  // while (!fileExists("/static/nodeMatrix.csv")) {

  // }
  // while (!fileExists("/static/edgeMatrix.csv")) {

  // }
  setTimeout(function(){

    queue()
    .defer(d3.csv, "/static/nodeMatrix.csv")
    .defer(d3.csv, "/static/edgeMatrix.csv")
    .await(function(error, file1, file2) { createAdjacencyMatrix(file1, file2); });
    
    function createAdjacencyMatrix(nodes,edges) {
      var edgeHash = {};
      for (x in edges) {
        var id = edges[x].source + "-" + edges[x].target;
        edgeHash[id] = edges[x];
      }
      matrix = [];
      //create all possible edges
      for (a in nodes) {
        for (b in nodes) {
          var grid = {id: nodes[a].id + "-" + nodes[b].id, x: b, y: a, weight: 0};
          if (edgeHash[grid.id]) {
            grid.weight = edgeHash[grid.id].weight;
          }
          matrix.push(grid);
        }
      }
      
      //d3.select("svg")
      // d3.select("#vizcontainer_svg").remove();
      // if
      d3.select("#vizcontainer_svg g").remove();
      d3.select("#vizcontainer_svg")
      .append("g")
      .attr("transform", "translate(50,50)")
      .attr("id", "adjacencyG")
      .selectAll("rect")
      .data(matrix)
      .enter()
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", function (d) {return d.x * 10})
      .attr("y", function (d) {return d.y * 10})
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("fill", "red")
      .style("fill-opacity", function (d) {return d.weight * .2})
      
      var scaleSize = nodes.length * 10;
      var nameScale = d3.scale.ordinal().domain(nodes.map(function (el) {return el.id})).rangePoints([0,scaleSize],1);
      
      xAxis = d3.svg.axis().scale(nameScale).orient("top").tickSize(4);    
      yAxis = d3.svg.axis().scale(nameScale).orient("left").tickSize(4);    
      d3.select("#adjacencyG").append("g").attr("id", "xaxis").call(xAxis).selectAll("text").style("text-anchor", "end").attr("transform", "translate(-10,-10) rotate(90)");
      d3.select("#adjacencyG").append("g").attr("id", "yaxis").call(yAxis);
      
      console.log('test');
      d3.select("#xaxis")
      .selectAll("text")
      .filter(function(d){ return typeof(d) == "string"; })
      .style("fill", "red")
      .style("cursor", "pointer")
      .on("click", function(d){
          adjShowReverse(d);
      });
      d3.select("#yaxis")
      .selectAll("text")
      .filter(function(d){ return typeof(d) == "string"; })
      .style("fill", "red")
      .style("cursor", "pointer")
      .on("click", function(d){
          adjShowReverse(d);
      });

    }
  },3000);
}

function deleteMatrixFiles(){
  console.log('in deleteMatrixFiles()');
  if (window.XMLHttpRequest) {
      req = new XMLHttpRequest();
  } else {
      req = new ActiveXObject("Microsoft.XMLHTTP");
  }
  req.onreadystatechange = handledeleteMatrixFiles;
  req.open("GET", "../PlotDistribution/DeleteMatrixFiles", true);
  req.send();
}

function handledeleteMatrixFiles(){
  console.log("enter handledeleteMatrixFiles")
    if (req.readyState != 4 || req.status != 200) {
        return;
    }
}

function adjShowReverse(nodeId){
  console.log("enter adjShowReverse()");
  if (window.XMLHttpRequest) {
      req = new XMLHttpRequest();
  } else {
      req = new ActiveXObject("Microsoft.XMLHTTP");
  }
  req.onreadystatechange = handleAdjShowReverse;
  req.open("GET", "../PlotDistribution/AdjShowReverse/?nodeid=" + nodeId, true);
  req.send();
}

function handleAdjShowReverse(){
  console.log("enter handleAdjShowReverse")
  if (req.readyState != 4 || req.status != 200) {
      return;
  }
  var textData = req.responseText;
  console.log(textData);
  var responseJson = JSON.parse(textData)

  for (dotId in prevClickAdjDotsSet) {
    console.log("===============:)==================");
    var dot = prevClickAdjDotsSet[dotId];
    dot.style("fill", dot.attr('origColor'));
    dot.attr("r", 2);
  }
  prevClickAdjDotsSet = {}


  plotNames.forEach(function(pName){
      
    xScale.domain(domainXMap[pName]);
    yScale.domain(domainYMap[pName]);
    if (responseJson[pName].length > 0) {
      responseJson[pName] = responseJson[pName].substring(0,responseJson[pName].length - 1);
    }
    var curSvg = svgMap[pName];
    var res = responseJson[pName].split(";");
    console.log(res);
    res.forEach(function(d) {

      var position = "#pt_" + d.replace('\t', 't').replace(/\./g,'_');
      var dot2Update = curSvg.select(position);

      dot2Update.style("fill", "red") //"rgb(0,231,231)")
              .attr("r", 4);
      prevClickAdjDotsSet[dot2Update.attr('id')] = dot2Update;
    });

  });
  deleteMatrixFiles();

}
