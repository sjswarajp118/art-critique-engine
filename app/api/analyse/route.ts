
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
    console.log(request , "api analyse works")
    const formData = await request.formData()
    const file = formData.get("image")

    if (!(file instanceof File)) {
        return Response.json({ error: "No Image Provides" }, { status: 400 })
    }
    if (!(ALLOWED_TYPES.includes(file.type))) {
        return Response.json({ error: "Invalid File Type" }, { status: 415 })
    }
    if (file.size > MAX_SIZE) {
        return Response.json({ error: "File is too large" }, { status: 413 })
    }

    return Response.json({message:"Received", name:file.name, size: file.size});
}
