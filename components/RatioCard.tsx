import { RatioJudgement } from "@/lib/ratioGuide";
import { Measurement } from "@/lib/schemas";


const JUDGEMENT_TEXT: Record<RatioJudgement, string> = {
    "unusual":
        "Unusual compared to real front-facing faces. This could be the angle or the style, not necessarily a mistake.",
    "nothing-unusual":
        "Nothing unusual detected compared to typical real front-facing faces.",
    "not-front-facing":
        "You marked this head as not front-facing, so the proportion check was skipped.",
    "not-measured":
        "The proportion could not be measured for this image.",
};

const ROUGH_GUIDE_NOTE =
    "Rough guide only, based on a small set of real photos. Drawings often bend proportions on purpose.";
export default function RatioCard({ ratio, judgement }: { ratio: Measurement, judgement: RatioJudgement }) {

    const wasJudged = judgement === "unusual" || judgement === "nothing-unusual"

    return (
        <div className="mt-4 border border-[#ded9ce] bg-[#f8f6f0] p-4 text-sm leading-6 text-[#5f5b52]">
            {wasJudged && ratio.value !== null && (
                <div className="font-medium text-[#38342d]">Eye-to-nose ÷ nose-to-jaw: {ratio.value}</div>
            )}
            <div className="mt-1">{JUDGEMENT_TEXT[judgement]}</div>
            {wasJudged && <div className="mt-2 text-xs text-[#817b70]">{ROUGH_GUIDE_NOTE}</div>}
        </div>
    )

}