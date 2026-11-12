import { scaleToFit } from "@/lib/resize";
import { describe, it, expect } from "vitest";

describe("scaleToFit", () => {
    it("shrinks a landscape image so the longer side equals maxSide", () => {
        expect(scaleToFit(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
    });

    it("shrinks a portrait image the same way", () => {
        expect(scaleToFit(3000, 4000, 2000)).toEqual({ width: 1500, height: 2000 });
    });

    it("does not enlarge an image that already fits", () => {
        expect(scaleToFit(1000, 800, 2000)).toEqual({ width: 1000, height: 800 });
    });

    it("rounds a fraction below .5 down (1333.33 becomes 1333)", () => {
        expect(scaleToFit(3333, 2222, 2000)).toEqual({ width: 2000, height: 1333 });
    });

    it("rounds a fraction above .5 up (1332.67 becomes 1333)", () => {
        expect(scaleToFit(3000, 1999, 2000)).toEqual({ width: 2000, height: 1333 });
    });
});