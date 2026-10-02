import { useEffect, useId, useRef, useState } from "react";

type ReportingDropdownProps = {
  label: string;
  options: readonly string[];
  value: number;
  onChange: (value: number) => void;
  calendar?: boolean;
};

// REPORTING DROPDOWN:
// Reused for the balance period and Statistics month.
// Selection changes the parent screen's filter.
// Escape and clicking outside close the dropdown.
export default function ReportingDropdown({
  label,
  options,
  value,
  onChange,
  calendar = false,
}: ReportingDropdownProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !wrapper.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div
      ref={wrapper}
      className={`reen-reporting-dropdown relative shrink-0 ${
        calendar ? "is-calendar" : ""
      }`}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={`${label}: ${options[value]}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="reen-reporting-trigger flex w-full items-center rounded-lg bg-[#f0f0f0] text-[12px] font-bold text-[#555] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#33b786]"
      >
        {calendar && (
          <img
            src="/assets/b2d13.svg"
            alt=""
            className="h-4 w-4 shrink-0"
          />
        )}

        <span className="min-w-0 flex-1 whitespace-nowrap text-left">
          {options[value]}
        </span>

        <img
          src="/assets/5bab1.svg"
          alt=""
          className={`h-4 w-4 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

          {/* REPORTING PANEL:
          Keep mounted so opening and closing can both fade.
          Closed options cannot receive focus or pointer interaction. */}
      <div
        id={panelId}
        aria-hidden={!open}
        inert={!open}
        className={`reen-reporting-panel absolute left-0 top-full z-40 w-full overflow-hidden rounded-lg bg-[#f0f0f0] ${
          open ? "is-open" : ""
        }`}
      >
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            aria-pressed={index === value}
            onClick={() => {
              onChange(index);
              setOpen(false);
              trigger.current?.focus();
            }}
            className="reen-reporting-option block w-full text-left text-[12px] font-bold text-[#555] hover:bg-[#d4f3e7] focus-visible:bg-[#d4f3e7] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#33b786]"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}