import * as $ from "jquery";
import * as d3Array from "d3-array";
import * as d3Selection from "d3-selection";
import * as d3Voronoi from "d3-voronoi";
import {VoronoiLayout} from "d3-voronoi";

let numberOfPolygonsIncludingEdgePieces: number = 66;
let graphContainer: JQuery = $(".graph");
let height: number = Math.min(graphContainer.height(), graphContainer.width());
let width: number = height;
let circleCenterX: number = Math.round(width / 2);
let circleCenterY: number = Math.round(height / 2);
let circleRadius: number = Math.floor(width / 2) - 1;

let coaster: any = d3Selection.select(graphContainer.get(0))
    .append("svg")
    .attr("height", height)
    .attr("width", width);

let sites: number[][] = d3Array.range(numberOfPolygonsIncludingEdgePieces)
    .map(() => [Math.random() * width, Math.random() * height]);

let voronoi: VoronoiLayout<number[]> = d3Voronoi.voronoi()
    .extent([[-1, -1], [width + 1, height + 1]]);

coaster
    .append("g")
    .attr("class", "polygons")
    .selectAll("path")
    .data(voronoi.polygons(sites))
    .enter()
    .append("path")
    .call((polygon: any) => polygon.attr("d", (points: number[][]) => pointsAreAllInCircle(points) ? "M" + points.join("L") + "Z" : null));

function pointsAreAllInCircle(points: number[][]): boolean {
    return points.every(point => Math.pow(point[0] - circleCenterX, 2) + Math.pow(point[1] - circleCenterY, 2) < Math.pow(circleRadius, 2));
}
