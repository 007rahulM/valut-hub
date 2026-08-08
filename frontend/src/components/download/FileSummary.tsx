import { Group, Paper, SimpleGrid, Text } from "@mantine/core";
import { File as FileIcon } from "lucide-react";

interface FileSummaryProps {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  expiresAt: string;
  isEncrypted: boolean;
  downloadCount: number;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text fz={10} c="dimmed" tt="uppercase" fw={600}>{label}</Text>
      <Text fz="sm" fw={500} mt={2}>{value}</Text>
    </div>
  );
}

export function FileSummary(props: FileSummaryProps) {
  return (
    <>
      <Group gap="sm" wrap="nowrap">
        <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
          style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
          <FileIcon size={20} />
        </Paper>
        <div style={{ minWidth: 0 }}>
          <Text fw={600} lineClamp={1}>{props.originalName}</Text>
          <Text fz="xs" c="dimmed">{props.mimeType}</Text>
        </div>
      </Group>

      <SimpleGrid cols={2} mt="md">
        <Detail label="Size" value={formatSize(props.sizeBytes)} />
        <Detail label="Expires" value={props.expiresAt?.split("T")[0] ?? ""} />
        <Detail label="Encrypted" value={props.isEncrypted ? "Yes" : "No"} />
        <Detail label="Downloads" value={String(props.downloadCount ?? 0)} />
      </SimpleGrid>
    </>
  );
}

export default FileSummary;