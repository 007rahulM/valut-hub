import { useMemo, useState } from "react";
import { Alert, Badge, Box, Button, Card, Group, Paper, Progress, Stack, Text, Textarea, Title } from "@mantine/core";
import { ArrowRight, Check, Eye, FileLock2, FileText, KeyRound, RotateCcw } from "lucide-react";

const demoTextV2 = `# Sendly demo environment file\nDEMO_APP_NAME=Sendly-Demo\nDEMO_STORAGE_PROVIDER=Example-Storage\nDEMO_BUCKET=demo-bucket-not-real\nDEMO_REGION=example-region-1\nDEMO_ENCRYPTION=Browser-AES-GCM\nDEMO_NOTE=This-file-is-safe-demo-data\n`;

export default function SendlyLearningLabV2() {
  const [videoUrl, setVideoUrl] = useState("");
  const [demoMode, setDemoMode] = useState<"plain" | "encrypted">("plain");
  const [status, setStatus] = useState("Ready. This demo never uses real secrets.");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState(false);

  const safeVideoUrl = useMemo(() => {
    if (/youtube\.com\/watch\?v=/.test(videoUrl)) return videoUrl.replace("watch?v=", "embed/");
    if (/youtu\.be\//.test(videoUrl)) return videoUrl.replace("youtu.be/", "www.youtube.com/embed/");
    return "";
  }, [videoUrl]);

  const runDemo = async () => {
    if (busy || attempts >= 3) return;
    setAttempts((value) => value + 1);
    setBusy(true);
    setResult("");
    setProgress(8);
    setStatus("Reading the safe demo file in your browser…");
    await delayV2(350);
    setProgress(35);

    if (demoMode === "encrypted") {
      setStatus("Encrypting the demo file on this device…");
      const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(demoTextV2));
      setProgress(62);
      setStatus("Encrypted bytes are unreadable until the browser decrypts them…");
      await delayV2(450);
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
      setProgress(100);
      setResult(new TextDecoder().decode(decrypted));
      setStatus("Done. The browser encrypted and decrypted the demo without sending it anywhere.");
    } else {
      setStatus("Preparing a normal browser Blob preview…");
      await delayV2(450);
      setProgress(100);
      setResult(demoTextV2);
      setStatus("Done. The browser opened the normal demo data as text.");
    }
    setBusy(false);
  };

  return (
    <Stack gap="lg">
      <Card withBorder radius="lg" p="xl">
        <Group justify="space-between" align="flex-start">
          <div><Badge color="blue">Development learning lab</Badge><Title order={2} mt="xs">See what Sendly does</Title><Text c="dimmed" mt={4}>This is safe demo data. It never uses your real environment or passwords.</Text></div>
          <FileLock2 size={34} aria-hidden />
        </Group>
      </Card>

      <Card withBorder radius="lg" p="xl">
        <Group justify="space-between" align="flex-start">
          <div><Title order={3}>How the file travels</Title><Text c="dimmed" fz="sm" mt={4}>A temporary illustration is used here so you can understand the flow before adding your final artwork.</Text></div>
          <Box component="img" src="/illustrations/process-v2.svg" alt="File process illustration" w={180} h={110} style={{ objectFit: "contain" }} />
        </Group>
        <Text c="dimmed" fz="sm" mt={4}>The browser prepares the file, HTTPS protects the connection, and storage keeps the uploaded bytes until the link expires.</Text>
        <Group justify="center" gap="md" mt="lg" wrap="nowrap">
          <FlowNodeV2 icon={<FileText size={18} />} label="Browser" />
          <ArrowRight className="sendly-v2-flow-arrow" />
          <FlowNodeV2 icon={<KeyRound size={18} />} label="HTTPS" />
          <ArrowRight className="sendly-v2-flow-arrow" />
          <FlowNodeV2 icon={<FileLock2 size={18} />} label="Storage" />
        </Group>
        <Text fz="xs" c="dimmed" mt="md">Plain file: normal bytes are uploaded. Encrypted file: the browser locks the bytes first, and the recipient’s browser unlocks them after the correct password is entered.</Text>
      </Card>

      <Card withBorder radius="lg" p="xl">
        <Title order={3}>Explanation video</Title>
        <TextInputV2 value={videoUrl} onChange={setVideoUrl} />
        {safeVideoUrl ? <Box component="iframe" title="Sendly explanation" src={safeVideoUrl} w="100%" h={280} mt="md" style={{ border: 0, borderRadius: 12 }} /> : <Box component="video" src="/demo-v2/sendly-how-it-works-v2.mp4" autoPlay muted loop playsInline controls w="100%" mt="md" style={{ borderRadius: 12, maxHeight: 360 }} />}
      </Card>

      <Card withBorder radius="lg" p="xl">
        <Group justify="space-between" align="flex-start"><div><Title order={3}>Try the safe demo file</Title><Text c="dimmed" fz="sm">This fake `.env.example` file contains no real key.</Text></div><Box component="img" src="/illustrations/undraw-design-notes-v2.svg" alt="Demo notes illustration" w={150} h={95} style={{ objectFit: "contain" }} /><Eye size={22} /></Group>
        <Paper withBorder p="sm" mt="md"><Text fz="xs" ff="monospace" style={{ whiteSpace: "pre-wrap" }}>{demoTextV2}</Text></Paper>
        <Group mt="md"><Button variant={demoMode === "plain" ? "filled" : "light"} onClick={() => setDemoMode("plain")} disabled={busy}>Normal preview</Button><Button variant={demoMode === "encrypted" ? "filled" : "light"} onClick={() => setDemoMode("encrypted")} disabled={busy}>Encrypt then decrypt</Button></Group>
        <Button mt="md" leftSection={<RotateCcw size={16} />} onClick={() => void runDemo()} disabled={busy || attempts >= 3}>{attempts >= 3 ? "Demo limit reached" : `Run demo (${attempts}/3 used)`}</Button>
        <Progress value={progress} animated={busy} mt="md" />
        <Text fz="sm" mt="sm">{status}</Text>
        {result && <Alert icon={<Check size={17} />} color="green" mt="md" title="Browser result"><Textarea value={result} readOnly minRows={7} autosize /></Alert>}
      </Card>
    </Stack>
  );
}

function FlowNodeV2({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <Paper withBorder radius="xl" px="md" py="xs"><Group gap={6}>{icon}<Text fz="sm" fw={600}>{label}</Text></Group></Paper>;
}

function TextInputV2({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label style={{ display: "block", marginTop: 12 }}><Text fz="sm" fw={500}>Optional YouTube URL</Text><input value={value} onChange={(event) => onChange(event.currentTarget.value)} placeholder="Paste your explanation video URL later" style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8, border: "1px solid var(--mantine-color-default-border)" }} /></label>;
}

function delayV2(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
