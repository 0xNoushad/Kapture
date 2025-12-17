import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import type { AnnotationRegion } from "../../types";

interface ImageSettingsProps {
  annotation: AnnotationRegion;
  onContentChange: (content: string) => void;
}

export function ImageSettings({ annotation, onContentChange }: ImageSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPG, PNG, GIF, or WebP image file.',
      });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onContentChange(dataUrl);
        toast.success('Image uploaded successfully!');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to upload image', {
        description: 'There was an error reading the file.',
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept=".jpg,.jpeg,.png,.gif,.webp,image/*" className="hidden" />
      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2 bg-white/5 text-slate-200 border-white/10 hover:bg-[#34B27B] hover:text-white hover:border-[#34B27B] transition-all py-8">
        <Upload className="w-5 h-5" />
        Upload Image
      </Button>
      {annotation.content && annotation.content.startsWith('data:image') && (
        <div className="rounded-lg border border-white/10 overflow-hidden bg-white/5 p-2">
          <img src={annotation.content} alt="Uploaded annotation" className="w-full h-auto rounded-md" />
        </div>
      )}
      <p className="text-xs text-slate-500 text-center leading-relaxed">Supported formats: JPG, PNG, GIF, WebP</p>
    </div>
  );
}
