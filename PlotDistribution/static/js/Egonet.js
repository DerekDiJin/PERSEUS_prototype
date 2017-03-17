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

var req;
console.log('node ID: ' + QueryString.nodeid);
if (window.XMLHttpRequest) {
    req = new XMLHttpRequest();
} else {
    req = new ActiveXObject("Microsoft.XMLHTTP");
}
req.onreadystatechange = handleResponse;
req.open("GET", "../GetEgonet/?nodeid=" + QueryString.nodeid, true);
req.send(); 


var width = 960,
    height = 500;

var color = d3.scale.category20();
var svg = d3.select("#chart1").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "svg_egonet");

var prevLinks = {};
var nodes = {};

function handleResponse() {
    console.log("enter handleResponse: GetEgonet returned")
    if (req.readyState != 4 || req.status != 200) {
        return;
    }

    // Parses the Text response
    var textData = req.responseText;
    // if (textData.length > 0) {
    //   textData = textData.substring(0,textData.length - 1);
    // }
    // var res = textData.split(";");
    // console.log("corresponding edges num: " + res.length);
    var links = d3.tsv.parseRows(textData);
    
    
    // clear previous data
    
    prevLinks = {};
    nodes = {};

    showEgonet(links)
    
}

function handleResponseExpand() {
    console.log("enter handleResponseExpand: GetEgonet returned")
    if (req.readyState != 4 || req.status != 200) {
        return;
    }

    // Parses the Text response
    var textData = req.responseText;
    // if (textData.length > 0) {
    //   textData = textData.substring(0,textData.length - 1);
    // }
    // var res = textData.split(";");
    // console.log("corresponding edges num: " + res.length);

    var links = d3.tsv.parseRows(textData);
    d3.select('#svg_egonet').text('');
    showEgonet(links);
}

function showEgonet(links) {
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
  .size([width, height])
  .linkDistance(100)
  .charge(-300)
  .on("tick", tick)
  .start();


  // build the arrow.
  svg.append("svg:defs").selectAll("marker")
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
  var path = svg.append("svg:g").selectAll("path")
      .data(force.links())
    .enter().append("svg:path")
      .attr("class", "link")
      .attr("marker-end", "url(#end)");

  // define the nodes
  var node = svg.selectAll(".node")
      .data(force.nodes())
    .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  // add the nodes
  node.append("circle")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.id); })
      .on("click", function(d){
        console.log('enter click');
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = handleResponseExpand;
        req.open("GET", "../GetEgonet/?nodeid=" + d.id, true);
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

