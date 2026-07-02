export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Missing text" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 60,
        messages: [
          {
            role: "user",
            content: `Rewrite this messy brain-dump into a clear, short task title (max 8 words, no punctuation at the end, no quotes). Return ONLY the rewritten title, nothing else.\n\nInput: ${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "Anthropic API error", detail: errText });
    }

    const data = await response.json();
    const cleaned = data?.content?.[0]?.text?.trim();

    if (!cleaned) {
      return res.status(502).json({ error: "No result from AI" });
    }

    return res.status(200).json({ cleaned });
  } catch (err) {
    return res.status(500).json({ error: "Unexpected error", detail: String(err) });
  }
}
