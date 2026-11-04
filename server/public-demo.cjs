"use strict";

const MAX_BODY_BYTES = 2048;
const AUDIO_BASE = "/assets/marketing/demo-audio/";
const lesson = Object.freeze({
  title: "في المقهى: اطلب قهوة",
  subtitle: "Al bar — ordinare un caffè",
  explanation: "في المقهى، يمكنك طلب ما تريد بعبارة مهذبة. تقول per favore بمعنى «من فضلك». ويستخدم الباريستا Dica pure لدعوتك إلى الطلب بصيغة مهذبة.",
  dialogue: Object.freeze([
    { italian: "Buongiorno! Dica pure.", arabic: "صباح الخير! تفضّل، ماذا تطلب؟", audio: AUDIO_BASE + "line-1.mp3" },
    { italian: "Buongiorno. Un caffè e un cornetto, per favore.", arabic: "صباح الخير. قهوة وكرواسون، من فضلك.", audio: AUDIO_BASE + "line-2.mp3" },
    { italian: "Subito. Sono due euro e cinquanta.", arabic: "حالًا. الحساب يوروان وخمسون سنتًا.", audio: AUDIO_BASE + "line-3.mp3" },
    { italian: "Ecco. Grazie!", arabic: "تفضّل. شكرًا!", audio: AUDIO_BASE + "line-4.mp3" },
    { italian: "Prego, buona giornata!", arabic: "عفوًا، أتمنّى لك يومًا سعيدًا!", audio: AUDIO_BASE + "line-5.mp3" }
  ]),
  exerciseCount: 3,
  exercises: Object.freeze([
    {
      id: "bar-order-meaning",
      type: "choice",
      prompt: "ماذا يقصد الباريستا بعبارة Dica pure؟",
      options: Object.freeze([
        { id: "invito-a-ordinare", text: "تفضّل، ماذا تطلب؟", lang: "ar" },
        { id: "saluto-finale", text: "أتمنّى لك يومًا سعيدًا!", lang: "ar" },
        { id: "prezzo", text: "الحساب يوروان وخمسون سنتًا.", lang: "ar" }
      ])
    },
    {
      id: "bar-polite-response",
      type: "choice",
      prompt: "قال لك الباريستا: Buongiorno! Dica pure. كيف تطلب قهوة وكرواسون بأدب؟",
      options: Object.freeze([
        { id: "ordine-gentile", text: "Buongiorno. Un caffè e un cornetto, per favore.", lang: "it" },
        { id: "conto", text: "Subito. Sono due euro e cinquanta.", lang: "it" },
        { id: "ringraziamento", text: "Ecco. Grazie!", lang: "it" }
      ])
    },
    {
      id: "bar-build-order",
      type: "order",
      prompt: "رتّب الكلمات لتكوّن طلب الزبون المهذّب.",
      tokens: Object.freeze([
        { id: "t-favore", text: "favore", lang: "it" },
        { id: "t-un-2", text: "un", lang: "it" },
        { id: "t-cornetto", text: "cornetto", lang: "it" },
        { id: "t-per", text: "per", lang: "it" },
        { id: "t-caffe", text: "caffè", lang: "it" },
        { id: "t-e", text: "e", lang: "it" },
        { id: "t-un-1", text: "Un", lang: "it" }
      ])
    }
  ])
});

const answerRules = Object.freeze({
  "bar-order-meaning": {
    accepts: answer => answer === "invito-a-ordinare",
    correct: "أحسنت! Dica pure دعوة مهذبة لبدء الطلب.",
    incorrect: "فكّر في العبارة التي يستخدمها الباريستا لدعوتك إلى بدء الطلب."
  },
  "bar-polite-response": {
    accepts: answer => answer === "ordine-gentile",
    correct: "ممتاز! أجبت الباريستا وأضفت per favore لتكون مهذبًا.",
    incorrect: "اختر عبارة الزبون التي تذكر ما يريد طلبه."
  },
  "bar-build-order": {
    accepts: answer => Array.isArray(answer) && answer.length === 7 && answer.every((id, i) => id === ["t-un-1", "t-caffe", "t-e", "t-un-2", "t-cornetto", "t-per", "t-favore"][i]),
    correct: "رائع! Un caffè e un cornetto, per favore طلب واضح ومهذب.",
    incorrect: "ابدأ بـ Un caffè، ثم أضف e un cornetto، وأنهِ العبارة بـ per favore."
  }
});

function json(res, status, value) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(value));
}

function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === "string" || Buffer.isBuffer(req.body)) return Promise.resolve(Buffer.from(req.body));
    try { return Promise.resolve(Buffer.from(JSON.stringify(req.body))); } catch { return Promise.resolve(Buffer.alloc(0)); }
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    let tooLarge = false;
    req.on("data", chunk => {
      length += chunk.length;
      if (length > MAX_BODY_BYTES) { tooLarge = true; chunks.length = 0; return; }
      if (!tooLarge) chunks.push(chunk);
    });
    req.on("end", () => tooLarge ? reject(Object.assign(new Error("too_large"), { status: 413 })) : resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function createHandler() {
  return async (req, res) => {
    for (const [name, value] of Object.entries({
      "Cache-Control": "no-store, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow"
    })) res.setHeader(name, value);

    let url;
    try { url = new URL(req.url || "/", "https://demo.invalid"); }
    catch { return json(res, 400, { error: "invalid_request" }); }
    if (url.pathname !== "/api/demo" || [...url.searchParams].length !== 0) return json(res, 404, { error: "not_found" });
    if (req.method === "GET") return json(res, 200, lesson);
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return json(res, 405, { error: "method_not_allowed" });
    }
    if (Number(req.headers && req.headers["content-length"]) > MAX_BODY_BYTES) return json(res, 413, { error: "request_too_large" });
    const contentType = String(req.headers && req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
    if (contentType !== "application/json") return json(res, 415, { error: "unsupported_media_type" });

    let body;
    try {
      const raw = await readBody(req);
      if (raw.length > MAX_BODY_BYTES) return json(res, 413, { error: "request_too_large" });
      body = JSON.parse(raw.toString("utf8"));
    } catch (error) {
      return json(res, error.status === 413 ? 413 : 400, { error: error.status === 413 ? "request_too_large" : "invalid_json" });
    }
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).sort().join(",") !== "answer,exerciseId" || typeof body.exerciseId !== "string") return json(res, 400, { error: "invalid_answer" });
    const rule = answerRules[body.exerciseId];
    if (!rule) return json(res, 404, { error: "unknown_exercise" });
    const answer = body.answer;
    if (!(typeof answer === "string" && answer.length <= 80) && !(Array.isArray(answer) && answer.length <= 12 && answer.every(x => typeof x === "string" && x.length <= 40))) return json(res, 400, { error: "invalid_answer" });
    return json(res, 200, { correct: rule.accepts(answer), feedback: rule.accepts(answer) ? rule.correct : rule.incorrect });
  };
}

module.exports = { createHandler };