// // ============================================================
// // FileDropzone - drag and drop box.
// // Light mode: very light blue fill + light blue dashed outline.
// // Dark mode: dark fill + subtle dashed outline (no white box).
// // ============================================================
// import { Dropzone } from "@mantine/dropzone";
// import { Button, Stack, Text, useMantineColorScheme } from "@mantine/core";
// import { Plus } from "lucide-react";
// import toast from "react-hot-toast";
// import { Illustration } from "./Illustration";

// interface FileDropzoneProps {
//   onFileSelect: (file: File) => void;
//   maxSize?: number;
// }

// const MAX_FILE_SIZE = 500 * 1024 * 1024;

// export function FileDropzone({ onFileSelect, maxSize = MAX_FILE_SIZE }: FileDropzoneProps) {
//   const { colorScheme } = useMantineColorScheme();
//   const dark = colorScheme === "dark";

//   const handleDrop = (files: File[]) => {
//     const file = files[0];
//     if (!file) return;
//     const BLOCKED = [".exe", ".bat", ".sh", ".cmd"];
//     if (BLOCKED.some((ext) => file.name.toLowerCase().endsWith(ext))) {
//       toast.error("File type not allowed for security reasons.");
//       return;
//     }
//     onFileSelect(file);
//   };

//   const handleReject = () => {
//     toast.error(`File too large. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB`);
//   };

//   return (
//     <Dropzone
//       onDrop={handleDrop}
//       onReject={handleReject}
//       maxSize={maxSize}
//       multiple={false}
//       style={{
//         border: `1.5px dashed ${dark ? "#55657D" : "#aecdf0"}`,
//         background: dark ? "#182338" : "#f7fbff",
//         borderRadius: 12,
//       }}
//     >
//       <Stack align="center" gap="lg" p="lg">
//         <Illustration src="/illustrations/drag-to-add.svg" alt="Drag and drop your file here" maxWidth={320} baseMax={240} />
//         <Button leftSection={<Plus size={18} />} style={{ pointerEvents: "none" }}>
//           Select files to upload
//         </Button>
//         <Text fz={{ base: "xs", sm: "sm" }} c="dimmed" ta="center">
//           Or drag files from your device onto this box
//         </Text>
//       </Stack>
//     </Dropzone>
//   );
// }


// ============================================================
// FileDropzone - drag and drop box.
// Light mode: very light blue fill + light blue dashed outline.
// Dark mode: dark fill + subtle dashed outline (no white box).
//
// SECURITY: frontend extension check = friendly UX only.
// The backend re-checks everything (frontend can be bypassed).
// ============================================================
import { Dropzone } from "@mantine/dropzone";
import { Button, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Illustration } from "./Illustration";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  maxSize?: number;
  disabled?: boolean; // used when the daily quota is blown
}

const MAX_FILE_SIZE = 500 * 1024 * 1024;

// SAME list as the backend BLOCKED_EXTENSIONS — keep them in sync!
// These are executable / script / macro / disk-image types (malware vectors).
const BLOCKED_EXTENSIONS = [
  ".exe", ".msi", ".msp", ".mst", ".bat", ".cmd", ".com", ".scr", ".pif",
  ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh", ".ps1", ".psm1", ".hta",
  ".cpl", ".lnk", ".reg", ".dll", ".sys", ".drv", ".iso", ".img", ".vhd",
  ".vhdx", ".apk", ".jar", ".sh", ".bash", ".cgi",
  ".docm", ".xlsm", ".pptm",
];

export function FileDropzone({ onFileSelect, maxSize = MAX_FILE_SIZE, disabled = false }: FileDropzoneProps) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const handleDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (BLOCKED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      toast.error("This file type is blocked for security reasons. Try zipping it first.");
      return;
    }
    onFileSelect(file);
  };

  const handleReject = () => {
    toast.error(`File too large. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB`);
  };

  return (
    <Dropzone
      onDrop={handleDrop}
      onReject={handleReject}
      maxSize={maxSize}
      multiple={false}
      disabled={disabled}
      style={{
        border: `1.5px dashed ${dark ? "#55657D" : "#aecdf0"}`,
        background: dark ? "#182338" : "#f7fbff",
        borderRadius: 12,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <Stack align="center" gap="lg" p="lg">
        <Illustration src="/illustrations/drag-to-add.svg" alt="Drag and drop your file here" maxWidth={320} baseMax={240} />
        <Button leftSection={<Plus size={18} />} style={{ pointerEvents: "none" }}>
          Select files to upload
        </Button>
        <Text fz={{ base: "xs", sm: "sm" }} c="dimmed" ta="center">
          Or drag files from your device onto this box
        </Text>
      </Stack>
    </Dropzone>
  );
}