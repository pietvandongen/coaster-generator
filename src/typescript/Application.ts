import {Point} from "./Point";
import {Bounds} from "./Bounds";
import * as $ from "jquery";
import * as d3Selection from "d3-selection";
import {BaseType, Selection} from "d3-selection";
import * as d3Voronoi from "d3-voronoi";
import {VoronoiLayout, VoronoiPolygon} from "d3-voronoi";
import * as d3Array from "d3-array";

const NUMBER_OF_REGIONS: number = 66;
const NUMBER_OF_REGION_DIVISIONS: number = 5;
const EDGE_THICKNESS: number = 2;
const SUB_EDGE_THICKNESS: number = Math.round(EDGE_THICKNESS * (2 / 3));
const VIEW_BOX_HEIGHT: number = 100;
const VIEW_BOX_WIDTH: number = VIEW_BOX_HEIGHT;
const PADDING: number = EDGE_THICKNESS;
const FIGURE_CONTAINER: JQuery = $(".figure");
const FIGURE_HEIGHT: number = Math.min(FIGURE_CONTAINER.height(), FIGURE_CONTAINER.width());
const FIGURE_WIDTH: number = FIGURE_HEIGHT;
const FIGURE_CENTER: Point = {
    x: Math.round((VIEW_BOX_WIDTH - PADDING * 2) / 2) + PADDING,
    y: Math.round((VIEW_BOX_HEIGHT - PADDING * 2) / 2) + PADDING
};
const FIGURE_BOUNDS: Bounds = {
    topLeft: {x: PADDING, y: PADDING},
    bottomRight: {x: VIEW_BOX_WIDTH - PADDING, y: VIEW_BOX_HEIGHT - PADDING}
};
const FIGURE_BOUNDS_RADIUS: number = Math.floor((VIEW_BOX_WIDTH - PADDING * 2) / 2);
const FIGURE: Selection<BaseType, {}, null, undefined> = d3Selection.select(FIGURE_CONTAINER.get(0))
    .append("svg")
    .attr("viewBox", "0 0 " + VIEW_BOX_WIDTH + " " + VIEW_BOX_HEIGHT)
    .attr("height", FIGURE_HEIGHT)
    .attr("width", FIGURE_WIDTH);
const MAIN_REGION_CLIP_PATH_PREFIX: string = "main-region-clip-path-";
const FILL_COLOR: string = "none";
const STROKE_COLOR: string = "#000";
const STROKE_LINE_JOIN_TYPE: string = "round";

function drawFigure(): void {
    let polygons: VoronoiPolygon<number[]>[] = removePolygonsOutsideFigureBounds(createPolygons(NUMBER_OF_REGIONS, FIGURE_BOUNDS));
    let pathDescriptions: string[] = polygons.map(polygon => getPathDescriptionForPolygon(polygon));

    createMainRegionClipPaths(pathDescriptions);
    drawMainRegions(pathDescriptions);
    drawSubRegions(polygons);
}

function createMainRegionClipPaths(pathDescriptions: string[]): void {
    let group: Selection<BaseType, {}, null, undefined> = FIGURE
        .append("defs")
        .attr("id", "main-region-clip-paths");

    pathDescriptions.forEach((pathDescription: string, index: number) => {
        group
            .append("clipPath")
            .attr("id", MAIN_REGION_CLIP_PATH_PREFIX + index)
            .append("path")
            .attr("d", pathDescription);
    });
}

function drawMainRegions(pathDescriptions: string[]): void {
    let group: Selection<BaseType, {}, null, undefined> = FIGURE
        .append("g")
        .attr("id", "main-regions");

    pathDescriptions.forEach((pathDescription: string) => {
        group
            .append("path")
            .attr("fill", FILL_COLOR)
            .attr("stroke", STROKE_COLOR)
            .attr("stroke-width", EDGE_THICKNESS)
            .attr("stroke-linejoin", STROKE_LINE_JOIN_TYPE)
            .attr("d", pathDescription);
    });
}

function drawSubRegions(polygons: VoronoiPolygon<number[]>[]): void {
    let group: Selection<BaseType, {}, any, any> = FIGURE
        .append("g")
        .attr("class", "sub-regions");

    polygons.forEach((polygon: VoronoiPolygon<number[]>, index: number) => {
        let polygonArray: number[][] = polygon as number[][];
        let bounds: Bounds = {
            topLeft: {
                x: d3Array.min(polygonArray, (point: number[]) => point[0]),
                y: d3Array.min(polygonArray, (point: number[]) => point[1])
            },
            bottomRight: {
                x: d3Array.max(polygonArray, (point: number[]) => point[0]),
                y: d3Array.max(polygonArray, (point: number[]) => point[1])
            },
        };
        let subPolygons: VoronoiPolygon<number[]>[] = createPolygons(NUMBER_OF_REGION_DIVISIONS, bounds);
        let subGroup: Selection<BaseType, {}, any, any> = group
            .append("g")
            .attr("class", "sub-regions-" + index);

        subPolygons.forEach(polygon => {
            subGroup
                .append("path")
                .attr("fill", FILL_COLOR)
                .attr("stroke", STROKE_COLOR)
                .attr("stroke-width", SUB_EDGE_THICKNESS)
                .attr("stroke-linejoin", STROKE_LINE_JOIN_TYPE)
                .attr("clip-path", "url(#" + MAIN_REGION_CLIP_PATH_PREFIX + index + ")")
                .attr("d", getPathDescriptionForPolygon(polygon));
        });
    });
}

function getPathDescriptionForPolygon(polygon: VoronoiPolygon<number[]>): string {
    return "M" + (polygon as number[][]).join("L") + "Z";
}

function createSeeds(numberOfSeeds: number, bounds: Bounds): number[][] {
    let seeds: number[][] = [];

    for (let i: number = 0; i < numberOfSeeds; i++) {
        let width: number = bounds.bottomRight.x - bounds.topLeft.x;
        let height: number = bounds.bottomRight.y - bounds.topLeft.y;
        let x = bounds.topLeft.x + Math.random() * width;
        let y = bounds.topLeft.y + Math.random() * height;

        seeds.push([x, y]);
    }

    return seeds;
}

function createPolygons(numberOfRegions: number, bounds: Bounds): VoronoiPolygon<number[]>[] {
    let seeds = createSeeds(numberOfRegions, bounds);
    let voronoi: VoronoiLayout<number[]> = d3Voronoi.voronoi().extent([
        [bounds.topLeft.x, bounds.topLeft.y],
        [bounds.bottomRight.x, bounds.bottomRight.y]
    ]);

    return voronoi.polygons(seeds);
}

function removePolygonsOutsideFigureBounds(polygons: VoronoiPolygon<number[]>[]): VoronoiPolygon<number[]>[] {
    return polygons.filter(polygon => polygonIsWithBounds(polygon));
}

function polygonIsWithBounds(points: VoronoiPolygon<number[]>): boolean {
    return (points as number[][]).every(point => pointIsWithinBounds({x: point[0], y: point[1]}));
}

function pointIsWithinBounds(point: Point): boolean {
    return Math.pow(point.x - FIGURE_CENTER.x, 2) + Math.pow(point.y - FIGURE_CENTER.y, 2) < Math.pow(FIGURE_BOUNDS_RADIUS, 2);
}

drawFigure();
