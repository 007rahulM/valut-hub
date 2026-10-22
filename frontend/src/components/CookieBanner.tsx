import { useState } from "react";
import { Paper, Group, Text, Button } from "@mantine/core";
import { Cookie } from "lucide-react";

interface CookieBannerProps {
  hidden?: boolean; // ✅ Allow parent to hide it
}

export function CookieBanner({ hidden = false }: CookieBannerProps) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("VaultHub_cookie_consent");
  });

  const handleAccept = () => {
    localStorage.setItem("VaultHub_cookie_consent", "true");
    setVisible(false);
  };

  if (!visible || hidden) return null;

  return (
    <Paper
      withBorder
      shadow="md"
      radius="md"
      p="md"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 100, // ✅ Lower than WelcomeModal (201)
        background: "var(--mantine-color-body)",
        maxWidth: 320,
      }}
    >
      <Group align="flex-start" gap="sm">
        <div style={{ background: "var(--mantine-color-brand-light)", borderRadius: 8, padding: 8, flexShrink: 0 }}>
          <Cookie size={20} color="var(--mantine-color-brand-6)" />
        </div>
        <div style={{ flex: 1 }}>
          <Text fz="sm" fw={700} mb={4}>We use functional cookies</Text>
          <Text fz="xs" c="dimmed" mb="md" lh={1.5}>
            VaultHub uses a small technical cookie to keep the service safe, remember your display preference, and recover interrupted uploads. We do not use tracking or advertising cookies.
          </Text>
          <Button size="xs" fullWidth onClick={handleAccept}>I Agree</Button>
        </div>
      </Group>
    </Paper>
  );
}