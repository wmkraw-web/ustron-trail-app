export default async function handler(req, res) {
  // Odrzucamy wszystkie żądania, które nie są poprawnym formularzem
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  // Pobieramy nasz BEZPIECZNY klucz ze środowiska Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Błąd serwera: Brak klucza API w Vercel.' });
  }

  const { message } = req.body;

  try {
    const systemPrompt = "Jesteś profesjonalnym i zabawnym wirtualnym przewodnikiem turystycznym po Beskidach. Pomagasz turystom planować trasy, polecasz lokalne jedzenie i atrakcje. Używaj emotikon. Pytanie turysty: ";
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + message }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    
    // Zwracamy czystą odpowiedź do naszej aplikacji na telefonie
    return res.status(200).json({ reply: aiText });

  } catch (error) {
    return res.status(500).json({ error: 'Błąd połączenia z modelem AI' });
  }
}