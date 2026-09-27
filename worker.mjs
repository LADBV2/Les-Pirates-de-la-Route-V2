// Relais serveur pour un salon Discord. Aucun secret ne doit être ajouté à ce fichier.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
    const cors = allowed.includes(origin) ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin'
    } : {};
    const reply = (status, body) => Response.json(body, {status, headers: {...cors, 'Cache-Control': 'no-store'}});
    if (url.pathname !== '/contact') return reply(404, {error: 'Introuvable.'});
    if (!origin || !allowed.includes(origin)) return reply(403, {error: 'Origine non autorisée.'});
    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});
    if (request.method !== 'POST') return reply(405, {error: 'Méthode non autorisée.'});
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415, {error: 'Format non accepté.'});
    let body;
    try {
      const reader = request.body?.getReader();
      if (!reader) return reply(400, {error: 'Message manquant.'});
      let size = 0; const chunks = [];
      while (true) {
        const {done, value} = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > 24576) { await reader.cancel(); return reply(413, {error: 'Message trop long.'}); }
        chunks.push(value);
      }
      const joined = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
      body = JSON.parse(new TextDecoder().decode(joined));
    } catch { return reply(400, {error: 'Données invalides.'}); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400, {error: 'Données invalides.'});
    const text = key => typeof body[key] === 'string' ? body[key].trim() : '';
    if (text('website')) return reply(400, {error: 'Envoi refusé.'});
    const name = text('name'), discord = text('discord'), email = text('email'), subject = text('subject'), message = text('message');
    if (!name || name.length > 100 || !discord || discord.length > 100 || message.length < 10 || message.length > 4000 || !['Candidature','Question','Partenariat','Convoi','Autre'].includes(subject) || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return reply(400, {error: 'Vérifie les champs du formulaire.'});
    let webhook;
    try {
      webhook = new URL(env.DISCORD_WEBHOOK_URL);
      if (webhook.protocol !== 'https:' || webhook.hostname !== 'discord.com' || !/^\/api\/(v\d+\/)?webhooks\/\d+\/[A-Za-z0-9._-]+$/.test(webhook.pathname)) throw new Error();
      webhook.searchParams.set('wait', 'true');
    } catch { return reply(503, {error: 'Le formulaire n’est pas encore relié à Discord. Contacte-nous sur le serveur.'}); }
    try {
      const result = await fetch(webhook.toString(), {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          username: 'Les Pirates de la Route', allowed_mentions: {parse: []},
          embeds: [{title: 'Nouveau message — ' + subject, description: message, color: 0xA63C47,
            fields: [{name: 'Nom / Pseudo', value: name, inline: true}, {name: 'Pseudo Discord', value: discord, inline: true}, ...(email ? [{name: 'Email', value: email}] : [])],
            footer: {text: 'Formulaire du site • identité déclarée par le visiteur'}, timestamp: new Date().toISOString()}]
        })
      });
      if (result.status === 429) return reply(429, {error: 'Trop de messages. Patiente un instant avant de réessayer.'});
      if (!result.ok) return reply(502, {error: 'Discord n’a pas accepté le message. Contacte-nous directement sur le serveur.'});
      return reply(200, {ok: true});
    } catch { return reply(502, {error: 'Discord ne répond pas. Vérifie auprès de l’équipage avant de réessayer.'}); }
  }
};
