// import type { FocusEvent } from "react";
// import { Button, Group, Paper, Text, TextInput, Title } from "@mantine/core";
// import { Clock, Copy, Download, KeyRound } from "lucide-react";
// import { Illustration } from "../Illustration";
// import { FeedbackPrompt } from "../FeedbackPrompt";

// interface ShareLinkCardProps {
//   shareUrl: string;
//   copied: boolean;
//   isEncrypted: boolean;
//   password?: string;
//   maxDownloads: number;
//   timeLeft: string;
//   onCopy: () => void;
//   onCopyPassword: () => void;
//   onReset: () => void;
// }

// export function ShareLinkCard(props: ShareLinkCardProps) {
//   return (
//     <>
//       <Illustration src="/illustrations/share.svg" alt="Files being sent" maxWidth={150} />
//       <Title order={3} mt="md">Your link is ready</Title>
//       <Text fz="sm" c="dimmed" mt={4}>
//         Send this to the person you're sharing with.
//       </Text>

//   <Group mt="md" align="stretch" wrap="wrap">
//   <TextInput
//     value={props.shareUrl}
//     readOnly
//     style={{ flex: 1, minWidth: 200 }}
//     onFocus={(e: FocusEvent<HTMLInputElement>) => e.currentTarget.select()}
//   />
//   <Button onClick={props.onCopy} leftSection={<Copy size={16} />} w={{ base: "100%", xs: "auto" }}>
//     Copy link
//   </Button>
// </Group>

//       {props.isEncrypted && props.password && (
//         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-light)">
//           <Group justify="space-between" wrap="wrap" gap={8}>
//             <Group gap={8} wrap="wrap">
//               <KeyRound size={15} style={{ color: "var(--mantine-color-blue-7)", flexShrink: 0 }} />
//               <Text fz="xs" fw={700} c="var(--mantine-color-blue-8)">The password — your only copy</Text>
//             </Group>
//             {/* Solid green button — unmistakably a button */}
//             <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={props.onCopyPassword}>
//               Copy
//             </Button>
//           </Group>
//           <Text fz="sm" fw={600} mt={6} style={{ fontFamily: "monospace" }}>{props.password}</Text>
//           <Text fz={11} c="dimmed" mt={6}>
//             The link won't open without it, and we never store it.
//             Tip: send the link and the password in two different apps.
//           </Text>
//         </Paper>
//       )}

//       {props.copied && (
//         <Paper withBorder radius="md" px="md" py={10} mt="md" bg="var(--mantine-color-blue-light)">
//           <Group justify="space-between" wrap="wrap" gap={8}>
//             <Group gap={14} wrap="wrap">
//               <Text fz="xs" c="dimmed">
//                 <Download size={13} style={{ verticalAlign: -2 }} /> {props.maxDownloads} download{props.maxDownloads > 1 ? "s" : ""} left
//               </Text>
//               <Text fz="xs" c="dimmed">
//                 <Clock size={13} style={{ verticalAlign: -2 }} /> {props.timeLeft}
//               </Text>
//             </Group>
//             <Group gap={6}>
//               <Button size="compact-xs" variant="outline" color="brand" onClick={props.onCopy} aria-label="Copy link again">
//                 <Copy size={14} />
//               </Button>
//               <Button size="compact-xs" variant="outline" color="brand"
//                 onClick={() => window.open(props.shareUrl, "_blank")} aria-label="Open your link">
//                 <Download size={14} />
//               </Button>
//             </Group>
//           </Group>
//           <Text fz={11} c="dimmed" mt={6}>
//             Deleted automatically when the link expires or its downloads run out.
//           </Text>
//         </Paper>
//       )}

//       <div style={{ textAlign: "center", marginTop: 16 }}>
//         <button type="button" className="link-plain" onClick={props.onReset}>Share another file</button>
//       </div>

//       <FeedbackPrompt />
//     </>
//   );
// }

// export default ShareLinkCard;











