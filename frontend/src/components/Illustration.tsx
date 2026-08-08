import { Box, useMantineColorScheme } from "@mantine/core";

interface IllustrationProps {
  src: string;
  alt: string;
  maxWidth?: number;
}

export function Illustration({ src, alt, maxWidth = 320 }: IllustrationProps) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Box
      mx="auto"
      style={{
        maxWidth,
        width: "100%",
        /* dark: light gallery frame so black hair/clothes stay visible */
        background: dark ? "#f8f9fb" : "transparent",
        borderRadius: 16,
        border: dark ? "1px solid #26334a" : "none",
        boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.35)" : "none",
        padding: dark ? 14 : 0,
      }}
    >
      <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "auto" }} />
    </Box>
  );
}

export default Illustration;