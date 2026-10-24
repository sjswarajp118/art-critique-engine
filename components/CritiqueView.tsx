import type { Critique } from "@/lib/schemas";

export default function CritiqueView({ critique }: { critique: Critique }) {
    return (
        <section className="space-y-5">
            <h2 className="border-l-2 border-[#a39170] bg-[#f5f2eb] px-5 py-4 font-serif text-lg leading-7 text-[#38342d]">
                {critique.summary}
            </h2>


            {critique.working.length > 0 &&
                <div className="border-b border-[#e8e3d9] pb-5">

                    <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#82745f]">
                        What&apos;s Working
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5c584f]">
                        {critique.working.map((working, index) => <li key={index}>— {working}</li>)}
                    </ul>
                </div>
            }

            {
                critique.suggestions.length === 0 ? (
                    <p className="text-sm leading-6 text-[#777167]">No suggestions this time. That is not a verdict that the drawing is perfect.</p>
                ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {
                            critique.suggestions.map((s, i) => (
                                <li key={i} className="border border-[#e8e3d9] bg-white p-4">
                                    <h3 className="font-serif text-base text-[#75664f]">{s.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-[#666157]">{s.detail}</p>
                                </li>
                            ))
                        }
                    </ul>
                )
            }

            {/* Always visible: a missing warning must never read as "the points are fine". */}
            <p className="text-xs leading-5 text-[#817b70]">
                Face points are found automatically and are not verified.
            </p>
        </section>
    )
}