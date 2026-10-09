import { clampPoint } from "./coordinates";
import { Landmarks, landmarkSchema } from "./schemas";
import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export const LANDMARK_INDEX = {
    leftEye: 33,    // checked: smaller x than 263 on a photo and a drawing
    rightEye: 263,  // checked: same
    nose: 1,        // passes position checks; confirm visually in Week 4
    jaw: 152,       // passes position checks; confirm visually in Week 4
};


function getPoint(face: { x: number, y: number }[], index: number) {
    const p = face[index];
    return { x: p.x, y: p.y };
}
//ok reason reunion
type ExtractResult = { ok: true, data: Landmarks } 
| { ok: false, reason: "no face detected" | "face not valid" };


export function extractLandmarks(result: FaceLandmarkerResult): ExtractResult {
    const face = result.faceLandmarks[0];
    if (!face) {
        return { ok: false, reason: "no face detected" };
    }

    const raw = {
        leftEye: getPoint(face, LANDMARK_INDEX.leftEye),
        rightEye: getPoint(face, LANDMARK_INDEX.rightEye),
        nose: getPoint(face, LANDMARK_INDEX.nose),
        jaw: getPoint(face, LANDMARK_INDEX.jaw),
    };

    const clamped = {
        leftEye: clampPoint(raw.leftEye),
        rightEye: clampPoint(raw.rightEye),
        nose: clampPoint(raw.nose),
        jaw: clampPoint(raw.jaw),
    };

    const parsed = landmarkSchema.safeParse(clamped);
    if (!parsed.success) {
        console.log("Landmark parsing failed:", parsed.error.issues);
        return { ok: false, reason: "face not valid" };
    }

    return { ok: true, data: parsed.data };
}

