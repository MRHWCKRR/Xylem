const MODEL = 'gemini-3.8-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini is not configured on the server.' });
  }

  try {
    const { messages, plantContext, sensorContext } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'A message history is required.' });
    }

    const context = `You are Xylem AI, a practical smart-farming assistant. Help the grower understand plant health and make sensible care decisions. Be concise, friendly and specific. Use the current Xylem readings when answering. Never pretend simulated readings are real hardware data. If a reading is uncertain, say so.\n\nCURRENT XYLEM DATA:\nPlants:\n${plantContext || 'Plant data is not currently visible.'}\nDashboard sensor summary:\n${sensorContext || 'No dashboard summary visible.'}`;

    const contents = [
      { role: 'user', parts: [{ text: context }] },
      ...messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(message.content || '') }]
      }))
    ];

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini API request failed.'
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!text) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Gemini route error:', error);
    return res.status(500).json({ error: 'Unable to reach Gemini right now.' });
  }
};
