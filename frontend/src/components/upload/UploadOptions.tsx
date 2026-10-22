// // // // // // // ============================================================
// // // // // // // UploadOptions - the options window (step 2 of the sender flow)
// // // // // // // The X (remove file) sits in the TOP-RIGHT corner of the card,
// // // // // // // where users expect a close/remove control.
// // // // // // // Downloads selector is commented out for launch (locked to 10).
// // // // // // // ============================================================
// // // // // // import {ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Progress, SimpleGrid, Stack, Switch, Text, TextInput,} from "@mantine/core";
// // // // // // import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
// // // // // // import { Link } from "react-router-dom";
// // // // // // import toast from "react-hot-toast";
// // // // // // import { generateStrongPassword, validatePassword } from "../../lib/password";
// // // // // // import { Illustration } from "../Illustration";

// // // // // // interface UploadOptionsProps {
// // // // // //   fileName: string;
// // // // // //   fileSizeLabel: string;
// // // // // //   maxDownloads: number;
// // // // // //   onMaxDownloadsChange: (n: number) => void;
// // // // // //   isEncrypted: boolean;
// // // // // //   onIsEncryptedChange: (v: boolean) => void;
// // // // // //   password: string;
// // // // // //   onPasswordChange: (v: string) => void;
// // // // // //   acceptedTerms: boolean;
// // // // // //   onAcceptedTermsChange: (v: boolean) => void;
// // // // // //   isWorking: boolean;
// // // // // //   onUpload: () => void;
// // // // // //   onRemoveFile: () => void;
// // // // // //   // NEW: dynamic progress area + cancel + resume (Step 9 UI)
// // // // // //   progress?: number;           // 0-100 while working
// // // // // //   chatter?: string;            // human line while working
// // // // // //   onCancel?: () => void;       // the small ✕
// // // // // //   resumeLabel?: string | null; // "Resume Upload" / "Try Again" when failed
// // // // // // }

// // // // // // export function UploadOptions(props: UploadOptionsProps) {
// // // // // //   const validation = validatePassword(props.password);
// // // // // //   const strongEnough = validation.valid;
// // // // // //   const hasInput = props.password.length > 0;

// // // // // //   // Fill the password with a strong generated one
// // // // // //   const suggest = () => {
// // // // // //     props.onPasswordChange(generateStrongPassword());
// // // // // //     toast.success("Strong password suggested", { duration: 2500 });
// // // // // //   };

// // // // // //   // Copy the current password to clipboard
// // // // // //   const copyPassword = () => {
// // // // // //     navigator.clipboard.writeText(props.password);
// // // // // //     toast.success("Password copied", { duration: 2000 });
// // // // // //   };

// // // // // //   return (
// // // // // //     <>
// // // // // //       {/* Remove-file button: top-right corner of the card */}
// // // // // //       <Group justify="flex-end">
// // // // // //         <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile}
// // // // // //           aria-label="Remove file" disabled={props.isWorking}>
// // // // // //           <X size={16} />
// // // // // //         </ActionIcon>
// // // // // //       </Group>

// // // // // //       <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />

// // // // // //       {/* File identity row */}
// // // // // //       <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
// // // // // //         <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
// // // // // //           style={{ display: "grid", placeItems: "center" }}>
// // // // // //           <FileIcon size={20} />
// // // // // //         </Paper>
// // // // // //         <div>
// // // // // //           <Text fw={600} lineClamp={1}>{props.fileName}</Text>
// // // // // //           <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
// // // // // //         </div>
// // // // // //       </Group>

// // // // // //       <Text fz="sm" c="dimmed" mt="md">
// // // // // //         Two quick choices, then you're set.
// // // // // //       </Text>

// // // // // //       <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
// // // // // //         <TextInput label="Link expires after" value="1 day (default)" disabled />

// // // // // //         {/* TODO (later): re-enable the downloads selector when backend supports custom limits.
// // // // // //         <Select
// // // // // //           label="Number of downloads"
// // // // // //           data={Array.from({ length: 10 }, (_, i) => ({
// // // // // //             value: String(i + 1),
// // // // // //             label: `${i + 1} download${i > 0 ? "s" : ""}`,
// // // // // //           }))}
// // // // // //           value={String(props.maxDownloads)}
// // // // // //           onChange={(v) => props.onMaxDownloadsChange(Number(v ?? "1"))}
// // // // // //           disabled={props.isWorking}
// // // // // //         />
// // // // // //         */}
// // // // // //         <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
// // // // // //       </SimpleGrid>

// // // // // //       <Paper withBorder radius="md" p="md" mt="md">
// // // // // //         <Switch
// // // // // //           label="Encrypt file (recommended)"
// // // // // //           description="Locked on your device before upload. We can never read it."
// // // // // //           checked={props.isEncrypted}
// // // // // //           onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
// // // // // //           disabled={props.isWorking}
// // // // // //         />
// // // // // //         {props.isEncrypted && (
// // // // // //           <Stack gap="xs" mt="sm">
// // // // // //             <PasswordInput
// // // // // //               label="Password"
// // // // // //               placeholder="Min 8 chars, upper, lower, number & symbol" 
// // // // // //               value={props.password}
// // // // // //               onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
// // // // // //               error={hasInput && !strongEnough ? validation.message : undefined}
// // // // // //               disabled={props.isWorking}
// // // // // //             />
// // // // // //             {strongEnough && (
// // // // // //               <Text fz="xs" c="green">✓ {validation.message}</Text>
// // // // // //             )}
// // // // // //             <Group gap={8} mt={4}>
// // // // // //               <Button size="compact-xs" color="blue" radius="md" leftSection={<KeyRound size={12} />} onClick={suggest} disabled={props.isWorking}>
// // // // // //                 Suggest a strong password
// // // // // //               </Button>
// // // // // //               {props.password && (
// // // // // //                 <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={copyPassword} disabled={props.isWorking}>
// // // // // //                   Copy
// // // // // //                 </Button>
// // // // // //               )}
// // // // // //             </Group>
// // // // // //           </Stack>
// // // // // //         )}
// // // // // //       </Paper>

// // // // // //       <Checkbox
// // // // // //         mt="md"
// // // // // //         label={
// // // // // //           <Text fz="sm" component="span">
// // // // // //             I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms</Link> and{" "}
// // // // // //             <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
// // // // // //           </Text>
// // // // // //         }
// // // // // //         checked={props.acceptedTerms}
// // // // // //         onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
// // // // // //         disabled={props.isWorking}
// // // // // //       />

