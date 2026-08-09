import type { FocusEvent } from "react";
import { Button, Group, Paper, Text, TextInput, Title } from "@mantine/core";
import { Clock, Copy, Download, KeyRound } from "lucide-react";
import { Illustration } from "../Illustration";
import { FeedbackPrompt } from "../FeedbackPrompt";

interface ShareLinkCardProps {
  shareUrl: string;
  copied: boolean;
  isEncrypted: boolean;
  password?: string;
  maxDownloads: number;
  timeLeft: string;
  onCopy: () => void;
  onCopyPassword: () => void;
  onReset: () => void;
}

export function ShareLinkCard(props: ShareLinkCardProps) {
  return (
    <>
      <Illustration src="/illustrations/share.svg" alt="Files being sent" maxWidth={150} />
      <Title order={3} mt="md">Your link is ready</Title>
      <Text fz="sm" c="dimmed" mt={4}>
        Send this to the person you're sharing with.
      </Text>

  <Group mt="md" align="stretch" wrap="wrap">
  <TextInput
    value={props.shareUrl}
    readOnly
    style={{ flex: 1, minWidth: 200 }}
    onFocus={(e: FocusEvent<HTMLInputElement>) => e.currentTarget.select()}
  />
  <Button onClick={props.onCopy} leftSection={<Copy size={16} />} w={{ base: "100%", xs: "auto" }}>
    Copy link
  </Button>
</Group>

      {props.isEncrypted && props.password && (
        <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-light)">
          <Group justify="space-between" wrap="wrap" gap={8}>
            <Group gap={8} wrap="wrap">
              <KeyRound size={15} style={{ color: "var(--mantine-color-blue-7)", flexShrink: 0 }} />
              <Text fz="xs" fw={700} c="var(--mantine-color-blue-8)">The password — your only copy</Text>
            </Group>
            {/* Solid green button — unmistakably a button */}
            <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={props.onCopyPassword}>
              Copy
            </Button>
          </Group>
          <Text fz="sm" fw={600} mt={6} style={{ fontFamily: "monospace" }}>{props.password}</Text>
          <Text fz={11} c="dimmed" mt={6}>
            The link won't open without it, and we never store it.
            Tip: send the link and the password in two different apps.
          </Text>
        </Paper>
      )}

      {props.copied && (
        <Paper withBorder radius="md" px="md" py={10} mt="md" bg="var(--mantine-color-blue-light)">
          <Group justify="space-between" wrap="wrap" gap={8}>
            <Group gap={14} wrap="wrap">
              <Text fz="xs" c="dimmed">
                <Download size={13} style={{ verticalAlign: -2 }} /> {props.maxDownloads} download{props.maxDownloads > 1 ? "s" : ""} left
              </Text>
              <Text fz="xs" c="dimmed">
                <Clock size={13} style={{ verticalAlign: -2 }} /> {props.timeLeft}
              </Text>
            </Group>
            <Group gap={6}>
              <Button size="compact-xs" variant="outline" color="brand" onClick={props.onCopy} aria-label="Copy link again">
                <Copy size={14} />
              </Button>
              <Button size="compact-xs" variant="outline" color="brand"
                onClick={() => window.open(props.shareUrl, "_blank")} aria-label="Open your link">
                <Download size={14} />
              </Button>
            </Group>
          </Group>
          <Text fz={11} c="dimmed" mt={6}>
            Deleted automatically when the link expires or its downloads run out.
          </Text>
        </Paper>
      )}

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button type="button" className="link-plain" onClick={props.onReset}>Share another file</button>
      </div>

      <FeedbackPrompt />
    </>
  );
}

export default ShareLinkCard;