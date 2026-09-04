



import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Box, Card, Container, Group, Paper, SimpleGrid, Stack, Switch, Text, Title } from "@mantine/core";
import { Clock, Download, HardDrive } from "lucide-react";

import { FileDropzone } from "../components/FileDropzone";
import { UploadOptions } from "../components/upload/UploadOptions";
import { ShareLinkCard } from "../components/upload/ShareLinkCard";
import { InfoBanner } from "../components/InfoBanner";
import { Term } from "../components/Term";
import { CookieBanner } from "../components/CookieBanner";

import { validatePassword } from "../lib/password";
import { uploadFileV2, type UploadEngineEventV2, type UploadEngineProgressV2 } from "../lib/uploadEngine.v2";

const EXPIRY_SECONDS_V2 = 24 * 60 * 60;
const MAX_DOWNLOADS_V2 = 10;
const MAX_FILE_SIZE_V2 = 500 * 1024 * 1024;

type StepV2 = "drop" | "options" | "link";

type RestoredShareV2 = {
  shareUrl: string;
  fileName: string;
  isEncrypted: boolean;
  maxDownloads: number;
  createdAt: number;
  password: string;
};

const RESTORED_SHARE_KEY_V2 = "sendly_v2_completed_share";
const ACTIVE_UPLOAD_KEY_V2 = "sendly_v2_active_upload";

function readRestoredShareV2(): RestoredShareV2 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RESTORED_SHARE_KEY_V2);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<RestoredShareV2>;
    if (typeof saved.shareUrl !== "string" || typeof saved.fileName !== "string" || typeof saved.createdAt !== "number") return null;
    if (Date.now() - saved.createdAt > EXPIRY_SECONDS_V2 * 1000) {
      window.sessionStorage.removeItem(RESTORED_SHARE_KEY_V2);
      return null;
    }
    return {
      shareUrl: saved.shareUrl,
      fileName: saved.fileName,
      isEncrypted: saved.isEncrypted === true,
      maxDownloads: typeof saved.maxDownloads === "number" ? saved.maxDownloads : MAX_DOWNLOADS_V2,
      createdAt: saved.createdAt,
      password: typeof saved.password === "string" ? saved.password : "",
    };
  } catch {
    return null;
  }
}

