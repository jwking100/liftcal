import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { fileToDataUrl } from "@/lib/image";

interface ScannedWorkout {
  exercise: string;
  weight: number;
  reps: number;
}

interface PhotoScannerProps {
  onScanned: (result: ScannedWorkout) => void;
}

export function PhotoScanner({ onScanned }: PhotoScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setScanning(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);

      const { data, error } = await supabase.functions.invoke("extract-workout-from-image", {
        body: { image: dataUrl },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      onScanned(data as ScannedWorkout);
      toast.success("Workout details extracted — review and save below.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that image");
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Camera className="h-4 w-4 text-primary" />
          Photo Scanner
        </div>
        <p className="text-sm text-muted-foreground">
          Snap or upload a photo of a logbook, whiteboard, or app screenshot and we'll fill in the form for you.
        </p>

        {preview && (
          <img src={preview} alt="Uploaded workout" className="max-h-40 rounded-md border border-border/60 object-contain" />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={scanning}>
          {scanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning…
            </>
          ) : (
            "Upload photo"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
