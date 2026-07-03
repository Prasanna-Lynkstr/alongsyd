import { JOURNEY } from "@/config/welcome";

/**
 * The greyed-out roadmap strip. Non-interactive, illustrative only — it signals
 * the whole-life journey (Diagnosis · School years · Adulthood · After-us)
 * without any of those stages being built yet.
 */
export default function JourneyStrip() {
  return (
    <div aria-hidden className="select-none">
      <div className="flex items-center justify-between gap-1">
        {JOURNEY.map((stage, i) => (
          <div key={stage.key} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center text-center">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
                  stage.status === "here"
                    ? "bg-teal text-surface"
                    : "bg-cream text-faint ring-1 ring-line"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`mt-1.5 text-[11px] leading-tight ${
                  stage.status === "here" ? "font-semibold text-ink" : "text-faint"
                }`}
              >
                {stage.label}
              </span>
              <span
                className={`text-[10px] ${
                  stage.status === "here" ? "text-teal-strong" : "text-faint/80"
                }`}
              >
                {stage.status === "here" ? "you're here" : "coming"}
              </span>
            </div>
            {i < JOURNEY.length - 1 && (
              <span className="mb-6 h-px w-4 flex-none bg-line" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
