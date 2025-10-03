export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    // Call Hugging Face Space
    const hfResponse = await fetch(
      "https://gabb11-sentiment-analyzer.hf.space/run/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [text] })
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return res.status(500).json({ error: "HF API error", details: errorText });
    }

    const hfResult = await hfResponse.json();

    // Extract from Hugging Face's format
    const data = hfResult.data?.[0];
    if (!data) {
      return res.status(500).json({ error: "Invalid response from Hugging Face", raw: hfResult });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
