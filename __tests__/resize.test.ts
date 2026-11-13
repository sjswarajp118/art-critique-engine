import { jpegName, needsResize, scaleToFit } from "@/lib/resize";
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


describe("needsResize", () => {
    it("returns false if the size is less than the target", () => {
        expect(needsResize(3000000, 4000000)).toBe(false);
    });

    it("returns false if the size is equal to the target", () => {
        expect(needsResize(4000000, 4000000)).toBe(false);
    });

    it("returns true if the size is greater than the target", () => {
        expect(needsResize(4000001, 4000000)).toBe(true);
    });

});

describe("jpegName", () => {
    it("converts a PNG filename to a JPEG filename", () => {
        expect(jpegName("image.png")).toBe("image.jpg");
    });
    it("replaces a JPEG extension with a JPG extension", () => {
        expect(jpegName("my.sketch.jpeg")).toBe("my.sketch.jpg");
    });
    it("handles a file name without an extension", () => {
        expect(jpegName("scan")).toBe("scan.jpg");
    });
    it("handles a jpg extension", () => {
        expect(jpegName("scan.jpg")).toBe("scan.jpg");
    });
})