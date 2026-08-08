import type { ReactNode } from "react";

interface InfoTooltipProps {
  term: string;
  children: ReactNode;
}

export function InfoTooltip({ term, children }: InfoTooltipProps) {
  return (
    <span className="relative inline-block group">
      <button
        type="button"
        className="font-semibold text-blue-600 underline decoration-dotted underline-offset-2 cursor-help focus:outline-none"
      >
        {term}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-md border border-gray-200 bg-gray-100 p-3 text-left text-xs font-normal text-gray-700 leading-relaxed shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}