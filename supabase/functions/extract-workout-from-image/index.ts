import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACT_TOOL = {
  type: "function",
  function: {
    name: "extract_workout",
    description: "Extract a single logged workout (exercise, weight in kg, reps) from an image.",
    parameters: {
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
      additionalProperties: false,
    },
  },
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You read photos of workout logs, whiteboards, gym notebooks, or fitness app screenshots and extract " +
              "a single structured workout entry. Always call the extract_workout tool with your best reading of the " +
              "exercise name, weight in kilograms (convert from pounds by multiplying by 0.4536 if the image uses lb), " +
              "and reps. If multiple sets are shown, use the heaviest set.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the workout data from this image." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        tools: [EXTRACT_TOOL],
        tool_choice: { type: "function", function: { name: "extract_workout" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Could not extract workout data from image" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);

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
