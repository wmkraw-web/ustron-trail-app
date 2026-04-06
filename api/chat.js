export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Brak klucza w ustawieniach Vercel.' });
  }

  try {
    // TUTAJ JEST ZMIANA: używamy modelu gemini-1.5-flash-latest
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Jesteś przewodnikiem po Beskidach. Turysta pyta: " + req.body.message }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: `Błąd Google: ${data.error.message}` });
    }

    return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });

  } catch (error) {
    return res.status(500).json({ error: `Awaria serwera: ${error.message}` });
  }
}
