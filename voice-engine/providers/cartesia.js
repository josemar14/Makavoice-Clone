const API = "https://api.cartesia.ai";

function requireKey(env) {
  if (!env.CARTESIA_API_KEY) {
    throw new Error("CARTESIA_API_KEY não configurada no Cloudflare.");
  }

  return env.CARTESIA_API_KEY;
}

export async function clone({ file, name }, env) {
  const key = requireKey(env);

  const form = new FormData();
  form.append("clip", file, file.name || "voice-sample.webm");
  form.append(
    "name",
    String(name || "Minha Voz Makavoice").slice(0, 100)
  );

  const response = await fetch(`${API}/voices/clone`, {
    method: "POST",
    headers: {
      "X-API-Key": key,
      "Cartesia-Version": "2026-03-01",
    },
    body: form,
  });

  const body = await response.text();

  if (!response.ok) {
    throw Object.assign(
      new Error("Cartesia recusou a criação da voz."),
      {
        status: response.status,
        details: body,
      }
    );
  }

  return JSON.parse(body);
}

export async function synthesize({ voiceId, text }, env) {
  const key = requireKey(env);

  const response = await fetch(`${API}/tts/bytes`, {
    method: "POST",
    headers: {
      "X-API-Key": key,
      "Cartesia-Version": "2026-03-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: "sonic-3",
      transcript: String(text).slice(0, 10000),
      voice: {
        mode: "id",
        id: voiceId,
      },
      output_format: {
        container: "mp3",
        encoding: "mp3",
        sample_rate: 44100,
      },
      language: "pt",
    }),
  });

  if (!response.ok) {
    throw Object.assign(
      new Error("Cartesia falhou na síntese de voz."),
      {
        status: response.status,
        details: await response.text(),
      }
    );
  }

  return response;
}
