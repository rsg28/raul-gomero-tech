const SYSTEM = `You are F.R.I.D.A.Y. (Field Response, Interactive Diagnostic Aide, Yours) — a senior bench tech sitting next to a student on Fault Bench, a simulated CompTIA-style service bay.

You are a language model. Read the student's question and the live page dump as language. Do not keyword-match.

You can see the ticket, tip, machine, labor, the open tool (Event Viewer, Task Manager, terminal, SMART, and so on), and the theory/fix buttons in the order they appear. If a theory is pinned, you see that. If a fix already missed, you see that.

You also receive the full chat for THIS ticket only. Remember what they already asked. Do not mix it with any other work order.

HARD RULE — NO ANSWERS WHILE THE TICKET IS OPEN:
- Never name the root cause.
- Never say which theory is correct, which fix to click, or which button number to pick.
- Never rank the options ("this one is most likely", "not 1 or 2, so 3", "I would apply X").
- Never confirm or deny a guess ("yes that's it", "wrong theory", "you got it") until the ticket is closed.
- If they ask for the answer, the correct option, what to click, or "is it X?": refuse the verdict in one short sentence, then point at one thing already on the screen and ask what they notice.
- You MAY explain what a readout MEANS (what Event 1014 is, what 169.254 means, what a SMART raw count is) without concluding the case.
- You MAY explain what a listed theory or fix *would do* if they chose it, without saying they should.
- Coach the next measurement, not the conclusion. Ask questions. Point at a gauge, a line, a ping result.
- Do not invent Event lines, theories, or fixes that are not in the dump.

WHEN THE TICKET IS CLOSED (debrief on screen):
- Then you may discuss the written cause, herring, and method.

Other:
- No real-system exploit steps, payloads, or bypasses. This is a simulation.
- Stay short: usually 2–6 sentences. English.`;

function extractText(data, raw) {
  if (typeof data === 'string' && data.trim()) return data.trim();
  const choice = data?.choices?.[0]?.message?.content;
  if (typeof choice === 'string' && choice.trim()) return choice.trim();
  if (typeof data?.message?.content === 'string' && data.message.content.trim()) {
    return data.message.content.trim();
  }
  const gem = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n');
  if (gem && gem.trim()) return gem.trim();
  if (typeof data?.text === 'string' && data.text.trim()) return data.text.trim();
  if (typeof raw === 'string' && raw.trim() && !raw.trim().startsWith('{')) return raw.trim();
  return '';
}

async function postJson(url, body, headers = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 28000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }
    if (!res.ok) {
      const msg = data?.error?.message || data?.error || data?.message || raw.slice(0, 180) || `HTTP ${res.status}`;
      const err = new Error(typeof msg === 'string' ? msg : `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const text = extractText(data, raw);
    if (!text) throw new Error('Empty model reply');
    return text;
  } finally {
    clearTimeout(t);
  }
}

function openaiBody(model, messages) {
  return { model, messages, temperature: 0.4, max_tokens: 420 };
}

async function callModel(messages) {
  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    return postJson(
      'https://api.groq.com/openai/v1/chat/completions',
      openaiBody(process.env.FRIDAY_MODEL || 'llama-3.1-8b-instant', messages),
      { Authorization: `Bearer ${groq}` },
    );
  }

  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    return postJson(
      `${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`,
      openaiBody(process.env.FRIDAY_MODEL || 'gpt-4o-mini', messages),
      { Authorization: `Bearer ${openai}` },
    );
  }

  const gemini = process.env.GEMINI_API_KEY;
  if (gemini) {
    const model = process.env.FRIDAY_MODEL || 'gemini-2.0-flash';
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const sys = messages.find((m) => m.role === 'system')?.content || SYSTEM;
    const data = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gemini}`,
      { system_instruction: { parts: [{ text: sys }] }, contents, generationConfig: { temperature: 0.4, maxOutputTokens: 420 } },
    );
    if (typeof data === 'string') return data;
  }

  const customKey = process.env.FRIDAY_API_KEY;
  const customBase = process.env.FRIDAY_BASE_URL;
  if (customKey && customBase) {
    return postJson(
      `${customBase.replace(/\/$/, '')}/chat/completions`,
      openaiBody(process.env.FRIDAY_MODEL || 'llama-3.1-8b-instant', messages),
      { Authorization: `Bearer ${customKey}` },
    );
  }

  const pollen = process.env.POLLINATIONS_KEY;
  if (pollen) {
    return postJson(
      'https://gen.pollinations.ai/v1/chat/completions',
      openaiBody(process.env.FRIDAY_MODEL || 'openai/gpt-5.4-nano', messages),
      { Authorization: `Bearer ${pollen}` },
    );
  }

  if (process.env.OLLAMA_HOST) {
    return postJson(`${process.env.OLLAMA_HOST.replace(/\/$/, '')}/api/chat`, {
      model: process.env.OLLAMA_MODEL || 'llama3.2',
      messages,
      stream: false,
    });
  }

  return postJson('https://text.pollinations.ai/', {
    messages,
    model: process.env.FRIDAY_MODEL || 'openai',
  });
}

