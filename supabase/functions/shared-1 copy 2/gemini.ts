export type GeminiJsonRequest = {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
};

function cleanModelOutput(raw: string): string {
  return raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();
}

export async function generateGeminiJson<T>(req: GeminiJsonRequest): Promise<T> {
  const model = req.model || "gemini-2.0-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(req.apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: req.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: req.userPrompt }],
        },
      ],
      generationConfig: {
        temperature: req.temperature ?? 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
    .join("\n");

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const cleaned = cleanModelOutput(text);
  return JSON.parse(cleaned) as T;
}
