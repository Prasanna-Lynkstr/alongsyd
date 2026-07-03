import { JOURNEY } from "@/config/welcome";

/**
 * The whole-life roadmap: Diagnosis · School years · Adulthood · After-us,
 * shown as one connected journey Alongsyd grows to support over time — not a
 * "you are here / coming" tracker. Non-interactive, illustrative only.
 */
export default function JourneyStrip() {
  const last = JOURNEY.length - 1;
  return (
    <div aria-hidden className="select-none">
      <div className="flex items-start justify-between">
        {JOURNEY.map((stage, i) => (
          <div key={stage.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span className={`h-px flex-1 ${i === 0 ? "bg-transparent" : "bg-teal/30"}`} />
              <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-soft text-xs font-semibold text-teal-strong ring-1 ring-teal/20">
                {i + 1}
              </span>
              <span className={`h-px flex-1 ${i === last ? "bg-transparent" : "bg-teal/30"}`} />
            </div>
            <span className="mt-1.5 px-0.5 text-center text-[11px] leading-tight text-muted">
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
