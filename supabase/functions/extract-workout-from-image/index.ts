import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_VERSION = "2023-06-01";

const EXTRACT_TOOL = {
  name: "extract_workout",
  description: "Extract a single logged workout (exercise, weight in kg, reps) from an image.",
  input_schema: {
    type: "object",
    properties: {
      exercise: {
        type: "string",
        description: "The name of the exercise, e.g. 'Bench Press'.",
      },
      weight: {
        type: "number",
        description: "The weight lifted, in kilograms. Convert from lb if needed.",
      },
      reps: {
        type: "number",
        description: "The number of reps performed.",
      },
    },
    required: ["exercise", "weight", "reps"],
  },
};

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mediaType: match[1], base64: match[2] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'image' (base64 data URL) in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsedImage = parseDataUrl(image);
    if (!parsedImage) {
      return new Response(JSON.stringify({ error: "Image must be a base64 data URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "AI provider is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 512,
        system:
          "You read photos of workout logs, whiteboards, gym notebooks, or fitness app screenshots and extract " +
          "a single structured workout entry. Always call the extract_workout tool with your best reading of the " +
          "exercise name, weight in kilograms (convert from pounds by multiplying by 0.4536 if the image uses lb), " +
          "and reps. If multiple sets are shown, use the heaviest set.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: parsedImage.mediaType,
                  data: parsedImage.base64,
                },
              },
              { type: "text", text: "Extract the workout data from this image." },
            ],
          },
        ],
        tools: [EXTRACT_TOOL],
        tool_choice: { type: "tool", name: "extract_workout" },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolUse = data.content?.find((block) => block.type === "tool_use");

    if (!toolUse?.input) {
      return new Response(JSON.stringify({ error: "Could not extract workout data from image" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = toolUse.input;

    return new Response(
      JSON.stringify({
        exercise: String(parsed.exercise ?? "").slice(0, 100),
        weight: Number(parsed.weight),
        reps: Math.round(Number(parsed.reps)),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("extract-workout-from-image error:", error);
    return new Response(JSON.stringify({ error: "Unexpected error processing image" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
