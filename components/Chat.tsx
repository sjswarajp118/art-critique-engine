"use client";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {

    const [input, setInput] = useState("");
    const { messages, sendMessage, status, stop, error, regenerate } = useChat();
    const isBusy: boolean = status === "submitted" || status === "streaming";

    return (
        <div className="flex flex-col p-5 text-center gap-4">

            {messages.length === 0 && <p className="text-amber-100/70">Ask me anything to get started</p>}
            {messages.map(message =>
                <div className="flex flex-col items-start font-bold w-6/12 mx-auto my-3 p-4 text-black bg-gray-200" key={message.id}>
                    <p className=""> {message.role === "user" ? "You" : "AI"}</p>

                    {message.parts.map((part, i) =>
                        <p key={i}>{part.type === "text" ? <span>{part.text}</span> : null}</p>
                    )}
                </div>
            )}

            {
                error &&
                <div className="text-red-500">
                    <p>Something wnet wrong. Please try again</p>
                    <button className="underline cursor-pointer" onClick={() => regenerate()}>Retry </button>
                </div>
            }

            {status === "submitted" && <p >AI is thinking...</p>}


            <form className="fixed bg-black h-[15%] p-5 left-0 right-0 bottom-0" onSubmit={(e) => {
                e.preventDefault();
                if (isBusy || !input.trim()) return;
                sendMessage({ text: input });
                setInput("");

            }}>
                <input value={input} disabled={isBusy} className="w-4/12 outline-0 py-3 px-4 border-2 rounded-l-2xl disabled:bg-gray-50" onChange={e => setInput(e.target.value)} placeholder="Ask me anything" />

                <button type="submit" disabled={isBusy} className="p-3 mx-2 bg-amber-100 text-red-600 font-bold cursor-pointer rounded-r-2xl disabled:cursor-not-allowed">Send</button>

                {isBusy && <button type="button" onClick={stop} className="p-3 mx-2 bg-red-300 text-white font-bold cursor-pointer">Stop</button>}
            </form>
        </div>
    )
}