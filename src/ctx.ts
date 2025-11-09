const ctx: {
  width: number;
  dark: boolean;
  compare: boolean;
  pixelData: {
    r: number;
    g: number;
    b: number;
  }[][];
  echocmd: string;
  opts: {
    grayscale: boolean;
    brightness: number;
    contrast: number;
    hue: number;
    saturate: number;
  };
} = {
  width: 64,
  dark: true,
  compare: false,
  pixelData: [],
  echocmd: "",
  opts: {
    grayscale: false,
    brightness: 100,
    contrast: 100,
    hue: 0,
    saturate: 100,
  },
};

export default ctx;
