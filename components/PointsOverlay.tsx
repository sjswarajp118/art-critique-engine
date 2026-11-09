import drawPoints from "@/lib/drawPoints";
import { Landmarks } from "@/lib/schemas";
import { useEffect, useRef, useState } from "react";

export default function PointsOverlay({ src, landmarks }: { src: string, landmarks: Landmarks | null }) {
    const [drawFailed, setDrawFailed] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const img = imageRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;

        const syncCanvas = () => {
            canvas.width = Math.round(img.clientWidth);
            canvas.height = Math.round(img.clientHeight);

            try {
                drawPoints(canvas, landmarks);
                setDrawFailed(false);
            } catch (error) {
                const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
                console.error("Canvas draw failed", reason);
                setDrawFailed(true);
            }
        };

        const observer = new ResizeObserver(() => syncCanvas());
        observer.observe(img);
        return () => observer.disconnect();
    }, [landmarks]);


    return (
        <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the user's file; no server optimisation applies */}
            <img ref={imageRef} className="w-full max-w-md" src={src} alt="" />
            <canvas ref={canvasRef} className="absolute left-0 top-0" />

            {drawFailed && landmarks && (
                <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-red-500/50 text-white">
                    <p role="status" className="px-4">The guides couldn’t be drawn on this image. Your critique is not affected.</p>
                </div>
            )}
        </div>
    )
}
