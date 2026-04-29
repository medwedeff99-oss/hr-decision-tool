export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://medwedeff99-oss.github.io");
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
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: "You are an HR manager-support assistant inside an HR decision tool. Give practical manager guidance, not legal advice. Be concise, human, and risk-aware. Do not invent law. Do not ask for private medical details. Always remind the user to follow company policy and involve HR/legal for high-risk, protected, termination, safety, complaint, leave, or medical issues."
          },
          {
            role: "user",
            content: `Based on this decision-tree result, refine the guidance for a manager.

Scenario:
${JSON.stringify(scenario, null, 2)}

Return only:
1. Manager-ready summary
2. What to say
3. What not to say
4. Risk flags
5. Documentation notes

Keep it practical, clear, and not overly legal.`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed."
      });
    }

    const answer =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "No AI response returned.";

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: "Server error." });
  }
}
