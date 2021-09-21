var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) {
    return d.id;
  }))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));


let url = "https://services1.arcgis.com/9vUEN5aDoh5W7aGs/ArcGIS/rest/services/HurtosBogota/FeatureServer/0/query?groupByFieldsForStatistics=%22Localidad%22&outStatistics=%5B%7B%22statisticType%22%3A%22COUNT%22%2C%0D%0A%22onStatisticField%22%3A%22OBJECTID%22%2C%0D%0A%22outStatisticFieldName%22%3A%22COUNT%22%7D%0D%0A%5D&f=pjson"
var xhr = new XMLHttpRequest();


xhr.open("GET", url, false);

xhr.send();

let response = JSON.parse(xhr.responseText).features;
console.log(response)


node_data = [];

for (f in response) {
  count = response[f].attributes.COUNT;
  localidad = response[f].attributes.EXPR_1;
  node_data.push({
    "id": localidad,
    "hurtos": count
  });
}

var data = {
  "nodes": node_data,
  "links": []
}





var link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(data.links)
  .enter().append("line")
  .attr("stroke-width", function (d) {
    return Math.sqrt(d.value);
  });

var node = svg.append("g")
  .attr("class", "nodes")
  .selectAll("g")
  .data(data.nodes)
  .enter().append("g")

var circles = node.append("circle")
  .attr("r", function (d) {
    return d.hurtos/10;
  })
  .attr("fill", function (d) {
    return color(d.hurtos);
  });

// Create a drag handler and append it to the node object instead
var drag_handler = d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

drag_handler(node);

var labels = node.append("text")
  .text(function (d) {
    return d.id;
  })
  .attr('x', 6)
  .attr('y', 3);

node.append("title")
  .text(function (d) {
    return d.id;
  });

simulation
  .nodes(data.nodes)
  .on("tick", ticked);

simulation.force("link")
  .links(data.links);

function ticked() {
  link
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    });

  node
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
