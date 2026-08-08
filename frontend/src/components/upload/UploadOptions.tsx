import {
  ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Select,
  SimpleGrid, Stack, Switch, Text, TextInput,
} from "@mantine/core";
import { File as FileIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { generateStrongPassword } from "../../lib/password";

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
  const suggest = () => {
    props.onPasswordChange(generateStrongPassword());
    toast.success("Strong password suggested", { duration: 2500 });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(props.password);
    toast.success("Password copied!", { duration: 2000 });
  };

  return (
    <>
      <Group justify="space-between" pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
        <Group>
          <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
            style={{ display: "grid", placeItems: "center" }}>
            <FileIcon size={20} />
          </Paper>
          <div>
            <Text fw={600} lineClamp={1}>{props.fileName}</Text>
            <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
          </div>
        </Group>
        <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile} aria-label="Remove file">
          <X size={16} />
        </ActionIcon>
      </Group>

      <Text fz="sm" c="dimmed" mt="md">
        Choose the number of downloads permitted and the length of time the link will be available for.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
        <TextInput label="Link expires after" value="1 day (default)" disabled />
        <Select
          label="Number of downloads"
          data={Array.from({ length: 10 }, (_, i) => ({
            value: String(i + 1),
            label: `${i + 1} download${i > 0 ? "s" : ""}`,
          }))}
          value={String(props.maxDownloads)}
          onChange={(v) => props.onMaxDownloadsChange(Number(v ?? "1"))}
        />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md" mt="md">
        <Switch
          label="Encrypt file (recommended)"
          description="Your file is encrypted in your browser before upload."
          checked={props.isEncrypted}
          onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
        />
        {props.isEncrypted && (
          <Stack gap="xs" mt="sm">
            <PasswordInput
              label="Password"
              placeholder="Add a password"
              value={props.password}
              onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
            />
            <Group gap={8} mt={4}>
              <Button size="compact-xs" variant="light" color="blue" fw={700} onClick={suggest}>
                Suggest a strong password
              </Button>
              {props.password && (
                <Button size="compact-xs" variant="light" color="green" fw={700} onClick={copyPassword}>
                  Copy
                </Button>
              )}
            </Group>
            <Text fz="xs" c="dimmed">[optional] For additional security add a password.</Text>
          </Stack>
        )}
      </Paper>

      <Checkbox
        mt="md"
        label={
          <Text fz="sm" component="span">
            I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms of Service</Link> and{" "}
            <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
          </Text>
        }
        checked={props.acceptedTerms}
        onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
      />

      <Button
        fullWidth size="md" mt="md"
        loading={props.isWorking}
        disabled={!props.acceptedTerms || (props.isEncrypted && !props.password)}
        onClick={props.onUpload}
      >
        Upload
      </Button>
    </>
  );
}

export default UploadOptions;