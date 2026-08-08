import { Button, Group, Stack, Text } from "@mantine/core";
import { Check, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Illustration } from "../Illustration";

export function DownloadCompleteCard() {
  return (
    <>
      <Group gap={8} px="lg" py={10} bg="var(--mantine-color-green-light)">
        <Check size={16} style={{ color: "var(--mantine-color-green-7)", flexShrink: 0 }} />
        <Text fz="sm" fw={700} c="var(--mantine-color-green-7)">Download Complete</Text>
        <Text fz="xs" c="dimmed" ml="auto">saved to your device</Text>
      </Group>

      <Stack p="xl" gap="md" align="center">
        <Illustration src="/illustrations/successful-upload.svg" alt="Download complete" maxWidth={150} />
        <Text fz="sm" c="dimmed" ta="center">
          You can now close this window. The link keeps working until it expires
          or reaches its download limit.
        </Text>
        <Text fz="sm" c="dimmed" ta="center" maw={420}>
          That was easy, right? Next time you need to send something —
          big or small — VaultHub is free, private and needs no account.
        </Text>
        <Button component={Link} to="/" leftSection={<Upload size={16} />}>
          Send a file — it's free
        </Button>
      </Stack>
    </>
  );
}

export default DownloadCompleteCard;