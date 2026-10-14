import { NextResponse } from "next/server";

import { formatOrder, parseOrder } from "@/lib/order";

/**
 * Receives the order form. Delivers to a Telegram bot (TELEGRAM_BOT_TOKEN +
 * TELEGRAM_CHAT_ID) and/or an n8n webhook (N8N_WEBHOOK_URL). With neither
 * configured it answers 503 and the form falls back to email/Telegram links.
 */
export async function POST(request: Request) {
  // A hidden field real visitors never fill.
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (body?.website) return NextResponse.json({ ok: true });

  const order = parseOrder(body);
  if (!order) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  const webhook = process.env.N8N_WEBHOOK_URL;
  if (!(token && chat) && !webhook) {
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  const text = formatOrder(order);
  const sends: Promise<Response>[] = [];
  if (token && chat) {
    sends.push(
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text }),
      }),
    );
  }
  if (webhook) {
    sends.push(
      fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...order, text, receivedAt: new Date().toISOString() }),
      }),
    );
  }

  const results = await Promise.allSettled(sends);
  const delivered = results.some((r) => r.status === "fulfilled" && r.value.ok);
  return NextResponse.json({ ok: delivered }, { status: delivered ? 200 : 502 });
}
