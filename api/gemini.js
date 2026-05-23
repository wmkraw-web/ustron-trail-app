export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  const { payload, type, prompt } = req.body;
  const openaiKey = process.env.OPENAI_API_KEY;
  const stabilityKey = process.env.STABILITY_API_KEY; 

  try {
    if (prompt) {
      if (!openaiKey) return res.status(401).json({ error: '🚨 BŁĄD VERCEL: Brak klucza OPENAI_API_KEY.' });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({ 
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
          })
      });
      const data = await response.json();
      return res.status(200).json({ candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] });
    }

    if (type === 'image') {
      if (!stabilityKey || !openaiKey) return res.status(401).json({ error: '🚨 BŁĄD VERCEL: Brak kluczy API.' });

      // Odbieramy "czysty" opis od użytkownika
      const rawPrompt = payload?.prompt || "Edukacyjna ilustracja";

      // 1. Tłumaczenie przez OpenAI (zabezpieczone try-catch)
      let englishPrompt = rawPrompt;
      try {
          const translateRes = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
              body: JSON.stringify({
                  model: "gpt-4o-mini",
                  messages: [
                      { role: "system", content: "You translate texts to English accurately. Return ONLY the English translation, without any conversational filler." },
                      { role: "user", content: rawPrompt }
                  ],
                  temperature: 0.1
              })
          });
          if (translateRes.ok) {
              const tData = await translateRes.json();
              englishPrompt = tData.choices[0].message.content.trim();
          }
      } catch (e) { console.warn("Wyjątek podczas tłumaczenia:", e); }

      // 2. Sklejanie ostatecznego promptu dla Stability (Dodajemy tło gór dopiero PO angielsku)
      const finalPrompt = `A beautiful artistic masterpiece painting of: ${englishPrompt}. Scenic mountain landscape in the Beskidy mountains, vibrant colors, nature.`;

      const stabilityBody = {
          text_prompts: [
            { text: finalPrompt, weight: 1 }, 
            { text: "text, watermark, writing", weight: -1 } 
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 20, 
          samples: 1
      };

      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${stabilityKey}` },
        body: JSON.stringify(stabilityBody)
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: `Błąd Stability AI: ${data.message || "Odmowa autoryzacji"}` });

      return res.status(200).json({
        predictions: [{ bytesBase64Encoded: data.artifacts[0].base64 }]
      });
    }
  } catch (error) {
    return res.status(500).json({ error: `Wewnętrzny błąd serwera: ${error.message}` });
  }
}
