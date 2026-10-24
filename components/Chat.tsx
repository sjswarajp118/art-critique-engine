"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
    const [input, setInput] = useState("");
    const { messages, sendMessage, status, stop, error, regenerate } = useChat();
    const isBusy = status === "submitted" || status === "streaming";

    return (
        <section className="flex min-h-[480px] flex-col overflow-hidden rounded-sm border border-[#ded9ce] bg-[#fcfbf8] shadow-[0_12px_36px_rgba(50,42,30,0.04)] lg:sticky lg:top-6">
            <header className="border-b border-[#e8e3d9] px-5 py-5 sm:px-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a7a61]">Studio conversation</p>
                <h2 className="mt-1 font-serif text-2xl text-[#302d27]">Ask the atelier</h2>
                <p className="mt-2 text-sm leading-6 text-[#777167]">
                    Talk through portrait proportions, tonal values, or your next drawing decision.
                </p>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6" aria-live="polite">
                {messages.length === 0 && (
                    <div className="border border-dashed border-[#d8d2c7] bg-[#f8f6f0] p-5">
                        <p className="font-serif text-lg text-[#494438]">Begin with a question</p>
                        <p className="mt-2 text-sm leading-6 text-[#777167]">
                            For example: “How can I compare the spacing of the features in my portrait?”
                        </p>
                    </div>
                )}
                {messages.map((message) => (
                    <article
                        className={`max-w-[94%] border p-4 text-sm leading-6 ${
                            message.role === "user"
                                ? "ml-auto border-[#d9d0c0] bg-[#f2eee5] text-[#38342d]"
                                : "border-[#e8e3d9] bg-white text-[#4d4941]"
                        }`}
                        key={message.id}
                    >
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a7a61]">
                            {message.role === "user" ? "You" : "Atelier"}
                        </p>
                        {message.parts.map((part, index) =>
                            part.type === "text" ? <p key={index}>{part.text}</p> : null
                        )}
                    </article>
                ))}

                {status === "submitted" && (
                    <p className="text-sm italic text-[#777167]" role="status">Considering your question…</p>
                )}

                {error && (
                    <div className="border border-[#e1c9c1] bg-[#fbf3ef] p-4 text-sm text-[#704539]" role="alert">
                        <p>Something went wrong. Please try again.</p>
                        <button className="mt-2 underline underline-offset-4" onClick={() => regenerate()}>
                            Retry response
                        </button>
                    </div>
                )}
            </div>

            <form
                className="border-t border-[#e8e3d9] bg-[#f8f6f0] p-4 sm:p-5"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (isBusy || !input.trim()) return;
                    sendMessage({ text: input });
                    setInput("");
                }}
            >
                <label htmlFor="studio-question" className="sr-only">Ask a question</label>
                <div className="flex gap-2">
                    <input
                        id="studio-question"
                        value={input}
                        disabled={isBusy}
                        className="min-w-0 flex-1 border border-[#d8d2c7] bg-white px-3 py-3 text-sm text-[#302d27] outline-none placeholder:text-[#a09a8e] focus:border-[#8d7d63] focus:ring-1 focus:ring-[#8d7d63] disabled:opacity-60"
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Ask about your study…"
                    />
                    <button
                        type="submit"
                        disabled={isBusy || !input.trim()}
                        className="bg-[#292720] px-4 text-sm font-medium text-[#faf8f3] transition-colors hover:bg-[#494438] disabled:cursor-not-allowed disabled:bg-[#aaa69e]"
                    >
                        Send
                    </button>
                </div>
                {isBusy && (
                    <button type="button" onClick={stop} className="mt-3 text-xs text-[#75664f] underline underline-offset-4">
                        Stop response
                    </button>
                )}
            </form>
        </section>
    );
}
