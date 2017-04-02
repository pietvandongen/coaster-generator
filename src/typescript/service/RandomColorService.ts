import * as d3Color from "d3-color";
import {HCLColor} from "d3-color";
import {ColorService} from "./ColorService";

export class RandomColorService implements ColorService {
    readonly maximumHue: number = 360;
    readonly maximumChroma: number = 100;
    readonly maximumLuminance: number = 150;
    readonly mainColor: HCLColor;
    readonly darkenedColor: HCLColor;
    readonly complimentaryColor: HCLColor;

    constructor() {
        this.mainColor = d3Color.hcl(
            Math.round(Math.random() * this.maximumHue),
            0.25 * this.maximumChroma,
            0.15 * this.maximumLuminance
        );
        this.darkenedColor = d3Color.hcl(
            this.mainColor.h,
            this.mainColor.c,
            0.4 * this.mainColor.l
        );
        this.complimentaryColor = d3Color.hcl(
            (this.mainColor.h + this.maximumHue / 3) % this.maximumHue,
            0.67 * this.maximumChroma,
            0.5 * this.maximumLuminance
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
