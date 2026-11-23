const SYSTEM = `Sei SENSE Assistant, assistente informativo del progetto INDOOR EYE SENSE. Rispondi in italiano, con tono chiaro e concreto. Spiega che il dispositivo mostrato come prototipo è un modulo sperimentale da banco con due trasduttori ultrasonici e indicatore luminoso; il prodotto finale desiderato è un bracciale indossabile collegato a una companion app. Distingui sempre fatti, ipotesi e simulazioni. La mappa 3D attuale è una demo geometrica sintetica e non riceve dati da sensori reali. Il progetto è sperimentale, non è un ausilio validato, non sostituisce bastone bianco, cane guida o strategie di mobilità e non deve essere usato per navigare in ambienti reali. Non inventare prezzo, autonomia, precisione, portata, certificazioni o disponibilità. Per domande tecniche, descrivi i limiti e suggerisci verifiche controllate. Non chiedere dati personali o sanitari.`;

const allowedOrigins = new Set([
  "https://youssef673.github.io",
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
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "L'assistente AI non è ancora configurato. Il collegamento sicuro al modello deve essere completato dal responsabile del progetto." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
    const safeMessages = messages
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 1600) }));
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "Scrivi una domanda per SENSE." });
    }
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        instructions: SYSTEM,
        input: safeMessages,
        max_output_tokens: 450
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("SENSE AI provider error", response.status);
      return res.status(502).json({ error: "Il servizio AI non ha risposto correttamente. Riprova più tardi." });
    }
    const answer = (data.output || []).flatMap(item => item.content || [])
      .filter(item => item.type === "output_text").map(item => item.text).join("\n").trim();
    if (!answer) return res.status(502).json({ error: "Non è arrivata una risposta utilizzabile. Riprova." });
    return res.status(200).json({ answer });
  } catch {
    return res.status(400).json({ error: "Richiesta non valida. Riprova." });
  }
}
