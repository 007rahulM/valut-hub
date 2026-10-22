// import { useEffect, useState } from "react";
// import type { CSSProperties } from "react";
// import { Box } from "@mantine/core";

// // Full logo file (square with padding). Change if your path differs.
// const LOGO_URL = "/illustrations/logoo.png";

// // The lockup (fingerprint + wordmark) area inside the square image.
// const CONTENT = { x: 0.12, y: 0.3, w: 0.76, h: 0.35 };

// // Pick logo height: smaller on phones, bigger on laptop
// function getTargetH() {
//   if (typeof window === "undefined") return 50;
//   return window.matchMedia("(max-width: 480px)").matches ? 38 : 50;
// }

// // Fallback look while the image loads
// const fallback = (h: number): CSSProperties => ({
//   width: Math.round(h * 2.2),
//   height: h,
//   display: "inline-block",
//   backgroundImage: `url(${LOGO_URL})`,
//   backgroundRepeat: "no-repeat",
//   backgroundSize: "cover",
//   backgroundPosition: "center",
// });

// export function Logo() {
//   const [targetH, setTargetH] = useState<number>(getTargetH);
//   const [style, setStyle] = useState<CSSProperties>(() => fallback(getTargetH()));

//   // Follow viewport changes (resize, phone rotation)
//   useEffect(() => {
//     const mq = window.matchMedia("(max-width: 480px)");
//     const onChange = () => setTargetH(mq.matches ? 38 : 50);
//     if (mq.addEventListener) mq.addEventListener("change", onChange);
//     return () => {
//       if (mq.removeEventListener) mq.removeEventListener("change", onChange);
//     };
//   }, []);

//   // Measure the real file, then crop exactly the lockup area
//   useEffect(() => {
//     const img = new Image();
//     img.onload = () => {
//       const H = targetH / CONTENT.h;
//       const W = H * ((img.naturalWidth || 1) / (img.naturalHeight || 1));
//       setStyle({
//         width: Math.round(W * CONTENT.w),
//         height: targetH,
//         display: "inline-block",
//         backgroundImage: `url(${LOGO_URL})`,
//         backgroundRepeat: "no-repeat",
//         backgroundSize: `${Math.round(W)}px ${Math.round(H)}px`,
//         backgroundPosition: `${-Math.round(W * CONTENT.x)}px ${-Math.round(H * CONTENT.y)}px`,
//         flexShrink: 0,
//       });
//     };
//     img.src = LOGO_URL;
//   }, [targetH]);

//   return <Box component="span" role="img" aria-label="SendDrift" style={style} />;
// }


import { Box, useMantineColorScheme } from "@mantine/core";

// These are the exact filenames already present in public/illustrations.
const LIGHT_LOGO_URL = "/illustrations/logo.png";
const DARK_LOGO_URL = "/illustrations/logo.png";

export function Logo() {
  const { colorScheme } = useMantineColorScheme();
  const src = colorScheme === "dark" ? DARK_LOGO_URL : LIGHT_LOGO_URL;

  return (
    <Box
      component="img"
      src={src}
      alt="VaultHub"
      aria-label="VaultHub"
      loading="eager"
      decoding="async"
      style={{
        display: "block",
        height: "clamp(34px, 5vw, 48px)",
        width: "auto",
        maxWidth: "min(240px, 42vw)",
        objectFit: "contain",
        objectPosition: "left center",
      }}
    />
  );
}

export default Logo;
