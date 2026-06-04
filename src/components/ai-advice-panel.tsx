"use client";

import { useState } from "react";

type AdviceMode = "yearly" | "monthly" | "weekly";

export function AiAdvicePanel({
  mode,
  initialText = "",
  title,
  description,
}: {
  mode: AdviceMode;
  initialText?: string;
  title: string;
  description: string;
}) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAsk = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/ai/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          text,
        }),
      });

      const body = (await response.json()) as { message?: string; error?: string };
      setMessage(body.message ?? body.error ?? "AIアドバイスを取得できませんでした。");
    } catch {
      setMessage("AIアドバイスを取得できませんでした。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50/70 p-5">
      <p className="text-sm font-semibold text-cyan-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        className="mt-4 w-full rounded-[1.25rem] border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
        placeholder="AIに整理してほしい内容を入力してください"
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAsk}
          disabled={loading}
          className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "考え中..." : "AIに整理してもらう"}
        </button>
        {message ? <p className="text-sm leading-6 text-slate-700">{message}</p> : null}
      </div>
    </div>
  );
}
