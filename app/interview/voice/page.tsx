"use client";

import { useEffect, useRef, useState } from "react";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import SiteHeader from "@/components/SiteHeader";
import InterviewMenu from "@/components/interview/InterviewMenu";
import RequireInterviewAccess from "@/components/interview/RequireInterviewAccess";
import { trackEvent } from "@/lib/analytics-client";

type FinalReview = {
  score: number;
  categories: { label: string; value: number }[];
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
};

const COMPANIES = [
  "Google",
  "Amazon",
  "Meta",
  "Apple",
  "Microsoft",
  "Netflix",
  "NVIDIA",
  "Tesla",
  "OpenAI",
  "Anthropic",
  "DeepMind",
  "HuggingFace",
  "Cohere",
  "Perplexity",
  "Scale AI",
  "Runway",
  "ElevenLabs",
  "Stability AI",
  "Cisco",
  "Palo Alto Networks",
  "CrowdStrike",
  "Zscaler",
  "Cloudflare",
  "Okta",
  "HashiCorp",
  "Datadog",
  "Stripe",
  "PayPal",
  "Square",
  "Robinhood",
  "Coinbase",
  "SoFi",
  "JPMorgan",
  "Goldman Sachs",
  "Atlassian",
  "Salesforce",
  "Zoom",
  "Slack",
  "Twilio",
  "Shopify",
  "LinkedIn",
  "Deloitte",
  "Accenture",
  "McKinsey",
  "EY",
  "PwC",
  "KPMG",
  "BCG",
  "Riot Games",
  "Blizzard",
  "Valve",
  "Nintendo",
  "EA",
  "Ubisoft",
  "Uber",
  "Lyft",
  "Airbnb",
  "DoorDash",
  "Spotify",
];

type ChatMessage = { from: string; text: string };

