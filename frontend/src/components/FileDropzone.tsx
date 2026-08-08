import { Dropzone } from "@mantine/dropzone";
import { Button, Stack, Text } from "@mantine/core";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Illustration } from "./Illustration";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  maxSize?: number;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024;

export function FileDropzone({ onFileSelect, maxSize = MAX_FILE_SIZE }: FileDropzoneProps) {
  const handleDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const BLOCKED = [".exe", ".bat", ".sh", ".cmd"];
    if (BLOCKED.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      toast.error("File type not allowed for security reasons.");
      return;
    }
    onFileSelect(file);
  };

  const handleReject = () => {
    toast.error(`File too large. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB`);
  };

  return (
    <Dropzone onDrop={handleDrop} onReject={handleReject} maxSize={maxSize} multiple={false}>
      <Stack align="center" gap="md" p="md">
        <Illustration src="/illustrations/drag-to-add.svg" alt="Drag and drop your file here" maxWidth={280} />
        <Button leftSection={<Plus size={18} />} style={{ pointerEvents: "none" }}>
          Select files to upload
        </Button>
        <Text fz="sm" c="dimmed" ta="center">
          Or drag files from your device onto this box
        </Text>
      </Stack>
    </Dropzone>
  );
}