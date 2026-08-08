import { Tooltip } from "@mantine/core";

interface TermProps {
  tip: string;
  children: string;
}

export function Term({ tip, children }: TermProps) {
  return (
    <Tooltip label={tip} multiline w={260} withArrow events={{ hover: true, focus: true, touch: true }}>
      <button
        type="button"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "help",
          font: "inherit",
          fontWeight: 600,
          color: "inherit",
          textDecoration: "underline dotted",
          textUnderlineOffset: 3,
        }}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export default Term;