import { useState, useEffect } from "react";
import { Paper, Group, Text, Button } from "@mantine/core";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user already accepted functional cookies
    const accepted = localStorage.getItem("sendly_cookie_consent");
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("sendly_cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Paper
      withBorder
      shadow="lg"
      radius="md"
      p="md"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 100,
        background: "var(--mantine-color-body)",
        maxWidth: 400,
      }}
    >
      <Group align="flex-start" gap="md" wrap="nowrap">
        <div style={{ background: "var(--mantine-color-brand-light)", borderRadius: 8, padding: 8, flexShrink: 0 }}>
          <Cookie size={20} color="var(--mantine-color-brand-6)" />
        </div>
        <div style={{ flex: 1 }}>
          <Text fz="sm" fw={700} mb={4}>We use functional cookies</Text>
          <Text fz="xs" c="dimmed" mb="md" lh={1.5}>
            Sendly uses a small technical cookie to keep the service safe (rate limiting) and remember your theme. We do not use tracking or advertising cookies.
            Read our <a href="/cookies" style={{ color: "var(--mantine-color-brand-6)", textDecoration: "underline" }}>Cookie Policy</a>.
          </Text>
          <Button size="xs" fullWidth onClick={handleAccept}>Got it</Button>
        </div>
      </Group>
    </Paper>
  );
}