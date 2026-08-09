import { Button, Group, Stack, Text } from "@mantine/core";
import { Check, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Illustration } from "../Illustration";
import { FeedbackPrompt } from "../FeedbackPrompt";

export function DownloadCompleteCard() {
  return (
    <>
      {/* Slim green success strip */}
      <Group gap={8} px="lg" py={10} bg="var(--mantine-color-green-light)">
        <Check size={16} style={{ color: "var(--mantine-color-green-7)", flexShrink: 0 }} />
        <Text fz="sm" fw={700} c="var(--mantine-color-green-7)">Saved to your device</Text>
        <Text fz="xs" c="dimmed" ml="auto">done</Text>
      </Group>

      <Stack p={{ base: "md", sm: "xl" }} gap="md" align="center">
        <Illustration src="/illustrations/successful-upload.svg" alt="Download complete" maxWidth={150} />

        <Text fz="sm" c="dimmed" ta="center">
          You can close this window now. The link keeps working until it expires
          or runs out of downloads.
        </Text>

        <Text fz="sm" c="dimmed" ta="center" maw={420}>
          Got something to send back? VaultHub is free, private, and needs no account.
        </Text>

        <Button component={Link} to="/" leftSection={<Upload size={16} />}>
          Send a file
        </Button>

        {/* ⭐ The star feedback — exactly where you marked in yellow */}
        <FeedbackPrompt />
      </Stack>
    </>
  );
}

export default DownloadCompleteCard;