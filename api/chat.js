export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  const { prompt, payload, type } = req.body;
  
  // Pobieranie kluczy z Vercela
  const openaiKey = process.env.OPENAI_API_KEY;
  const stabilityKey = process.env.STABILITY_API_KEY; 

  try {
    // ==============================================================
    // 1. OBSŁUGA OBRAZKÓW (MALARZ AI -> STABILITY)
    // ==============================================================
    if (type === 'image') {
      if (!stabilityKey) return res.status(401).json({ error: 'Brak klucza STABILITY_API_KEY na serwerze.' });

      const imgPrompt = payload?.prompt || "Beautiful scenic mountain landscape";

      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${stabilityKey}` 
        },
        body: JSON.stringify({
          text_prompts: [{ text: imgPrompt, weight: 1 }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 20, 
          samples: 1
        })
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: `Błąd API Grafiki: ${data.message}` });

      return res.status(200).json({ predictions: [{ bytesBase64Encoded: data.artifacts[0].base64 }] });
    }

    // ==============================================================
    // 2. OBSŁUGA TEKSTU (ASYSTENT CZATU -> OPENAI)
    // ==============================================================
    if (prompt) {
      if (!openaiKey) return res.status(401).json({ error: 'Brak klucza OPENAI_API_KEY na serwerze.' });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({ 
            model: "gpt-4o-mini", // Szybki i najtańszy model OpenAI do chatu
            messages: [{ role: "user", content: prompt }]
          })
      });
      
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: `Błąd OpenAI: ${data.error?.message}` });
      
      return res.status(200).json({ 
        candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
      });
    }
    
    return res.status(400).json({ error: 'Nieprawidłowe żądanie.' });

  } catch (error) {
    console.error("Krytyczny błąd API:", error);
    return res.status(500).json({ error: `Wewnętrzny błąd serwera: ${error.message}` });
  }
}