// // // // // //       {/* DYNAMIC BUTTON AREA: Progress OR Upload/Resume button */}
// // // // // //       {props.isWorking ? (
// // // // // //         // ---------- THE BUTTON AREA BECOMES THE PROGRESS AREA ----------
// // // // // //         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-0)">
// // // // // //           <Group justify="space-between" mb={6}>
// // // // // //             <Text fz="sm" fw={600} c="dimmed" lineClamp={1}>
// // // // // //               {props.chatter || "Working on it…"}
// // // // // //             </Text>
// // // // // //             <Group gap={8}>
// // // // // //               <Text fz="xs" c="dimmed" fw={700}>{Math.round(props.progress ?? 0)}%</Text>
// // // // // //               <ActionIcon variant="light" color="red" size="sm" onClick={props.onCancel} title="Cancel upload">
// // // // // //                 <X size={14} />
// // // // // //               </ActionIcon>
// // // // // //             </Group>
// // // // // //           </Group>
// // // // // //           <Progress value={props.progress ?? 0} size={8} radius="xl" color="var(--mantine-color-blue-6)" animated />
// // // // // //         </Paper>
// // // // // //       ) : (
// // // // // //         // ---------- DYNAMIC BUTTON: Upload / Resume Upload / Try Again ----------
// // // // // //         <Button
// // // // // //           fullWidth
// // // // // //           size="md"
// // // // // //           mt="md"
// // // // // //           disabled={!props.acceptedTerms || (props.isEncrypted && !strongEnough)}
// // // // // //           onClick={props.onUpload}
// // // // // //         >
// // // // // //           {props.resumeLabel ?? "Upload"}
// // // // // //         </Button>
// // // // // //       )}
// // // // // //     </>
// // // // // //   );
// // // // // // }

// // // // // // export default UploadOptions;



// // // // // // ============================================================
// // // // // // UploadOptions - the options window (step 2 of the sender flow)
// // // // // // ============================================================
// // // // // import { ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Progress, SimpleGrid, Stack, Switch, Text, TextInput } from "@mantine/core";
// // // // // import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
// // // // // import { Link } from "react-router-dom";
// // // // // import toast from "react-hot-toast";
// // // // // import { generateStrongPassword, validatePassword } from "../../lib/password";
// // // // // import { Illustration } from "../Illustration";

// // // // // interface UploadOptionsProps {
// // // // //   fileName: string;
// // // // //   fileSizeLabel: string;
// // // // //   maxDownloads: number;
// // // // //   onMaxDownloadsChange: (n: number) => void;
// // // // //   isEncrypted: boolean;
// // // // //   onIsEncryptedChange: (v: boolean) => void;
// // // // //   password: string;
// // // // //   onPasswordChange: (v: string) => void;
// // // // //   acceptedTerms: boolean;
// // // // //   onAcceptedTermsChange: (v: boolean) => void;
// // // // //   isWorking: boolean;
// // // // //   onUpload: () => void;
// // // // //   onRemoveFile: () => void;
// // // // //   // NEW: dynamic progress area + cancel + resume
// // // // //   progress?: number;           
// // // // //   chatter?: string;            
// // // // //   onCancel?: () => void;       
// // // // //   resumeLabel?: string | null; 
// // // // // }

// // // // // export function UploadOptions(props: UploadOptionsProps) {
// // // // //   const validation = validatePassword(props.password);
// // // // //   const strongEnough = validation.valid;
// // // // //   const hasInput = props.password.length > 0;

// // // // //   const suggest = () => {
// // // // //     props.onPasswordChange(generateStrongPassword());
// // // // //     toast.success("Strong password suggested", { duration: 2500 });
// // // // //   };

// // // // //   const copyPassword = () => {
// // // // //     navigator.clipboard.writeText(props.password);
// // // // //     toast.success("Password copied", { duration: 2000 });
// // // // //   };

// // // // //   return (
// // // // //     <>
// // // // //       <Group justify="flex-end">
// // // // //         <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile} aria-label="Remove file" disabled={props.isWorking}>
// // // // //           <X size={16} />
// // // // //         </ActionIcon>
// // // // //       </Group>

// // // // //       <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />

// // // // //       <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
// // // // //         <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue" style={{ display: "grid", placeItems: "center" }}>
// // // // //           <FileIcon size={20} />
// // // // //         </Paper>
// // // // //         <div>
// // // // //           <Text fw={600} lineClamp={1}>{props.fileName}</Text>
// // // // //           <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
// // // // //         </div>
// // // // //       </Group>

// // // // //       <Text fz="sm" c="dimmed" mt="md">Two quick choices, then you're set.</Text>

// // // // //       <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
// // // // //         <TextInput label="Link expires after" value="1 day (default)" disabled />
// // // // //         <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
// // // // //       </SimpleGrid>

// // // // //       <Paper withBorder radius="md" p="md" mt="md">
// // // // //         <Switch
// // // // //           label="Encrypt file (recommended)"
// // // // //           description="Locked on your device before upload. We can never read it."
// // // // //           checked={props.isEncrypted}
// // // // //           onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
// // // // //           disabled={props.isWorking}
// // // // //         />
// // // // //         {props.isEncrypted && (
// // // // //           <Stack gap="xs" mt="sm">
// // // // //             <PasswordInput
// // // // //               label="Password"
// // // // //               placeholder="Min 8 chars, upper, lower, number & symbol" 
// // // // //               value={props.password}
// // // // //               onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
// // // // //               error={hasInput && !strongEnough ? validation.message : undefined}
// // // // //               disabled={props.isWorking}
// // // // //             />
// // // // //             {strongEnough && <Text fz="xs" c="green">✓ {validation.message}</Text>}
// // // // //             <Group gap={8} mt={4}>
// // // // //               <Button size="compact-xs" color="blue" radius="md" leftSection={<KeyRound size={12} />} onClick={suggest} disabled={props.isWorking}>
// // // // //                 Suggest a strong password
// // // // //               </Button>
// // // // //               {props.password && (
// // // // //                 <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={copyPassword} disabled={props.isWorking}>
// // // // //                   Copy
// // // // //                 </Button>
// // // // //               )}
// // // // //             </Group>
// // // // //           </Stack>
// // // // //         )}
// // // // //       </Paper>

// // // // //       <Checkbox
// // // // //         mt="md"
// // // // //         label={
// // // // //           <Text fz="sm" component="span">
// // // // //             I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms</Link> and{" "}
// // // // //             <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
// // // // //           </Text>
// // // // //         }
// // // // //         checked={props.acceptedTerms}
// // // // //         onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
// // // // //         disabled={props.isWorking}
// // // // //       />

