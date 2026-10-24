import type { Proportions } from "./geometry";

type MeasurementName = keyof Proportions


const INFO : Record<MeasurementName, {unit:string, meaning:string, decimals:number}> = {
    tiltDegrees: { unit: "degrees", meaning: "Angle of the line joining the eyes. 0 is level; negative means the eye on the right side of the picture sits higher than the eye on the left; positive means eye on the left side of the picture sits higher." , decimals: 1},
    eyeDistance: { unit: "pixels", meaning: "How far apart the eyes are", decimals: 0 },
    eyeToNoseDistance: { unit: "pixels", meaning: "How far from the nose the eyes are" , decimals: 0},
    noseToJawDistance: { unit: "pixels", meaning: "How far from the jaw the nose is", decimals: 0 },
    eyeToNoseOverNoseToJaw: { unit: "ratio", meaning: "How far from the nose the eyes are compared to how far from the jaw the nose is", decimals: 2 },
};

export function lookupMeasurement(proportions: Proportions, name: MeasurementName) {
    // const value = name === "eyeToNoseOverNoseToJaw" ? null : proportions[name];
    const value = proportions[name];
    if(value === null) {
        return { measurement: name, value: null, unit: INFO[name].unit, meaning: "could not be measured" };
    } 
    return { measurement: name, value: Number(value.toFixed(INFO[name].decimals)), unit: INFO[name].unit, meaning: INFO[name].meaning };
}
