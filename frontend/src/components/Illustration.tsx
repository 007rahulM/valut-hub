import { Box, useMantineColorScheme } from "@mantine/core";

interface IllustrationProps {
  src: string;
  alt: string;
  maxWidth?: number;
}

// Mobile-first: on phones the image becomes a small strip (160px)
// so the card content gets the space. On bigger screens it uses maxWidth.
export function Illustration({ src, alt, maxWidth = 320 }: IllustrationProps) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Box
      mx="auto"
      maw={{ base: 160, sm: maxWidth }}
      style={{
        width: "100%",
        background: dark ? "#f8f9fb" : "transparent",
        borderRadius: 16,
        border: dark ? "1px solid #26334a" : "none",
        boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.35)" : "none",
        padding: dark ? 8 : 0,
      }}
    >
<img
  src={src}
  alt={alt}
  width={maxWidth}
  height={Math.round(maxWidth * 0.75)}
  style={{ display: "block", width: "100%", height: "auto" }}
/>
    </Box>
  );
}

export default Illustration;