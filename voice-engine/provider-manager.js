import * as elevenlabs from "./providers/elevenlabs.js";
import * as cartesia from "./providers/cartesia.js";

const providers = {
  elevenlabs,
  cartesia,
};

export function getProvider(name = "elevenlabs") {
  const provider = providers[name];

  if (!provider) {
    throw new Error(`Provedor de voz não suportado: ${name}`);
  }

  return { name, ...provider };
}

export function listProviders(env) {
  return Object.keys(providers).map(name => ({
    name,
    configured:
      name === "elevenlabs"
        ? Boolean(env.ELEVENLABS_API_KEY)
        : name === "cartesia"
          ? Boolean(env.CARTESIA_API_KEY)
          : false,
  }));
}
