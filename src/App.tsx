import { useCallback, useRef, useState } from "react";
import ctx from "./ctx";
import useCtx from "./Hooks/useCtx";
import { useDropzone } from "react-dropzone";
import { spring } from "motion/react";

function App() {
  const c = useCtx(ctx);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef(null);

  const onDrop = useCallback((files: Blob[]) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new window.Image();
      img.onload = () => {
        setImage(img);
        procImg(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (text: string) => {
    window.navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Echo command copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy to clipboard");
      });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const procImg = (img: HTMLImageElement) => {
    if (!canRef.current) return;
    const canva = canRef.current;
    const ctx = canva.getContext("2d");

    const aspectRatio = img.height / img.width;
    const targetWidth = c.ctx.width;
    const targetHeight = Math.round(targetWidth * aspectRatio);

    canva.width = targetHeight;
    canva.height = targetWidth;

    if (!ctx) {
      console.error("The ctx is null");
      return;
    }
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);

    const pixels = [];
    for (let y = 0; y < targetHeight; y++) {
      const row = [];
      for (let x = 0; x < targetWidth; x++) {
        const idx = (y * targetWidth + x) * 4;
        const r = imgData.data[idx];
        const g = imgData.data[idx + 1];
        const b = imgData.data[idx + 2];
        row.push({ r, g, b });
      }
      pixels.push(row);
    }

    c.setCtx("pixelData", pixels);
    console.log(pixels);
  };

  return (
    <div className="gap-3 w-screen h-screen flex-col bg-[#090E13] flex justify-center items-center p-10">
      <img
        draggable={false}
        src="/pixecho.svg"
        className="w-50 absolute top-10"
      />
      <div
        {...getRootProps()}
        style={{
          scale: isDragActive ? 1.1 : 1,
          transition: "all " + spring(0.3, 0.5),
        }}
        className="w-100 p-2 active:p-3 text-white/80 h-80 mt-10 border-dashed border-3 border-white/20 rounded-2xl"
      >
        <input accept="image/*" {...getInputProps()} />
        <div
          style={{
            background: !isDragActive
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.07)",
            transition: "all 300ms",
          }}
          className="flex justify-center items-center border active:rounded-sm overflow-hidden border-white/10 w-full h-full rounded-lg"
        >
          {isDragActive ? (
            <p>Drop the image here ...</p>
          ) : (
            <p>Drop the image here, or click to upload</p>
          )}
        </div>
        <canvas ref={canRef} className="hidden" />
      </div>
    </div>
  );
}

export default App;
