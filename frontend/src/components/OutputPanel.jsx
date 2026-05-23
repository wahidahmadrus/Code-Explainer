import { useState } from "react";
import { AlertTriangle, Check, Clipboard, Code2, Sparkles } from "lucide-react";
import Button from "./Button.jsx";

function Section({ title, children }) {
  return (
    <section className="border-t border-zinc-200 pt-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold text-zinc-950">{title}</h3>
      {children}
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="grid gap-2 text-sm leading-6 text-zinc-700">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CodeBlock({ code, title = "Code" }) {
  const [copiedCode, setCopiedCode] = useState(false);

  async function handleCopyCode() {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-300">
          <Code2 aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-300" />
          <span className="truncate">{title}</span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="focus-ring inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          {copiedCode ? (
            <Check aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <Clipboard aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          <span>{copiedCode ? "Copied!" : "Copy code"}</span>
        </button>
      </div>
      <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words p-4 text-sm leading-6 text-zinc-50 [tab-size:2]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center">
      <Sparkles aria-hidden="true" className="mb-3 h-8 w-8 text-teal-700" />
      <p className="text-sm font-medium text-zinc-800">No result yet</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-500">AI responses will appear here.</p>
    </div>
  );
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanList(items) {
  return Array.isArray(items) ? items.map(cleanText).filter(Boolean) : [];
}

export default function OutputPanel({ mode, output, error, loading, copied, onCopy }) {
  const hasOutput = Boolean(output);
  const summary = cleanText(output?.summary);
  const lineByLine = cleanList(output?.lineByLine);
  const concepts = cleanList(output?.concepts);
  const mistakes = cleanList(output?.mistakes);
  const improvedCode = cleanText(output?.improvedCode);
  const generatedCode = cleanText(output?.code);
  const explanation = cleanText(output?.explanation);
  const loadingMessage = mode === "explain" ? "Thinking through your code..." : "Drafting beginner-friendly code...";

  return (
    <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-4 shadow-soft lg:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">Result</p>
          <h2 className="text-lg font-semibold text-zinc-950">
            {mode === "explain" ? "Code Explanation" : "Generated Code"}
          </h2>
        </div>
        <Button
          icon={copied ? Check : Clipboard}
          variant="secondary"
          onClick={onCopy}
          disabled={!hasOutput || loading}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {error ? (
        <div
          className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
          role="alert"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-6 text-center text-sm text-zinc-700">
          <Sparkles aria-hidden="true" className="mb-3 h-8 w-8 animate-pulse text-teal-700" />
          <p className="font-medium">{loadingMessage}</p>
          <p className="mt-1 max-w-sm leading-6 text-zinc-500">This usually takes a few seconds.</p>
        </div>
      ) : null}

      {!loading && !error && !hasOutput ? <EmptyState /> : null}

      {!loading && !error && mode === "explain" && output ? (
        <div className="grid gap-5">
          {summary ? (
            <Section title="Summary">
              <p className="text-sm leading-6 text-zinc-700">{summary}</p>
            </Section>
          ) : null}
          {lineByLine.length > 0 ? (
            <Section title="Line-by-line Explanation">
              <List items={lineByLine} />
            </Section>
          ) : null}
          {concepts.length > 0 ? (
            <Section title="Concepts">
              <List items={concepts} />
            </Section>
          ) : null}
          {mistakes.length > 0 ? (
            <Section title="Beginner Mistakes">
              <List items={mistakes} />
            </Section>
          ) : null}
          {improvedCode ? (
            <Section title="Improved Code">
              <CodeBlock code={improvedCode} title="Improved code" />
            </Section>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && mode === "generate" && output ? (
        <div className="grid gap-5">
          {generatedCode ? (
            <Section title="Generated Code">
              <CodeBlock code={generatedCode} title="Generated code" />
            </Section>
          ) : null}
          {explanation ? (
            <Section title="Explanation">
              <p className="text-sm leading-6 text-zinc-700">{explanation}</p>
            </Section>
          ) : null}
          {concepts.length > 0 ? (
            <Section title="Concepts">
              <List items={concepts} />
            </Section>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
