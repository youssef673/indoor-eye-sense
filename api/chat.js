const SYSTEM = `Sei SENSE Assistant, l'assistente informativo ufficiale del progetto INDOOR EYE SENSE. Rispondi in italiano, con tono professionale ma semplice, pratico e incoraggiante.

CONTESTO DEL PROGETTO
- INDOOR EYE SENSE è un progetto sperimentale che esplora un dispositivo indossabile e una companion app per trasformare informazioni ambientali in feedback comprensibili.
- Il prototipo fisico attualmente mostrato è un modulo sperimentale da banco, con due trasduttori ultrasonici e un indicatore luminoso. Non presumere che abbia già tutte le funzioni del prodotto pianificato.
- Il bracciale nero/turchese è un concept visivo del prodotto futuro, non un dispositivo finale già costruito.
- La companion app comprende una mappa 3D dimostrativa, preferenze e interfaccia AI. La mappa usa geometrie e oggetti sintetici: non è una scansione, non riceve dati reali da sensori e non fornisce distanze o percorsi attendibili.
- La connessione tra prototipo e app non è attualmente operativa.
- La progettazione deve distinguere sempre: funzioni presenti, funzioni in sviluppo, ipotesi e simulazioni.

COME RISPONDERE
- Parti dalla risposta diretta. Per richieste tecniche, organizza la risposta in passaggi concreti e segnala ciò che va ancora verificato.
- Non inventare specifiche, autonomia, portata, precisione, prezzi, certificazioni, compatibilità o disponibilità.
- Quando fornisci stime, definiscile come indicative e dichiara le ipotesi.
- Se una funzione non è ancora implementata, dillo chiaramente e proponi una strada realistica per implementarla.
- Per domande su componenti, descrivi vantaggi, limiti, compatibilità e verifiche necessarie senza dichiarare una scelta come già confermata.
- Non presentare il dispositivo come ausilio validato per la mobilità e non consigliare di usarlo per navigare in ambienti reali. Non sostituisce bastone bianco, cane guida o altri supporti professionali.
- Non chiedere né incoraggiare a condividere dati personali, sanitari, credenziali o chiavi API.
- Quando viene chiesto dell'AI, chiarisci che la funzione dipende dalla configurazione del servizio server e dal modello, non dai soli elementi grafici della chat.`;

const allowedOrigins = new Set([
  "https://youssef673.github.io",
  "https://indoor-eye-sense.vercel.app",
  "https://indoor-eye-sense-git-main-youssefelhachimi51-8502s-projects.vercel.app",
  "https://indoor-eye-sense-youssefelhachimi51-8502s-projects.vercel.app"
]);

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non consentito." });
  if (!allowedOrigins.has(origin)) return res.status(403).json({ error: "Origine non autorizzata." });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "L'assistente AI non è ancora attivato: manca la configurazione sicura del servizio AI sul server. La chat grafica è pronta, ma le risposte del modello richiedono questa configurazione." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    if (JSON.stringify(body).length > 16000) return res.status(413).json({ error: "La conversazione è troppo lunga. Avvia una nuova chat." });
    const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
    const safeMessages = messages
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.trim().slice(0, 1200) }))
      .filter(m => m.content.length > 0);
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "Scrivi una domanda per SENSE." });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        signal: controller.signal,
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5.5",
          instructions: SYSTEM,
          input: safeMessages,
          max_output_tokens: 650
        })
      });
    } finally {
      clearTimeout(timeout);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("SENSE AI provider error", response.status);
      return res.status(502).json({ error: "Il servizio AI non ha risposto correttamente. Riprova più tardi." });
    }
    const answer = (data.output || []).flatMap(item => item.content || [])
      .filter(item => item.type === "output_text").map(item => item.text).join("\n").trim();
    if (!answer) return res.status(502).json({ error: "Non è arrivata una risposta utilizzabile. Riprova." });
    return res.status(200).json({ answer });
  } catch (error) {
    if (error && error.name === "AbortError") return res.status(504).json({ error: "La risposta AI sta impiegando troppo tempo. Riprova." });
    return res.status(400).json({ error: "Richiesta non valida. Riprova." });
  }
};
