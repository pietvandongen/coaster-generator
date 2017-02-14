import * as $ from "jquery";
import * as d3Selection from "d3-selection";
import {Selection, BaseType} from "d3-selection";
import * as d3Voronoi from "d3-voronoi";
import {VoronoiLayout, VoronoiPolygon} from "d3-voronoi";

let numberOfPolygonsIncludingEdgePieces: number = 66;
let graphContainer: JQuery = $(".graph");
let height: number = Math.min(graphContainer.height(), graphContainer.width());
let width: number = height;
let seeds: Array<Array<number>> = createSeeds(numberOfPolygonsIncludingEdgePieces);
let circleCenterX: number = Math.round(width / 2);
let circleCenterY: number = Math.round(height / 2);
let circleRadius: number = Math.floor(width / 2) - 1;
let voronoi: VoronoiLayout<Array<number>> = d3Voronoi.voronoi().extent([[0, 0], [width, height]]);
let polygons: Array<VoronoiPolygon<Array<number>>> = voronoi.polygons(seeds);

d3Selection.select(graphContainer.get(0))
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("class", "polygons")
    .selectAll("path")
    .data(polygons)
    .enter()
    .append("path")
    .call(drawPolygon);

function drawPolygon(element: Selection<BaseType, {}, any, any>) {
    element.attr("d", (points: Array<Array<number>>) => pointsAreAllInCircle(points) ? "M" + points.join("L") + "Z" : null);
}

function createSeeds(numberOfSeeds: number): Array<Array<number>> {
    let seeds: Array<Array<number>> = [];

    for (let i: number = 0; i < numberOfSeeds; i++) {
        let x = Math.random() * width;
        let y = Math.random() * height;

        seeds.push([x, y]);
    }

    return seeds;
}

function pointsAreAllInCircle(points: Array<Array<number>>): boolean {
    return points.every(point => Math.pow(point[0] - circleCenterX, 2) + Math.pow(point[1] - circleCenterY, 2) < Math.pow(circleRadius, 2));
}
