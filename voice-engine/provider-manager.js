import * as elevenlabs from "./providers/elevenlabs.js";

const providers = { elevenlabs };

export function getProvider(name = "elevenlabs") {
  const provider = providers[name];
  if (!provider) throw new Error(`Provedor de voz não suportado: ${name}`);
  return { name, ...provider };
}

export function listProviders(env) {
  return Object.keys(providers).map(name => ({ name, configured: name === "elevenlabs" ? Boolean(env.ELEVENLABS_API_KEY) : false }));
}