// ============================================================
// ShareLinkCard — the link-ready window (step 3 of sender flow)
//
// Shows: share link, copy button, password "only copy" box,
// status strip, feedback prompt.
//
// DEV-GATED EXTRAS (see src/config/features.ts):
//   - Embed password in link using #fragment (opt-in, with warning)
//   - Branded QR share card: preview + copy + download + share
//
// Production push: features hidden automatically.
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent } from "react";
import { Button, Group, Paper, Stack, Switch, Text, TextInput, Title } from "@mantine/core";
import { Clock, Copy, Download, KeyRound, QrCode, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { Illustration } from "../Illustration";
import { FeedbackPrompt } from "../FeedbackPrompt";
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
  const [showCard, setShowCard] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement | null>(null);

  // Check if phone share-sheet is supported (memoized, no effect needed)
  const canShare = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return !!navigator.canShare;
  }, []);

  // The link we show and copy. With #password when the user opts in.
  const finalUrl =
    embed && props.isEncrypted && props.password
      ? `${props.shareUrl}#${encodeURIComponent(props.password)}`
      : props.shareUrl;

  // Build the branded card image when the preview is opened
  useEffect(() => {
    if (!showCard) return;
    
    const buildCard = async () => {
      const qr = qrRef.current?.querySelector("canvas");
      if (!qr) return;
      const card = await drawShareCard(qr, props.fileName);
      setCardUrl(card.toDataURL("image/png"));
    };
    
    const t = window.setTimeout(buildCard, 60);
    return () => {
      window.clearTimeout(t);
      setCardUrl(null);
    };
  }, [showCard, finalUrl, props.fileName]);

  // Build a fresh card canvas on demand (for copy / download / share)
  const makeCard = async () => {
    const qr = qrRef.current?.querySelector("canvas");
    return qr ? await drawShareCard(qr, props.fileName) : null;
  };

  // Copy the branded card as an image to the clipboard
  const copyImage = async () => {
    const card = await makeCard();
    if (!card) return;
    const blob = await new Promise<Blob | null>((res) => card.toBlob(res, "image/png"));
    if (!blob) return;

    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Card copied. Paste it anywhere.");
    } catch {
      toast.error("Copy not supported here. Use Download instead.");
    }
  };

  // Save the branded card as a PNG on the device
  const downloadImage = async () => {
    const card = await makeCard();
    if (!card) return;
    const a = document.createElement("a");
    a.href = card.toDataURL("image/png");
    a.download = "vaulthub-share-card.png";
    a.click();
  };

  // Native share sheet on phones (WhatsApp, chat, airdrop style)
  const shareImage = async () => {
    const card = await makeCard();
    if (!card) return;
    const blob = await new Promise<Blob | null>((res) => card.toBlob(res, "image/png"));
    if (!blob) return;
    const file = new File([blob], "vaulthub-share-card.png", { type: "image/png" });
    try {
      await navigator.share({ files: [file], title: "VaultHub", text: "You received a private file." });
    } catch {
      /* user cancelled, do nothing */
    }
  };

  return (
    <>
      <Illustration src="/illustrations/share.svg" alt="Files being sent" maxWidth={150} />
      <Title order={3} mt="md">Your link is ready</Title>
      <Text fz="sm" c="dimmed" mt={4}>
        Send this to the person you're sharing with.
      </Text>

      <Group mt="md" align="stretch" wrap="wrap">
        <TextInput
          value={finalUrl}
          readOnly
          aria-label="Share link"
          style={{ flex: 1, minWidth: 200 }}
          onFocus={(e: FocusEvent<HTMLInputElement>) => e.currentTarget.select()}
        />
        <Button onClick={() => props.onCopy(finalUrl)} leftSection={<Copy size={16} />}>
          Copy link
        </Button>
      </Group>

      {/* DEV-GATED: embed password + branded QR card */}
      {FEATURES.embedPassword && props.isEncrypted && props.password && (
        <Paper withBorder radius="md" p="md" mt="md">
          <Stack gap="sm">
            <Switch
              label="Embed password in the link (easier, less safe)"
              description="Anyone with this combined link can open the file. Only share it with people you trust."
              checked={embed}
              onChange={(e) => setEmbed(e.currentTarget.checked)}
            />
            <Group gap={8}>
              <Button
                size="compact-xs"
                variant="outline"
                color="brand"
                leftSection={<QrCode size={12} />}
                onClick={() => setShowCard((v) => !v)}
              >
                {showCard ? "Hide share card" : "Show share card"}
              </Button>
            </Group>

            {showCard && cardUrl && (
              <Stack gap="sm" align="center" pt="xs">
                <img
                  src={cardUrl}
                  alt="VaultHub share card with QR code"
                  style={{ width: "100%", maxWidth: 300, borderRadius: 16, border: "1px solid var(--mantine-color-default-border)" }}
                />
                <Group gap={8} wrap="wrap" justify="center">
                  <Button size="compact-xs" color="blue" leftSection={<Copy size={12} />} onClick={copyImage}>
                    Copy image
                  </Button>
                  <Button size="compact-xs" variant="light" color="blue" leftSection={<Download size={12} />} onClick={downloadImage}>
                    Download
                  </Button>
                  {canShare && (
                    <Button size="compact-xs" variant="outline" color="brand" leftSection={<Share2 size={12} />} onClick={shareImage}>
                      Share
                    </Button>
                  )}
                </Group>
              </Stack>
            )}
          </Stack>
        </Paper>
      )}

      {/* Hidden QR canvas used as the source for the branded card */}
      {FEATURES.embedPassword && props.isEncrypted && props.password && (
        <div ref={qrRef} style={{ position: "absolute", left: -9999, top: 0 }} aria-hidden="true">
          <QRCodeCanvas value={finalUrl} size={420} />
        </div>
      )}

      {/* Password box (the safe default flow) */}
      {props.isEncrypted && props.password && (
        <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-light)">
          <Group justify="space-between" wrap="wrap" gap={8}>
            <Group gap={8} wrap="wrap">
              <KeyRound size={15} style={{ color: "var(--mantine-color-blue-7)", flexShrink: 0 }} />
              <Text fz="xs" fw={700} c="var(--mantine-color-blue-8)">The password (your only copy)</Text>
            </Group>
            <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={props.onCopyPassword}>
              Copy
            </Button>
          </Group>
          <Text fz="sm" fw={600} mt={6} style={{ fontFamily: "monospace" }}>{props.password}</Text>
          <Text fz={11} c="dimmed" mt={6}>
            The link won't open without it, and we never store it. Tip: send the link and the password in two different apps.
          </Text>
        </Paper>
      )}

      {/* Status strip */}
      {props.copied && (
        <Paper withBorder radius="md" px="md" py={10} mt="md" bg="var(--mantine-color-blue-light)">
          <Group justify="space-between" wrap="wrap" gap={8}>
            <Group gap={14} wrap="wrap">
              <Text fz="xs" c="dimmed">
                <Download size={13} style={{ verticalAlign: -2 }} /> {props.maxDownloads} download{props.maxDownloads > 1 ? "s" : ""} left
              </Text>
              <Text fz={11} c="dimmed">
                <Clock size={13} style={{ verticalAlign: -2 }} /> {props.timeLeft}
              </Text>
            </Group>
            <Group gap={6}>
              <Button size="compact-xs" variant="outline" color="brand" onClick={() => props.onCopy(finalUrl)} aria-label="Copy link again">
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