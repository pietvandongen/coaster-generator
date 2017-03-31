import {Point} from "../type/Point";
import {Bounds} from "../type/Bounds";
import * as $ from "jquery";
import * as d3Selection from "d3-selection";
import {BaseType, Selection} from "d3-selection";
import * as d3Voronoi from "d3-voronoi";
import {VoronoiLayout, VoronoiPolygon} from "d3-voronoi";
import * as d3Array from "d3-array";
import {FigureService} from "./FigureService";

export class CoasterFigureService implements FigureService {
    readonly numberOfRegions: number = 66;
    readonly numberOfRegionDivisions: number = 5;
    readonly edgeThickness: number = 2;
    readonly subEdgeThickness: number = Math.round(this.edgeThickness * (2 / 3));
    readonly viewBoxSize: number = 100;
    readonly figure: JQuery = $(`<svg viewBox="0 0 ${this.viewBoxSize} ${this.viewBoxSize}"></svg>`);
    readonly figureCenter: Point = {
        x: Math.round(this.viewBoxSize / 2),
        y: Math.round(this.viewBoxSize / 2)
    };
    readonly figureBounds: Bounds = {
        topLeft: {x: 0, y: 0},
        bottomRight: {x: this.viewBoxSize, y: this.viewBoxSize}
    };
    readonly figureBoundsRadius: number = Math.floor((this.viewBoxSize) / 2);
    readonly figureSelection: Selection<BaseType, {}, null, undefined> = d3Selection.select(this.figure.get(0));
    readonly mainRegionClipPathPrefix: string = "main-region-clip-path-";
    readonly fillColor: string = "none";
    readonly strokeColor: string = "#000";
    readonly strokeLineJoinType: string = "round";

    createFigure(): JQuery {
        let polygons: VoronoiPolygon<number[]>[] = this.removePolygonsOutsideFigureBounds(CoasterFigureService.createPolygons(this.numberOfRegions, this.figureBounds));
        let pathDescriptions: string[] = polygons.map(polygon => CoasterFigureService.getPathDescriptionForPolygon(polygon));

        this.createMainRegionClipPaths(pathDescriptions);
        this.drawMainRegions(pathDescriptions);
        this.drawSubRegions(polygons);

        return this.figure;
    }

    private createMainRegionClipPaths(pathDescriptions: string[]): void {
        let group: Selection<BaseType, {}, null, undefined> = this.figureSelection
            .append("defs")
            .attr("id", "main-region-clip-paths");

        pathDescriptions.forEach((pathDescription: string, index: number) => {
            group
                .append("clipPath")
                .attr("id", this.mainRegionClipPathPrefix + index)
                .append("path")
                .attr("d", pathDescription);
        });
    }

    private drawMainRegions(pathDescriptions: string[]): void {
        let group: Selection<BaseType, {}, null, undefined> = this.figureSelection
            .append("g")
            .attr("class", "main-regions");

        pathDescriptions.forEach((pathDescription: string) => {
            group
                .append("path")
                .attr("fill", this.fillColor)
                .attr("stroke", this.strokeColor)
                .attr("stroke-width", this.edgeThickness)
                .attr("stroke-linejoin", this.strokeLineJoinType)
                .attr("d", pathDescription);
        });
    }

    private drawSubRegions(polygons: VoronoiPolygon<number[]>[]): void {
        let group: Selection<BaseType, {}, any, any> = this.figureSelection
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
            let subPolygons: VoronoiPolygon<number[]>[] = CoasterFigureService.createPolygons(this.numberOfRegionDivisions, bounds);
            let subGroup: Selection<BaseType, {}, any, any> = group
                .append("g")
                .attr("class", "sub-regions-" + index);

            subPolygons.forEach(polygon => {
                subGroup
                    .append("path")
                    .attr("fill", this.fillColor)
                    .attr("stroke", this.strokeColor)
                    .attr("stroke-width", this.subEdgeThickness)
                    .attr("stroke-linejoin", this.strokeLineJoinType)
                    .attr("clip-path", "url(#" + this.mainRegionClipPathPrefix + index + ")")
                    .attr("d", CoasterFigureService.getPathDescriptionForPolygon(polygon));
            });
        });
    }

    private static getPathDescriptionForPolygon(polygon: VoronoiPolygon<number[]>): string {
        return "M" + (polygon as number[][]).join("L") + "Z";
    }

    private static createPolygons(numberOfRegions: number, bounds: Bounds): VoronoiPolygon<number[]>[] {
        let seeds: number[][] = CoasterFigureService.createSeeds(numberOfRegions, bounds).map(seed => [seed.x, seed.y]);
        let voronoi: VoronoiLayout<number[]> = d3Voronoi.voronoi().extent([
            [bounds.topLeft.x, bounds.topLeft.y],
            [bounds.bottomRight.x, bounds.bottomRight.y]
        ]);

        return voronoi.polygons(seeds);
    }

    private static createSeeds(numberOfSeeds: number, bounds: Bounds): Point[] {
        let seeds: Point[] = [];

        for (let i: number = 0; i < numberOfSeeds; i++) {
            let width: number = bounds.bottomRight.x - bounds.topLeft.x;
            let height: number = bounds.bottomRight.y - bounds.topLeft.y;
            let x = bounds.topLeft.x + Math.random() * width;
            let y = bounds.topLeft.y + Math.random() * height;

            seeds.push({x: x, y: y});
        }

        return seeds;
    }

    private removePolygonsOutsideFigureBounds(polygons: VoronoiPolygon<number[]>[]): VoronoiPolygon<number[]>[] {
        return polygons.filter(polygon => this.polygonIsWithBounds(polygon));
    }

    private polygonIsWithBounds(points: VoronoiPolygon<number[]>): boolean {
        return (points as number[][]).every(point => this.pointIsWithinBounds({x: point[0], y: point[1]}));
    }

    private pointIsWithinBounds(point: Point): boolean {
        return Math.pow(point.x - this.figureCenter.x, 2) + Math.pow(point.y - this.figureCenter.y, 2) < Math.pow(this.figureBoundsRadius, 2);
    }
}
