import { generateCritique } from "@/lib/critique"
import { landmarkSchema } from "@/lib/schemas"
import { ALLOWED_TYPES, MAX_SIZE } from "@/lib/upload"
import { NoObjectGeneratedError } from "ai"

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
    // 6. NOW read the file into bytes
    const bytes = await file.arrayBuffer();
    try {
        const critique = await generateCritique(bytes, landmarksResult.data);
        //  return the critique as a JSON response
        return Response.json(critique)
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
