export const MAX_SIZE = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateFile(file:File) : string  | null{

    //Guard for type
    if(!(ALLOWED_TYPES.includes(file.type))){
        return "Please choose JPEG, PNG, or WEBP image type.";
    }

    //guard for size
    if(file.size > MAX_SIZE){
        return "The Image  must be under 5MB";
    }
    return null;
}