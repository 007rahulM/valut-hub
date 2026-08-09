import { useState } from "react";
import { Link } from "react-router-dom";
import { Group, Rating, Stack, Text } from "@mantine/core";
import toast from "react-hot-toast";

// Sends feedback straight to your inbox as a CLEAN TABLE (FormSubmit _template: table).
// No IPs, no tracking — just rating + page + time. If spam ever shows up later,
// add a rate-limited backend endpoint; for now this is enough.
export function FeedbackPrompt() {
  const [sent, setSent] = useState(false);

  const submit = async (value: number) => {
    setSent(true);
    try {
      await fetch("https://formsubmit.co/ajax/rk096327945@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `VaultHub feedback: ${value}/5 stars`,
          _template: "table",   // email arrives as a neat table, easy to read
          _captcha: "false",
          Rating: `${value}/5`,
          Page: window.location.pathname,
          Time: new Date().toLocaleString(),
        }),
      });
    } catch {
      /* a rating should never block or annoy anyone */
    }
    toast.success("Thanks — that helps more than you think.");
  };

  return (
    <Stack gap={6} align="center" mt="md" pt="md"
      style={{ borderTop: "1px dashed var(--mantine-color-default-border)" }}>
      {sent ? (
        <Text fz="xs" c="dimmed">Thanks — that helps more than you think.</Text>
      ) : (
        <>
          <Text fz="xs" c="dimmed">How was it for you?</Text>
          <Group gap={8}>
            <Rating size="sm" onChange={(v) => submit(v)} aria-label="Rate your experience" />
          </Group>
          <Text fz={11} c="dimmed">
            Want to say more?{" "}
            <Link to="/feedback" style={{ textDecoration: "underline" }}>Leave a note</Link>
          </Text>
        </>
      )}
    </Stack>
  );
}

export default FeedbackPrompt;