// // // // //       {/* DYNAMIC BUTTON AREA: Progress OR Upload/Resume button */}
// // // // //       {props.isWorking ? (
// // // // //         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-0)">
// // // // //           <Group justify="space-between" mb={6}>
// // // // //             <Text fz="sm" fw={600} c="dimmed" lineClamp={1}>
// // // // //               {props.chatter || "Working on it…"}
// // // // //             </Text>
// // // // //             <Group gap={8}>
// // // // //               <Text fz="xs" c="dimmed" fw={700}>{Math.round(props.progress ?? 0)}%</Text>
// // // // //               <ActionIcon variant="light" color="red" size="sm" onClick={props.onCancel} title="Cancel upload">
// // // // //                 <X size={14} />
// // // // //               </ActionIcon>
// // // // //             </Group>
// // // // //           </Group>
// // // // //           <Progress value={props.progress ?? 0} size={8} radius="xl" color="var(--mantine-color-blue-6)" animated />
// // // // //         </Paper>
// // // // //       ) : (
// // // // //         <Button
// // // // //           fullWidth
// // // // //           size="md"
// // // // //           mt="md"
// // // // //           disabled={!props.acceptedTerms || (props.isEncrypted && !strongEnough)}
// // // // //           onClick={props.onUpload}
// // // // //         >
// // // // //           {props.resumeLabel ?? "Upload"}
// // // // //         </Button>
// // // // //       )}
// // // // //     </>
// // // // //   );
// // // // // }

// // // // // export default UploadOptions;


// // // // // // ============================================================
// // // // // // UploadOptions - the options window (step 2 of the sender flow)
// // // // // // The X (remove file) sits in the TOP-RIGHT corner of the card,
// // // // // // where users expect a close/remove control.
// // // // // // Downloads selector is commented out for launch (locked to 10).
// // // // // // ============================================================
// // // // // import {ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Progress, SimpleGrid, Stack, Switch, Text, TextInput,} from "@mantine/core";
// // // // // import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
// // // // // import { Link } from "react-router-dom";
// // // // // import toast from "react-hot-toast";
// // // // // import { generateStrongPassword, validatePassword } from "../../lib/password";
// // // // // import { Illustration } from "../Illustration";

// // // // // interface UploadOptionsProps {
// // // // //   fileName: string;
// // // // //   fileSizeLabel: string;
// // // // //   maxDownloads: number;
// // // // //   onMaxDownloadsChange: (n: number) => void;
// // // // //   isEncrypted: boolean;
// // // // //   onIsEncryptedChange: (v: boolean) => void;
// // // // //   password: string;
// // // // //   onPasswordChange: (v: string) => void;
// // // // //   acceptedTerms: boolean;
// // // // //   onAcceptedTermsChange: (v: boolean) => void;
// // // // //   isWorking: boolean;
// // // // //   onUpload: () => void;
// // // // //   onRemoveFile: () => void;
// // // // //   // NEW: dynamic progress area + cancel + resume (Step 9 UI)
// // // // //   progress?: number;           // 0-100 while working
// // // // //   chatter?: string;            // human line while working
// // // // //   onCancel?: () => void;       // the small ✕
// // // // //   resumeLabel?: string | null; // "Resume Upload" / "Try Again" when failed
// // // // // }

// // // // // export function UploadOptions(props: UploadOptionsProps) {
// // // // //   const validation = validatePassword(props.password);
// // // // //   const strongEnough = validation.valid;
// // // // //   const hasInput = props.password.length > 0;

// // // // //   // Fill the password with a strong generated one
// // // // //   const suggest = () => {
// // // // //     props.onPasswordChange(generateStrongPassword());
// // // // //     toast.success("Strong password suggested", { duration: 2500 });
// // // // //   };

// // // // //   // Copy the current password to clipboard
// // // // //   const copyPassword = () => {
// // // // //     navigator.clipboard.writeText(props.password);
// // // // //     toast.success("Password copied", { duration: 2000 });
// // // // //   };

// // // // //   return (
// // // // //     <>
// // // // //       {/* Remove-file button: top-right corner of the card */}
// // // // //       <Group justify="flex-end">
// // // // //         <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile}
// // // // //           aria-label="Remove file" disabled={props.isWorking}>
// // // // //           <X size={16} />
// // // // //         </ActionIcon>
// // // // //       </Group>

// // // // //       <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />

// // // // //       {/* File identity row */}
// // // // //       <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
// // // // //         <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue"
// // // // //           style={{ display: "grid", placeItems: "center" }}>
// // // // //           <FileIcon size={20} />
// // // // //         </Paper>
// // // // //         <div>
// // // // //           <Text fw={600} lineClamp={1}>{props.fileName}</Text>
// // // // //           <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
// // // // //         </div>
// // // // //       </Group>

// // // // //       <Text fz="sm" c="dimmed" mt="md">
// // // // //         Two quick choices, then you're set.
// // // // //       </Text>

// // // // //       <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
// // // // //         <TextInput label="Link expires after" value="1 day (default)" disabled />

// // // // //         {/* TODO (later): re-enable the downloads selector when backend supports custom limits.
// // // // //         <Select
// // // // //           label="Number of downloads"
// // // // //           data={Array.from({ length: 10 }, (_, i) => ({
// // // // //             value: String(i + 1),
// // // // //             label: `${i + 1} download${i > 0 ? "s" : ""}`,
// // // // //           }))}
// // // // //           value={String(props.maxDownloads)}
// // // // //           onChange={(v) => props.onMaxDownloadsChange(Number(v ?? "1"))}
// // // // //           disabled={props.isWorking}
// // // // //         />
// // // // //         */}
// // // // //         <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
// // // // //       </SimpleGrid>

// // // // //       <Paper withBorder radius="md" p="md" mt="md">
// // // // //         <Switch
// // // // //           label="Encrypt file (recommended)"
// // // // //           description="Locked on your device before upload. We can never read it."
// // // // //           checked={props.isEncrypted}
// // // // //           onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
// // // // //           disabled={props.isWorking}
// // // // //         />
// // // // //         {props.isEncrypted && (
// // // // //           <Stack gap="xs" mt="sm">
// // // // //             <PasswordInput
// // // // //               label="Password"
// // // // //               placeholder="Min 8 chars, upper, lower, number & symbol" 
// // // // //               value={props.password}
// // // // //               onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
// // // // //               error={hasInput && !strongEnough ? validation.message : undefined}
// // // // //               disabled={props.isWorking}
// // // // //             />
// // // // //             {strongEnough && (
// // // // //               <Text fz="xs" c="green">✓ {validation.message}</Text>
// // // // //             )}
// // // // //             <Group gap={8} mt={4}>
// // // // //               <Button size="compact-xs" color="blue" radius="md" leftSection={<KeyRound size={12} />} onClick={suggest} disabled={props.isWorking}>
// // // // //                 Suggest a strong password
// // // // //               </Button>
// // // // //               {props.password && (
// // // // //                 <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={copyPassword} disabled={props.isWorking}>
// // // // //                   Copy
// // // // //                 </Button>
// // // // //               )}
// // // // //             </Group>
// // // // //           </Stack>
// // // // //         )}
// // // // //       </Paper>

