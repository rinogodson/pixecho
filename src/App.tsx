import { useCallback, useEffect, useRef, useState } from "react";
import ctx from "./ctx";
import useCtx from "./Hooks/useCtx";
import { useDropzone } from "react-dropzone";
import { spring } from "motion/react";
import { motion } from "motion/react";
import CopyBtn from "./Components/CopyBtn/CopyBtn";
import Btn from "./Components/Btn/Btn";
import {
  Check,
  FileDown,
  HardDriveDownload,
  ImageUpscaleIcon,
} from "lucide-react";
import Toggle from "./Components/Toggle/Toggle";

function App() {
  const c = useCtx(ctx);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (image) {
      procImg(image);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.ctx.width]);

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reader.onload = (event: any) => {
        const img = new window.Image();
        img.onload = () => {
          setImage(img);
          procImg(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const procImg = (img: HTMLImageElement) => {
    if (!canRef.current) return;
    const canva = canRef.current;
    const ctx = canva.getContext("2d");

    const aspectRatio = img.height / img.width;
    const targetWidth = c.ctx?.width || img.width;
    const targetHeight = Math.round(targetWidth * aspectRatio);

    canva.width = targetWidth;
    canva.height = targetHeight;

    if (!ctx) {
      console.error("The ctx is null");
      return;
    }
    ctx.filter = "grayscale(100%)";
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
    echoGen(pixels);
    console.log(pixels);
  };

  const echoGen = (pixels: { r: number; g: number; b: number }[][]) => {
    if (pixels.length === 0) return;
    const lines = [];

    for (let g = 0; g < pixels.length; g += 2) {
      let line = "";
      for (let x = 0; x < pixels[g].length; x++) {
        const topPixel = pixels[g][x];
        const bottomPixel =
          g + 1 < pixels.length ? pixels[g + 1][x] : { r: 0, g: 0, b: 0 };

        const fg = `\\x1b[38;2;${topPixel.r};${topPixel.g};${topPixel.b}m`;
        const bg = `\\x1b[48;2;${bottomPixel.r};${bottomPixel.g};${bottomPixel.b}m`;

        line += `${fg}${bg}▀`;
      }
      lines.push(line);
    }

    const reset = "\\x1b[0m";
    const echoLines = lines.map((line) => `echo "${line}${reset}"`).join("\n");
    c.setCtx("echocmd", echoLines);
  };

  const downloadScript = () => {
    const scriptContent = `#!/bin/bash\n\n${c.ctx.echocmd}\n`;
    const blob = new Blob([scriptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pixecho.sh";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="gap-3 w-screen h-screen flex bg-[#090E13] justify-center items-center p-10">
      <img
        draggable={false}
        src="/pixecho.svg"
        className="w-50 absolute top-10 left-10"
      />
      <div className="flex gap-20 justify-start">
        <div className="flex flex-col gap-3 justify-center items-center">
          <motion.div layout transition={{ duration: 0.2 }}>
            <div
              {...getRootProps()}
              style={{
                scale: isDragActive ? 1.1 : 1,
                transition: "all " + spring(0.3, 0.5),
                border: image
                  ? "solid 3px rgba(255,255,255,0.2)"
                  : "dashed 3px",
                borderColor: "rgba(255,255,255,0.2)",
                borderRadius: image ? "0" : "1rem",
              }}
              className="w-fit p-2 active:p-1 text-white/80 h-fit rounded-2xl"
            >
              {!image && <input accept="image/*" {...getInputProps()} />}
              <div
                style={{
                  background: !isDragActive
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.07)",
                  transition: "all 300ms",
                  display: image ? "none" : "flex",
                }}
                className="w-90 flex-col gap-4 h-80 justify-center items-center border active:rounded-sm overflow-hidden border-white/10 rounded-lg"
              >
                {isDragActive ? (
                  <>
                    <FileDown size={100} className="text-[#d0d0d0]" />
                    <p>Drop the image here ...</p>
                  </>
                ) : (
                  <>
                    <FileDown size={50} className="text-[#d0d0d0]" />
                    <p className="text-center">
                      Drop the image here,
                      <br /> or click to upload
                    </p>
                  </>
                )}
              </div>
              <canvas
                ref={canRef}
                className="h-100"
                style={{
                  aspectRatio: `${image?.width} / ${image?.height}`,
                  display: image ? "block" : "none",
                  imageRendering: "pixelated",
                }}
              />
            </div>
          </motion.div>
          {c.ctx.echocmd && (
            <motion.div
              initial={{ translateY: -100, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              exit={{ translateY: -100, opacity: 0 }}
              className="flex gap-5 flex-col mt-10"
            >
              <Btn
                text="Download Script"
                fn={downloadScript}
                initComp={HardDriveDownload}
                exitComp={Check}
              />
              <CopyBtn text={c.ctx.echocmd} />
            </motion.div>
          )}
        </div>
        {c.ctx.echocmd && (
          <motion.div
            initial={{ translateX: -100, opacity: 0 }}
            animate={{ translateX: 0, opacity: 1 }}
            exit={{ translateX: -100, opacity: 0 }}
            className="w-80 gap-7 flex flex-col h-fit bg-white/1 p-5 border border-white/10 rounded-xl shadow-[0_0_0px_1px_rgba(255,255,255,0.2),0_0_0px_3px_rgba(0,0,0,1),inset_0_1px_0px_0.2px_rgba(255,255,255,0.1),0_1px_1px_1px_rgba(0,0,0,0.7)]"
          >
            <div className="flex flex-col text-white gap-3">
              <div className="flex gap-3">
                <ImageUpscaleIcon />
                <p>Size</p>
                <p className="text-white/40">
                  {c.ctx.width > 100
                    ? c.ctx.width + " (oversize)"
                    : c.ctx.width}
                </p>
              </div>
              <label className="slider">
                <input
                  type="range"
                  min={1}
                  max={150}
                  value={c.ctx.width}
                  onChange={(e) => {
                    c.setCtx("width", Math.round(Number(e.target.value)));
                  }}
                  className="level"
                />
              </label>
            </div>
            <Toggle />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
