// ============================================================
// UploadOptions - the options window (step 2 of the sender flow)
// The X (remove file) sits in the TOP-RIGHT corner of the card,
// where users expect a close/remove control.
// Downloads selector is commented out for launch (locked to 10).
// ============================================================
import {
  ActionIcon, Button, Checkbox, Group, Paper, PasswordInput,
  SimpleGrid, Stack, Switch, Text, TextInput,
} from "@mantine/core";
import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { generateStrongPassword } from "../../lib/password";
import { Illustration } from "../Illustration";

interface UploadOptionsProps {
  fileName: string;
  fileSizeLabel: string;
  maxDownloads: number;
  onMaxDownloadsChange: (n: number) => void;
  isEncrypted: boolean;
  onIsEncryptedChange: (v: boolean) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  acceptedTerms: boolean;
  onAcceptedTermsChange: (v: boolean) => void;
  isWorking: boolean;
  onUpload: () => void;
  onRemoveFile: () => void;
}

export function UploadOptions(props: UploadOptionsProps) {
  const tooShort = props.password.length > 0 && props.password.length < 8;
  const strongEnough = props.password.length >= 8;

  // Fill the password with a strong generated one
  const suggest = () => {
    props.onPasswordChange(generateStrongPassword());
    toast.success("Strong password suggested", { duration: 2500 });
  };

  // Copy the current password to clipboard
  const copyPassword = () => {
    navigator.clipboard.writeText(props.password);
    toast.success("Password copied!", { duration: 2000 });
  };

  return (
    <>
      {/* Remove-file button: top-right corner of the card */}
      <Group justify="flex-end">
        <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile}
          aria-label="Remove file" disabled={props.isWorking}>
          <X size={16} />
        </ActionIcon>
      </Group>

      <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />

      {/* File identity row */}
      <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
        <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
          style={{ display: "grid", placeItems: "center" }}>
          <FileIcon size={20} />
        </Paper>
        <div>
          <Text fw={600} lineClamp={1}>{props.fileName}</Text>
          <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
        </div>
      </Group>

      <Text fz="sm" c="dimmed" mt="md">
        Two quick choices, then you're set.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
        <TextInput label="Link expires after" value="1 day (default)" disabled />

        {/* TODO (later): re-enable the downloads selector when backend supports custom limits.
        <Select
          label="Number of downloads"
          data={Array.from({ length: 10 }, (_, i) => ({
            value: String(i + 1),
            label: `${i + 1} download${i > 0 ? "s" : ""}`,
          }))}
          value={String(props.maxDownloads)}
          onChange={(v) => props.onMaxDownloadsChange(Number(v ?? "1"))}
          disabled={props.isWorking}
        />
        */}
        <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md" mt="md">
        <Switch
          label="Encrypt file (recommended)"
          description="Locked on your device before upload. We can never read it."
          checked={props.isEncrypted}
          onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
          disabled={props.isWorking}
        />
        {props.isEncrypted && (
          <Stack gap="xs" mt="sm">
            <PasswordInput
              label="Password"
              placeholder="Add a password (min 8 characters)"
              value={props.password}
              onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
              error={tooShort ? "At least 8 characters, please." : undefined}
              disabled={props.isWorking}
            />
            {strongEnough && (
              <Text fz="xs" c="green">Looks good. Tip: longer is always stronger.</Text>
            )}
            <Group gap={8} mt={4}>
              <Button size="compact-xs" color="blue" radius="md" leftSection={<KeyRound size={12} />} onClick={suggest} disabled={props.isWorking}>
                Suggest a strong password
              </Button>
              {props.password && (
                <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={copyPassword} disabled={props.isWorking}>
                  Copy
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Paper>

      <Checkbox
        mt="md"
        label={
          <Text fz="sm" component="span">
            I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms</Link> and{" "}
            <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
          </Text>
        }
        checked={props.acceptedTerms}
        onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
        disabled={props.isWorking}
      />

      <Button
        fullWidth size="md" mt="md"
        loading={props.isWorking}
        disabled={props.isWorking || !props.acceptedTerms || (props.isEncrypted && !strongEnough)}
        onClick={props.onUpload}
      >
        {props.isWorking ? "Working..." : "Upload"}
      </Button>
    </>
  );
}

export default UploadOptions;