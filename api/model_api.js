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

    // Read raw prediction from Hugging Face Space
    const prediction = await response.json();

    // Return the same structure your frontend expects
    res.status(200).json(prediction);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error connecting to Hugging Face Space API" });
  }
}
