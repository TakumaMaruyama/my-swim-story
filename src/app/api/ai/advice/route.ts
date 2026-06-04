import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  mode: z.enum(["yearly", "monthly", "weekly"]),
  text: z.string().trim().min(1).max(4000),
});

const FALLBACK_MESSAGE =
  "AIアドバイスは現在準備中です。まずは、自分の言葉で目標を書いてみましょう。";

function buildPrompt(mode: "yearly" | "monthly" | "weekly", text: string): string {
  const modeInstruction = {
    yearly: "年間目標の文章を短く整理し、結果目標と行動目標のつながりがわかるようにしてください。",
    monthly: "月間目標の文章を整理し、今月の行動に落とし込んでください。",
    weekly: "振り返り文を整理し、次の1週間でできる行動案を2つまで提案してください。",
  }[mode];

  return [
    "あなたは学生競泳選手の目標設定を支援するアシスタントです。本人の言葉を尊重し、小中高生にもわかる短い日本語で、目標を整理してください。断定的に指導せず、練習で実行できる行動に落とし込んでください。",
    "禁止事項: 医学的助言、栄養指導の断定、怪我への判断、メンタル診断、他選手との比較、コーチ批判はしないでください。",
    modeInstruction,
    "回答は120文字から220文字程度で、日本語の箇条書きは最大3点までにしてください。",
    "",
    "入力:",
    text,
  ].join("\n");
}

function extractText(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const response = body as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const text = response.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text" && typeof item.text === "string")?.text;

  return text?.trim() || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 });
    }

    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: FALLBACK_MESSAGE });
    }

    const endpoint = process.env.LLM_API_BASE_URL ?? "https://api.openai.com/v1/responses";
    const model = process.env.LLM_MODEL ?? "gpt-4.1-mini";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: buildPrompt(parsed.data.mode, parsed.data.text),
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: FALLBACK_MESSAGE });
    }

    const payload = await response.json();
    const message = extractText(payload) ?? FALLBACK_MESSAGE;
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ message: FALLBACK_MESSAGE });
  }
}
