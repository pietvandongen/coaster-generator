import {HCLColor} from "d3-color";

export interface ColorService {
    getMainColor(): HCLColor;
    getDarkenedColor(): HCLColor;
    getComplimentaryColor(): HCLColor;
}
