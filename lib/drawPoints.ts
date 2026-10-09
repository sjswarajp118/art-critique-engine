import type { Landmarks } from "./schemas";

export default function drawPoints(canvas: HTMLCanvasElement, landmarks: Landmarks | null) {
    const ctx = canvas.getContext("2d")

    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    if(!landmarks) return;

    Object.values(landmarks).forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x *canvas.width, point.y *canvas.height, 5, 0 , 2* Math.PI);
        ctx.fill();  
    })
}