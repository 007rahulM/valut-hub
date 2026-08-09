

// ============================================================
// UploadPage — THE SENDER'S VIEW (3 windows, like the PDF)
//
// FLOW:
//   "drop"    → FileDropzone + hero text (tooltips on technical words)
//               + 3 quiet facts + one trust banner
//   "options" → UploadOptions (file row, limits, encryption, password)
//               + live progress panel (blue, thin) + failure banner
//   "link"    → ShareLinkCard (link + password copy + status + ⭐)
//
// Heavy logic (AES-GCM, presigned URLs) stays in src/lib/* — untouched.
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Card, Container, Group, Loader, Paper, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Clock, Download, HardDrive } from "lucide-react";
import { FileDropzone } from "../components/FileDropzone";
import { UploadOptions } from "../components/upload/UploadOptions";
import { ShareLinkCard } from "../components/upload/ShareLinkCard";
import { InfoBanner } from "../components/InfoBanner";
import { Term } from "../components/Term";
import { requestUploadUrl, uploadFileToS3WithProgress } from "../lib/api";
import { encryptFile } from "../lib/crypto";

const EXPIRY_SECONDS = 24 * 60 * 60; // 1 day ONLY
const MAX_DOWNLOADS = 10;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

// SHA-256 of the password = the verifier the backend stores (NOT the key)
async function hashPassword(password: string): Promise<string> {
  const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function UploadPage() {
  const [step, setStep] = useState<"drop" | "options" | "link">("drop");
  const [file, setFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [password, setPassword] = useState("");
  // const [maxDownloads, setMaxDownloads] = useState(1);
  const [maxDownloads, setMaxDownloads] = useState(10);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isWorking, setIsWorking] = useState(false);
  const [stage, setStage] = useState<"encrypting" | "uploading">("encrypting");
  const [progress, setProgress] = useState(0);
  const [slowNote, setSlowNote] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const startRef = useRef(0);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState("24h 0m 0s");

  // Live countdown shown in the status strip once the link exists
  useEffect(() => {
    if (!createdAt) return;
    const interval = window.setInterval(() => {
      const diff = Math.max(0, createdAt + EXPIRY_SECONDS * 1000 - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [createdAt]);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f); setStep("options"); setFailed(null);
    toast.success(`Selected: ${f.name}`, { duration: 2500 });
  }, []);

  // encrypt → register → PUT bytes to S3 (with progress + offline abort)
  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file.");
    if (isEncrypted && password.length < 8) return toast.error("Password needs at least 8 characters.");
    if (!acceptedTerms) return toast.error("Please accept the Terms & Privacy Policy.");
    if (!navigator.onLine) { setFailed("You're offline. Check your internet, then press Upload again."); return; }

    setFailed(null); setSlowNote(false); setProgress(0); setIsWorking(true); setStage("encrypting");
    const controller = new AbortController();
    const goOffline = () => controller.abort();
    window.addEventListener("offline", goOffline);

    try {
      let fileToUpload: File | Blob = file;
      let salt: string | null = null;
      let iv: string | null = null;

      if (isEncrypted) {
        const enc = await encryptFile(file, password);
        fileToUpload = enc.encryptedFile; salt = enc.salt; iv = enc.iv;
      }

      setStage("uploading");
      startRef.current = Date.now();
      const metadata = {
        originalName: file.name,
        mimeType: isEncrypted ? "application/octet-stream" : file.type,
        sizeBytes: fileToUpload.size,
        isEncrypted,
        passwordHash: isEncrypted ? await hashPassword(password) : null,
        iv, salt,
        expirySeconds: EXPIRY_SECONDS,
        maxDownloads,
      };
      const res = await requestUploadUrl(metadata);
      const { presignedUrl, shareUrl: newShareUrl } = res.data;

      await uploadFileToS3WithProgress(presignedUrl, fileToUpload as File, {
        signal: controller.signal,
        onProgress: (p) => {
          setProgress(p);
          if (Date.now() - startRef.current > 6000 && p < 90) setSlowNote(true);
        },
        onStall: () => setSlowNote(true),
      });

      setShareUrl(newShareUrl); setCreatedAt(Date.now()); setStep("link");
      toast.success("Upload complete!");
    } catch (err) {
      const base = !navigator.onLine
        ? "Your internet dropped during the upload."
        : err instanceof Error ? err.message : "Upload failed.";
      setFailed(`${base} Don't worry — your file never left your device. Press Upload to try again.`);
    } finally {
      window.removeEventListener("offline", goOffline);
      setIsWorking(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!", { duration: 2000 });
  };

  const reset = () => {
    setStep("drop"); setFile(null); setPassword("");
    setShareUrl(null); setCopied(false); setCreatedAt(null); setFailed(null);
  };

  return (
    <Container size="lg" py={{ base: "md", sm: "xl" }}>
      {/* ---------- WINDOW 1: drop + explanation ---------- */}
      {step === "drop" && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <FileDropzone onFileSelect={handleFileSelect} />
            <Stack justify="center" gap="md">
              <Title order={2}>Simple, private file sharing</Title>
              <Text c="dimmed" fz="sm" lh={1.8}>
                VaultHub lets you share files with{" "}
                <Term tip="Your file is locked on YOUR device before upload. Only someone with the link (and the password, if you set one) can ever open it — even we cannot.">
                  end-to-end encryption
                </Term>{" "}
                and a{" "}
                <Term tip="The link deletes itself after 1 day or after the downloads you choose. Nothing stays online forever.">
                  link that automatically expires
                </Term>. Only the person you send it to can download the file.
              </Text>
              <Stack gap={6} mt={4}>
                <Group gap={8}>
                  <HardDrive size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
                  <Text fz="xs" c="dimmed">Share files up to 500 MB.</Text>
                </Group>
                <Group gap={8}>
                  <Clock size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
                  <Text fz="xs" c="dimmed">Keep link open for up to 1 day.</Text>
                </Group>
                <Group gap={8}>
                  <Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} />
                  <Text fz="xs" c="dimmed">Link expires after up to {MAX_DOWNLOADS} downloads.</Text>
                </Group>
              </Stack>
            </Stack>
          </SimpleGrid>
          <Group mt="lg">
            <InfoBanner>
              Files are locked in your browser before upload — only people with the link
              (and the password, if you set one) can ever read them.
            </InfoBanner>
          </Group>
        </Card>
      )}

      {/* ---------- WINDOW 2: options + progress ---------- */}
      {step === "options" && file && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={640}>
          <UploadOptions
            fileName={file.name}
            fileSizeLabel={formatBytes(file.size)}
            maxDownloads={maxDownloads}
            onMaxDownloadsChange={setMaxDownloads}
            isEncrypted={isEncrypted}
            onIsEncryptedChange={setIsEncrypted}
            password={password}
            onPasswordChange={setPassword}
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={setAcceptedTerms}
            isWorking={isWorking}
            onUpload={handleUpload}
            onRemoveFile={() => { setFile(null); setStep("drop"); }}
          />

          {/* NEW loading design: thin blue bar, stage label, % on the right */}
          {isWorking && (
            <Paper withBorder radius="md" p="md" mt="md">
              <Group justify="space-between" mb={6}>
                <Group gap={8}>
                  <Loader size={14} color="var(--mantine-color-blue-6)" />
                  <Text fz="sm" fw={600}>
                    {stage === "encrypting" ? "Locking your file on this device…" : "Uploading your file…"}
                  </Text>
                </Group>
                {stage === "uploading" && <Text fz="xs" c="dimmed" fw={700}>{progress}%</Text>}
              </Group>
              <Progress
                value={stage === "encrypting" ? 100 : progress}
                size={6}
                radius="xl"
                color="var(--mantine-color-blue-6)"
                striped={stage === "encrypting"}
                animated
              />
              {slowNote && (
                <Text fz="xs" c="dimmed" mt={6}>
                  Connection looks slow — hang tight, we're still working.
                </Text>
              )}
            </Paper>
          )}

          {failed && !isWorking && (
            <Group mt="md">
              <InfoBanner color="red">{failed}</InfoBanner>
            </Group>
          )}
        </Card>
      )}

      {/* ---------- WINDOW 3: link ready ---------- */}
      {step === "link" && shareUrl && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={640}>
          <ShareLinkCard
            shareUrl={shareUrl}
            copied={copied}
            isEncrypted={isEncrypted}
            password={password}
            onCopyPassword={() => { navigator.clipboard.writeText(password); toast.success("Password copied!"); }}
            maxDownloads={maxDownloads}
            timeLeft={timeLeft}
            onCopy={handleCopy}
            onReset={reset}
          />
        </Card>
      )}
    </Container>
  );
}

export default UploadPage;