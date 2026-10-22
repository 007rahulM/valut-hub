import { useState } from "react";
import { Box, Card, Group, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { ArrowRight, LockKeyhole, Server, Upload } from "lucide-react";

export function HowVaultHubWorksV2() {
  const [videoUrl, setVideoUrl] = useState("");
  const isYouTube = /youtube\.com|youtu\.be/.test(videoUrl);

  return (
    <Card withBorder radius="lg" p={{ base: "md", sm: "xl" }} mt="md">
      <Stack gap="md">
        <div>
          <Title order={3}>How VaultHub works</Title>
          <Text fz="sm" c="dimmed" mt={4}>A simple explanation for testing and learning. This area is safe to keep on the development page.</Text>
        </div>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <PaperStepV2 icon={<LockKeyhole size={19} />} title="1. Your device" text="The browser can lock the file before it leaves your device." />
          <PaperStepV2 icon={<Upload size={19} />} title="2. Secure connection" text="HTTPS protects the connection while the browser sends the file." />
          <PaperStepV2 icon={<Server size={19} />} title="3. Temporary storage" text="Storage keeps the protected bytes until the link expires or its limit is reached." />
        </SimpleGrid>
        <Box className="VaultHub-v2-flow" aria-label="Animated upload flow" py="xs">
          <Group justify="center" gap="xs" wrap="nowrap">
            <FlowNodeV2 label="Browser" />
            <ArrowRight className="VaultHub-v2-flow-arrow" size={22} />
            <FlowNodeV2 label="HTTPS" />
            <ArrowRight className="VaultHub-v2-flow-arrow" size={22} />
            <FlowNodeV2 label="Storage" />
          </Group>
        </Box>
        <TextInput label="Optional explanation video URL" placeholder="Paste a YouTube URL later" value={videoUrl} onChange={(event) => setVideoUrl(event.currentTarget.value)} />
        {isYouTube && (
          <Box component="iframe" title="How VaultHub works video" src={videoUrl.replace("watch?v=", "embed/")} w="100%" h={260} style={{ border: 0, borderRadius: 12 }} />
        )}
        <Text fz="xs" c="dimmed">For a plaintext file, the browser sends normal bytes. For an encrypted file, it sends protected bytes and unlocks them only in the recipient’s browser after the correct password is entered.</Text>
      </Stack>
    </Card>
  );
}

function PaperStepV2({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <Card withBorder radius="md" p="sm"><Group align="flex-start" wrap="nowrap"><Box c="blue">{icon}</Box><div><Text fw={600} fz="sm">{title}</Text><Text fz="xs" c="dimmed" mt={3}>{text}</Text></div></Group></Card>;
}

function FlowNodeV2({ label }: { label: string }) {
  return <Box className="VaultHub-v2-flow-node" px="sm" py={6} style={{ border: "1px solid var(--mantine-color-blue-3)", borderRadius: 999 }}><Text fz="xs" fw={600}>{label}</Text></Box>;
}
