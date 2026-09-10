

// // ============================================================
// // FeedbackPage — THE STAR RATING + MESSAGE PAGE
// // Submits to FormSubmit (forwards to the team inbox as a
// // clean table). If FormSubmit fails, falls back to opening
// // the user's mail app with a pre-filled email.
// // Used standalone at /feedback AND inline on upload-complete
// // and download-complete pages via FeedbackPrompt component.
// // ============================================================


// import { useState } from "react";
// import { Button, Card, Rating, Stack, Text, Textarea } from "@mantine/core";
// import toast from "react-hot-toast";
// import { PageShell } from "../components/PageSheel";
// import { Illustration } from "../components/Illustration";

// export function FeedbackPage() {
//   const [stars, setStars] = useState(0);
//   const [message, setMessage] = useState("");
//   const [sending, setSending] = useState(false);

//   const submit = async () => {
//     if (!stars) return toast.error("Please tap a star rating first");
//     setSending(true);
//     try {
//       const res = await fetch("https://formsubmit.co/ajax/rk096327945@gmail.com", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify({
//           _subject: `Sendly feedback: ${stars}/5 stars`,
//           _template: "table",
//           _captcha: "false",
//           Rating: `${stars}/5`,
//           Page: window.location.pathname,
//           Time: new Date().toLocaleString(),
//           Message: message || "(no written message)",
//         }),
//       });
//       if (!res.ok) throw new Error("send failed");
//       toast.success("Thanks😊 that helps more than you think.");
//       setStars(0);
//       setMessage("");
//     } catch {
//       const body = encodeURIComponent(`Rating: ${stars}/5\n\n${message}`);
//       window.location.href = `mailto:rk096327945@gmail.com?subject=${encodeURIComponent("Sendly feedback")}&body=${body}`;
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <PageShell title="Rate your experience" subtitle="30 seconds of your time makes Sendly better for everyone.">
//       {/* The feedback illustration — small strip on phones, bigger on desktop */}
//       <Illustration src="/illustrations/feedback.svg" alt="Sharing feedback" maxWidth={240} />

//       <Card withBorder radius="md" p={{ base: "md", sm: "lg" }} mt="md">
//         <Stack gap="md">
//           <Text fw={600}>How was Sendly for you?</Text>
//           <Rating value={stars} onChange={setStars} size="lg" />
//           <Textarea
//             label="Anything we should know? (optional)"
//             placeholder="Too slow? Confusing? Perfect? Tell us in one line…"
//             value={message}
//             onChange={(e) => setMessage(e.currentTarget.value)}
//             minRows={3}
//           />
//           <Button loading={sending} onClick={submit}>Send feedback</Button>
//           <Text fz="xs" c="dimmed">Feedback goes straight to the team's inbox. No account needed.</Text>
//         </Stack>
//       </Card>
//     </PageShell>
//   );
// }

// export default FeedbackPage;


import { useState } from "react";
import { Button, Card, Rating, Stack, Text, Textarea } from "@mantine/core";
import toast from "react-hot-toast";
import { PageShell } from "../components/PageSheel";
import { Illustration } from "../components/Illustration";

export function FeedbackPage() {
  const [stars, setStars] = useState(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const key1 = import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY_1;
  const key2 = import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY_2;

  const submit = async () => {
    if (!stars) return toast.error("Please tap a star rating first");
    
    if (!key1 || !key2) {
      console.error("❌ Missing Web3Forms keys in .env file!");
      toast.error("Configuration error.");
      return;
    }

    setSending(true);

    // Clean, professional message format
    const formattedMessage = `Rating: ${stars} out of 5 stars

Page: ${window.location.pathname}
Time: ${new Date().toLocaleString()}

Message:
${message || "(No message provided)"}`;

    const createPayload = (accessKey: string) => ({
      access_key: accessKey,
      subject: `Feedback: ${stars}/5 stars`,
      from_name: "Sendly ",
      message: formattedMessage,
      "Rating": `${stars}/5`,
      "Page": window.location.pathname,
      "Submitted": new Date().toLocaleString(),
    });

    try {
      const [result1, result2] = await Promise.allSettled([
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(createPayload(key1)),
        }),
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(createPayload(key2)),
        }),
      ]);

      const successCount = [result1, result2].filter(r => r.status === "fulfilled").length;
      
      if (successCount > 0) {
        toast.success("Thanks😊 Feedback sent to the team!");
        setStars(0);
        setMessage("");
      } else {
        throw new Error("Both requests failed");
      }
    } catch (error) {
      console.error(" Feedback failed:", error);
      toast.error("Failed to send. Try again?");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell title="Rate your experience" subtitle="30 seconds of your time makes Sendly better for everyone.">
      <Illustration src="/illustrations/feedback.svg" alt="Sharing feedback" maxWidth={240} />

      <Card withBorder radius="md" p={{ base: "md", sm: "lg" }} mt="md">
        <Stack gap="md">
          <Text fw={600}>How was Sendly for you?</Text>
          <Rating value={stars} onChange={setStars} size="lg" />
          <Textarea
            label="Anything we should know? (optional)"
            placeholder="Too slow? Confusing? Perfect? Tell us in one line…"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            minRows={3}
          />
          <Button loading={sending} onClick={submit}>Send feedback</Button>
          <Text fz="xs" c="dimmed">Feedback goes straight to the team's inbox.</Text>
        </Stack>
      </Card>
    </PageShell>
  );
}

export default FeedbackPage;