// http://haoqicat.com/luckyyang/wang-ye-shang-de-tu-biao/8

//d3.tsv(url[, accessor][, callback])
d3.tsv("/static/data/testData.tsv", type, function(error, data){
  console.log(data);
var 
    bar_height = 50,
    bar_padding = 5,
    svg_width = (bar_height + bar_padding) * data.length,
    svg_height = 500

var svg = d3.select("#container")
.append("svg:svg")
.attr("height", svg_height)
.attr("width", svg_width)
.attr("class", "chart")

var bar = svg.selectAll("g")
.data(data)
.enter()
.append("g")
.attr("transform", function(d,i) { return "translate(" + i*(bar_height + bar_padding) + ",0)"; })

var scale = d3.scale.linear()
.domain([0, d3.max(data, function(d) { return d.value; })])
.range([0, svg_height])

//svg rect

bar.append("svg:rect")
.attr("height", function(d) { return scale(d.value); })
.attr("width", bar_height)
.attr("transform", function(d) { return "translate(0," + (svg_height - scale(d.value)) + ")"; })

bar.append("svg:text")
.text(function(d) {return d.value;})
.attr("y", function(d) { return svg_height - scale(d.value) + 15; })
.attr("x", (bar_height)/2)
.attr("text-anchor", "middle")
})

function type(d) {
  d.value = +d.value;
  console.log(d)
  return d;
}