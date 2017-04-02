import {Color} from "d3-color";

export interface ColorService {
    getMainColor(): Color;
    getDarkenedColor(): Color;
    getSecondaryColor(): Color;
}
