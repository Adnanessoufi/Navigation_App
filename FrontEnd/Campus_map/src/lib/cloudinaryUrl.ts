export function clThumb(
  url: string,
  opts: { w?: number; h?: number; fit?: "fill" | "thumb" | "crop" } = {}
) {
  const w = opts.w ?? 320;
  const h = opts.h ?? 220;
  const fit = opts.fit ?? "fill";
  try {
    const t = `w_${w},h_${h},c_${fit},q_auto,f_auto`;
    return url.replace("/upload/", `/upload/${t}/`);
  } catch {
    return url; 
  }
}
