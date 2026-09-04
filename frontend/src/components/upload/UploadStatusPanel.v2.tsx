import { Loader, Paper, Progress, Stack, Text } from "@mantine/core";

export type UploadStatusStageV2 =
  | "preparing"
  | "encrypting"
  | "uploading"
  | "retrying"
  | "completing"
  | "cancelling"
  | "downloading"
  | "decrypting"
  | "complete"
  | "error";

const stageTextV2: Record<UploadStatusStageV2, string> = {
  preparing: "Preparing your file…",
  encrypting: "Locking your file on this device…",
  uploading: "Uploading your file…",
  retrying: "The connection paused. Trying again…",
  completing: "Finishing your secure link…",
  cancelling: "Cancelling and cleaning up…",
  downloading: "Preparing your download…",
  decrypting: "Unlocking the file on your device…",
  complete: "Your file is ready.",
  error: "We could not finish this step.",
};

export function UploadStatusPanelV2({
  stage,
  percent,
  detail,
  showTechnicalDetail = false,
}: {
  stage: UploadStatusStageV2;
  percent?: number;
  detail?: string;
  showTechnicalDetail?: boolean;
}) {
  const isActive = !["complete", "error"].includes(stage);
  const safePercent = Math.max(0, Math.min(100, percent ?? 0));

  return (
    <Paper withBorder radius="md" p="md" mt="md" aria-live="polite">
      <Stack gap={8}>
        <Text fw={600} fz="sm">{stageTextV2[stage]}</Text>
        {isActive && <Loader size="sm" type="dots" />}
        {(stage === "uploading" || stage === "encrypting" || stage === "downloading" || stage === "decrypting") && (
          <Progress value={safePercent} animated aria-label={`${safePercent}% complete`} />
        )}
        {detail && <Text fz="xs" c="dimmed">{detail}</Text>}
        {showTechnicalDetail && <Text fz="xs" c="dimmed">Development detail: {stage} — {safePercent}%</Text>}
      </Stack>
    </Paper>
  );
}
