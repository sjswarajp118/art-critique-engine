import drawPoints from "@/lib/drawPoints";
import { Landmarks } from "@/lib/schemas";
import { useEffect, useRef } from "react";

export default function PointsOverlay({ src, landmarks }: { src: string, landmarks: Landmarks | null }) {

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    function syncCanvas() {
        const img = imageRef.current;
        const canvas = canvasRef.current;

        if (!img || !canvas) return;

        canvas.width = Math.round(img?.clientWidth);
        canvas.height = Math.round(img?.clientHeight);

        drawPoints(canvas, landmarks);
    }
    useEffect(() => {
        if (!imageRef || !canvasRef) return;
        const observer = new ResizeObserver(() => {
            syncCanvas();
        });

        const img = imageRef.current;
        observer.observe(img!);
        return () => observer.disconnect();

    }, [landmarks]);


    return (
        <div className="relative">
            <img ref={imageRef} className="w-full max-w-md" src={src ? src : ""} alt="" />
            <canvas ref={canvasRef} className="absolute left-0 top-0" />
        </div>
    )
}
