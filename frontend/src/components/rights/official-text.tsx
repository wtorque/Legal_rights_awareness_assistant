import { Fragment } from "react";

/**
 * Official text as printed: footnote markers like `2[` are shown as superscripts so amended passages
 * can be matched to the amendment notes. The words themselves are never altered.
 */
export function OfficialText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(?<![\w(])(\d{1,2})\[/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <sup key={i} className="mr-px font-mono text-[0.65em] text-brass">
            {part}
          </sup>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