export default function VoiceInterviewPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recording, setRecording] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeStatusMessage, setResumeStatusMessage] = useState("");
  const [finalReview, setFinalReview] = useState<FinalReview | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endInterviewNextRef = useRef(false);

  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => stopVoice();
  }, []);

  const speak = async (text: string) => {
    stopVoice();

    const res = await fetch("/api/tts", {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("TTS API error");
      return;
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    void audio.play();
  };

  const uploadResume = async () => {
    if (!resumeFile) return;

    setUploadingResume(true);
    setResumeStatusMessage("");
    setResumeText("");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const res = await fetch("/api/resume", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setResumeStatusMessage("Failed to analyze resume.");
      } else {
        setResumeStatusMessage("Resume analyzed.");
        setResumeText(data.text);
      }
    } catch {
      setResumeStatusMessage("Network error while uploading resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const sendAudio = async (audioBlob: Blob, endInterviewFlag: boolean) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("company", selectedCompany || "");
      formData.append("role", selectedRole || "");
      formData.append("resumeText", resumeText || "");
      formData.append("endInterview", endInterviewFlag ? "true" : "false");

      const res = await fetch("/api/voice", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((prev) => [
          ...prev,
          { from: "AI", text: "Sorry, something went wrong with the interview API." },
        ]);
        return;
      }

      if (!endInterviewFlag) {
        if (data.transcript) {
          setMessages((prev) => [
            ...prev,
            { from: "You", text: data.transcript as string },
            { from: "AI", text: data.reply as string },
          ]);
        } else {
          setMessages((prev) => [...prev, { from: "AI", text: data.reply as string }]);
        }

        await speak(data.reply as string);
        return;
      }

      if (data.ended && data.review) {
        void trackEvent("voice_interview_finished", {
          path: "/interview/voice",
          metadata: {
            company: selectedCompany || null,
            role: selectedRole || null,
            score: data.review.score ?? null,
          },
        });
        setFinalReview(data.review as FinalReview);
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error sending audio:", err);
      setMessages((prev) => [
        ...prev,
        { from: "AI", text: "Sorry, something went wrong processing your audio." },
      ]);
    }
  };

  const startRecording = async () => {
    stopVoice();
    void trackEvent("voice_interview_started", {
      path: "/interview/voice",
      metadata: {
        company: selectedCompany || null,
        role: selectedRole || null,
      },
    });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    endInterviewNextRef.current = false;
    setRecording(true);
    setFinalReview(null);

    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    mediaRecorder.onstop = async () => {
      setRecording(false);
      setAiThinking(true);

      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      await sendAudio(audioBlob, endInterviewNextRef.current);

      setAiThinking(false);
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    endInterviewNextRef.current = false;
    mediaRecorderRef.current.stop();
  };

  const handleEndInterview = () => {
    if (finalReview) return;

    if (recording && mediaRecorderRef.current) {
      endInterviewNextRef.current = true;
      mediaRecorderRef.current.stop();
    } else {
      endInterviewNextRef.current = true;
      void sendAudio(new Blob(), true);
    }
  };

  const disableTalk =
    aiThinking || uploadingResume || (!!resumeFile && !resumeText);

  return (
    <main className="theme-shell min-h-screen text-white">
      <SiteHeader currentSection="interview" />
      <InterviewMenu />
      <RequireInterviewAccess>
        <PageViewTracker page="interview_voice" path="/interview/voice" />
        <section className="mx-auto flex max-w-5xl justify-center px-4 pb-20">
          <div className="w-full">
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
                Voice Interview
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-300">
              Configure the role, upload a resume if you want project-aware
              questions, then run a live interview and end with a full review.
            </p>
          </div>

          <div className="theme-panel mb-10 rounded-3xl p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-200">
              Job Configuration
            </h2>

            <label className="mb-1 block text-sm text-gray-300">Target Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="theme-input w-full rounded-lg p-3"
            >
              <option value="">Choose a company...</option>
              {COMPANIES.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>

            <label className="mb-1 mt-4 block text-sm text-gray-300">Target Role</label>
            <input
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="theme-input w-full rounded-lg p-3"
              placeholder="Software Engineer, Cloud Engineer, Security Engineer, etc."
            />
          </div>

          <div className="theme-panel mb-12 rounded-3xl p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-200">Resume Input</h2>

            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="theme-input flex-grow rounded-lg p-2"
              />

              <button
                onClick={uploadResume}
                disabled={!resumeFile || uploadingResume}
                className="theme-button-primary rounded-lg px-6 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
              >
                {uploadingResume ? "Analyzing..." : "Upload & Analyze"}
              </button>
            </div>

            {resumeStatusMessage && (
              <p className="mt-3 text-sm text-slate-200">{resumeStatusMessage}</p>
            )}
          </div>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <button
              onClick={startRecording}
              disabled={disableTalk || recording}
              className={`rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg transition ${
                !recording && !disableTalk
                  ? "theme-button-primary"
                  : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
              }`}
            >
              {recording ? "Listening..." : "Start Talking"}
            </button>

            <button
              onClick={stopRecording}
              disabled={!recording}
              className={`rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg transition ${
                recording
                  ? "bg-rose-500 hover:bg-rose-400"
                  : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
              }`}
            >
              Stop and Send
            </button>

            <button
              onClick={handleEndInterview}
              disabled={disableTalk}
              className={`rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg transition ${
                !disableTalk
                  ? "theme-button-secondary"
                  : "cursor-not-allowed border border-white/10 bg-white/8 text-slate-500"
              }`}
            >
              End Interview and Review
            </button>

            <button
              onClick={stopVoice}
              className="theme-button-secondary rounded-full px-6 py-3 text-sm font-semibold shadow-md transition"
            >
              Stop AI Voice
            </button>

            {recording && (
              <div className="self-center">
                <div className="h-4 w-4 rounded-full bg-red-500 animate-ping" />
              </div>
            )}
          </div>

          <div className="theme-panel max-h-[420px] overflow-y-auto rounded-2xl p-6">
            {messages.length === 0 && !aiThinking && (
              <p className="text-sm text-slate-400">
                Start the conversation and the transcript will appear here.
              </p>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`mb-3 max-w-[85%] rounded-xl p-4 ${
                  message.from === "You"
                    ? "ml-auto bg-cyan-500/20 border border-cyan-300/20"
                    : "border border-white/10 bg-white/5"
                }`}
              >
                <p className="mb-1 text-xs font-mono opacity-60">{message.from}</p>
                <p className="whitespace-pre-wrap text-sm md:text-base">
                  {message.text}
                </p>
              </div>
            ))}

            {aiThinking && (
              <div className="flex gap-2 p-3">
                <div className="h-3 w-3 rounded-full bg-teal-400 animate-pulse" />
                <div className="h-3 w-3 rounded-full bg-teal-400 animate-pulse delay-150" />
                <div className="h-3 w-3 rounded-full bg-teal-400 animate-pulse delay-300" />
              </div>
            )}
          </div>

          {finalReview && (
            <div className="mt-14">
              <p className="mb-6 text-center text-4xl font-extrabold text-teal-300">
                Score: {finalReview.score}/10
              </p>

              <div className="theme-panel space-y-6 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-teal-200">
                  Final Interview Review
                </h2>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-100">
                    Category Scores
                  </h3>
                  <div className="space-y-1 text-[15px] leading-relaxed text-slate-300">
                    {finalReview.categories.map((category) => (
                      <p key={category.label}>
                        <span className="font-semibold text-slate-200">
                          {category.label}:
                        </span>{" "}
                        {category.value}/10
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-100">
                    Summary
                  </h3>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
                    {finalReview.summary}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-100">
                    Strengths
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-slate-300">
                    {finalReview.strengths.map((item, index) => (
                      <li key={`strength-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-100">
                    Areas to Improve
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-slate-300">
                    {finalReview.improvements.map((item, index) => (
                      <li key={`improvement-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-100">
                    Suggested Next Steps
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-slate-300">
                    {finalReview.nextSteps.map((item, index) => (
                      <li key={`next-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          </div>
        </section>
      </RequireInterviewAccess>
    </main>
  );
}
