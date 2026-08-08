import { Button, PasswordInput, Stack, Text } from "@mantine/core";
import { Term } from "../Term";

interface UnlockFormProps {
  password: string;
  onPasswordChange: (value: string) => void;
  onUnlock: () => void;
}

export function UnlockForm({ password, onPasswordChange, onUnlock }: UnlockFormProps) {
  return (
    <Stack gap="sm">
      <Text fz="sm" c="dimmed">
        This file is{" "}
        <Term tip="Locked with AES-GCM in the sender's browser. VaultHub never stores the password and cannot recover it — if you don't have it, ask the sender.">
          encrypted
        </Term>{" "}
        — enter the password the sender shared with you.
      </Text>
      <PasswordInput
        label="Password"
        placeholder="Enter password to decrypt"
        value={password}
        onChange={(e) => onPasswordChange(e.currentTarget.value)}
      />
      <Button fullWidth disabled={!password} onClick={onUnlock}>Unlock</Button>
    </Stack>
  );
}

export default UnlockForm;