function formatBytesV2(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatRemainingV2(createdAt: number | null, now: number): string {
  if (!createdAt) return "24h 0m 0s";
  const remaining = Math.max(0, createdAt + EXPIRY_SECONDS_V2 * 1000 - now);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

// ============================================================================
// MODULE-LEVEL LIVE SESSION STORE (THE NAVIGATION-PERSISTENCE FIX)
// WHY: React Router unmounts this page when you navigate to another page,
// and React state (useState) dies with the component. A plain object at
// module scope survives navigation for the whole tab lifetime.
// The in-flight XHR upload also keeps running, because we NO LONGER abort
// on unmount. When the user comes back, the component re-hydrates from this
// store and shows the exact same progress page.
// ============================================================================
type LiveSessionV2 = {
  step: StepV2;
  file: File | null;
  restoredFileName: string | null;
  isEncrypted: boolean;
  password: string;
  maxDownloads: number;
  acceptedTerms: boolean;
  isWorking: boolean;
  isPaused: boolean;
  progress: UploadEngineProgressV2 | null;
  events: UploadEngineEventV2[];
  failed: string | null;
  shareUrl: string | null;
  copied: boolean;
  createdAt: number | null;
  controller: AbortController | null;
};

const liveSession: LiveSessionV2 = {
  step: "drop",
  file: null,
  restoredFileName: null,
  isEncrypted: true,
  password: "",
  maxDownloads: MAX_DOWNLOADS_V2,
  acceptedTerms: false,
  isWorking: false,
  isPaused: false,
  progress: null,
  events: [],
  failed: null,
  shareUrl: null,
  copied: false,
  createdAt: null,
  controller: null,
};

// One-time bootstrap: if there is no live session, restore a completed share card.
if (liveSession.step === "drop" && !liveSession.file) {
  const restored = readRestoredShareV2();
  if (restored) {
    liveSession.step = "link";
    liveSession.shareUrl = restored.shareUrl;
    liveSession.restoredFileName = restored.fileName;
    liveSession.isEncrypted = restored.isEncrypted;
    liveSession.password = restored.password;
    liveSession.maxDownloads = restored.maxDownloads;
    liveSession.createdAt = restored.createdAt;
  }
}

export default function UploadPageV2() {
  // Hydrate every piece of state FROM the live store on mount,
  // so coming back from another page looks exactly like never leaving.
  const [step, setStep] = useState<StepV2>(liveSession.step);
  const [file, setFile] = useState<File | null>(liveSession.file);
  const [restoredFileName, setRestoredFileName] = useState<string | null>(liveSession.restoredFileName);
  const [isEncrypted, setIsEncrypted] = useState(liveSession.isEncrypted);
  const [password, setPassword] = useState(liveSession.password);
  const [maxDownloads, setMaxDownloads] = useState(liveSession.maxDownloads);
  const [acceptedTerms, setAcceptedTerms] = useState(liveSession.acceptedTerms);
  const [isWorking, setIsWorking] = useState(liveSession.isWorking);
  const [isPaused, setIsPaused] = useState(liveSession.isPaused);
  const [progress, setProgress] = useState<UploadEngineProgressV2 | null>(liveSession.progress);
  const [events, setEvents] = useState<UploadEngineEventV2[]>(liveSession.events);
  const [failed, setFailed] = useState<string | null>(liveSession.failed);
  const [shareUrl, setShareUrl] = useState<string | null>(liveSession.shareUrl);
  const [copied, setCopied] = useState(liveSession.copied);
  const [createdAt, setCreatedAt] = useState<number | null>(liveSession.createdAt);
  const [now, setNow] = useState(() => Date.now());
  const [showDeveloperDetails, setShowDeveloperDetails] = useState(false);

  // Countdown timer for the share card
  useEffect(() => {
    if (!createdAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [createdAt]);

  // F5 / tab-close protection ONLY while working (kept as you confirmed it is correct)
  useEffect(() => {
    if (!isWorking) return undefined;
    const warnBeforeReload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeReload);
    return () => window.removeEventListener("beforeunload", warnBeforeReload);
  }, [isWorking]);

  // NOTE: There is intentionally NO "abort on unmount" effect anymore.
  // Navigating away must NOT cancel the upload.

  const handleFileSelectV2 = useCallback((selected: File): void => {
    liveSession.file = selected;
    liveSession.restoredFileName = null;
    liveSession.shareUrl = null;
    liveSession.createdAt = null;
    liveSession.step = "options";
    liveSession.failed = null;
    liveSession.progress = null;
    liveSession.events = [];
    liveSession.isPaused = false;

    setFile(selected);
    setRestoredFileName(null);
    setShareUrl(null);
    setCreatedAt(null);
    setStep("options");
    setFailed(null);
    setProgress(null);
    setEvents([]);
    setIsPaused(false);
    toast.success(`Selected: ${selected.name}`, { duration: 2_500 });
  }, []);

  // The ONLY place that aborts + cleans. Triggered only by explicit user actions
  // (X on share card, "Share another file", "Cancel & Clean Up").
  const handleExplicitCleanup = useCallback((): void => {
    if (liveSession.controller) {
      liveSession.controller.abort();
      liveSession.controller = null;
    }
    window.sessionStorage.removeItem(ACTIVE_UPLOAD_KEY_V2);
    window.sessionStorage.removeItem(RESTORED_SHARE_KEY_V2);

    liveSession.step = "drop";
    liveSession.file = null;
    liveSession.restoredFileName = null;
    liveSession.password = "";
    liveSession.acceptedTerms = false;
    liveSession.shareUrl = null;
    liveSession.copied = false;
    liveSession.createdAt = null;
    liveSession.progress = null;
    liveSession.events = [];
    liveSession.failed = null;
    liveSession.isWorking = false;
    liveSession.isPaused = false;

    setFailed(null);
    setEvents([]);
    setStep("drop");
    setFile(null);
    setRestoredFileName(null);
    setPassword("");
    setAcceptedTerms(false);
    setShareUrl(null);
    setCopied(false);
    setCreatedAt(null);
    setProgress(null);
    setIsWorking(false);
    setIsPaused(false);
  }, []);

  const handleUploadV2 = async (): Promise<void> => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_V2) {
      setFailed("This file is larger than the 500 MB limit.");
      liveSession.failed = "This file is larger than the 500 MB limit.";
      return;
    }
    if (isEncrypted && !validatePassword(password).valid) {
      toast.error("Password needs at least 8 characters, upper/lowercase, a number, and a symbol.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms & Privacy Policy.");
      return;
    }
    if (!navigator.onLine) {
      const msg = "You're offline. Check your internet, then press Upload again.";
      setFailed(msg);
      liveSession.failed = msg;
      return;
    }

    const controller = new AbortController();
    liveSession.controller = controller;
    liveSession.failed = null;
    liveSession.progress = null;
    liveSession.events = [];
    liveSession.isPaused = false;
    liveSession.isWorking = true;

    setFailed(null);
    setProgress(null);
    setEvents([]);
    setIsPaused(false);
    setIsWorking(true);

if (import.meta.env.DEV) {
  console.log("FRONTEND: About to send maxDownloads=", maxDownloads);
}

    try {
      const newShareUrl = await uploadFileV2(file, {
        signal: controller.signal,
        password: isEncrypted ? password : undefined,
        maxDownloads,
        expirySeconds: EXPIRY_SECONDS_V2,
        // Wrapped callbacks: keep updating the module store even if the
        // component is unmounted (user navigated away).
        onProgress: (p) => {
          liveSession.progress = p;
          setProgress(p);
        },
        onEvent: (event) => {
          liveSession.events = [...liveSession.events.slice(-79), event];
          setEvents(liveSession.events);
        },
      });

      const completedAt = Date.now();
      const savedShare: RestoredShareV2 = {
        shareUrl: newShareUrl,
        fileName: file.name,
        isEncrypted,
        maxDownloads,
        createdAt: completedAt,
        password: isEncrypted ? password : "",
      };
      window.sessionStorage.setItem(RESTORED_SHARE_KEY_V2, JSON.stringify(savedShare));
      window.sessionStorage.removeItem(ACTIVE_UPLOAD_KEY_V2);

      liveSession.shareUrl = newShareUrl;
      liveSession.restoredFileName = file.name;
      liveSession.createdAt = completedAt;
      liveSession.step = "link";
      liveSession.isWorking = false;
      liveSession.isPaused = false;
      liveSession.controller = null;

      setShareUrl(newShareUrl);
      setRestoredFileName(file.name);
      setCreatedAt(completedAt);
      setStep("link");
      toast.success("Upload complete");
    } catch (error) {
      const errObj = error instanceof Error ? error : new Error(String(error));
      const errCode = (error as { code?: string })?.code || "NO_CODE";

      const crashEvent: UploadEngineEventV2 = {
        timestamp: new Date().toLocaleTimeString(),
        level: "error",
        message: `CRASH: ${errObj.message || "Unknown error"} | Code: ${errCode} | At: ${errObj.stack?.split("\n")[1]?.trim() || "No stack trace"}`,
        mode: "single",
      };
      liveSession.events = [...liveSession.events.slice(-79), crashEvent];
      setEvents(liveSession.events);

      const message = !navigator.onLine
        ? "Your internet dropped during the upload."
        : errObj.message || "Upload failed.";
      const failedMsg = `${message} Don't worry, your file was not completed. Press Upload to try again.`;
      liveSession.failed = failedMsg;
      setFailed(failedMsg);
    } finally {
      liveSession.controller = null;
      liveSession.isWorking = false;
      liveSession.isPaused = false;
      setIsWorking(false);
      setIsPaused(false);
    }
  };

  const copyLinkV2 = async (url: string): Promise<void> => {
    await navigator.clipboard.writeText(url);
    liveSession.copied = true;
    setCopied(true);
    toast.success("Link copied", { duration: 2_000 });
  };

  const progressPercent = progress?.percent ?? 0;
  const phaseText = progress?.phase === "starting"
    ? "Checking file safety and preparing"
    : progress?.phase === "encrypting"
    ? "Encrypting your file with AES-GCM"
    : progress?.phase === "uploading"
    ? `Uploading part ${Math.min((progress?.completedParts ?? 0) + 1, progress?.totalParts ?? 1)} of ${progress?.totalParts ?? 1}`
    : progress?.phase === "completing"
    ? "Securing your share link"
    : progress?.phase === "complete"
    ? "Your link is ready"
    : "Preparing";

  return (
    <Container size="xl" py={{ base: "md", sm: "xl" }}>
      <CookieBanner />

      {import.meta.env.DEV && (
        <Paper withBorder p="xs" mb="md">
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Sendly V2 developer mode</Text>
            <Switch size="xs" label="Show technical details" checked={showDeveloperDetails} onChange={(event) => setShowDeveloperDetails(event.currentTarget.checked)} />
          </Group>
        </Paper>
      )}

      {step === "drop" && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <FileDropzone onFileSelect={handleFileSelectV2} maxSize={MAX_FILE_SIZE_V2} />
            <Stack justify="center" gap="md">
              <Title order={2}>Simple, private file sharing</Title>
              <Text c="dimmed" fz="sm" lh={1.8}>
                Sendly lets you share files with{" "}
                <Term tip="Cryptography means your file is scrambled into a secret code on your device before upload. Only the right password can unscramble it. Even we cannot read it.">cryptography</Term>{" "}
                and a{" "}
                <Term tip="After 1 day, or after the number of downloads you choose, the link stops working and the file is deleted forever. Nothing stays online">temporary cloud storage & link</Term>{" "}
                Only the person you send it to can open the file
              </Text>
              <Stack gap={6} mt={4}>
                <Group gap={8}><HardDrive size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Share files up to 500 MB.</Text></Group>
                <Group gap={8}><Clock size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Keep link open for up to 1 day.</Text></Group>
                {/* <Group gap={8}><Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Link expires after up to {MAX_DOWNLOADS_V2} downloads.</Text></Group> */}
                                <Group gap={8}><Download size={15} style={{ color: "var(--mantine-color-blue-6)", flexShrink: 0 }} /><Text fz="xs" c="dimmed">Set custom download limits for your link.</Text></Group>
              </Stack>
            </Stack>
          </SimpleGrid>
          <Box mt="lg"><InfoBanner>Files are locked in your browser before upload. Only people with the link, and the password if you set one, can read them.</InfoBanner></Box>
        </Card>
      )}

      {step === "options" && file && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
          <UploadOptions
            fileName={file.name}
            fileSizeLabel={formatBytesV2(file.size)}
            maxDownloads={maxDownloads}
            onMaxDownloadsChange={(n) => { liveSession.maxDownloads = n; setMaxDownloads(n); }}
            isEncrypted={isEncrypted}
            onIsEncryptedChange={(v) => { liveSession.isEncrypted = v; setIsEncrypted(v); }}
            password={password}
            onPasswordChange={(v) => { liveSession.password = v; setPassword(v); }}
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={(v) => { liveSession.acceptedTerms = v; setAcceptedTerms(v); }}
            isWorking={isWorking}
            isPaused={isPaused}
            onUpload={handleUploadV2}
            onRemoveFile={handleExplicitCleanup}
            progress={progressPercent}
            chatter={phaseText}
            onCancel={() => { liveSession.isPaused = true; setIsPaused(true); }}
            onResume={() => { liveSession.isPaused = false; setIsPaused(false); }}
            onCancelAndCleanup={handleExplicitCleanup}
            resumeLabel={failed ? "Try Again" : "Upload"}
          />
          {failed && !isWorking && <Box mt="md"><InfoBanner color="red">{failed}</InfoBanner></Box>}
          {import.meta.env.DEV && showDeveloperDetails && events.length > 0 && (
            <Paper withBorder p="sm" mt="md" style={{ maxHeight: 280, overflowY: "auto" }}>
              <Text fz="xs" fw={700}>Developer timeline</Text>
              {events.map((event, index) => (
                <Text size="xs" key={`${index}-${event.timestamp}-${event.message}`} c={event.level === "error" ? "red" : event.level === "warn" ? "orange" : "dimmed"}>
                  {event.timestamp} — {event.message}
                </Text>
              ))}
            </Paper>
          )}
        </Card>
      )}

      {step === "link" && shareUrl && (file || restoredFileName) && (
        <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }} mx="auto" maw={{ base: 640, lg: 880 }}>
          <ShareLinkCard
            shareUrl={shareUrl}
            copied={copied}
            isEncrypted={isEncrypted}
            password={password}
            fileName={file?.name ?? restoredFileName ?? undefined}
            maxDownloads={maxDownloads}
            timeLeft={formatRemainingV2(createdAt, now)}
            onCopy={copyLinkV2}
            onCopyPassword={async () => {
              await navigator.clipboard.writeText(password);
              toast.success("Password copied");
            }}
            onReset={handleExplicitCleanup}
          />
        </Card>
      )}
    </Container>
  );
}