import { tool } from "ai";
import { z } from "zod";
import type { Proportions } from "./geometry";
import { lookupMeasurement } from "./measure";

export function makeMeasureTool(proportions: Proportions, allowed : readonly (keyof Proportions)[]) {
    return tool({
        description: "Looks up one measurement of the face from the face points the app already holds. " +
            "Call it with the name of the measurement you want, from the list below. " +
            "Available:" + allowed.join(", ") + " ." +
            "Returns an object with measurement, value, unit and meaning. " +
            "If value is null, the measurement could not be taken: say so and do not guess a number. " +
            "It only measures; it does not judge whether the face points are accurate.",
        inputSchema: z.object({
            name: z.enum([...allowed]),
        }),
        execute: async ({ name }) => {
            return lookupMeasurement(proportions, name);
        },
    });
}