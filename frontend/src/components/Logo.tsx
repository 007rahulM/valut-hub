import { Group, Text } from "@mantine/core";

export function Logo() {
  return (
    <Group gap={8} wrap="nowrap">
      <img src="/illustrations/icon.svg" alt="" width={28} height={26} style={{ display: "block" }} />
      <Text fw={800} fz="lg" lh={1}>
        <span style={{ color: "var(--mantine-color-text)" }}>Vault</span>
        {/* Darker orange so small text passes the contrast rule */}
        <span style={{ color: "#CE4214" }}>Hub</span>
      </Text>
    </Group>
  );
}