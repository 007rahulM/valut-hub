import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Box, Card, Container, Group, Loader, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Clock, Download, HardDrive } from "lucide-react";
import { FileDropzone } from "../components/FileDropzone";
import { UploadOptions } from "../components/upload/UploadOptions";
import { ShareLinkCard } from "../components/upload/ShareLinkCard";
import { InfoBanner } from "../components/InfoBanner";
import { Term } from "../components/Term";
import { validatePassword } from "../lib/password";
import { uploadLargeFileV2, type MultipartEventV2, type MultipartProgressV2 } from "../lib/multipart-v2/multipartEngine.v2";
import { abortMultipartV2 } from "../lib/multipart-v2/multipartApi.v2";
import { clearCheckpointV2, listCheckpointsV2, type V2UploadCheckpoint } from "../lib/resumeStore.v2";
  
const MAX_FILE_SIZE_V2 = 500 * 1024 * 1024;
const MIN_FILE_SIZE_V2 = 16 * 1024 * 1024;
const EXPIRY_SECONDS_V2 = 24 * 60 * 60;
const MAX_DOWNLOADS_V2 = 10;

function formatBytesV2(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function hashPasswordV2ForPage(password: string): Promise<string> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(password)).then((digest) => (
    Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")
  ));
}

export default function MultipartV2UploadTestPage() {
  const [step, setStep] = useState<"drop" | "options" | "link">("drop");
  const [file, setFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [password, setPassword] = useState("");
  const [maxDownloads, setMaxDownloads] = useState(MAX_DOWNLOADS_V2);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [progress, setProgress] = useState<MultipartProgressV2 | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState("24h 0m 0s");
  const [events, setEvents] = useState<MultipartEventV2[]>([]);
  const [interrupted, setInterrupted] = useState<V2UploadCheckpoint | null>(null);
  const [resumeDecision, setResumeDecision] = useState<"resume" | "fresh" | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void listCheckpointsV2().then((checkpoints) => setInterrupted(checkpoints[0] ?? null));
  }, []);

  useEffect(() => {
    if (!createdAt) return undefined;
    const interval = window.setInterval(() => {
      const difference = Math.max(0, createdAt + EXPIRY_SECONDS_V2 * 1000 - Date.now());
      const hours = Math.floor(difference / 3_600_000);
      const minutes = Math.floor((difference % 3_600_000) / 60_000);
      const seconds = Math.floor((difference % 60_000) / 1_000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [createdAt]);

  const selectFile = useCallback((selected: File) => {
    setFile(selected);
    setStep("options");
    setFailed(null);
    setProgress(null);
    setResumeDecision(null);
    void listCheckpointsV2().then((checkpoints) => {
      const match = checkpoints.find((checkpoint) => checkpoint.fileName === selected.name && checkpoint.fileSize === selected.size) ?? null;
      setInterrupted(match);
    });
    toast.success(`Selected: ${selected.name}`, { duration: 2_500 });
  }, []);


  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }
    if (file.size < MIN_FILE_SIZE_V2) {
      toast.error("This V2 test page needs a file of at least 16 MiB.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_V2) {
      toast.error("The maximum file size is 500 MB.");
      return;
    }
    if (isEncrypted && !validatePassword(password).valid) {
      toast.error("Use a password with at least 8 characters, upper case, lower case, number, and symbol.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms and Privacy Policy.");
      return;
    }
    if (interrupted && interrupted.fileName === file.name && interrupted.fileSize === file.size && !resumeDecision) {
      toast.error("Choose Resume or Start Fresh for the interrupted upload first.");
      return;
    }
    if (resumeDecision === "fresh" && interrupted) {
      await abortMultipartV2(interrupted.token, interrupted.uploadId).catch(() => undefined);
      await clearCheckpointV2(interrupted.fileName, interrupted.fileSize);
      setInterrupted(null);
    }
    if (!navigator.onLine) {
      setFailed("You are offline. Check your internet, then press Try Again / Resume Upload.");
      return;
    }

    setFailed(null);
    setProgress(null);
    setEvents([{ timestamp: new Date().toLocaleTimeString(), level: "info", message: "Upload button clicked" }]);
    setIsWorking(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const result = await uploadLargeFileV2(file, {
        signal: controller.signal,
        password: isEncrypted ? password : undefined,
        passwordHash: isEncrypted ? await hashPasswordV2ForPage(password) : null,
        concurrency: 4,
        onProgress: setProgress,
        onEvent: (event) => setEvents((current) => [...current.slice(-39), event]),
      });
      setShareUrl(result);
      setCreatedAt(Date.now());
      setStep("link");
      toast.success("Upload complete");
    } catch (error) {
      const message = error instanceof Error ? error.message : "V2 upload failed.";
      setFailed(message.includes("cancel")
        ? "Upload cancelled. The temporary session and local checkpoint were cleaned up."
        : `Upload paused: ${message} Press Try Again / Resume Upload.`);
    } finally {
      controllerRef.current = null;
      setIsWorking(false);
    }
  };

  const cancelUpload = () => {
    controllerRef.current?.abort();
  };

  const reset = () => {
    setStep("drop");
    setFile(null);
    setPassword("");
    setShareUrl(null);
    setCopied(false);
    setCreatedAt(null);
    setFailed(null);
    setProgress(null);
    setEvents([]);
    setInterrupted(null);
    setResumeDecision(null);
  };

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied", { duration: 2_000 });
  };

  const phaseLabel = progress?.phase === "encrypting"
    ? "Locking your file on this device"
    : progress?.phase === "completing"
      ? "Finishing your secure link"
      : "Uploading your file";

  return (
    <Container size="xl" py={{ base: "md", sm: "xl" }}>
      <Paper withBorder p="xs" mb="md" ta="center">
        <Text fz="xs" c="dimmed">Development-only V2 test page. The normal UploadPage is not changed by this screen.</Text>
      </Paper>

      {step === "drop" && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <FileDropzone onFileSelect={selectFile} maxSize={MAX_FILE_SIZE_V2} />
            <Stack justify="center" gap="md">
              <Title order={2}>Simple, private file sharing</Title>
              <Text c="dimmed" fz="sm" lh={1.8}>
                This page uses the V2 path for files from 16 MiB to 500 MB. Your file is locked in your browser before upload when encryption is enabled.
              </Text>
              <Stack gap={6} mt={4}>
                <Group gap={8}><HardDrive size={15} color="var(--mantine-color-blue-6)" /><Text fz="xs" c="dimmed">Test files up to 500 MB.</Text></Group>
                <Group gap={8}><Clock size={15} color="var(--mantine-color-blue-6)" /><Text fz="xs" c="dimmed">Links expire after 1 day.</Text></Group>
                <Group gap={8}><Download size={15} color="var(--mantine-color-blue-6)" /><Text fz="xs" c="dimmed">Links allow 10 downloads.</Text></Group>
              </Stack>
            </Stack>
          </SimpleGrid>
          <Box mt="lg"><InfoBanner>Choose a 16 MiB–500 MB file. This separate page is where we test V2 before connecting it to the real UploadPage.</InfoBanner></Box>
          {interrupted && (
            <Paper withBorder radius="md" p="md" mt="md">
              <Text fw={700} fz="sm">Interrupted upload found</Text>
              <Text fz="xs" c="dimmed" mt={4}>{interrupted.fileName} — {interrupted.completedParts.length}/{interrupted.totalParts} parts saved.</Text>
              <Text fz="xs" mt={6}>Select the same file, then choose Resume to continue with the original password, or Start Fresh to cancel the old session and begin again.</Text>
              <Group mt="sm">
                <button type="button" onClick={() => setResumeDecision("resume")}>Resume</button>
                <button type="button" onClick={() => setResumeDecision("fresh")}>Start Fresh</button>
              </Group>
            </Paper>
          )}
        </Card>
      )}

      {step === "options" && file && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
          <UploadOptions
            fileName={file.name}
            fileSizeLabel={formatBytesV2(file.size)}
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
            onRemoveFile={() => { if (!isWorking) { setFile(null); setStep("drop"); } }}
            progress={progress?.percent ?? 0}
            chatter={phaseLabel}
            onCancel={cancelUpload}
            resumeLabel={failed ? "Try Again / Resume Upload" : "Upload"}
          />
          {isWorking && progress?.phase === "encrypting" && <Text fz="xs" c="dimmed" mt="xs">The browser is locking one part at a time. Your password is not sent to S3.</Text>}
          {failed && !isWorking && <Box mt="md"><InfoBanner color="red">{failed}</InfoBanner></Box>}
          {events.length > 0 && (
            <Paper withBorder radius="md" p="sm" mt="md" style={{ maxHeight: 220, overflowY: "auto" }}>
              <Text fz="xs" fw={700} mb={6}>Development upload timeline</Text>
              <Stack gap={4}>
                {events.map((event, index) => (
                  <Text key={`${index}-${event.message}`} fz="xs" c={event.level === "error" ? "red" : event.level === "warn" ? "orange" : "dimmed"}>
                    {event.timestamp} — {event.level === "error" ? "ERROR" : event.level === "warn" ? "WAIT" : "OK"} — {event.message}{event.details?.elapsedMs !== undefined ? ` (${event.details.elapsedMs} ms)` : ""}{event.details?.partNumber !== undefined ? ` [part ${event.details.partNumber}]` : ""}
                  </Text>
                ))}
              </Stack>
            </Paper>
          )}
          <Text fz="xs" c="dimmed" mt="md"><Term tip="V2 sends the large file directly to S3 in parallel parts. The backend coordinates the session but does not receive the large file bytes.">How this test works</Term></Text>
          <Text fz="xs" c="dimmed" mt={4}>The detailed timeline is development-only and is not shown to normal users.</Text>
        </Card>
      )}

      {step === "link" && shareUrl && file && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
          <ShareLinkCard
            shareUrl={shareUrl}
            copied={copied}
            isEncrypted={isEncrypted}
            password={password}
            fileName={file.name}
            onCopy={copyLink}
            onCopyPassword={() => { void navigator.clipboard.writeText(password); toast.success("Password copied"); }}
            maxDownloads={maxDownloads}
            timeLeft={timeLeft}
            onReset={reset}
          />
          <Group justify="center" mt="md"><Loader size={14} color="var(--mantine-color-green-6)" /><Text fz="xs" c="dimmed">V2 upload completed. The share link is ready.</Text></Group>
        </Card>
      )}
    </Container>
  );
}
