import { Tooltip } from "@mantine/core";

interface TermProps {
  tip: string;
  children: string;
}

// A technical word with a tap/hover explanation.
// Rendered as a plain <span> (inline by default) so the sentence flows
// naturally across lines. A <button> would be inline-block and push the
// whole term to the next line, breaking the reading flow.
// tabIndex makes it focusable, so the tooltip opens on:
//   - hover (desktop)
//   - tap (mobile, via touch events)
//   - keyboard focus (accessibility)
export function Term({ tip, children }: TermProps) {
  return (
    <Tooltip label={tip} multiline w={260} withArrow events={{ hover: true, focus: true, touch: true }}>
      <span
        role="button"
        tabIndex={0}
        style={{
          fontWeight: 600,
          color: "inherit",
          textDecoration: "underline dotted",
          textUnderlineOffset: 3,
          cursor: "help",
        }}
      >
        {children}
      </span>
    </Tooltip>
  );
}

export default Term;