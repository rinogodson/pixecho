import { Check, Copy } from "lucide-react";
import { spring } from "motion";
import { useEffect, useState } from "react";

function CopyBtn({ text }: { text: string }) {
  const copyToClipboard = (text: string) => {
    window.navigator.clipboard.writeText(text).catch(() => {
      alert("Failed to copy to clipboard");
    });
  };

  const [state, setState] = useState(false);

  useEffect(() => {
    if (state === true) {
      const timer = setTimeout(() => {
        setState(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);
  return (
    <button
      onClick={() => {
        copyToClipboard(text);
      }}
      onMouseUp={() => setState(true)}
      style={{ transition: "all " + spring(0.2, 0.5) }}
      className="flex w-[20ch] hover:scale-110 active:scale-100 active:rounded-4xl justify-center items-center gap-3 font-[Poppins] text-white/80 bg-[#101010] text-2xl px-5 py-3 rounded-2xl shadow-[0_0_0px_1px_rgba(255,255,255,0.2),0_0_0px_1.5px_rgba(0,0,0,1),inset_0_1px_2px_0.2px_rgba(255,255,255,0.1),0_1px_1px_1px_rgba(0,0,0,0.7)]"
    >
      {!state ? (
        <>
          <Copy />
          Copy To Clipboard
        </>
      ) : (
        <>
          <Check />
          Copied
        </>
      )}
    </button>
  );
}

export default CopyBtn;
