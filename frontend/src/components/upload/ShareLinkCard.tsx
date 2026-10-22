




import { useEffect, useRef, useState } from "react";
import type { FocusEvent } from "react";
import { Button, Group, Paper, Text, TextInput, Title, Box, Switch, ActionIcon, Modal, Alert, useMantineColorScheme } from "@mantine/core";
import { Clock, Copy, Download, KeyRound, QrCode, Info, Share2, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { Illustration } from "../Illustration";
import { FeedbackPrompt } from "../FeedbackPrompt";
import { Logo } from "../Logo";
import { Term } from "../Term";
import { FEATURES } from "../../config/features";
import { drawShareCard } from "../../lib/qrCard";

interface ShareLinkCardProps {
  shareUrl: string;
  copied: boolean;
  isEncrypted: boolean;
  password?: string;
  fileName?: string;
  maxDownloads: number;
  timeLeft: string;
  onCopy: (url: string) => void;
  onCopyPassword: () => void;
  onReset: () => void;
}

export function ShareLinkCard(props: ShareLinkCardProps) {
  const [embed, setEmbed] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement | null>(null);
  const { colorScheme } = useMantineColorScheme();

  const finalUrl = embed && props.isEncrypted && props.password
    ? `${props.shareUrl}#${encodeURIComponent(props.password)}`
    : props.shareUrl;

  useEffect(() => {
    const buildCard = async () => {
      const qr = qrRef.current?.querySelector("canvas");
      if (!qr) return;
      const card = await drawShareCard(qr, colorScheme === "dark" ? "dark" : "light", props.fileName);
      setCardUrl(card.toDataURL("image/png"));
    };
    const t = window.setTimeout(buildCard, 100);
    return () => window.clearTimeout(t);
  }, [finalUrl, props.fileName, colorScheme]);

  const copyQRCode = async () => {
    if (!cardUrl) return;
    try {
      const response = await fetch(cardUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("QR code copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  const downloadQRCode = () => {
    if (!cardUrl) return;
    const link = document.createElement("a");
    link.download = `VaultHub-qr.png`;
    link.href = cardUrl;
    link.click();
    toast.success("Downloaded!");
  };

  const shareNative = async () => {
    if (!cardUrl || !navigator.share) return;
    try {
      const response = await fetch(cardUrl);
      const blob = await response.blob();
      const file = new File([blob], "VaultHub-qr.png", { type: "image/png" });
      await navigator.share({ title: "VaultHub", text: "You received a file — scan to review or download.", files: [file] });
    } catch {
      // silently fail if user cancels share
    }
  };

  return (
    <>
      <Box ta="center" mb="md" style={{ position: "relative" }}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={props.onReset}
          style={{ position: "absolute", top: 0, right: 0, zIndex: 10 }}
          aria-label="Close and share another file"
        >
          <X size={16} />
        </ActionIcon>
        <Illustration src="/illustrations/share.svg" alt="Files being sent" maxWidth={160} />
      </Box>

      <Title order={3} ta="center" mb={2}>Your link is ready</Title>
      <Text fz="sm" c="dimmed" ta="center" mb="lg">Send this to the person you're sharing with.</Text>

      <Paper withBorder radius="md" p="md" mb="sm">
        <TextInput
          label={<Text fz="xs" fw={700} c="dimmed" mb={4}>Share Link</Text>}
          value={finalUrl}
          readOnly
          aria-label="Share link"
          styles={{
            input: {
              backgroundColor: "var(--mantine-color-blue-0)",
              borderColor: "var(--mantine-color-blue-4)",
              color: "var(--mantine-color-blue-9)",
              fontWeight: 500,
              fontSize: "13px",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }
          }}
          onFocus={(e: FocusEvent<HTMLInputElement>) => e.currentTarget.select()}
          rightSectionWidth={44}
          rightSection={
            <ActionIcon variant="filled" color="brand" size={36} radius="0 6px 6px 0" onClick={() => props.onCopy(finalUrl)} aria-label="Copy link" style={{ cursor: "pointer" }}>
              <Copy size={16} />
            </ActionIcon>
          }
        />

        {FEATURES.embedPassword && props.isEncrypted && props.password && (
          <Alert mt="sm" color="blue" variant="light" icon={<Info size={14} />} styles={{ root: { padding: "8px 12px" }, message: { fontSize: "12px" } }}>
            <Group justify="space-between" align="center" wrap="nowrap">
              {/* ✅ The dotted Term is now HERE, so tap/hover works exactly like on the upload page */}
              <Text fz="xs" lh={1.5}>
                <Term tip="This puts your password after the # sign in the link, The # part is never sent to our serverthe recipient's browser reads it and fills the password in automatically But anyone who gets this link can open the file, so only send it to the right person For maximum safety, keep this OFF and send the password in a separate message">
                  Embed password in link
                </Term>
                ? Easier, but less secure.
              </Text>
              <Switch
                checked={embed}
                onChange={(e) => setEmbed(e.currentTarget.checked)}
                size="xs"
                color="blue"
                style={{ flexShrink: 0 }}
              />
            </Group>
          </Alert>
        )}
      </Paper>

      {props.isEncrypted && props.password && !embed && (
        <Alert mb="sm" color="blue" variant="light" icon={<KeyRound size={14} />} styles={{ root: { padding: "10px 12px" } }}>
          <Group justify="space-between" mb={4}>
            <Text fz="xs" fw={700}>Password</Text>
            <Button size="compact-xs" color="green" onClick={props.onCopyPassword} leftSection={<Copy size={10} />}>Copy</Button>
          </Group>
          <Text fz="sm" fw={600} style={{ fontFamily: "monospace" }}>{props.password}</Text>
          <Text fz="xs" c="dimmed" mt={4}>Send separately for maximum security</Text>
        </Alert>
      )}

      <Button fullWidth size="md" variant="default" leftSection={<QrCode size={17} />} onClick={() => setQrModalOpen(true)} mb="sm" styles={{ root: { height: 42, backgroundColor: colorScheme === "dark" ? "rgba(255, 255, 255, 0.06)" : "#FFFFFF", border: colorScheme === "dark" ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(232, 80, 30, 0.24)", color: colorScheme === "dark" ? "#F5F7FB" : "#334155", boxShadow: colorScheme === "dark" ? "none" : "0 1px 2px rgba(15, 23, 42, 0.04)" }, section: { color: "#E8501E" }, label: { fontWeight: 700 } }}>
        Show QR Code
      </Button>

      <Group grow mb="md">
        <Alert color="blue" variant="light" icon={<Clock size={14} />} styles={{ root: { padding: "10px 12px" }, message: { fontSize: "12px", fontWeight: 600 } }}>
          {props.timeLeft} remaining
        </Alert>
        <Alert color="blue" variant="light" icon={<Download size={14} />} styles={{ root: { padding: "10px 12px" }, message: { fontSize: "12px", fontWeight: 600 } }}>
          {props.maxDownloads} downloads left
        </Alert>
      </Group>

      <Modal opened={qrModalOpen} onClose={() => setQrModalOpen(false)} centered size="xs" withCloseButton styles={{ content: { borderRadius: 16, padding: 0 }, body: { padding: 0 } }}>
        <Box p="sm" ta="center">
          <Box mb={4} style={{ display: "flex", justifyContent: "center" }}>
            <Logo />
          </Box>
          <Box mx="auto" w={168} h={168} p={1} style={{ background: "#FFFFFF", borderRadius: 12, display: "grid", placeItems: "center" }}>
            <QRCodeCanvas value={finalUrl} size={148} level="H" includeMargin />
          </Box>
          <Text fz="sm" fw={600} mt={6} mb={8}>Scan to download</Text>
          <Group justify="center" gap={4} wrap="nowrap" style={{ width: "100%" }}>
            <Button size="xs" variant="light" color="blue" leftSection={<Copy size={13} />} onClick={copyQRCode} disabled={!cardUrl} styles={{ root: { flex: 1, minWidth: 0, paddingInline: 8 } }}>Copy</Button>
            <Button size="xs" variant="light" color="teal" leftSection={<Download size={13} />} onClick={downloadQRCode} disabled={!cardUrl} styles={{ root: { flex: 1, minWidth: 0, paddingInline: 8 } }}>Download</Button>
            <Button size="xs" variant="light" color="orange" leftSection={<Share2 size={13} />} onClick={shareNative} disabled={!cardUrl} styles={{ root: { flex: 1, minWidth: 0, paddingInline: 8 } }}>Share</Button>
          </Group>
        </Box>
      </Modal>

      <div ref={qrRef} style={{ position: "absolute", left: -9999, top: 0 }} aria-hidden="true">
        <QRCodeCanvas value={finalUrl} size={420} level="H" includeMargin={false} />
      </div>

      <Box mt="md" ta="center">
        <Button variant="subtle" color="brand" onClick={props.onReset} size="sm">
          Share another file
        </Button>
      </Box>

      <FeedbackPrompt />
    </>
  );
}

export default ShareLinkCard;