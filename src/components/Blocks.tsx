import type { Block } from "../types";
import { sourceById } from "../config/sources";
import { glossary } from "../content/glossary";

export function SimLabel() {
  return <span className="sim">Simulation — illustrative data</span>;
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "p") return <p key={index}>{block.text}</p>;
        if (block.type === "ul") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "term") {
          return (
            <p key={index}>
              <strong>{block.term}.</strong> {block.definition}
            </p>
          );
        }
        return (
          <aside key={index} className={`callout ${block.kind}`}>
            <strong>{block.title ?? labelFor(block.kind)}. </strong>
            {block.text}
          </aside>
        );
      })}
    </>
  );
}

function labelFor(kind: Block extends { kind: infer K } ? K : string): string {
  if (kind === "verified") return "Verified fact";
  if (kind === "assumption") return "Illustrative assumption";
  if (kind === "needs-verification") return "Needs verification";
  return "Concept";
}

export function SourceList({ ids }: { ids: string[] }) {
  const items = ids.map((id) => sourceById(id)).filter((item) => item !== undefined);
  if (!items.length) return null;
  return (
    <div className="fine">
      <p>Sources checked for the product-specific claims in this lesson:</p>
      <ul>
        {items.map((source) => (
          <li key={source.id}>
            <a href={source.url}>{source.title}</a> — verified {source.verifiedOn}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GlossaryPeek({ ids }: { ids: string[] }) {
  const items = glossary.filter((entry) => ids.includes(entry.id));
  if (!items.length) return <p className="muted">No glossary terms pinned to this lesson.</p>;
  return (
    <ul>
      {items.map((entry) => (
        <li key={entry.id}>
          <strong>{entry.term}.</strong> {entry.definition}
        </li>
      ))}
    </ul>
  );
}
