export default async function handler(req, res) {
  // Pobieramy klucz z Vercela
  const apiKey = process.env.GEMINI_API_KEY;

  // ZMIENIONY KOMUNIKAT - jeśli zobaczysz to na telefonie, kod się zaktualizował!
  if (!apiKey) {
    return res.status(500).json({ error: 'HALO VERCEL! Tu nowy serwer. Nadal nie widzę klucza GEMINI_API_KEY w ustawieniach!' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Jesteś przewodnikiem po Beskidach. Turysta pyta: " + req.body.message }] }]
      })
    });

    const data = await response.json();
    return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });

  } catch (error) {
    return res.status(500).json({ error: 'Błąd połączenia z Google AI' });
  }
}
