const API = "https://api.elevenlabs.io/v1";

function requireKey(env) {
  if (!env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY não configurada no Cloudflare.");
  return env.ELEVENLABS_API_KEY;
}

export async function clone({ file, name }, env) {
  const key = requireKey(env);
  const form = new FormData();
  form.append("name", String(name || "Minha Voz Makavoice").slice(0, 100));
  form.append("description", "Voz criada pelo Makavoice");
  form.append("files[]", file, file.name || "voice-sample.webm");

  const response = await fetch(`${API}/voices/add`, {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });
  const body = await response.text();
  if (!response.ok) throw Object.assign(new Error("ElevenLabs recusou a criação da voz."), { status: response.status, details: body });
  return JSON.parse(body);
}

export async function synthesize({ voiceId, text }, env) {
  const key = requireKey(env);
  const response = await fetch(`${API}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text: String(text).slice(0, 10000), model_id: "eleven_multilingual_v2", language_code: "pt" }),
  });
  if (!response.ok) throw Object.assign(new Error("Falha na síntese de voz."), { status: response.status, details: await response.text() });
  return response;
}
