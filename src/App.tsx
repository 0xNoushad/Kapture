import { useState, useCallback, useRef } from "react";
import VideoEditor from "./components/video-editor/VideoEditor";
import GradientBackground from "./components/GradientBackground";
import { ChevronRight } from "lucide-react";
import kaptureLogo from "./assets/kapture.svg";

export type MockupType = "device" | "browser" | null;

const mockupCards = [
  {
    type: null as MockupType,
    title: "No Mockup",
    description: "Clean video, no frame",
  },
  {
    type: "browser" as MockupType,
    title: "Browser",
    description: "Safari-style window frame",
  },
  {
    type: "device" as MockupType,
    title: "Device",
    description: "iPhone mockup frame",
  },
];

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
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
        setVideoUrl(URL.createObjectURL(file));
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
  }, [videoUrl]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setSelectedIndex(index);
    fileInputRef.current?.click();
  };

  if (videoUrl) {
    return (
      <VideoEditor
        videoUrl={videoUrl}
        fileName={videoFile?.name}
        onReset={handleReset}
        mockupType={selectedIndex !== null ? mockupCards[selectedIndex].type : null}
      />
    );
  }

  return (
    <>
      {/* Mobile blocker */}
      <div className="md:hidden min-h-screen flex flex-col items-center justify-center p-8 bg-[#0a0a0a] relative overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#34B27B]/5 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-[#1a1a1c] border border-white/10 flex items-center justify-center mb-6">
            <img src={kaptureLogo} alt="Kapture" className="w-12 h-12" />
          </div>
          
          <h1 className="text-2xl font-semibold text-white mb-1">Kapture</h1>
          <p className="text-[#34B27B] text-sm font-medium mb-6">Video Editor</p>
          
          <div className="w-16 h-1 rounded-full bg-white/10 mb-6" />
          
          <p className="text-white/50 text-sm text-center max-w-[260px] leading-relaxed">
            This app needs a bigger screen to work properly. Open it on your laptop or desktop.
          </p>
          
          <div className="mt-8 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/30 text-xs">Min width: 768px</p>
          </div>
        </div>
      </div>

      {/* Desktop content */}
      <div
        className="hidden md:flex min-h-screen flex-col items-center justify-center p-8 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
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

      {/* Side by Side Cards */}
      <div className="relative z-10 flex gap-4">
        {mockupCards.map((card, index) => (
          <div
            key={card.title}
            onClick={() => handleCardClick(index)}
            className={`w-[240px] rounded-2xl border bg-[#1a1a1c] p-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/20 ${
              isDragging ? "border-white/30 bg-white/5" : "border-white/10"
            }`}
          >
            {/* Card Preview */}
            <div className="h-[140px] w-full rounded-xl overflow-hidden bg-[#0f0f10] flex items-center justify-center border border-white/5">
              <img src={kaptureLogo} alt="Kapture" className="w-12 h-12 opacity-40" />
            </div>

            {/* Card Content */}
            <div className="flex items-center justify-between mt-3 px-1 pb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-white/90 font-medium truncate">{card.title}</h3>
                <p className="text-white/40 text-sm truncate">{card.description}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(index);
                }}
                className="flex items-center shrink-0 gap-0.5 pl-3 pr-2 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Go
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Footer */}
      <p className="mt-6 text-white/20 text-xs relative z-10">
        Drop or click to upload • MP4, WebM, MOV
      </p>
      </div>
    </>
  );
}
