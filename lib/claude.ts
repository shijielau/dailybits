import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateSummary(topics: string[]): Promise<string> {
  const userContent = `Research and summarize the latest news and developments for each topic below. Use web search to find current information (ideally from the last 24–48 hours).

For each topic write a clear 3–5 sentence summary covering the most important recent developments.

Topics:
${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Format each section as:
## <Topic Name>
<summary paragraph>`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let messages: any[] = [{ role: "user", content: userContent }];

  const MAX_CONTINUATIONS = 10;

  for (let i = 0; i < MAX_CONTINUATIONS; i++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      tools: [{ type: "web_search_20260209", name: "web_search" }],
      messages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find(
        (b): b is Anthropic.TextBlock => b.type === "text"
      );
      return textBlock?.text ?? "No summary could be generated.";
    }

    if (response.stop_reason === "pause_turn") {
      // Re-send to let the server-side tool loop continue
      messages = [
        { role: "user", content: userContent },
        { role: "assistant", content: response.content },
      ];
      continue;
    }

    // Unexpected stop — return whatever text we have
    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    if (textBlock?.text) return textBlock.text;
    break;
  }

  throw new Error("Summary generation did not complete within iteration limit");
}
