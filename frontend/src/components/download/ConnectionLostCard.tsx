import { Button, Card, Stack, Text, Title } from "@mantine/core";
import { RefreshCw } from "lucide-react";
import { Illustration } from "../Illustration";

interface ConnectionLostCardProps {
  variant: "network" | "server";
  onRetry: () => void;
}

export function ConnectionLostCard({ variant, onRetry }: ConnectionLostCardProps) {
  const network = variant === "network";
  return (
    <Card withBorder shadow="sm" radius="lg" p="xl">
      <Stack align="center" gap="md">
        <Illustration src="/illustrations/connection-lost.svg" alt="Connection lost" maxWidth={260} />
        <Title order={2}>{network ? "You're offline" : "We'll be right back"}</Title>
        <Text c="dimmed" fz="sm" ta="center" maw={400}>
          {network
            ? "It looks like your internet connection dropped. Check your Wi‑Fi or mobile data and try again your files are safe."
            : "Our servers are taking a short break. Please try again in a few minutes your files are safe and waiting."}
        </Text>
        <Button leftSection={<RefreshCw size={16} />} onClick={onRetry}>Try again</Button>
      </Stack>
    </Card>
  );
}

export default ConnectionLostCard;
