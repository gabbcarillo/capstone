export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const response = await fetch(
      "https://gabb11-sentiment-analyzer.hf.space/run/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [text] })  // 👈 HF Spaces expect {data:[...]}
      }
    );

    const result = await response.json();

    // Hugging Face returns {"data": [ ... ]}, so unwrap it
    res.status(200).json(result.data ? result.data[0] : result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error connecting to Hugging Face Space API" });
  }
}
