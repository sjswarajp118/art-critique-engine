import type { Critique } from "@/lib/schemas";

export default function CritiqueView({ data }: { data: Critique }) {
    return (
        <section className="mt-6 space-y-4 w-11/12 m-auto" >
            {/* // The model's doubt about a measurement. It is an opinion, so it is worded as one. */}
            {
                // data.measurementWarning && (
                //     <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" >
                //         The AI thinks a point may be off: {data.measurementWarning}
                //     </p>
                // )
            }

            <h2 className="rounded-md bg-slate-100 p-4 text-lg text-black font-medium" > {data.summary} </h2>

            < ul className="space-y-3 flex gap-3 flex-wrap" >
                {
                    data.suggestions.map((s, i) => (
                        <li key={i} className="rounded-md  bg-slate-100 border p-4 flex-1 w-3/12" >
                            <h3 className="text-orange-400 font-bold" > {s.title} </h3>
                            < p className="mt-1 text-sm text-sky-700" > {s.detail} </p>
                        </li>
                    ))
                }
            </ul>

            {/* Always visible: a missing warning must never read as "the points are fine". */}
            <p className="text-xs text-slate-500" >
                Face points are found automatically and are not verified.
            </p>
        </section>
    )
}