// // // // //       <Checkbox
// // // // //         mt="md"
// // // // //         label={
// // // // //           <Text fz="sm" component="span">
// // // // //             I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms</Link> and{" "}
// // // // //             <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
// // // // //           </Text>
// // // // //         }
// // // // //         checked={props.acceptedTerms}
// // // // //         onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
// // // // //         disabled={props.isWorking}
// // // // //       />

// // // // //       {/* DYNAMIC BUTTON AREA: Progress OR Upload/Resume button */}
// // // // //       {props.isWorking ? (
// // // // //         // ---------- THE BUTTON AREA BECOMES THE PROGRESS AREA ----------
// // // // //         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-0)">
// // // // //           <Group justify="space-between" mb={6}>
// // // // //             <Text fz="sm" fw={600} c="dimmed" lineClamp={1}>
// // // // //               {props.chatter || "Working on it…"}
// // // // //             </Text>
// // // // //             <Group gap={8}>
// // // // //               <Text fz="xs" c="dimmed" fw={700}>{Math.round(props.progress ?? 0)}%</Text>
// // // // //               <ActionIcon variant="light" color="red" size="sm" onClick={props.onCancel} title="Cancel upload">
// // // // //                 <X size={14} />
// // // // //               </ActionIcon>
// // // // //             </Group>
// // // // //           </Group>
// // // // //           <Progress value={props.progress ?? 0} size={8} radius="xl" color="var(--mantine-color-blue-6)" animated />
// // // // //         </Paper>
// // // // //       ) : (
// // // // //         // ---------- DYNAMIC BUTTON: Upload / Resume Upload / Try Again ----------
// // // // //         <Button
// // // // //           fullWidth
// // // // //           size="md"
// // // // //           mt="md"
// // // // //           disabled={!props.acceptedTerms || (props.isEncrypted && !strongEnough)}
// // // // //           onClick={props.onUpload}
// // // // //         >
// // // // //           {props.resumeLabel ?? "Upload"}
// // // // //         </Button>
// // // // //       )}
// // // // //     </>
// // // // //   );
// // // // // }

// // // // // export default UploadOptions;



// // // // // ============================================================
// // // // // UploadOptions - the options window (step 2 of the sender flow)
// // // // // ============================================================
// // // // import { ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Progress, SimpleGrid, Stack, Switch, Text, TextInput } from "@mantine/core";
// // // // import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
// // // // import { Link } from "react-router-dom";
// // // // import toast from "react-hot-toast";
// // // // import { generateStrongPassword, validatePassword } from "../../lib/password";
// // // // import { Illustration } from "../Illustration";

// // // // interface UploadOptionsProps {
// // // //   fileName: string;
// // // //   fileSizeLabel: string;
// // // //   maxDownloads: number;
// // // //   onMaxDownloadsChange: (n: number) => void;
// // // //   isEncrypted: boolean;
// // // //   onIsEncryptedChange: (v: boolean) => void;
// // // //   password: string;
// // // //   onPasswordChange: (v: string) => void;
// // // //   acceptedTerms: boolean;
// // // //   onAcceptedTermsChange: (v: boolean) => void;
// // // //   isWorking: boolean;
// // // //   onUpload: () => void;
// // // //   onRemoveFile: () => void;
// // // //   // NEW: dynamic progress area + cancel + resume
// // // //   progress?: number;           
// // // //   chatter?: string;            
// // // //   onCancel?: () => void;       
// // // //   resumeLabel?: string | null;
// // // //   showProgress?: boolean;
// // // // }

// // // // export function UploadOptions(props: UploadOptionsProps) {
// // // //   const validation = validatePassword(props.password);
// // // //   const strongEnough = validation.valid;
// // // //   const hasInput = props.password.length > 0;

// // // //   const suggest = () => {
// // // //     props.onPasswordChange(generateStrongPassword());
// // // //     toast.success("Strong password suggested", { duration: 2500 });
// // // //   };

// // // //   const copyPassword = () => {
// // // //     navigator.clipboard.writeText(props.password);
// // // //     toast.success("Password copied", { duration: 2000 });
// // // //   };

// // // //   return (
// // // //     <>
// // // //       <Group justify="flex-end">
// // // //         <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile} aria-label="Remove file" disabled={props.isWorking}>
// // // //           <X size={16} />
// // // //         </ActionIcon>
// // // //       </Group>

// // // //       <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />

// // // //       <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
// // // //         <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue" style={{ display: "grid", placeItems: "center" }}>
// // // //           <FileIcon size={20} />
// // // //         </Paper>
// // // //         <div>
// // // //           <Text fw={600} lineClamp={1}>{props.fileName}</Text>
// // // //           <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
// // // //         </div>
// // // //       </Group>

// // // //       <Text fz="sm" c="dimmed" mt="md">Two quick choices, then you're set.</Text>

// // // //       <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
// // // //         <TextInput label="Link expires after" value="1 day (default)" disabled />
// // // //         <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
// // // //       </SimpleGrid>

// // // //       <Paper withBorder radius="md" p="md" mt="md">
// // // //         <Switch
// // // //           label="Encrypt file (recommended)"
// // // //           description="Locked on your device before upload. We can never read it."
// // // //           checked={props.isEncrypted}
// // // //           onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
// // // //           disabled={props.isWorking}
// // // //         />
// // // //         {props.isEncrypted && (
// // // //           <Stack gap="xs" mt="sm">
// // // //             <PasswordInput
// // // //               label="Password"
// // // //               placeholder="Min 8 chars, upper, lower, number & symbol" 
// // // //               value={props.password}
// // // //               onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
// // // //               error={hasInput && !strongEnough ? validation.message : undefined}
// // // //               disabled={props.isWorking}
// // // //             />
// // // //             {strongEnough && <Text fz="xs" c="green">✓ {validation.message}</Text>}
// // // //             <Group gap={8} mt={4}>
// // // //               <Button size="compact-xs" color="blue" radius="md" leftSection={<KeyRound size={12} />} onClick={suggest} disabled={props.isWorking}>
// // // //                 Suggest a strong password
// // // //               </Button>
// // // //               {props.password && (
// // // //                 <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={copyPassword} disabled={props.isWorking}>
// // // //                   Copy
// // // //                 </Button>
// // // //               )}
// // // //             </Group>
// // // //           </Stack>
// // // //         )}
// // // //       </Paper>

// // // //       <Checkbox
// // // //         mt="md"
// // // //         label={
// // // //           <Text fz="sm" component="span">
// // // //             I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms</Link> and{" "}
// // // //             <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
// // // //           </Text>
// // // //         }
// // // //         checked={props.acceptedTerms}
// // // //         onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
// // // //         disabled={props.isWorking}
// // // //       />

