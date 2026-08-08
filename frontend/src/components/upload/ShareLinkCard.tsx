import type { FocusEvent } from "react";
import { Button, Group, Paper, Text, TextInput, Title } from "@mantine/core";
import { Clock, Copy, Download } from "lucide-react";
import { Illustration } from "../Illustration";
import { InfoBanner } from "../InfoBanner";

interface ShareLinkCardProps {
  shareUrl: string;
  copied: boolean;
  isEncrypted: boolean;
  maxDownloads: number;
  timeLeft: string;
  onCopy: () => void;
  onReset: () => void;
}

export function ShareLinkCard(props: ShareLinkCardProps) {
  return (
    <>
      <Illustration src="/illustrations/share.svg" alt="Files being sent securely" maxWidth={150} />
      <Title order={3} mt="md">Your link is ready to share</Title>
      <Text fz="sm" c="dimmed" mt={4}>
        Paste the link into an email or message and send this to the recipient
        {props.isEncrypted && " and send them the password if one was set"}.
      </Text>

      {props.isEncrypted && (
        <Group mt="md">
          <InfoBanner>
            After you navigate away from this page, the following information is no longer
            available: <b>your file password</b>. Copy it now or send it to your recipient separately.
          </InfoBanner>
        </Group>
      )}

      <Group mt="md" align="stretch" wrap="nowrap">
        <TextInput
          value={props.shareUrl}
          readOnly
          flex={1}
          onFocus={(e: FocusEvent<HTMLInputElement>) => e.currentTarget.select()}
        />
        <Button onClick={props.onCopy} leftSection={<Copy size={16} />}>Copy link</Button>
      </Group>

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
                onClick={() => window.open(props.shareUrl, "_blank")} aria-label="Download your file">
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
    </>
  );
}

export default ShareLinkCard;