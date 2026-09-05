// // // // ============================================================
// // // // Illustration - responsive image wrapper. Nothing more.
// // // // Brand art is NEVER modified: no recolor, no box, no filter.
// // // // Dark mode only changes the UI around it (tokens in index.css).
// // // // ============================================================
// // // import { Box } from "@mantine/core";

// // // interface IllustrationProps {
// // //   src: string;
// // //   alt: string;
// // //   maxWidth?: number;
// // //   baseMax?: number;
// // // }

// // // export function Illustration({ src, alt, maxWidth = 320, baseMax = 160 }: IllustrationProps) {
// // //   return (
// // //     <Box mx="auto" maw={{ base: baseMax, sm: maxWidth }} style={{ width: "100%" }}>
// // //       <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "auto" }} />
// // //     </Box>
// // //   );
// // // }

// // // export default Illustration;


// // // ============================================================
// // // Illustration - responsive image wrapper.
// // // PHONE (base): fixed-height band + object-fit:contain, so a tall
// // //   artwork can never eat half the phone screen; all art keeps the
// // //   same visual rhythm on small devices.
// // // LAPTOP / TABLET (sm and up): height returns to NATURAL (auto),
// // //   exactly like the original design, so pages stay compact and
// // //   still fit in one screen with almost no scrolling.
// // // Brand art is NEVER modified: no recolor, no crop, no filter.
// // // Dark mode only changes the UI around it (tokens in index.css).
// // // ============================================================
// // import { Box } from "@mantine/core";

// // interface IllustrationProps {
// //   src: string;
// //   alt: string;
// //   /** Max width on desktop (sm and up). */
// //   maxWidth?: number;
// //   /** Max width on phones. */
// //   baseMax?: number;
// //   /** Fixed band height on phones ONLY. */
// //   baseHeight?: number;
// // }

// // export function Illustration({
// //   src,
// //   alt,
// //   maxWidth = 320,
// //   baseMax = 160,
// //   baseHeight = 160,
// // }: IllustrationProps) {
// //   return (
// //     <Box
// //       mx="auto"
// //       maw={{ base: baseMax, sm: maxWidth }}
// //       h={{ base: baseHeight, sm: "auto" }}
// //       style={{ width: "100%" }}
// //     >
// //       <img
// //         src={src}
// //         alt={alt}
// //         style={{
// //           display: "block",
// //           width: "100%",
// //           height: "100%",
// //           objectFit: "contain",
// //           objectPosition: "center",
// //         }}
// //       />
// //     </Box>
// //   );
// // }

// // export default Illustration;

// // ============================================================
// // Illustration - responsive image wrapper with ONE rule:
// // every artwork (tall or wide) sits inside the same fixed-height
// // band on EVERY device, so no image ever eats the screen or
// // looks tiny next to another one.
// // ============================================================
// import { Box } from "@mantine/core";

// interface IllustrationProps {
//   src: string;
//   alt: string;
//   maxWidth?: number;
//   baseMax?: number;
//   baseHeight?: number;
//   smHeight?: number;
// }

// export function Illustration({
//   src,
//   alt,
//   maxWidth = 320,
//   baseMax = 200,
//   baseHeight = 160,
//   smHeight = 180,
// }: IllustrationProps) {
//   return (
//     <Box
//       mx="auto"
//       maw={{ base: baseMax, sm: maxWidth }}
//       h={{ base: baseHeight, sm: smHeight }}
//       style={{ width: "100%" }}
//     >
//       <img
//         src={src}
//         alt={alt}
//         style={{
//           display: "block",
//           width: "100%",
//           height: "100%",
//           objectFit: "contain",
//           objectPosition: "center",
//         }}
//       />
//     </Box>
//   );
// }

// export default Illustration;



import { Box } from "@mantine/core";

interface IllustrationProps {
  src: string;
  alt: string;
  maxWidth?: number;
  baseMax?: number;
  baseHeight?: number;
  smHeight?: number;
}

export function Illustration({
  src,
  alt,
  maxWidth = 280,    // Desktop max width
  baseMax = 140,     // PHONE max width (shrunk from 200 to 140)
  baseHeight = 120,  // PHONE fixed band height (shrunk from 160 to 120)
  smHeight = 180,    // Desktop height
}: IllustrationProps) {
  return (
    <Box
      mx="auto"
      maw={{ base: baseMax, sm: maxWidth }}
      h={{ base: baseHeight, sm: smHeight }}
      style={{ width: "100%" }}
      mb="md"
    >
      <img
        src={src}
        alt={alt}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    </Box>
  );
}
export default Illustration;