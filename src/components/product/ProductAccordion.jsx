import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ProductAccordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-black/[0.1]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-[9px] uppercase tracking-[0.19em] text-[#211c18]">
          {title}
        </span>

        <ChevronDown
          size={15}
          strokeWidth={1.2}
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
          open
            ? "grid-rows-[1fr] pb-5 opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden text-[12px] leading-[1.8] text-[#665c54]">
          {children}
        </div>
      </div>
    </div>
  );
}