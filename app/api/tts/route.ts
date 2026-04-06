import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

    if (!elevenLabsApiKey) {
      return new NextResponse("Missing ELEVENLABS_API_KEY", { status: 500 });
    }

    if (!text) {
      return new NextResponse("Missing text input for TTS.", { status: 400 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.3,
            similarity_boost: 0.8,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(`TTS API Error: ${errorText}`, { status: 500 });
    }

    const audioArrayBuffer = await response.arrayBuffer();

    return new NextResponse(audioArrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("TTS Server Error:", err);
    return new NextResponse("Internal Server Error during TTS processing.", {
      status: 500,
    });
  }
}
