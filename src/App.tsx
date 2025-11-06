import { useRef } from "react";
import ctx from "./ctx";
import useCtx from "./Hooks/useCtx";
import { useDropzone } from "react-dropzone";
import { motion, spring } from "motion/react";

function App() {
  const c = useCtx(ctx);
  const canRef = useRef(null);
  const fileInputRef = useRef(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({});

  return (
    <div className="gap-3 w-screen h-screen flex-col bg-[#090E13] flex justify-start items-center p-10">
      <img src="/pixecho.svg" className="w-50" />
      <div
        {...getRootProps()}
        style={{
          scale: isDragActive ? 1.1 : 1,
          transition: "all " + spring(0.3, 0.5),
        }}
        className="w-100 p-2 text-white/80 h-80 mt-10 border-dashed border-3 border-white/20 rounded-2xl"
      >
        <input {...getInputProps()} />
        <div
          style={{
            background: !isDragActive
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.1)",
            transition: "all 300ms",
          }}
          className="flex justify-center items-center border overflow-hidden border-white/10 w-full h-full rounded-lg"
        >
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drop the file here, or click to select files</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
