exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed." })
    };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (typeof message !== "string" || !message.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please enter a message." })
      };
    }

    if (message.length > 4000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is too long." })
      };
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY is missing.");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "API key is not configured."
        })
      };
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
             content: `You are NovaGPT, a helpful and professional AI assistant.

Always format answers clearly and systematically.

Follow these rules:
1. Start with a clear heading when appropriate.
2. Use short paragraphs and meaningful subheadings.
3. Use numbered lists for steps and bullet points for key information.
4. Use **bold** for important terms.
5. Put programming code inside appropriate code blocks.
6. Use tables only when they improve clarity.
7. Keep simple answers concise and detailed answers well organized.
8. Never put the entire answer in one long paragraph.
9. Do not repeat the question unnecessarily.`
            },
            {
              role: "user",
              content: message.trim()
            }
          ],
          max_tokens: 1200,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq HTTP status:", response.status);
      console.error("Groq error details:", JSON.stringify(data));

      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Groq API request failed. Check the Netlify terminal."
        })
      };
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("Groq returned no message.");
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "The AI returned an empty response." })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error("Function error:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error." })
    };
  }
};