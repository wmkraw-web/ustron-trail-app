export default async function handler(req, res) {
  // 1. ODBLOKOWANIE DLA TELEFONÓW (CORS Headers)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Pozwala każdemu urządzeniu na dostęp
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. Obsługa wstępnego zapytania z telefonu (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Właściwy kod AI
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Brak klucza w ustawieniach Vercel.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
