import * as $ from "jquery";
import * as d3Array from "d3-array";
import * as d3Selection from "d3-selection";
import * as d3Voronoi from "d3-voronoi";
import * as d3Polygon from "d3-polygon";

let graphContainer = $(".graph");
let height = Math.min(graphContainer.height(), graphContainer.width());
let width = height;
let svg = d3Selection.select(".graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
let sites = d3Array.range(100)
    .map(function (d) {
        return [Math.random() * width, Math.random() * height];
    });
let voronoi = d3Voronoi.voronoi()
    .extent([[-1, -1], [width + 1, height + 1]]);
let polygon = svg.append("g")
    .attr("class", "polygons")
    .selectAll("path")
    .data(voronoi.polygons(sites))
    .enter()
    .append("path")
    .call(redrawPolygon);

function redrawPolygon(polygon) {
    polygon
        .attr("d", function (d) {
            return d ? "M" + d.join("L") + "Z" : null;
        });
}
