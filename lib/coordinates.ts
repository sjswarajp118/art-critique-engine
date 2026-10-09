const TOLERANCE = 0.05;

function clampIfClose(v: number): number {
    if (v <= 0 && v >= -TOLERANCE) return 0;
    if (v >= 1 && v <= 1 + TOLERANCE) return 1;
    return v;
}


export function clampPoint(p: { x: number, y: number }) {
    return {
        x: clampIfClose(p.x),
        y: clampIfClose(p.y)
    }
}