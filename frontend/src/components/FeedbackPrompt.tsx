

// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { Group, Rating, Stack, Text } from "@mantine/core";
// import toast from "react-hot-toast";

// export function FeedbackPrompt() {
//   const [sent, setSent] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Load both access keys
//   const key1 = import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY_1;
//   const key2 = import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY_2;

//   const submit = async (value: number) => {
//     if (!value) return;
    
//     if (!key1 || !key2) {
//       console.error("Missing Web3Forms keys!");
//       return;
//     }

//     setSent(true);
//     setIsSubmitting(true);

//     // Clean, professional HTML table format for the email
//     const formattedMessage = `
//       <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; margin-bottom: 20px; font-size: 20px;">New Feedback Received</h2>
        
//         <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//           <tr style="background-color: #f9f9f9;">
//             <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: 600; width: 35%; color: #555;">Rating</td>
//             <td style="padding: 12px; border: 1px solid #e0e0e0; color: #1a1a1a;">${value} / 5 Stars</td>
//           </tr>
//           <tr>
//             <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: 600; color: #555;">Page</td>
//             <td style="padding: 12px; border: 1px solid #e0e0e0; color: #1a1a1a;">${window.location.pathname}</td>
//           </tr>
//           <tr style="background-color: #f9f9f9;">
//             <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: 600; color: #555;">Submitted At</td>
//             <td style="padding: 12px; border: 1px solid #e0e0e0; color: #1a1a1a;">${new Date().toLocaleString()}</td>
//           </tr>
//         </table>
        
//         <p style="color: #888888; font-size: 13px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
//           This is an automated notification from the Sendly App.
//         </p>
//       </div>
//     `.trim();

//     const createPayload = (accessKey: string) => ({
//       access_key: accessKey,
//       subject: `New Feedback: ${value}/5 Stars - Sendly App`,
//       from_name: "Sendly App",
//       message: formattedMessage,
//     });

//     try {
//       const [result1, result2] = await Promise.allSettled([
//         fetch("https://api.web3forms.com/submit", {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Accept: "application/json" },
//           body: JSON.stringify(createPayload(key1)),
//         }),
//         fetch("https://api.web3forms.com/submit", {
//           method: "POST",
//           headers: { "Content-Type": "application/json", Accept: "application/json" },
//           body: JSON.stringify(createPayload(key2)),
//         }),
//       ]);

//       const successCount = [result1, result2].filter(r => r.status === "fulfilled").length;
      
//       if (successCount > 0) {
//         console.log(`Feedback sent to ${successCount} inbox(es)`);
//         toast.success("Thank you, your feedback helps us improve.");
//       } else {
//         console.error("Both requests failed");
//         toast.error("Failed to send feedback. Please try again.");
//       }
//     } catch (error) {
//       console.error("NETWORK ERROR:", error);
//       toast.error("Failed to send feedback. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Stack gap={6} align="center" mt="md" pt="md"
//       style={{ borderTop: "1px dashed var(--mantine-color-default-border)" }}>
//       {sent ? (
//         <Text fz="xs" c="dimmed">Thank you, your feedback helps us improve.</Text>
//       ) : (
//         <>
//           <Text fz="xs" c="dimmed">How was your experience?</Text>
//           <Group gap={8}>
//             <Rating 
//               size="sm" 
//               onChange={(v) => !isSubmitting && submit(v)} 
//               aria-label="Rate your experience" 
//             />
//           </Group>
//           <Text fz={11} c="dimmed">
//             Want to share more?{" "}
//             <Link to="/feedback" style={{ textDecoration: "underline" }}>Leave a detailed note</Link>
//           </Text>
//         </>
//       )}
//     </Stack>
//   );
// }

// export default FeedbackPrompt;


import { useState } from "react";
import { Link } from "react-router-dom";
import { Group, Rating, Stack, Text } from "@mantine/core";
import toast from "react-hot-toast";

export function FeedbackPrompt() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const key1 = import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY_1;
  const key2 = import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY_2;

  // Get readable page name
  const getPageName = () => {
    const path = window.location.pathname;
    if (path.includes("/upload")) return "Upload Success Page";
    if (path.includes("/file/")) return "Download Page";
    if (path.includes("/s/")) return "Share Link Page";
    return path || "Home Page";
  };

  const submit = async (value: number) => {
    if (!value) return;
    
    if (!key1 || !key2) {
      console.error("Missing Web3Forms keys!");
      return;
    }

    setSent(true);
    setIsSubmitting(true);

    // ✅ CLEAN PLAIN TEXT FORMAT (not HTML)
    const formattedMessage = `
QUICK FEEDBACK - SENDLY

Rating: ${value} / 5 Stars
Page: ${getPageName()}
Time: ${new Date().toLocaleString()}

---
This is automated feedback from the quick rating widget.
    `.trim();

    const createPayload = (accessKey: string) => ({
      access_key: accessKey,
      subject: `⭐ ${value}/5 Stars - ${getPageName()}`,
      from_name: "Sendly ",
      message: formattedMessage,
      "Rating": `${value}/5`,
      "Page": getPageName(),
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
        console.log(`Feedback sent to ${successCount} inbox(es)`);
        toast.success("Thank you, your feedback helps us improve.");
      } else {
        console.error("Both requests failed");
        toast.error("Failed to send feedback. Please try again.");
      }
    } catch (error) {
      console.error("NETWORK ERROR:", error);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack gap={6} align="center" mt="md" pt="md"
      style={{ borderTop: "1px dashed var(--mantine-color-default-border)" }}>
      {sent ? (
        <Text fz="xs" c="dimmed">Thank you, your feedback helps us improve.</Text>
      ) : (
        <>
          <Text fz="xs" c="dimmed">How was your experience?</Text>
          <Group gap={8}>
            <Rating 
              size="sm" 
              onChange={(v) => !isSubmitting && submit(v)} 
              aria-label="Rate your experience" 
            />
          </Group>
          <Text fz={11} c="dimmed">
            Want to share more?{" "}
            <Link to="/feedback" style={{ textDecoration: "underline" }}>Leave a detailed note</Link>
          </Text>
        </>
      )}
    </Stack>
  );
}

export default FeedbackPrompt;