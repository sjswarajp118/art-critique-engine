import z from "zod";
import { RATIO_JUDGEMENTS } from "./ratioGuide";

const point = z.object({
    x:z.number().min(0).max(100),
    y:z.number().min(0).max(100)
});

export const landmarkSchema = z.object({
    leftEye:point,
    rightEye:point,
    nose:point,
    jaw:point,
}).refine(
    (landmark) => landmark.leftEye.x < landmark.rightEye.x, 
    {message:"Left eye must be to the left of right eye"}
);

export type Landmarks = z.infer<typeof landmarkSchema>;

export const critiqueSchema = z.object({
  summary: z.string().min(1),
  working: z.array(z.string()).max(3),
  suggestions: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .max(5),
  // measurementWarning: z.string().optional(),
});



export type Critique = z.infer<typeof critiqueSchema>;

export const measurementSchema = z.object({
    measurement :z.string(),
    value:z.number().nullable(),
    unit:z.string(),
    meaning:z.string(),
})

export const frontFacingSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const critiqueResponseSchema = z.object({
  critique: critiqueSchema,
  ratio : measurementSchema,
  judgementRatio: z.enum(RATIO_JUDGEMENTS), 
})

export type CritiqueResponse = z.infer<typeof critiqueResponseSchema> 

export type Measurement = z.infer<typeof measurementSchema>