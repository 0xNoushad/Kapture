import { useState, useCallback } from "react";
import VideoEditor from "./components/video-editor/VideoEditor";
import GradientBackground from "./components/GradientBackground";
import { Upload } from "lucide-react";
import kaptureLogo from "./assets/kapture.svg";

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("video/")) {
        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
  }, [videoUrl]);

  if (videoUrl) {
    return (
      <VideoEditor
        videoUrl={videoUrl}
        fileName={videoFile?.name}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <GradientBackground
        gradientOrigin="top-middle"
        colors={[
          { color: "rgba(17,17,17,1)", stop: "0%" },
          { color: "rgba(25,25,30,1)", stop: "40%" },
          { color: "rgba(30,25,35,1)", stop: "70%" },
          { color: "rgba(20,20,25,1)", stop: "100%" },
        ]}
        noiseIntensity={1.2}
      />
      {/* Beta badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">
          Beta
        </span>
      </div>

      {/* Header */}
      <div className="mb-10 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={kaptureLogo} alt="Kapture" className="w-8 h-8" />
          <h1 className="text-xl font-medium text-white/90">Kapture</h1>
        </div>
        <p className="text-white/40 text-sm">Beautiful video editing in your browser</p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full max-w-sm rounded-2xl border border-white/10 p-10
          flex flex-col items-center justify-center gap-4 transition-all duration-200
          ${
            isDragging
              ? "border-white/30 bg-white/5 scale-[1.02]"
              : "bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15"
          }
        `}
      >
        <div
          className={`
          w-12 h-12 rounded-full flex items-center justify-center transition-colors
          ${isDragging ? "bg-white text-black" : "bg-white/10 text-white/50"}
        `}
        >
          <Upload className="w-5 h-5" />
        </div>

        <div className="text-center">
          <p className="text-white/80 text-sm font-medium mb-0.5">
            Drop video here
          </p>
          <p className="text-white/30 text-xs">or click to browse</p>
        </div>

        <label className="cursor-pointer mt-2">
          <span className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-medium rounded-lg transition-colors inline-block border border-white/10">
            Select Video
          </span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Footer */}
      <p className="mt-6 text-white/20 text-xs">MP4, WebM, MOV</p>
    </div>
  );
}
