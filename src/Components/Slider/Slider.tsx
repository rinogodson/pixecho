import { RotateCcw } from "lucide-react";
import { useRef } from "react";

function Slider({
  valText,
  val,
  onChange,
  min,
  max,
  title,
  icon: Icon,
}: {
  valText: string;
  val: number;
  onChange: (e: { target: { value: string } }) => void;
  min: number;
  max: number;
  title: string;
  icon: React.FC;
}) {
  const initValue = useRef(structuredClone(val));
  return (
    <div className="flex flex-col text-white gap-3">
      <div className="flex justify-between items-center">
        <div className="justify-center flex gap-3">
          <Icon />
          <p>{title}</p>
          <p className="text-white/40">{valText}</p>
        </div>
        <div>
          {initValue.current != val && (
            <div
              onClick={() => {
                onChange({ target: { value: String(initValue.current) } });
              }}
              className="hover:bg-white/10 active:bg-white/5 h-full p-1 rounded-full"
            >
              <RotateCcw size={15} />
            </div>
          )}
        </div>
      </div>
      <label className="slider">
        <input
          type="range"
          min={min}
          max={max}
          value={val}
          onChange={onChange}
          className="level"
        />
      </label>
    </div>
  );
}

export default Slider;
