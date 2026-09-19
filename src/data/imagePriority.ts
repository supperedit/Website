import type { ImgHTMLAttributes } from "react";
export const highImagePriority: ImgHTMLAttributes<HTMLImageElement> & { fetchpriority: "high" } = { fetchpriority: "high" };