// // // //       {/* DYNAMIC BUTTON AREA: Progress OR Upload/Resume button */}
// // // //       {props.isWorking && props.showProgress !== false ? (
// // // //         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-0)">
// // // //           <Group justify="space-between" mb={6}>
// // // //             <Text fz="sm" fw={600} c="dimmed" lineClamp={1}>
// // // //               {props.chatter || "Working on it…"}
// // // //             </Text>
// // // //             <Group gap={8}>
// // // //               <Text fz="xs" c="dimmed" fw={700}>{Math.round(props.progress ?? 0)}%</Text>
// // // //               <ActionIcon variant="light" color="red" size="sm" onClick={props.onCancel} title="Cancel upload">
// // // //                 <X size={14} />
// // // //               </ActionIcon>
// // // //             </Group>
// // // //           </Group>
// // // //           <Progress value={props.progress ?? 0} size={8} radius="xl" color="var(--mantine-color-blue-6)" animated />
// // // //         </Paper>
// // // //       ) : props.isWorking ? null : (
// // // //         <Button
// // // //           fullWidth
// // // //           size="md"
// // // //           mt="md"
// // // //           disabled={!props.acceptedTerms || (props.isEncrypted && !strongEnough)}
// // // //           onClick={props.onUpload}
// // // //         >
// // // //           {props.resumeLabel ?? "Upload"}
// // // //         </Button>
// // // //       )}
// // // //     </>
// // // //   );
// // // // }

// // // // export default UploadOptions;



// // // import { ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Progress, SimpleGrid, Stack, Switch, Text, TextInput } from "@mantine/core";
// // // import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
// // // import { Link } from "react-router-dom";
// // // import toast from "react-hot-toast";
// // // import { generateStrongPassword, validatePassword } from "../../lib/password";
// // // import { Illustration } from "../Illustration";

// // // interface UploadOptionsProps {
// // //   fileName: string;
// // //   fileSizeLabel: string;
// // //   maxDownloads: number;
// // //   onMaxDownloadsChange: (n: number) => void;
// // //   isEncrypted: boolean;
// // //   onIsEncryptedChange: (v: boolean) => void;
// // //   password: string;
// // //   onPasswordChange: (v: string) => void;
// // //   acceptedTerms: boolean;
// // //   onAcceptedTermsChange: (v: boolean) => void;
// // //   isWorking: boolean;
// // //   isPaused?: boolean; // <-- ADDED THIS
// // //   onUpload: () => void;
// // //   onRemoveFile: () => void;
// // //   progress?: number;
// // //   chatter?: string;
// // //   onCancel?: () => void;
// // //   onResume?: () => void; // <-- ADDED THIS
// // //   onCancelAndCleanup?: () => void; // <-- ADDED THIS
// // //   resumeLabel?: string | null;
// // //   showProgress?: boolean;
// // // }

// // // export function UploadOptions(props: UploadOptionsProps) {
// // //   const validation = validatePassword(props.password);
// // //   const strongEnough = validation.valid;
// // //   const hasInput = props.password.length > 0;

// // //   const suggest = () => {
// // //     props.onPasswordChange(generateStrongPassword());
// // //     toast.success("Strong password suggested", { duration: 2500 });
// // //   };

// // //   const copyPassword = () => {
// // //     navigator.clipboard.writeText(props.password);
// // //     toast.success("Password copied", { duration: 2000 });
// // //   };

// // //   return (
// // //     <>
// // //       <Group justify="flex-end">
// // //         <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile} aria-label="Remove file" disabled={props.isWorking && !props.isPaused}>
// // //           <X size={16} />
// // //         </ActionIcon>
// // //       </Group>
// // //       <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />
// // //       <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
// // //         <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue" style={{ display: "grid", placeItems: "center" }}>
// // //           <FileIcon size={20} />
// // //         </Paper>
// // //         <div>
// // //           <Text fw={600} lineClamp={1}>{props.fileName}</Text>
// // //           <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
// // //         </div>
// // //       </Group>
// // //       <Text fz="sm" c="dimmed" mt="md">Two quick choices, then you're set.</Text>
// // //       <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
// // //         <TextInput label="Link expires after" value="1 day (default)" disabled />
// // //         <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
// // //       </SimpleGrid>
// // //       <Paper withBorder radius="md" p="md" mt="md">
// // //         <Switch
// // //           label="Encrypt file (recommended)"
// // //           description="Locked on your device before upload. We can never read it."
// // //           checked={props.isEncrypted}
// // //           onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
// // //           disabled={props.isWorking && !props.isPaused}
// // //         />
// // //         {props.isEncrypted && (
// // //           <Stack gap="xs" mt="sm">
// // //             <PasswordInput
// // //               label="Password"
// // //               placeholder="Min 8 chars, upper, lower, number & symbol"
// // //               value={props.password}
// // //               onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
// // //               error={hasInput && !strongEnough ? validation.message : undefined}
// // //               disabled={props.isWorking && !props.isPaused}
// // //             />
// // //             {strongEnough && <Text fz="xs" c="green">✓ {validation.message}</Text>}
// // //             <Group gap={8} mt={4}>
// // //               <Button size="compact-xs" color="blue" radius="md" leftSection={<KeyRound size={12} />} onClick={suggest} disabled={props.isWorking && !props.isPaused}>
// // //                 Suggest a strong password
// // //               </Button>
// // //               {props.password && (
// // //                 <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={copyPassword} disabled={props.isWorking && !props.isPaused}>
// // //                   Copy
// // //                 </Button>
// // //               )}
// // //             </Group>
// // //           </Stack>
// // //         )}
// // //       </Paper>
// // //       <Checkbox
// // //         mt="md"
// // //         label={
// // //           <Text fz="sm" component="span">
// // //             I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms</Link> and{" "}
// // //             <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
// // //           </Text>
// // //         }
// // //         checked={props.acceptedTerms}
// // //         onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
// // //         disabled={props.isWorking && !props.isPaused}
// // //       />

