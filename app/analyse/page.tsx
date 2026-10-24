import type { Metadata } from "next";
import Link from "next/link";
import Chat from "@/components/Chat";
import UploadPanel from "@/components/UploadPanel";

export const metadata: Metadata = {
    title: "Portrait Analysis | Art Critique Engine",
    description: "Upload a portrait study for observational critique on proportion and form.",
};

export default function AnalysePage() {
    return (
        <main className="min-h-screen bg-[#f8f6f0] text-[#25231f]">
            <header className="border-b border-[#ded9ce]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
                    <Link href="/analyse" className="flex items-center gap-3" aria-label="Art Critique Engine analysis">
                        <span className="flex size-10 items-center justify-center border border-[#b9ad98] font-serif text-xl">A</span>
                        <span>
                            <span className="block font-serif text-lg leading-tight">Art Critique Engine</span>
                            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#777167]">Atelier Observational Suite</span>
                        </span>
                    </Link>
                    <Link href="/experiment" className="text-sm text-[#625e55] transition-colors hover:text-[#25231f]">
                        Landmark experiment <span aria-hidden="true">↗</span>
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
                <section className="mb-9 max-w-3xl">
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-[#82745f]">
                        Portrait study <span className="px-2 text-[#c5bcae]">/</span> Guided observation
                    </p>
                    <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl">
                        See your portrait
                        <br className="hidden sm:block" /> with a second set of eyes.
                    </h1>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[#69655c] sm:text-base">
                        Share a portrait study for thoughtful observations on proportion and form.
                        Treat every measurement as a guide for your own artistic judgment.
                    </p>
                </section>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
                    <UploadPanel />
                    <Chat />
                </div>

                <p className="mt-8 border-t border-[#ded9ce] pt-5 text-xs leading-6 text-[#777167]">
                    Landmark points are estimated automatically and are not manually verified. Use proportion
                    comparisons as a rough reference, not a verdict on your drawing.
                </p>
            </div>
        </main>
    );
}
