"use client"

import React, { useEffect, useRef, useState } from "react"
import { validateFile } from "@/lib/upload";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import { loadImage } from "@/lib/image";
import { Critique, CritiqueResponse, critiqueResponseSchema, critiqueSchema, Landmarks, Measurement } from "@/lib/schemas";
import { extractLandmarks } from "@/lib/landmarks";
import CritiqueView from "./CritiqueView";
import PointsOverlay from "./PointsOverlay";
import { distance, eyeTiltDegrees, measureProportions, midpoint, ratio } from "@/lib/geometry";
import { lookupMeasurement } from "@/lib/measure";
import RatioCard from "./RatioCard";

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
    const [showGuides, setShowGuides] = useState<boolean>(false);

    const [frontFacing, setFrontFacing] = useState(false);

    // the tool itself: survives re-renders, no repaint when set
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    //own upload state 
    type UploadState =
        { status: "idle" }
        | { status: "uploading" }
        | { status: "analyzing" }
        | { status: "success", result: CritiqueResponse }
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
            return;
        }

        // find the facepoints and run them through your pipeline
        let facepoints: Landmarks;
        try {
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

        console.log(measureProportions({ ...facepoints }, img.naturalWidth, img.naturalHeight));

        setState({ status: "uploading" });
        const formData = new FormData();
        formData.append("image", file);
        formData.append("landmarks", JSON.stringify(facepoints));
        formData.append("width", img.naturalWidth.toString());
        formData.append("height", img.naturalHeight.toString());
        formData.append("frontFacing", String(frontFacing));

        setLandmarks(facepoints);
        setShowGuides(true);
        try {
            const response = await fetch('/api/critique', { method: "POST", body: formData });
            const data = await readJsonSafely(response)

            if (!response.ok) {
                const isServer = response.status >= 500;
                setState({ status: "error", kind: isServer ? "server" : "client", message: data?.error ?? (isServer ? "Something went wrong" : "The image couldn't be accepted") });
                return;
            }


            const parsed = critiqueResponseSchema.safeParse(data);
            if (!parsed.success) {
                console.error("Critique parsing failed:", parsed.error.issues);
                setState({
                    status: "error",
                    kind: "server",
                    message: "We couldnt read the critique. Please try another image"
                })
                return;
            }

            setState({ status: "success", result: parsed.data });
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
        // A. Wipe everything that belonged to the previous photo, on every pick
        setFile(null);
        setPreviewUrl(null);
        setLandmarks(null);
        setFrontFacing(false);
        setState({ status: "idle" })

        // B. Cancelled: you chose "clear it", and A already did that. Nothing left to do.
        if (!selectedFile) return;

        // C. Validate BEFORE accepting
        const problem = validateFile(selectedFile)
        if (problem) {
            setState({ status: "error", kind: "client", message: problem})
            e.target.value = "";
            return
        }

        // D. Accept it
        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile));
    }
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [previewUrl]);
    const isProcessing = state.status === "analyzing" || state.status === "uploading";

    return (
        <section className="rounded-sm border border-[#ded9ce] bg-[#fcfbf8] p-5 shadow-[0_12px_36px_rgba(50,42,30,0.04)] sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#e8e3d9] pb-4">
                <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a7a61]">01 / Study</p>
                    <h2 className="mt-1 font-serif text-2xl">Your portrait</h2>
                </div>
                <span className="mt-1 text-xs text-[#827d72]">JPG, PNG or WEBP</span>
            </div>

            <label
                htmlFor="ChoosingImage"
                className={`group flex cursor-pointer flex-col items-center justify-center border border-dashed border-[#cfc7b9] bg-[#f8f6f0] px-5 text-center transition-colors hover:border-[#8d7d63] hover:bg-[#f4f0e7] focus-within:ring-2 focus-within:ring-[#8d7d63] ${
                    previewUrl ? "py-3" : "min-h-56 py-10"
                }`}
            >
                <span className="mb-3 flex size-11 items-center justify-center rounded-full border border-[#d7cfc1] font-serif text-xl text-[#766950]" aria-hidden="true">
                    {previewUrl ? "+" : "↥"}
                </span>
                <span className="font-medium text-[#302d27]">
                    {previewUrl ? "Choose a different portrait" : "Choose a portrait to begin"}
                </span>
                <span className="mt-1 text-xs text-[#817b70]">
                    {previewUrl ? file?.name : "Select an image of a face for your study"}
                </span>
            </label>
            <input
                type="file"
                id="ChoosingImage"
                className="sr-only"
                accept="image/*"
                onChange={handleFileChange}
            />

            {previewUrl && (
                <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-start">
                    <div className="flex min-h-64 items-center justify-center overflow-hidden border border-[#e4dfd5] bg-[#f1eee7] p-3">
                        <PointsOverlay src={previewUrl} landmarks={showGuides ? landmarks : null} />
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 border border-[#e4dfd5] bg-white p-4 text-sm leading-5 text-[#625e55]">
                        <input
                            type="checkbox"
                            checked={frontFacing}
                            onChange={(e) => setFrontFacing(e.target.checked)}
                            className="mt-1 accent-[#73654f]"
                        />
                        <span>
                            <span className="block font-medium text-[#302d27]">Facing front</span>
                            <span className="mt-1 block text-xs text-[#817b70]">Mark this if the head is facing forward.</span>
                        </span>
                    </label>
                </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                    disabled={!file || isProcessing || (state.status === "error" && state.kind === "client") || engineState === "loading"}
                    onClick={handleAnalyse}
                    className="min-h-11 bg-[#292720] px-5 text-sm font-medium text-[#faf8f3] transition-colors hover:bg-[#494438] disabled:cursor-not-allowed disabled:bg-[#aaa69e]"
                >
                    {isProcessing ? "Working…" : "Analyse portrait"}
                </button>
                <button
                    disabled={state.status === "uploading"}
                    className="min-h-11 border border-[#d8d2c7] px-4 text-sm text-[#5f5b52] transition-colors hover:bg-[#f4f1ea] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => { setFile(null); setPreviewUrl(null); setState({ status: "idle" }), setLandmarks(null), setShowGuides(!showGuides) }}
                >
                    Reset
                </button>
                {landmarks && (
                    <button
                        className="min-h-11 px-3 text-sm text-[#75664f] underline decoration-[#c8bdab] underline-offset-4 hover:text-[#393329]"
                        onClick={() => setShowGuides(!showGuides)}
                    >
                        {showGuides ? "Hide guides" : "Show guides"}
                    </button>
                )}
            </div>

            {state.status === "analyzing" && (
                <p className="mt-4 border-l-2 border-[#a39170] bg-[#f5f2eb] px-4 py-3 text-sm text-[#5f5b52]" role="status">
                    Finding facial landmarks in your portrait…
                </p>
            )}
            {state.status === "uploading" && (
                <p className="mt-4 border-l-2 border-[#a39170] bg-[#f5f2eb] px-4 py-3 text-sm text-[#5f5b52]" role="status">
                    Preparing your critique…
                </p>
            )}
            {state.status === "success" && (
                <div className="mt-7 border-t border-[#e8e3d9] pt-6">
                    <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a7a61]">02 / Observations</p>
                    <CritiqueView critique={state.result.critique} />
                    <RatioCard ratio={state.result.ratio} judgement={state.result.judgementRatio} />
                </div>
            )}
            {state.status === "error" && (
                <div className="mt-4 border border-[#e1c9c1] bg-[#fbf3ef] p-4 text-sm text-[#704539]" role="alert">
                    <p>{state.message}</p>
                    {state.kind === "client" ? (
                        <button
                            className="mt-3 underline underline-offset-4"
                            onClick={() => { setFile(null); setPreviewUrl(null); setState({ status: "idle" }); setLandmarks(null) }}
                        >
                            Choose another image
                        </button>
                    ) : (
                        <button className="mt-3 underline underline-offset-4" onClick={handleAnalyse}>Retry</button>
                    )}
                </div>
            )}
        </section>
    )
}