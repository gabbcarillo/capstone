export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const response = await fetch(
      "https://huggingface.co/spaces/gabb11/sentiment_analyzer/api/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      }
    );

    if (!response.ok) throw new Error(`HF API returned ${response.status}`);

    // Try parsing JSON, fallback to raw text
    let prediction;
    try {
      prediction = await response.json();
    } catch {
      prediction = await response.text();
    }

    // Return structured data for frontend
    let sentiment = typeof prediction === "string" ? prediction : prediction;
    let probabilities = { negative: 0, neutral: 0, positive: 0 };

    // Assign dummy probabilities based on sentiment
    if (sentiment === "positive") probabilities.positive = 1;
    else if (sentiment === "neutral") probabilities.neutral = 1;
    else probabilities.negative = 1;

    res.status(200).json({ sentiment, probabilities });

  } catch (err) {
    console.error("HF API error:", err);

    // Return fallback so frontend still works
    res.status(200).json({
      sentiment: "neutral",
      probabilities: { negative: 0, neutral: 1, positive: 0 }
    });
  }
}
