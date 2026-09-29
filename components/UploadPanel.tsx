"use client"

import React, { useState } from "react"

export default function UploadPanel() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0] ?? null;
        setFile(selectedFile)
        setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
    }
    return (
        <div className="flex justify-center mt-55">


            <label htmlFor="ChoosingImage">
                <button className="bg-white text-black rounded border-2 font-bold border-red-400 p-2 ml-4 mx-2 cursor-pointer">Upload</button>
                <input type="file" id="ChoosingImage" className="d-none" accept="image/*" onChange={handleFileChange} />
            </label>
            {previewUrl && <img className="w-96" src={previewUrl} />}

            <button disabled={!file} className="bg-white text-black rounded border-2 font-bold border-red-400 p-2 ml-4 mx-2 cursor-pointer disabled:cursor-not-allowed">Analyse</button>
            <button className="bg-white text-black rounded border-2 font-bold border-red-400 p-2 ml-4 mx-2 cursor-pointer" onClick={() => { setFile(null); setPreviewUrl(null); }}>Reset</button>

        </div>
    )
}