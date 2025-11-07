import { Eclipse, Palette } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

function Toggle() {
  const [option, setOption] = useState(false); // YEAH, the naming makes no sense, but it works... so i'm ging with this one!

  return (
    <div className="h-20 w-full bg-black/90 justify-center items-center rounded-3xl border-3 border-white/20 relative flex">
      <div
        style={{ color: option ? "#b0b0b0" : "black" }}
        onClick={() => {
          setOption(false);
        }}
        className="font-[Poppins] w-[45%] flex justify-center items-center gap-2 h-[calc(100%)] active:scale-95 transition-all duration-300 relative z-1000"
      >
        <Palette />
        <p>Color</p>
      </div>
      <div
        onClick={() => {
          setOption(true);
        }}
        style={{ color: !option ? "#b0b0b0" : "black" }}
        className="font-[Poppins] w-[45%] flex justify-center items-center gap-2 h-[calc(100%)]  active:scale-95 transition-all duration-300 relative z-1000"
      >
        <Eclipse />
        <p>B/W</p>
      </div>
      <motion.div
        animate={{
          transform: !option
            ? "translateX(calc(-50% + 0.25rem))"
            : "translateX(calc(50% - 0.25rem))",
        }}
        className="w-[50%] h-[calc(100%-0.5rem)] translate-y-[50%] bottom-[50%] bg-white/90 border-2 border-black/20 rounded-2xl absolute"
      ></motion.div>
    </div>
  );
}

export default Toggle;