// // //       {/* DYNAMIC BUTTON AREA */}
// // //       {props.isWorking && !props.isPaused ? (
// // //         // 1. UPLOADING STATE: Only show progress bar and X button
// // //         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-0)">
// // //           <Group justify="space-between" mb={6}>
// // //             <Text fz="sm" fw={600} c="dimmed" lineClamp={1}>
// // //               {props.chatter || "Processing..."}
// // //             </Text>
// // //             <Group gap={8}>
// // //               <Text fz="xs" c="dimmed" fw={700}>{Math.round(props.progress ?? 0)}%</Text>
// // //               <ActionIcon variant="light" color="red" size="sm" onClick={props.onCancel} title="Pause upload">
// // //                 <X size={14} />
// // //               </ActionIcon>
// // //             </Group>
// // //           </Group>
// // //           <Progress value={props.progress ?? 0} size={8} radius="xl" color="var(--mantine-color-blue-6)" animated />
// // //         </Paper>
// // //       ) : props.isPaused ? (
// // //         // 2. PAUSED STATE: Show Resume and Cancel buttons
// // //         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-orange-0)">
// // //           <Text fz="sm" fw={600} c="orange" mb="md" ta="center">Upload paused</Text>
// // //           <Group justify="center" gap="xs">
// // //             <Button size="sm" color="blue" onClick={props.onResume}>Resume Upload</Button>
// // //             <Button size="sm" color="red" variant="light" onClick={props.onCancelAndCleanup}>Cancel & Clean Up</Button>
// // //           </Group>
// // //         </Paper>
// // //       ) : (
// // //         // 3. IDLE STATE: Show the main Upload button
// // //         <Button
// // //           fullWidth
// // //           size="md"
// // //           mt="md"
// // //           disabled={!props.acceptedTerms || (props.isEncrypted && !strongEnough)}
// // //           onClick={props.onUpload}
// // //         >
// // //           {props.resumeLabel ?? "Upload"}
// // //         </Button>
// // //       )}
// // //     </>
// // //   );
// // // }

// // // export default UploadOptions;



// // import { ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Progress, SimpleGrid, Stack, Switch, Text, TextInput } from "@mantine/core";
// // import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
// // import { Link } from "react-router-dom";
// // import toast from "react-hot-toast";
// // import { generateStrongPassword, validatePassword } from "../../lib/password";
// // import { Illustration } from "../Illustration";

// // interface UploadOptionsProps {
// //   fileName: string;
// //   fileSizeLabel: string;
// //   maxDownloads: number;
// //   onMaxDownloadsChange: (n: number) => void;
// //   isEncrypted: boolean;
// //   onIsEncryptedChange: (v: boolean) => void;
// //   password: string;
// //   onPasswordChange: (v: string) => void;
// //   acceptedTerms: boolean;
// //   onAcceptedTermsChange: (v: boolean) => void;
// //   isWorking: boolean;
// //   isPaused?: boolean;       // OPTIONAL: Protects V1/Test pages
// //   onUpload: () => void;
// //   onRemoveFile: () => void;
// //   progress?: number;
// //   chatter?: string;
// //   onCancel?: () => void;    // OPTIONAL
// //   onResume?: () => void;    // OPTIONAL
// //   onCancelAndCleanup?: () => void; // OPTIONAL
// //   resumeLabel?: string | null;
// // }

// // export function UploadOptions(props: UploadOptionsProps) {
// //   const validation = validatePassword(props.password);
// //   const strongEnough = validation.valid;
// //   const hasInput = props.password.length > 0;
// //   const isPaused = props.isPaused ?? false; // Safe fallback

// //   const suggest = () => {
// //     props.onPasswordChange(generateStrongPassword());
// //     toast.success("Strong password suggested", { duration: 2500 });
// //   };

// //   const copyPassword = () => {
// //     navigator.clipboard.writeText(props.password);
// //     toast.success("Password copied", { duration: 2000 });
// //   };

// //   return (
// //     <>
// //       <Group justify="flex-end">
// //         <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile} aria-label="Remove file" disabled={props.isWorking && !isPaused}>
// //           <X size={16} />
// //         </ActionIcon>
// //       </Group>
// //       <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />
// //       <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
// //         <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue" style={{ display: "grid", placeItems: "center" }}>
// //           <FileIcon size={20} />
// //         </Paper>
// //         <div>
// //           <Text fw={600} lineClamp={1}>{props.fileName}</Text>
// //           <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
// //         </div>
// //       </Group>
// //       <Text fz="sm" c="dimmed" mt="md">Two quick choices, then you're set.</Text>
// //       <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
// //         <TextInput label="Link expires after" value="1 day (default)" disabled />
// //         <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
// //       </SimpleGrid>
// //       <Paper withBorder radius="md" p="md" mt="md">
// //         <Switch
// //           label="Encrypt file (recommended)"
// //           description="Locked on your device before upload. We can never read it."
// //           checked={props.isEncrypted}
// //           onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
// //           disabled={props.isWorking && !isPaused}
// //         />
// //         {props.isEncrypted && (
// //           <Stack gap="xs" mt="sm">
// //             <PasswordInput
// //               label="Password"
// //               placeholder="Min 8 chars, upper, lower, number & symbol"
// //               value={props.password}
// //               onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
// //               error={hasInput && !strongEnough ? validation.message : undefined}
// //               disabled={props.isWorking && !isPaused}
// //             />
// //             {strongEnough && <Text fz="xs" c="green">✓ {validation.message}</Text>}
// //             <Group gap={8} mt={4}>
// //               <Button size="compact-xs" color="blue" radius="md" leftSection={<KeyRound size={12} />} onClick={suggest} disabled={props.isWorking && !isPaused}>
// //                 Suggest a strong password
// //               </Button>
// //               {props.password && (
// //                 <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={copyPassword} disabled={props.isWorking && !isPaused}>
// //                   Copy
// //                 </Button>
// //               )}
// //             </Group>
// //           </Stack>
// //         )}
// //       </Paper>
// //       <Checkbox
// //         mt="md"
// //         label={
// //           <Text fz="sm" component="span">
// //             I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms</Link> and{" "}
// //             <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
// //           </Text>
// //         }
// //         checked={props.acceptedTerms}
// //         onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
// //         disabled={props.isWorking && !isPaused}
// //       />

// //       {/* DYNAMIC BUTTON AREA */}
// //       {props.isWorking && !isPaused ? (
// //         // 1. UPLOADING STATE: Show progress bar and X button (Background continues)
// //         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-0)">
// //           <Group justify="space-between" mb={6}>
// //             <Text fz="sm" fw={600} c="dimmed" lineClamp={1}>
// //               {props.chatter || "Processing..."}
// //             </Text>
// //             <Group gap={8}>
// //               <Text fz="xs" c="dimmed" fw={700}>{Math.round(props.progress ?? 0)}%</Text>
// //               <ActionIcon variant="light" color="red" size="sm" onClick={props.onCancel} title="Hide progress (upload continues in background)">
// //                 <X size={14} />
// //               </ActionIcon>
// //             </Group>
// //           </Group>
// //           <Progress value={props.progress ?? 0} size={8} radius="xl" color="var(--mantine-color-blue-6)" animated />
// //         </Paper>
// //       ) : props.isWorking && isPaused ? (
// //         // 2. PAUSED STATE: Upload is still running in background. Show Resume/Cancel.
// //         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-orange-0)">
// //           <Text fz="sm" fw={600} c="orange" mb="md" ta="center">Upload is continuing in the background...</Text>
// //           <Group justify="center" gap="xs">
// //             <Button size="sm" color="blue" onClick={props.onResume}>Resume</Button>
// //             <Button size="sm" color="red" variant="light" onClick={props.onCancelAndCleanup}>Cancel Upload</Button>
// //           </Group>
// //         </Paper>
// //       ) : (
// //         // 3. IDLE STATE: Show the main Upload button
// //         <Button
// //           fullWidth
// //           size="md"
// //           mt="md"
// //           disabled={!props.acceptedTerms || (props.isEncrypted && !strongEnough)}
// //           onClick={props.onUpload}
// //         >
// //           {props.resumeLabel ?? "Upload"}
// //         </Button>
// //       )}
// //     </>
// //   );
// // }

