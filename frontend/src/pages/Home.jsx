import { ArrowRight, Code2 } from "lucide-react";
import Button from "../components/Button.jsx";

export default function Home({ onStart }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <section className="grid min-h-[calc(100vh-180px)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Code2 aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
            Code Practice Assistant
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            A beginner-friendly workspace for explaining code and generating simple examples from plain English.
          </p>
          <div className="mt-6">
            <Button icon={ArrowRight} onClick={onStart}>
              Open Practice
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
          <div className="grid gap-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <span className="text-sm font-semibold text-zinc-900">JavaScript</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                Live AI
              </span>
            </div>
            <pre className="overflow-auto rounded-lg bg-zinc-950 p-4 text-sm leading-6 text-zinc-50">
              <code>{`const message = "Hello";

function greet(name) {
  return message + ", " + name;
}

console.log(greet("student"));`}</code>
            </pre>
            <div className="grid gap-2 border-t border-zinc-200 pt-3 text-sm leading-6 text-zinc-700">
              <p>
                Summary: This code stores a message, creates a reusable function, and prints the result.
              </p>
              <p>Concepts: variables, functions, return values, console output.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
