import { ALLOWED_TYPES, MAX_SIZE } from "@/lib/upload";

export async function POST(request: Request) {
    const formData = await request.formData()
    const file = formData.get("image")

    if (!(file instanceof File)) {
        return Response.json({ error: "No Image Provided" }, { status: 400 })
    }
    if (!(ALLOWED_TYPES.includes(file.type))) {
        return Response.json({ error: "Invalid File Type" }, { status: 415 })
    }
    if (file.size > MAX_SIZE) {
        return Response.json({ error: "File is too large" }, { status: 413 })
    }

    return Response.json({message:"Received", name:file.name, size: file.size});
}