function formatOptions(ctx) {
  const theories = Array.isArray(ctx.theories) ? ctx.theories : [];
  const fixes = Array.isArray(ctx.fixes) ? ctx.fixes : [];
  const theoryBlock = theories.length
    ? [
        'THEORY OPTIONS ON THIS PAGE (same order as the buttons)',
        ...theories.map((t) => `${t.n}. ${t.label}${t.pinned ? '  [PINNED]' : ''}`),
      ].join('\n')
    : 'No theory list attached.';
  const fixBlock = fixes.length
    ? [
        'FIX / ANSWER OPTIONS ON THIS PAGE (same order as the buttons)',
        ...fixes.map((f) => {
          const extra = [f.blurb, f.cost != null ? `${f.cost} min` : '', f.missed ? 'ALREADY TRIED — miss' : '']
            .filter(Boolean)
            .join(' · ');
          return `${f.n}. ${f.label}${extra ? `  (${extra})` : ''}`;
        }),
      ].join('\n')
    : 'No fix list attached.';
  return `${theoryBlock}\n\n${fixBlock}`;
}

function buildMessages(body) {
  const ctx = body?.context || {};
  const page = String(ctx.page || ctx.screen || '').slice(0, 14000);
  const watching = ctx.toolTitle || (ctx.toolId ? ctx.toolId : 'whole page');
  const used = Array.isArray(ctx.tests) && ctx.tests.length ? ctx.tests.join(', ') : 'none yet';
  const sheet = ctx.drawer ? `Sheet open: ${ctx.drawer}` : 'Theory/fix sheet is closed, but the option lists below are still the ones on this ticket.';
  const system = [
    SYSTEM,
    '',
    `Watching now: ${watching}`,
    `Probes already run: ${used}`,
    ctx.theory ? `Pinned theory (student): ${ctx.theory}` : 'No theory pinned yet.',
    sheet,
    ctx.toast ? `Toast on page: ${ctx.toast}` : '',
    ctx.resolved
      ? 'TICKET CLOSED. Debrief is on the page. You may discuss the written cause.'
      : [
          'TICKET OPEN — SPOILER LOCK ON.',
          'Do not name the cause. Do not pick a theory. Do not pick a fix. Do not confirm a guess.',
          'If they ask for the answer, refuse and send them back to one line on the screen.',
        ].join(' '),
    '',
    formatOptions(ctx),
    '',
    page ? `FULL VISIBLE PAGE\n${page}` : 'No page dump attached.',
  ]
    .filter(Boolean)
    .join('\n');

  const prior = Array.isArray(body?.messages) ? body.messages : [];
  const trimmed = prior
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-80)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  return [{ role: 'system', content: system }, ...trimmed];
}

export async function runFriday(body) {
  const last = Array.isArray(body?.messages) ? body.messages[body.messages.length - 1] : null;
  if (!last || last.role !== 'user' || !String(last.content || '').trim()) {
    return { status: 400, json: { error: 'Ask F.R.I.D.A.Y. a question.' } };
  }
  try {
    const reply = await callModel(buildMessages(body));
    return { status: 200, json: { reply } };
  } catch (err) {
    const msg = err?.message || 'F.R.I.D.A.Y. could not reach a model.';
    const status = err?.status === 402 || /rate|limit|402/i.test(msg) ? 429 : 502;
    return { status, json: { error: msg } };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'POST only' }));
    return;
  }
  const { status, json } = await runFriday(req.body || {});
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(json));
}
