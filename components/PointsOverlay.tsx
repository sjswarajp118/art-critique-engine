import drawPoints from "@/lib/drawPoints";
import { Landmarks } from "@/lib/schemas";
import { useEffect, useRef, useState } from "react";

export default function PointsOverlay({ src, landmarks }: { src: string, landmarks: Landmarks | null }) {
    const [drawFailed, setDrawFailed] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    function syncCanvas() {
        const img = imageRef.current;
        const canvas = canvasRef.current;

        if (!img || !canvas) return;

        canvas.width = Math.round(img.clientWidth);
        canvas.height = Math.round(img.clientHeight);

        try {
            drawPoints(canvas, landmarks);
            setDrawFailed(false); // Reset drawFailed state on successful draw
        } catch (error) {
            const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
            console.error("Canvas draw failed", reason);
            setDrawFailed(true);
        }
    }
    useEffect(() => {
        if (!imageRef.current || !canvasRef.current) return;
        const observer = new ResizeObserver(() => {
            syncCanvas();
        });

        const img = imageRef.current;
        observer.observe(img);
        return () => observer.disconnect();

    }, [landmarks]);


    return (
        <div className="relative">
            <img ref={imageRef} className="w-full max-w-md" src={src ? src : ""} alt="" />
            <canvas ref={canvasRef} className="absolute left-0 top-0" />

            {drawFailed && landmarks && (
                <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-red-500/50 bg-opacity-50 text-white">
                    <p  role="status" className="px-4">We found the face points but couldn’t draw them on your photo. Your critique isn’t affected.</p>
                </div>
            )}
        </div>
    )
}