// // export default UploadOptions;


// import { ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Progress, SimpleGrid, Stack, Switch, Text, TextInput } from "@mantine/core";
// import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
// import { Link } from "react-router-dom";
// import toast from "react-hot-toast";
// import { generateStrongPassword, validatePassword } from "../../lib/password";
// import { Illustration } from "../Illustration";

// interface UploadOptionsProps {
//   fileName: string;
//   fileSizeLabel: string;
//   maxDownloads: number;
//   onMaxDownloadsChange: (n: number) => void;
//   isEncrypted: boolean;
//   onIsEncryptedChange: (v: boolean) => void;
//   password: string;
//   onPasswordChange: (v: string) => void;
//   acceptedTerms: boolean;
//   onAcceptedTermsChange: (v: boolean) => void;
//   isWorking: boolean;
//   isPaused?: boolean;
//   onUpload: () => void;
//   onRemoveFile: () => void;
//   progress?: number;
//   chatter?: string;
//   onCancel?: () => void;
//   onResume?: () => void;
//   onCancelAndCleanup?: () => void;
//   resumeLabel?: string | null;
// }

// // Animated ". .. ..." dots (appear one by one, then loop)
// function WorkingDots() {
//   return (
//     <>
//       <style>{`
//         @keyframes VaultHubDot { 0%,20% {opacity:0;} 40% {opacity:1;} 100% {opacity:0;} }
//         .VaultHub-dot { display:inline-block; animation: VaultHubDot 1.2s infinite; }
//         .VaultHub-dot:nth-of-type(2) { animation-delay: .2s; }
//         .VaultHub-dot:nth-of-type(3) { animation-delay: .4s; }
//       `}</style>
//       <Text component="span" fw={700} c="dimmed" aria-hidden>
//         <span className="VaultHub-dot">.</span>
//         <span className="VaultHub-dot">.</span>
//         <span className="VaultHub-dot">.</span>
//       </Text>
//     </>
//   );
// }

// export function UploadOptions(props: UploadOptionsProps) {
//   const validation = validatePassword(props.password);
//   const strongEnough = validation.valid;
//   const hasInput = props.password.length > 0;
//   const realProgress = Math.round(props.progress ?? 0);
//   const hasRealProgress = realProgress > 0;

//   const suggest = () => {
//     props.onPasswordChange(generateStrongPassword());
//     toast.success("Strong password suggested", { duration: 2500 });
//   };

//   const copyPassword = () => {
//     navigator.clipboard.writeText(props.password);
//     toast.success("Password copied", { duration: 2000 });
//   };

//   return (
//     <>
//       <Group justify="flex-end">
//         <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile} aria-label="Remove file" disabled={props.isWorking}>
//           <X size={16} />
//         </ActionIcon>
//       </Group>
//       <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />
//       <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
//         <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue" style={{ display: "grid", placeItems: "center" }}>
//           <FileIcon size={20} />
//         </Paper>
//         <div>
//           <Text fw={600} lineClamp={1}>{props.fileName}</Text>
//           <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
//         </div>
//       </Group>
//       <Text fz="sm" c="dimmed" mt="md">Two quick choices, then you're set.</Text>
//       <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
//         <TextInput label="Link expires after" value="1 day (default)" disabled />
//         <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
//       </SimpleGrid>
//       <Paper withBorder radius="md" p="md" mt="md">
//         <Switch
//           label="Encrypt file (recommended)"
//           description="Locked on your device before upload. We can never read it."
//           checked={props.isEncrypted}
//           onChange={(e) => props.onIsEncryptedChange(e.currentTarget.checked)}
//           disabled={props.isWorking}
//         />
//         {props.isEncrypted && (
//           <Stack gap="xs" mt="sm">
//             <PasswordInput
//               label="Password"
//               placeholder="Min 8 chars, upper, lower, number & symbol"
//               value={props.password}
//               onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
//               error={hasInput && !strongEnough ? validation.message : undefined}
//               disabled={props.isWorking}
//             />
//             {strongEnough && <Text fz="xs" c="green">✓ {validation.message}</Text>}
//             <Group gap={8} mt={4}>
//               <Button size="compact-xs" color="blue" radius="md" leftSection={<KeyRound size={12} />} onClick={suggest} disabled={props.isWorking}>
//                 Suggest a strong password
//               </Button>
//               {props.password && (
//                 <Button size="compact-xs" color="green" radius="md" leftSection={<Copy size={12} />} onClick={copyPassword} disabled={props.isWorking}>
//                   Copy
//                 </Button>
//               )}
//             </Group>
//           </Stack>
//         )}
//       </Paper>
//       <Checkbox
//         mt="md"
//         label={
//           <Text fz="sm" component="span">
//             I agree to the <Link to="/terms" style={{ color: "var(--mantine-color-blue-6)" }}>Terms</Link> and{" "}
//             <Link to="/privacy" style={{ color: "var(--mantine-color-blue-6)" }}>Privacy Policy</Link>
//           </Text>
//         }
//         checked={props.acceptedTerms}
//         onChange={(e) => props.onAcceptedTermsChange(e.currentTarget.checked)}
//         disabled={props.isWorking}
//       />

