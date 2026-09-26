export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});
    if (request.method !== 'POST') return json({error: 'Méthode non autorisée'}, 405, cors);
    if (!env.DISCORD_WEBHOOK_URL) return json({error: 'Webhook Discord non configuré'}, 500, cors);

    let body;
    try { body = await request.json(); }
    catch { return json({error: 'Requête invalide'}, 400, cors); }

    const clean = (v, max) => String(v || '').trim().slice(0, max);
    const name = clean(body.name, 80);
    const discord = clean(body.discord, 80);
    const email = clean(body.email, 160);
    const subject = clean(body.subject, 100);
    const message = clean(body.message, 1800);

    if (!name || !discord || !subject || !message) {
      return json({error: 'Champs obligatoires manquants'}, 400, cors);
    }

    const payload = {
      username: 'Site — Les Pirates de la Route',
      embeds: [{
        title: '🏴‍☠️ Nouveau message depuis le site',
        color: 13874520,
        fields: [
          {name: 'Nom / pseudo', value: name, inline: true},
          {name: 'Pseudo Discord', value: discord, inline: true},
          {name: 'Email', value: email || 'Non renseignée', inline: false},
          {name: 'Sujet', value: subject, inline: false},
          {name: 'Message', value: message, inline: false}
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const r = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    if (!r.ok) return json({error: 'Discord a refusé le message'}, 502, cors);
    return json({ok: true}, 200, cors);
  }
};

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {...cors, 'Content-Type': 'application/json; charset=utf-8'}
  });
}
