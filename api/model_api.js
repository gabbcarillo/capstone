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

    if (!response.ok) {
      throw new Error(`HF API returned ${response.status}`);
    }

    const prediction = await response.json();

    // Forward the exact response from Hugging Face Space
    res.status(200).json(prediction);

  } catch (err) {
    console.error("HF API error:", err);
    res.status(500).json({ error: "Error connecting to Hugging Face Space API" });
  }
}
