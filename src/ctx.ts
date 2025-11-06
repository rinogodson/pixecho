const ctx: {
  image: Blob | null;
  pixelSize: number;
  width: number;
  pixelData: string[];
  echocmd: string;
} = {
  image: null,
  pixelSize: 8,
  width: 64,
  pixelData: [],
  echocmd: "",
};

export default ctx;
