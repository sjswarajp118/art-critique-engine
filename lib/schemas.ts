import z from "zod";

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
  suggestions: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .min(1)
    .max(5),
  // measurementWarning: z.string().optional(),
});

export type Critique = z.infer<typeof critiqueSchema>;