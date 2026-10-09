"use client"

import React, { useEffect, useRef, useState } from "react"
import { validateFile } from "@/lib/upload";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import { loadImage } from "@/lib/image";
import { Critique, critiqueSchema, Landmarks } from "@/lib/schemas";
import { extractLandmarks } from "@/lib/landmarks";
import CritiqueView from "./CritiqueView";
import PointsOverlay from "./PointsOverlay";

//json helper
async function readJsonSafely(response: Response) {
    try {
        return await response.json();
    }
    catch {
        return null;
    }
}

export default function UploadPanel() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [engineState, setEngineState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
    const [landmarks, setLandmarks] = useState<Landmarks | null>(null);

    // the tool itself: survives re-renders, no repaint when set
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    //own upload state 
    type UploadState =
        { status: "idle" }
        | { status: "uploading" }
        | { status: "analyzing" }
        | { status: "success", critique: Critique }
        | { status: "error", kind: "client" | "server" | "network", message: string };

    const [state, setState] = useState<UploadState>({ status: "idle" })

    async function handleAnalyse() {
        if (!file) return;

        const problem = validateFile(file);
        if (problem) {
            setState({ status: "error", kind: "client", message: problem });
            return;
        }
        setState({ status: "analyzing" });

        // 1. get the engine (loads on the first click, instant after that)
        let landmarker: FaceLandmarker;
        try {
            landmarker = await ensureLandmarker();
        }
        catch {
            // ensureLandmarker already logged the real error and set engineState to "failed"
            setState({ status: "error", kind: "server", message: "Couldnt get the face finder ready. Please try again" });
            return;
        }
        // turn the File into a loaded image element
        let img: HTMLImageElement;
        try {
            img = await loadImage(file)
        }
        catch {
            setState({
                status: "error",
                kind: "client",
                message: "Couldnt read the image, please try another one"
            })
        }

        // find the facepoints and run them through your pipeline
        let facepoints: Landmarks;
        try {
            img = await loadImage(file)
            const result = landmarker.detect(img);
            const extracted = extractLandmarks(result);

            if (!extracted.ok) {
                const message = extracted.reason === "no face detected" ?
                    "We couldn't find a face in the image. Try a clearer or more complete Portrait" :
                    "We found a face but it couldnt be read reliably. Try another image";
                setState({ status: "error", kind: "client", message });
                return;
            }

            facepoints = extracted.data;

            console.log("landmarks:", facepoints, "image size:", img.naturalWidth, img.naturalHeight);
        }
        catch (error) {
            console.error("Error during landmark extraction:", error);
            setState({ status: "error", kind: "client", message: "We couldnt analyse the image. Please choose another image" });
            return;
        }

        setState({ status: "uploading" });
        const formData = new FormData();
        formData.append("image", file);
        formData.append("landmarks", JSON.stringify(facepoints));
        setLandmarks(facepoints);
        try {
            const response = await fetch('/api/critique', { method: "POST", body: formData });
            const data = await readJsonSafely(response)

            if (!response.ok) {
                const isServer = response.status >= 500;
                setState({ status: "error", kind: isServer ? "server" : "client", message: isServer ? "Something went wrong" : data?.error ?? "The image couldn't be accepted" });
                return;
            }


            const parsed = critiqueSchema.safeParse(data);
            if (!parsed.success) {
                console.error("Critique parsing failed:", parsed.error.issues);
                setState({
                    status: "error",
                    kind: "server",
                    message: "We couldnt read the critique. Please try another image"
                })
                return;
            }

            setState({ status: "success", critique: parsed.data });
        }
        catch {
            setState({ status: "error", kind: "network", message: "Couldnt reach network, try again" })
        }

    }

    async function ensureLandmarker() {
        if (landmarkerRef.current) return landmarkerRef.current;
        setEngineState("loading");
        console.log("Loading Engine");
        try {
            const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision")

            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
            const landmarkerInstance = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: "/models/face_landmarker.task" },
                runningMode: "IMAGE",
            });

            landmarkerRef.current = landmarkerInstance;
            setEngineState("ready");
            return landmarkerInstance
        }
        catch (error) {
            console.error("Failed to load FaceLandmarker:", error);
            setEngineState("failed");
            throw error;
        }

    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0] ?? null;
        setFile(selectedFile)
        setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
        setState({ status: "idle" });
        setLandmarks(null);

    }
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [previewUrl]);
    return (
        <div className="flex flex-col items-center mt-1.5 mb-55">
            <label htmlFor="ChoosingImage">
                <button className="bg-white text-black rounded border-2 font-bold border-red-400 p-2 ml-4 mx-2 cursor-pointer">Upload</button>
                <input type="file" id="ChoosingImage" className="" accept="image/*" onChange={handleFileChange} />
            </label>

           { previewUrl && <PointsOverlay src={previewUrl} landmarks={landmarks} /> }
            <div>
                <div className="flex gap-2 my-3">
                    <button disabled={!file || state.status === "uploading" || (state.status === "error" && state.kind === "client") || engineState === "loading"} onClick={handleAnalyse} className="bg-white text-black rounded border-2 font-bold border-red-400 p-2 ml-4 mx-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400">Analyse</button>
                    <button disabled={state.status === "uploading"} className="bg-white text-black rounded border-2 font-bold border-red-400 p-2 ml-4 mx-2 cursor-pointer" onClick={() => { setFile(null); setPreviewUrl(null); setState({ status: "idle" }) ,setLandmarks(null) }}>Reset</button>
                </div>
                {state.status === "uploading" && <p>Uploading...</p>}
                {state.status === "success" &&
                    <CritiqueView data={state.critique} />
                }
                {state.status === "error" &&
                    <div>
                        <p>{state.message}</p>
                        {state.kind === "client" ? (
                            <button className="bg-white text-black rounded border-2 font-bold border-red-400 p-2 ml-4 mx-2 cursor-pointer" onClick={() => { setFile(null), setPreviewUrl(null), setState({ status: "idle" }) , setLandmarks(null) }} >Choose another image</button>
                        ) : (
                            <button className="bg-white text-black rounded border-2 font-bold border-red-400 p-2 ml-4 mx-2 cursor-pointer" onClick={handleAnalyse}>Retry</button>
                        )}

                    </div>}
            </div>

        </div>
    )
}