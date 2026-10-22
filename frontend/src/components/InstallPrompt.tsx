


// import { useEffect, useState, type ReactNode } from "react";
// import { ActionIcon, Button, Group, Paper, Text } from "@mantine/core";
// import { Download, Share, X } from "lucide-react";
// import toast from "react-hot-toast";
// import {
//   consumeInstallPrompt,
//   hasInstallPrompt,
//   isIOSBrowser,
//   isMobileBrowser,
//   isPwaInstalled,
//   isSmallScreen,
//   subscribePwa,
// } from "../lib/pwa";

// const MOBILE_HIDE_MS = 15000;

// export function InstallPrompt() {
//   const [visible, setVisible] = useState(() => {
//     if (typeof navigator === "undefined") return false;
//     return !isPwaInstalled() && (isMobileBrowser() || isSmallScreen());
//   });

//   useEffect(
//     () =>
//       subscribePwa(() =>
//         setVisible(
//           !isPwaInstalled() &&
//             (hasInstallPrompt() || isIOSBrowser() || isMobileBrowser() || isSmallScreen()),
//         ),
//       ),
//     [],
//   );

//   useEffect(() => {
//     if (!visible) return;
//     const timeout = window.setTimeout(
//       () => setVisible(false),
//       isMobileBrowser() || isSmallScreen() ? MOBILE_HIDE_MS : 7000,
//     );
//     return () => window.clearTimeout(timeout);
//   }, [visible]);

//   if (!visible) return null;

//   const nativeInstall = hasInstallPrompt();
//   const ios = isIOSBrowser() && !nativeInstall;

//   const onInstall = async () => {
//     if (!nativeInstall) {
//       toast("Open your browser menu and choose 'Install app' or 'Add to Home screen'.");
//       return;
//     }

//     const outcome = await consumeInstallPrompt();
//     if (outcome === "accepted") toast.success("VaultHub installed — check your home screen!");
//     setVisible(false);
//   };

//   return (
//     <Paper
//       withBorder
//       shadow="sm"
//       radius="md"
//       p={8}
//       className="VaultHub-install-prompt"
//       style={{
//         position: "fixed",
//         right: 16,
//         bottom: 84,
//         zIndex: 60,
//         width: 280,
//         maxWidth: "calc(100vw - 32px)",
//         background: "var(--mantine-color-body)",
//       }}
//     >
//       <Group gap={8} wrap="nowrap" align="center">
//         <BoxFallback>
//           <Text fz="xs" fw={700} lh={1.2}>
//             {ios ? "Add VaultHub to Home Screen" : "Install VaultHub"}
//           </Text>
//           <Text fz={10} c="dimmed" lh={1.25} mt={2}>
//             {ios ? (
//               <>
//                 Tap <Share size={11} style={{ display: "inline", verticalAlign: -2 }} /> Share, then choose{" "}
//                 <Text component="span" fw={700} inherit>"Add to Home Screen"</Text>.
//               </>
//             ) : nativeInstall ? (
//               "Quick access from your home screen."
//             ) : (
//               "Use your browser menu to install."
//             )}
//           </Text>
//         </BoxFallback>

//         <Button
//           size="compact-xs"
//           variant={nativeInstall ? "filled" : "light"}
//           color="brand"
//           leftSection={nativeInstall ? <Download size={12} /> : undefined}
//           onClick={onInstall}
//           style={{ flexShrink: 0 }}
//         >
//           {nativeInstall ? "Install" : "How to install"}
//         </Button>

//         <ActionIcon
//           variant="subtle"
//           color="gray"
//           size="sm"
//           onClick={() => setVisible(false)}
//           aria-label="Dismiss install prompt"
//           style={{ flexShrink: 0 }}
//         >
//           <X size={13} />
//         </ActionIcon>
//       </Group>
//     </Paper>
//   );
// }

// function BoxFallback({ children }: { children: ReactNode }) {
//   return <div style={{ minWidth: 0, flex: 1 }}>{children}</div>;
// }



