const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

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

async function cloneVoice(request, env) {
  if (!env.ELEVENLABS_API_KEY) {
    return json({ error: "ELEVENLABS_API_KEY não configurada no Cloudflare." }, 500);
  }

  const incoming = await request.formData();
  const file = incoming.get("file");
  const name = String(incoming.get("name") || "Minha Voz Makavoice");

  if (!(file instanceof File)) {
    return json({ error: "Envie um arquivo de áudio no campo file." }, 400);
  }

  if (file.size === 0) {
    return json({ error: "O arquivo de áudio está vazio." }, 400);
  }

  const form = new FormData();
  form.append("name", name.slice(0, 100));
  form.append("description", "Voz criada pelo Makavoice");
  form.append("files[]", file, file.name || "voice-sample.webm");

  const response = await fetch(`${ELEVENLABS_API}/voices/add`, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY },
    body: form,
  });

  const body = await response.text();
  if (!response.ok) {
    return json({ error: "ElevenLabs recusou a criação da voz.", details: body }, response.status);
  }

  let result;
  try {
    result = JSON.parse(body);
  } catch {
    return json({ error: "Resposta inválida do provedor de voz.", details: body }, 502);
  }

  return json({
    success: true,
    voice_id: result.voice_id,
    requires_verification: result.requires_verification ?? false,
  });
}

async function synthesize(request, env) {
  if (!env.ELEVENLABS_API_KEY) {
    return json({ error: "ELEVENLABS_API_KEY não configurada no Cloudflare." }, 500);
  }

  const { voice_id, text } = await request.json();
  if (!voice_id || !text || !String(text).trim()) {
    return json({ error: "voice_id e text são obrigatórios." }, 400);
  }

  const response = await fetch(
    `${ELEVENLABS_API}/text-to-speech/${encodeURIComponent(voice_id)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: String(text).slice(0, 10000),
        model_id: "eleven_multilingual_v2",
        language_code: "pt",
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    return json({ error: "Falha na síntese de voz.", details }, response.status);
  }

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Cache-Control", "no-store");
  Object.entries(corsHeaders()).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: 200, headers });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/voice/clone" && request.method === "POST") {
        return await cloneVoice(request, env);
      }

      if (url.pathname === "/api/voice/synthesize" && request.method === "POST") {
        return await synthesize(request, env);
      }

      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      return new Response("Makavoice Worker online", { status: 200 });
    } catch (error) {
      return json({ error: "Erro interno no Makavoice.", details: String(error) }, 500);
    }
  },
};
