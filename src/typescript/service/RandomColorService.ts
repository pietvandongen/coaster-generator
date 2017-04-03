import * as d3Color from "d3-color";
import {HCLColor} from "d3-color";
import {ColorService} from "./ColorService";

export class RandomColorService implements ColorService {
    readonly maximumHue: number = 360;
    readonly mainColor: HCLColor;
    readonly darkenedColor: HCLColor;
    readonly complimentaryColor: HCLColor;

    constructor() {
        console.log(d3Color.hcl("#3ad284"));

        this.mainColor = d3Color.hcl(
            Math.round(Math.random() * this.maximumHue),
            83,
            35
        );
        this.darkenedColor = d3Color.hcl(
            this.mainColor.h,
            this.mainColor.c,
            0.75 * this.mainColor.l
        );
        this.complimentaryColor = d3Color.hcl(
            (this.mainColor.h + this.maximumHue / 3) % this.maximumHue,
            63,
            75
        );
    }

    getMainColor(): HCLColor {
        return this.mainColor;
    }

    getDarkenedColor(): HCLColor {
        return this.darkenedColor;
    }

    getSecondaryColor(): HCLColor {
        return this.complimentaryColor;
    }
}
