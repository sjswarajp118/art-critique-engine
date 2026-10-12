import type { Landmarks } from "./schemas";

export type Point = {
    x: number;
    y: number;
}

export type Proportions = {
    tiltDegrees: number;
    eyeDistance: number;
    eyeToNoseDistance: number;
    noseToJawDistance: number;
    eyeToNoseOverNoseToJaw: number | null;
}

export function eyeTiltDegrees(landmarks: Landmarks, width: number, height: number): number {

    const horizontalGap = landmarks.rightEye.x - landmarks.leftEye.x
    const verticalGap = landmarks.rightEye.y - landmarks.leftEye.y

    const pixelGapX = horizontalGap * width
    const pixelGapY = verticalGap * height;

    const tilt = Math.atan2(pixelGapY, pixelGapX);
    const tiltedDegrees = (tilt * 180) / Math.PI
    return tiltedDegrees
}

export function distance(a: Point, b: Point, width: number, height: number): number {
    const pixelGapX = (b.x - a.x) * width;
    const pixelGapY = (b.y - a.y) * height;

    const distanceGaps = Math.hypot(pixelGapX, pixelGapY);

    return distanceGaps;
}

export function midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

}

export function ratio(top: number, bottom: number): number | null {
    if (bottom === 0) return null;

    const result = top / bottom

    return result
}

export function measureProportions(landmarks: Landmarks, width: number, height: number): Proportions {  

    const eyeMidpoint = midpoint(landmarks.leftEye, landmarks.rightEye);
    const tiltDegrees = eyeTiltDegrees(landmarks, width, height)
    const eyeDistance = distance(landmarks.leftEye, landmarks.rightEye, width, height);
    const eyeToNoseDistance = distance(eyeMidpoint, landmarks.nose, width, height);
    const noseToJawDistance = distance(landmarks.nose, landmarks.jaw, width, height);
    const eyeToNoseOverNoseToJaw = ratio(eyeToNoseDistance, noseToJawDistance);

    return { tiltDegrees, eyeDistance, eyeToNoseDistance, noseToJawDistance, eyeToNoseOverNoseToJaw };

}