//       {/* DYNAMIC AREA */}
//       {props.isWorking && !props.isPaused ? (
//         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-0)">
//           <Group justify="space-between" mb={6}>
//             <Group gap={6}>
//               <Text fz="sm" fw={600} c="dimmed" lineClamp={1}>{props.chatter || "Working"}</Text>
//               <WorkingDots />
//             </Group>
//             <Group gap={8}>
//               <Text fz="xs" c="dimmed" fw={700}>{realProgress}%</Text>
//               <ActionIcon variant="light" color="red" size="sm" onClick={props.onCancel} title="Hide progress (upload continues)">
//                 <X size={14} />
//               </ActionIcon>
//             </Group>
//           </Group>
//           {/* Gray moving "empty" bar until real bytes arrive, then blue fill */}
//           {hasRealProgress ? (
//             <Progress value={realProgress} size={8} radius="xl" color="var(--mantine-color-blue-6)" animated />
//           ) : (
//             <Progress value={100} size={8} radius="xl" color="gray" striped animated />
//           )}
//         </Paper>
//       ) : props.isPaused ? (
//         <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-orange-0)">
//           <Text fz="sm" fw={600} c="orange" mb="md" ta="center">Upload paused (still running in background)</Text>
//           <Group justify="center" gap="xs">
//             <Button size="sm" color="blue" onClick={props.onResume}>Resume Upload</Button>
//             <Button size="sm" color="red" variant="light" onClick={props.onCancelAndCleanup}>Cancel & Clean Up</Button>
//           </Group>
//         </Paper>
//       ) : (
//         <Button
//           fullWidth
//           size="md"
//           mt="md"
//           disabled={!props.acceptedTerms || (props.isEncrypted && !strongEnough)}
//           onClick={props.onUpload}
//         >
//           {props.resumeLabel ?? "Upload"}
//         </Button>
//       )}
//     </>
//   );
// }

// export default UploadOptions;

//uploadoption.tsx//
import { ActionIcon, Button, Checkbox, Group, Paper, PasswordInput, Progress, Select, SimpleGrid, Stack, Switch, Text, TextInput } from "@mantine/core";
import { Copy, File as FileIcon, KeyRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { generateStrongPassword, validatePassword } from "../../lib/password";
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
  isPaused?: boolean;
  onUpload: () => void;
  onRemoveFile: () => void;
  progress?: number;
  chatter?: string;
  onCancel?: () => void;
  onResume?: () => void;
  onCancelAndCleanup?: () => void;
  resumeLabel?: string | null;
}

function WorkingDots() {
  return (
    <>
      <style>{`
        @keyframes VaultHubDot { 0%,20% {opacity:0;} 40% {opacity:1;} 100% {opacity:0;} }
        .VaultHub-dot { display:inline-block; animation: VaultHubDot 1.2s infinite; margin-left: 1px; }
        .VaultHub-dot:nth-of-type(2) { animation-delay: .2s; }
        .VaultHub-dot:nth-of-type(3) { animation-delay: .4s; }
      `}</style>
      <span aria-hidden>
        <span className="VaultHub-dot">.</span>
        <span className="VaultHub-dot">.</span>
        <span className="VaultHub-dot">.</span>
      </span>
    </>
  );
}

export function UploadOptions(props: UploadOptionsProps) {
  const validation = validatePassword(props.password);
  const strongEnough = validation.valid;
  const hasInput = props.password.length > 0;
  const realProgress = Math.round(props.progress ?? 0);
  const hasRealProgress = realProgress > 0;

  const suggest = () => {
    props.onPasswordChange(generateStrongPassword());
    toast.success("Strong password suggested", { duration: 2500 });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(props.password);
    toast.success("Password copied", { duration: 2000 });
  };

  return (
    <>
      <Group justify="flex-end">
        <ActionIcon variant="subtle" color="gray" onClick={props.onRemoveFile} aria-label="Remove file" disabled={props.isWorking}>
          <X size={16} />
        </ActionIcon>
      </Group>
      <Illustration src="/illustrations/secure-password.svg" alt="Choosing a password" maxWidth={200} />
      <Group pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
        <Paper w={40} h={40} radius="md" bg="var(--mantine-color-blue-light)" c="blue" style={{ display: "grid", placeItems: "center" }}>
          <FileIcon size={20} />
        </Paper>
        <div>
          <Text fw={600} lineClamp={1}>{props.fileName}</Text>
          <Text fz="xs" c="dimmed">{props.fileSizeLabel}</Text>
        </div>
      </Group>
      <Text fz="sm" c="dimmed" mt="md">Two quick choices, then you're set.</Text>
      {/* <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
        <TextInput label="Link expires after" value="1 day (default)" disabled />
        <TextInput label="Number of downloads" value="10 downloads (default)" disabled />
      </SimpleGrid> */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xs">
        <TextInput label="Link expires after" value="1 day (default)" disabled />
        <Select
          label="Number of downloads"
          // description="Link stops working after this many downloads"
          data={[
            { value: '1', label: '1 download' },
            { value: '5', label: '5 downloads' },
            { value: '10', label: '10 downloads (default)' },
            { value: '25', label: '25 downloads' },
          ]}
          value={String(props.maxDownloads)}
          onChange={(val) => props.onMaxDownloadsChange(val ? parseInt(val, 10) : 10)}
          disabled={props.isWorking}
        />
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
              placeholder="Min 8 chars, upper, lower, number & symbol"
              value={props.password}
              onChange={(e) => props.onPasswordChange(e.currentTarget.value)}
              error={hasInput && !strongEnough ? validation.message : undefined}
              disabled={props.isWorking}
            />
            {strongEnough && <Text fz="xs" c="green">✓ {validation.message}</Text>}
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

      {/* DYNAMIC AREA */}
      {props.isWorking && !props.isPaused ? (
        <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-blue-0)">
          <Group justify="space-between" mb={6}>
            {/* FIXED: Text and Dots are in the same wrapper to prevent gaps */}
            <Text fz="sm" fw={600} c="dimmed" lineClamp={1}>
              {props.chatter || "Working"}
              <WorkingDots />
            </Text>
            <Group gap={8}>
              <Text fz="xs" c="dimmed" fw={700}>{realProgress}%</Text>
              <ActionIcon variant="light" color="red" size="sm" onClick={props.onCancel} title="Hide progress (upload continues)">
                <X size={14} />
              </ActionIcon>
            </Group>
          </Group>
          {/* FIXED: Light blue filling bar until real bytes arrive */}
          {hasRealProgress ? (
            <Progress value={realProgress} size={8} radius="xl" color="var(--mantine-color-blue-6)" animated />
          ) : (
            <Progress value={100} size={8} radius="xl" color="var(--mantine-color-blue-3)" striped animated />
          )}
        </Paper>
      ) : props.isPaused ? (
        <Paper withBorder radius="md" p="md" mt="md" bg="var(--mantine-color-orange-0)">
          <Text fz="sm" fw={600} c="orange" mb="md" ta="center">Uploading... (still running in background)</Text>
          <Group justify="center" gap="xs">
            <Button size="sm" color="blue" onClick={props.onResume}>Resume Upload</Button>
            <Button size="sm" color="red" variant="light" onClick={props.onCancelAndCleanup}>Cancel Upload</Button>
          </Group>
        </Paper>
      ) : (
        <Button
          fullWidth
          size="md"
          mt="md"
          disabled={!props.acceptedTerms || (props.isEncrypted && !strongEnough)}
          onClick={props.onUpload}
        >
          {props.resumeLabel ?? "Upload"}
        </Button>
      )}
    </>
  );
}

export default UploadOptions;