import { useEffect, useState, type ReactNode } from "react";
import { ActionIcon, Button, Group, Paper, Text } from "@mantine/core";
import { Download, Share, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  consumeInstallPrompt,
  hasInstallPrompt,
  isIOSBrowser,
  isMobileBrowser,
  isPwaInstalled,
  isSmallScreen,
  subscribePwa,
} from "../lib/pwa";

const MOBILE_HIDE_MS = 15000;
// Key to remember "already shown this session"
const SESSION_SHOWN_KEY = "VaultHub_pwa_prompt_shown_this_session";

export function InstallPrompt() {
  const [visible, setVisible] = useState(() => {
    if (typeof navigator === "undefined") return false;
    // If already shown this session, do NOT show again
    if (sessionStorage.getItem(SESSION_SHOWN_KEY) === "true") return false;
    return !isPwaInstalled() && (isMobileBrowser() || isSmallScreen());
  });

  // Mark as shown the moment it becomes visible
  useEffect(() => {
    if (visible) {
      sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
    }
  }, [visible]);

  useEffect(
    () =>
      subscribePwa(() =>
        setVisible(
          !isPwaInstalled() &&
            sessionStorage.getItem(SESSION_SHOWN_KEY) !== "true" &&
            (hasInstallPrompt() || isIOSBrowser() || isMobileBrowser() || isSmallScreen()),
        ),
      ),
    [],
  );

  useEffect(() => {
    if (!visible) return;
    const timeout = window.setTimeout(
      () => setVisible(false),
      isMobileBrowser() || isSmallScreen() ? MOBILE_HIDE_MS : 7000,
    );
    return () => window.clearTimeout(timeout);
  }, [visible]);

  if (!visible) return null;

  const nativeInstall = hasInstallPrompt();
  const ios = isIOSBrowser() && !nativeInstall;

  const onInstall = async () => {
    if (!nativeInstall) {
      toast("Open your browser menu and choose 'Install app' or 'Add to Home screen'.");
      return;
    }
    const outcome = await consumeInstallPrompt();
    if (outcome === "accepted") toast.success("VaultHub installed — check your home screen!");
    setVisible(false);
  };

  return (
    <Paper
      withBorder
      shadow="sm"
      radius="md"
      p={8}
      className="VaultHub-install-prompt"
      style={{
        position: "fixed",
        right: 16,
        bottom: 84,
        zIndex: 60,
        width: 280,
        maxWidth: "calc(100vw - 32px)",
        background: "var(--mantine-color-body)",
      }}
    >
      <Group gap={8} wrap="nowrap" align="center">
        <BoxFallback>
          <Text fz="xs" fw={700} lh={1.2}>
            {ios ? "Add VaultHub to Home Screen" : "Install VaultHub"}
          </Text>
          <Text fz={10} c="dimmed" lh={1.25} mt={2}>
            {ios ? (
              <>
                Tap <Share size={11} style={{ display: "inline", verticalAlign: -2 }} /> Share, then choose{" "}
                <Text component="span" fw={700} inherit>"Add to Home Screen"</Text>.
              </>
            ) : nativeInstall ? (
              "Quick access from your home screen."
            ) : (
              "Use your browser menu to install."
            )}
          </Text>
        </BoxFallback>

        <Button
          size="compact-xs"
          variant={nativeInstall ? "filled" : "light"}
          color="brand"
          leftSection={nativeInstall ? <Download size={12} /> : undefined}
          onClick={onInstall}
          style={{ flexShrink: 0 }}
        >
          {nativeInstall ? "Install" : "How to install"}
        </Button>

        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => setVisible(false)}
          aria-label="Dismiss install prompt"
          style={{ flexShrink: 0 }}
        >
          <X size={13} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}

function BoxFallback({ children }: { children: ReactNode }) {
  return <div style={{ minWidth: 0, flex: 1 }}>{children}</div>;
}