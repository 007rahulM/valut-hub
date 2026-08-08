import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const next = colorScheme === "dark" ? "light" : "dark";
  return (
    <ActionIcon
      variant="default"
      radius="md"
      size="lg"
      aria-label="Toggle light / dark mode"
      onClick={() => {
        setColorScheme(next);
        localStorage.setItem("vh-theme", next);
      }}
    >
      {colorScheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </ActionIcon>
  );
}