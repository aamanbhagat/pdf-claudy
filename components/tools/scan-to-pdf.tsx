"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, Download, RotateCcw, CheckCircle2, Loader2, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import { downloadBlob } from "@/lib/pdf/download";

type Phase = "camera" | "working" | "done";

export function ScanToPdfTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [shots, setShots] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("camera");
  const [err, setErr] = useState("");
  const [result, setResult] = useState<Blob | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setErr("We couldn't access a camera. Check permissions, or use JPG to PDF to upload photos instead."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    setShots((s) => [...s, canvas.toDataURL("image/jpeg", 0.92)]);
  };

  const reset = () => {
    setShots([]);
    setResult(null);
    setPhase("camera");
  };

  async function build() {
    setPhase("working");
    const images = await Promise.all(
      shots.map(async (url) => ({ bytes: await (await fetch(url)).arrayBuffer(), type: "image/jpeg" })),
    );
    const bytes = await pdf().imagesToPdf(images, { size: "a4", orientation: "auto", margin: 16 });
    setResult(pdfBlob(bytes));
    setPhase("done");
  }

  if (phase === "done" && result) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E5F5EE] text-[#18A06A]">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink">Your scan is ready</h2>
        <div className="mx-auto mt-6 max-w-md">
          <Button variant="accent" size="lg" className="w-full" onClick={() => downloadBlob(result, "scan.pdf")}>
            <Download className="h-4 w-4" /> Download scan.pdf
          </Button>
        </div>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> Scan again
        </button>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-paper-deep text-graphite">
          <CameraOff className="h-6 w-6" />
        </span>
        <p className="mx-auto mt-4 max-w-sm text-sm text-graphite">{err}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-[#16151d]">
        <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
        {phase === "working" && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-white">
            <span className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Building PDF…</span>
          </div>
        )}
        <button
          onClick={capture}
          disabled={phase === "working"}
          aria-label="Capture page"
          className="absolute bottom-4 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-white text-[#16151d] shadow-lift ring-4 ring-white/40 transition-transform hover:scale-105"
        >
          <Camera className="h-6 w-6" />
        </button>
      </div>

      {shots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {shots.map((url, i) => (
            <div key={i} className="relative h-20 w-16 overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Capture ${i + 1}`} className="h-full w-full object-cover" />
              <button onClick={() => setShots((s) => s.filter((_, idx) => idx !== i))} aria-label="Remove" className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-[#16151d]/70 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-graphite">{shots.length} page{shots.length === 1 ? "" : "s"} captured</span>
        <Button variant="accent" size="lg" onClick={build} disabled={!shots.length || phase === "working"}>
          Create PDF
        </Button>
      </div>
    </div>
  );
}
