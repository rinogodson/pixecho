import { useState } from "react";

const useCtx = <T extends object>(initialState: T) => {
  const [appCtx, setAppCtx] = useState<T>(initialState);

  const setCtx = (path: string, value: any) => {
    setAppCtx((p) => setVal(p, path, value));
  };

  const mergeCtx = (part: Partial<T>) => {
    setAppCtx((p) => ({ ...p, ...part }));
  };

  return { ctx: appCtx, setCtx, mergeCtx };
};

const setVal = (o: any, p: string, v: any): any => {
  const neoObj = structuredClone(o);
  const parts = p
    .replace(/\[(\w+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  let current = neoObj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextIsArrayIndex = /^\d+$/.test(parts[i + 1]);
    if (current[key] === undefined) {
      current[key] = nextIsArrayIndex ? [] : {};
    }
    current = current[key];
  }

  current[parts[parts.length - 1]] = v;
  return neoObj;
};

export default useCtx;
