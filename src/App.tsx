import { useCallback, useEffect, useRef, useState } from "react";
import ctx from "./ctx";
import useCtx from "./Hooks/useCtx";
import { useDropzone } from "react-dropzone";
import { spring } from "motion/react";
import { motion } from "motion/react";
import CopyBtn from "./Components/CopyBtn/CopyBtn";
import Btn from "./Components/Btn/Btn";
import {
  Blend,
  Check,
  Contrast,
  Eclipse,
  FileDown,
  HardDriveDownload,
  Images,
  ImageUpscaleIcon,
  Palette,
  RotateCcw,
  Sun,
  SwatchBook,
} from "lucide-react";
import Toggle from "./Components/Toggle/Toggle";
import Slider from "./Components/Slider/Slider";

function App() {
  const c = useCtx(ctx);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canRef = useRef<HTMLCanvasElement | null>(null);

  const prevOpts = useRef(c.ctx.opts);
  const prevWidth = useRef(c.ctx.width);

  useEffect(() => {
    if (!image) return;
    const optsChanged =
      JSON.stringify(prevOpts.current) !== JSON.stringify(c.ctx.opts);
    const widthChanged = prevWidth.current !== c.ctx.width;
    if (optsChanged || widthChanged) {
      procImg(image);
      prevOpts.current = c.ctx.opts;
      prevWidth.current = c.ctx.width;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.ctx.width, c.ctx.opts, image, c.ctx.compare]);

  useEffect(() => {
    if (!image) return;
    procImg(image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.ctx.compare]);

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

    if (c.ctx.compare) {
      ctx.filter = ``;
    } else {
      ctx.filter = `grayscale(${c.ctx.opts.grayscale ? "100" : "0"}%) contrast(${c.ctx.opts.contrast}%) brightness(${c.ctx.opts.brightness}%) hue-rotate(${c.ctx.opts.hue}deg) saturate(${c.ctx.opts.saturate}%)`;
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
    echoGen(pixels);
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
    const scriptContent = `${c.ctx.echocmd}\n`;
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
    <div className="font-[Poppins] gap-3 w-screen h-screen flex bg-[#090E13] sm:justify-center sm:items-center items-start justify-center sm:p-10 pt-30">
      <img
        onClick={() => window.location.reload()}
        draggable={false}
        src="/pixecho.svg"
        style={{ transition: "all " + spring(0.3, 0.4) }}
        className="w-50 absolute top-5 cursor-pointer sm:left-10 sm:top-10 active:scale-95 hover:scale-105"
      />
      <div className="flex flex-col sm:flex-row gap-20 justify-start">
        <div className="flex flex-col gap-3 justify-center items-center">
          <motion.div layout transition={{ duration: 0.2 }}>
            <div
              {...getRootProps()}
              style={{
                scale: isDragActive ? 1.1 : 1,
                transition: "all " + spring(0.3, 0.5),
                border: image
                  ? "solid 3px rgba(255,255,255,0.2)"
                  : "dashed 3px rgba(255,255,255, 0.1)",
                borderRadius: image ? "0" : "1rem",
              }}
              className="w-fit  p-2 active:p-1 text-white/80 h-fit rounded-2xl"
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
                className="sm:h-100 w-80 sm:w-auto"
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
          <>
            <div className="w-full h-px -my-10 bg-white/10 sm:hidden"></div>
            <motion.div
              initial={{ translateX: -100, opacity: 0 }}
              animate={{ translateX: 0, opacity: 1 }}
              exit={{ translateX: -100, opacity: 0 }}
              className="sm:w-80 w-full h-fit sm:mb-0 mb-10 text-center flex gap-5 flex-col-reverse sm:flex-col"
            >
              <div className="gap-10 flex flex-col bg-white/1 p-5 border border-white/10 rounded-2xl shadow-[0_0_0px_1px_rgba(255,255,255,0.2),0_0_0px_3px_rgba(0,0,0,1),inset_0_1px_0px_0.2px_rgba(255,255,255,0.1),0_1px_1px_1px_rgba(0,0,0,0.7)]">
                <Slider
                  valText={
                    c.ctx.width > 100
                      ? c.ctx.width + " (oversize)"
                      : String(c.ctx.width)
                  }
                  val={c.ctx.width}
                  onChange={(e) => {
                    c.setCtx("width", Math.round(Number(e.target.value)));
                  }}
                  title={"Size"}
                  min={1}
                  max={150}
                  icon={() => <ImageUpscaleIcon />}
                />
                <Toggle
                  opt1={() => (
                    <>
                      <Palette />
                      <p>Color</p>
                    </>
                  )}
                  opt2={() => (
                    <>
                      <Eclipse />
                      <p>B/W</p>
                    </>
                  )}
                  onToggle={(bool: boolean) => {
                    c.setCtx("opts.grayscale", bool);
                  }}
                />
                <Slider
                  valText={String(c.ctx.opts.brightness)}
                  val={c.ctx.opts.brightness}
                  onChange={(e) => {
                    c.setCtx(
                      "opts.brightness",
                      Math.round(Number(e.target.value)),
                    );
                  }}
                  title={"Brightness"}
                  min={0}
                  max={200}
                  icon={() => <Sun />}
                />
                <Slider
                  valText={String(c.ctx.opts.contrast)}
                  val={c.ctx.opts.contrast}
                  onChange={(e) => {
                    c.setCtx(
                      "opts.contrast",
                      Math.round(Number(e.target.value)),
                    );
                  }}
                  title={"contrast"}
                  min={0}
                  max={200}
                  icon={() => <Contrast />}
                />
                <Slider
                  valText={String(c.ctx.opts.hue)}
                  val={c.ctx.opts.hue}
                  onChange={(e) => {
                    c.setCtx("opts.hue", Math.round(Number(e.target.value)));
                  }}
                  title={"Hue"}
                  min={-360}
                  max={360}
                  icon={() => <Blend />}
                />
                <Slider
                  valText={String(c.ctx.opts.saturate)}
                  val={c.ctx.opts.saturate}
                  onChange={(e) => {
                    c.setCtx(
                      "opts.saturate",
                      Math.round(Number(e.target.value)),
                    );
                  }}
                  title={"Saturation"}
                  min={0}
                  max={200}
                  icon={() => <SwatchBook />}
                />
              </div>
              <div className="gap-4 flex flex-row-reverse sm:flex-row">
                <button
                  onMouseDown={() => {
                    c.setCtx("compare", true);
                  }}
                  onMouseUp={() => {
                    c.setCtx("compare", false);
                  }}
                  className="flex justify-center items-center gap-2 w-full font-[Poppins] text-white/80 bg-[#101010] active:opacity-80 text-xl px-4 py-2 rounded-2xl shadow-[0_0_0px_1px_rgba(255,255,255,0.2),0_0_0px_1.5px_rgba(0,0,0,1),inset_0_1px_2px_0.2px_rgba(255,255,255,0.1),0_1px_1px_1px_rgba(0,0,0,0.7)]"
                >
                  <Images />
                  Compare
                </button>
                <button
                  onClick={() => {
                    c.setCtx("pixelData", []);
                    setImage(null);
                    c.setCtx("width", 64);
                    c.setCtx("echocmd", "");
                    c.setCtx("opts", {
                      grayscale: false,
                      brightness: 100,
                      contrast: 100,
                      hue: 0,
                      saturate: 100,
                    });
                  }}
                  className="flex justify-center items-center gap-2 w-full font-[Poppins] text-white/80 bg-[#101010] active:opacity-80 text-xl px-4 py-2 rounded-2xl shadow-[0_0_0px_1px_rgba(255,255,255,0.2),0_0_0px_1.5px_rgba(0,0,0,1),inset_0_1px_2px_0.2px_rgba(255,255,255,0.1),0_1px_1px_1px_rgba(0,0,0,0.7)]"
                >
                  <RotateCcw />
                  Restart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
