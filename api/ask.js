export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { scenario } = req.body || {};

  if (!scenario) {
    return res.status(400).json({ error: "Missing scenario." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `You are an HR advisor helping a manager.

Scenario:
${scenario}

Provide:
1. What the manager should say (clear script)
2. Risk check (legal / HR flags)
3. Documentation notes (what to write)
`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI error",
        details: data,
      });
    }

    // ✅ FIXED PARSING (this is the key)
    const output = data.output_text || "No response generated.";

    return res.status(200).json({ result: output });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}
