const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function askGemini(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  // 🔥 DEBUG LOG (IMPORTANT)
  console.log("Gemini response:", data);

  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini API error");
  }

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "No response from Gemini."
  );
}
