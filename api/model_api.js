// api/model_api.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Hugging Face Space endpoint
    const HF_URL = "https://gabb11-sentiment-analyzer.hf.space/run/predict";

    const hfResponse = await fetch(HF_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [text]
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF API error:", errorText);
      return res.status(500).json({ error: "Hugging Face API failed", details: errorText });
    }

    const hfResult = await hfResponse.json();
    console.log("HF raw result:", hfResult);

    // HF Spaces with Gradio usually return { data: [ { sentiment, confidence, probabilities } ] }
    const data = hfResult?.data?.[0];

    if (!data || !data.sentiment) {
      return res.status(500).json({ error: "Invalid response format", raw: hfResult });
    }

    // Send clean JSON back to frontend
    return res.status(200).json({
      sentiment: data.sentiment,
      confidence: data.confidence,
      probabilities: data.probabilities,
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
