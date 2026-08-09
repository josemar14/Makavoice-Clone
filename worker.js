import { getProvider, listProviders } from "./voice-engine/provider-manager.js";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() },
  });
}

function resolveProvider(url, requestedProvider) {
  const provider = String(requestedProvider || url.searchParams.get("provider") || "elevenlabs").trim().toLowerCase();
  if (!provider) return "elevenlabs";
  return provider;
}

async function cloneVoice(request, env, providerName) {
  const incoming = await request.formData();
  const file = incoming.get("file");
  const name = String(incoming.get("name") || "Minha Voz Makavoice");
  if (!(file instanceof File)) return json({ error: "Envie um arquivo de áudio no campo file." }, 400);
  if (file.size === 0) return json({ error: "O arquivo de áudio está vazio." }, 400);
  if (file.size > 25 * 1024 * 1024) return json({ error: "Arquivo muito grande. Limite: 25 MB." }, 413);

  try {
    const provider = getProvider(providerName);
    const result = await provider.clone({ file, name }, env);
    return json({
      success: true,
      provider: provider.name,
      voice_id: result.voice_id,
      requires_verification: result.requires_verification ?? false,
    });
  } catch (error) {
    return json({
      error: error.message || "Falha na clonagem.",
      details: error.details || "",
      provider: providerName,
    }, error.status || 500);
  }
}

async function synthesize(request, env, providerName) {
  let input;
  try { input = await request.json(); } catch { return json({ error: "JSON inválido." }, 400); }
  const voiceId = String(input.voice_id || "").trim();
  const text = String(input.text || "").trim();
  if (!voiceId || !text) return json({ error: "voice_id e text são obrigatórios." }, 400);
  if (text.length > 10000) return json({ error: "Texto muito longo. Limite: 10.000 caracteres." }, 413);

  try {
    const provider = getProvider(providerName);
    const response = await provider.synthesize({ voiceId, text }, env);
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "audio/mpeg");
    headers.set("Cache-Control", "no-store");
    Object.entries(corsHeaders()).forEach(([key, value]) => headers.set(key, value));
    return new Response(response.body, { status: 200, headers });
  } catch (error) {
    return json({
      error: error.message || "Falha na síntese.",
      details: error.details || "",
      provider: providerName,
    }, error.status || 500);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/health") {
        return json({ ok: true, service: "makavoice-voice-engine", providers: listProviders(env) });
      }
      if (url.pathname === "/api/voice/clone" && request.method === "POST") {
        const provider = resolveProvider(url);
        return cloneVoice(request, env, provider);
      }
      if (url.pathname === "/api/voice/synthesize" && request.method === "POST") {
        let input = {};
        try { input = await request.clone().json(); } catch {}
        const provider = resolveProvider(url, input.provider);
        return synthesize(request, env, provider);
      }
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response("Makavoice Worker online", { status: 200 });
    } catch (error) {
      return json({ error: "Erro interno no Makavoice.", details: String(error) }, 500);
    }
  },
};
