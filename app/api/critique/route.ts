import { generateCritique } from "@/lib/critique"
import { measureProportions } from "@/lib/geometry"
import { lookupMeasurement } from "@/lib/measure"
import { judgeRatio } from "@/lib/ratioGuide"
import { CritiqueResponse, frontFacingSchema, landmarkSchema } from "@/lib/schemas"
import { ALLOWED_TYPES, MAX_SIZE } from "@/lib/upload"
import { NoObjectGeneratedError } from "ai"
import z from "zod"

export async function POST(request: Request) {
    // 1. read file + landmarks text from formData
    const formData = await request.formData()
    const file = formData.get("image")
    const rawLandmarks = formData.get("landmarks")

    // 2. guard: file present and is a File
    if (!(file instanceof File)) {
        return Response.json({ error: "No Image Provided" }, { status: 400 })
    }

    // 3. guard: type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json({ error: "Please use a jpeg, png or webp image" }, { status: 415 })
    }

    // 4. guard: size
    if (file.size > MAX_SIZE) {
        return Response.json({ error: "The image is too large" }, { status: 413 })
    }

    // 5a. guard: landmarks (parse, then safeParse)
    if (typeof rawLandmarks !== "string") {
        return Response.json({ error: "Invalid landmarks format" }, { status: 400 })
    }

    // 5b. guard : Json parse can throw on broken text
    let parsed: unknown
    try {
        parsed = JSON.parse(rawLandmarks)
    } catch {
        return Response.json({ error: "Invalid landmarks JSON" }, { status: 400 })
    }

    //5c. guard: safeParse
    const landmarksResult = landmarkSchema.safeParse(parsed);
    if (!landmarksResult.success) {
        console.error("Landmark parsing failed:", landmarksResult.error.issues);
        return Response.json({ error: "Invalid landmarks format" }, { status: 400 })
    }

    const sizeSchema = z.object({
        width: z.coerce.number().int().positive().max(10000),
        height: z.coerce.number().int().positive().max(10000),
        frontFacing: frontFacingSchema,
    })

    const sizeResult = sizeSchema.safeParse({ width: formData.get("width"), height: formData.get("height"), frontFacing: formData.get("frontFacing") ?? "false" });
    if (!sizeResult.success) {
        console.error("Size parsing failed:", sizeResult.error.issues);
        return Response.json({ error: "Invalid image size" }, { status: 400 })
    }

    const { width, height, frontFacing } = sizeResult.data


    const proportions = measureProportions(landmarksResult.data, width, height);

    const judgement = judgeRatio(proportions.eyeToNoseOverNoseToJaw, frontFacing);


    // 6. NOW read the file into bytes
    const bytes = await file.arrayBuffer();
    try {
        const critique = await generateCritique(bytes, proportions, judgement);

        if (judgement === "unusual" && critique.suggestions.length === 0) {
            console.error("Critique contradicts the judgement: unusual but no suggestions");
            return Response.json(
                { error: "We couldn't complete the critique this time. Please try again." },
                { status: 502 },
            );
        }

        const body: CritiqueResponse = { critique, ratio: lookupMeasurement(proportions, "eyeToNoseOverNoseToJaw"), judgementRatio: judgement };
        return Response.json(body);
    }

    catch (error) {
        // the helper throws,  the route decided the status
        if (NoObjectGeneratedError.isInstance(error)) {

            //log details on the server only
            console.log("Critique failed schema:", error.cause, error.text);

            return Response.json({ error: "We couldnt write the crtique this time. Please try again" }, { status: 502 })
        }
        console.error("Critique failed:", error);
        return Response.json({ error: "Something Wrong on our side. Please try again" }, { status: 500 })
    }
}
