import * as $ from "jquery";
import {ColorService} from "./service/ColorService";
import {RandomColorService} from "./service/RandomColorService";
import {FigureService} from "./service/FigureService";
import {CoasterFigureService} from "./service/CoasterFigureService";

let colorService: ColorService = new RandomColorService();
let figureService: FigureService = new CoasterFigureService();

insertStyleDeclarations();
insertFigure();

function insertStyleDeclarations(): void {
    $("head").append(`
    <style type="text/css">
        .main-background-color {
            background: ${colorService.getMainColor().toString()};
        }
        
        .darkened-background-color {
            background: ${colorService.getDarkenedColor().toString()};
        }
        
        .complimentary-text-color {
            color: ${colorService.getComplimentaryColor().toString()};
        }
        
        path {
            stroke: ${colorService.getComplimentaryColor().toString()};
        }
    </style>`);
}

function insertFigure(): void {
    let figureContainer: JQuery = $(".figure-container");
    let figureSize: number = Math.min(figureContainer.height(), figureContainer.width());
    let figure: JQuery = figureService.createFigure()
        .attr("height", figureSize)
        .attr("width", figureSize);

    $("figure").append(figure);
}
