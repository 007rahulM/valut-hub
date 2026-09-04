// // import { useEffect, useState } from "react";
// // import { ActionIcon, Button, Group, Paper, Text } from "@mantine/core";
// // import { Download, Share, X } from "lucide-react";
// // import toast from "react-hot-toast";
// // import { consumeInstallPrompt, hasInstallPrompt, isIOSBrowser, subscribePwa } from "../lib/pwa";

// // const AUTO_HIDE_MS = 7000; // shows ~7s, then quietly disappears on its own

// // export function InstallPrompt() {
// //   const [visible, setVisible] = useState(false);

// //   useEffect(
// //     () => subscribePwa(() => setVisible(hasInstallPrompt() || isIOSBrowser())),
// //     []
// //   );

// //   // Auto-hide after 7 seconds if the user does nothing.
// //   useEffect(() => {
// //     if (!visible) return;
// //     const t = window.setTimeout(() => setVisible(false), AUTO_HIDE_MS);
// //     return () => window.clearTimeout(t);
// //   }, [visible]);

// //   if (!visible) return null;

// //   const ios = isIOSBrowser() && !hasInstallPrompt();

// //   const onInstall = async () => {
// //     const outcome = await consumeInstallPrompt();
// //     if (outcome === "accepted") toast.success("Sendly installed — check your home screen!");
// //     setVisible(false);
// //   };

// //   return (
// //     <Paper
// //       withBorder
// //       shadow="md"
// //       radius="md"
// //       p="md"
// //       style={{
// //         position: "fixed",
// //         right: 16,
// //         bottom: 84, // above the mobile tab bar
// //         zIndex: 60,
// //         width: 280,
// //         maxWidth: "calc(100vw - 32px)", // never overflows on small phones
// //         background: "var(--mantine-color-body)",
// //       }}
// //     >
// //       <Group justify="space-between" mb={4}>
// //         <Text fz="sm" fw={700}>{ios ? "Add Sendly to Home Screen" : "Install Sendly"}</Text>
// //         <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setVisible(false)} aria-label="Dismiss">
// //           <X size={14} />
// //         </ActionIcon>
// //       </Group>

// //       {ios ? (
// //         <Text fz="xs" c="dimmed">
// //           Tap <Share size={12} style={{ display: "inline", verticalAlign: -2 }} /> Share at the bottom,
// //           then choose <Text component="span" fw={700} inherit>"Add to Home Screen"</Text>.
// //         </Text>
// //       ) : (
// //         <>
// //           <Text fz="xs" c="dimmed" mb="sm">
// //             Keep Sendly on your home screen for quick, app-like access.
// //           </Text>
// //           <Button fullWidth size="sm" color="brand" leftSection={<Download size={14} />} onClick={onInstall}>
// //             Install app
// //           </Button>
// //         </>
// //       )}
// //     </Paper>
// //   );
// // }


// import { useEffect, useState } from "react";
// import { ActionIcon, Button, Group, Paper, Text } from "@mantine/core";
// import { Download, Share, X } from "lucide-react";
// import toast from "react-hot-toast";
// import { consumeInstallPrompt, hasInstallPrompt, isIOSBrowser, isMobileBrowser, isPwaInstalled, subscribePwa } from "../lib/pwa";

// const AUTO_HIDE_MS = 15000; // mobile users need a little longer to notice the card

// export function InstallPrompt() {
//   const [visible, setVisible] = useState(false);

//   useEffect(
//     () => subscribePwa(() => setVisible(!isPwaInstalled() && (hasInstallPrompt() || isIOSBrowser() || isMobileBrowser()))),
//     []
//   );

//   // Auto-hide after a short period; mobile gets extra time to notice it.
//   useEffect(() => {
//     if (!visible) return;
//     const t = window.setTimeout(() => setVisible(false), isMobileBrowser() ? AUTO_HIDE_MS : 7000);
//     return () => window.clearTimeout(t);
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
//     if (outcome === "accepted") toast.success("Sendly installed — check your home screen!");
//     setVisible(false);
//   };

//   return (
//     <Paper
//       withBorder
//       shadow="md"
//       radius="md"
//       p={{ base: "sm", sm: "md" }}
//       className="sendly-install-prompt"
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
//       <Group justify="space-between" mb={4}>
//         <Text fz="sm" fw={700}>{ios ? "Add Sendly to Home Screen" : "Install Sendly"}</Text>
//         <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setVisible(false)} aria-label="Dismiss">
//           <X size={14} />
//         </ActionIcon>
//       </Group>

//       {ios ? (
//         <>
//           <Text fz="xs" c="dimmed" mb="sm">
//             Tap <Share size={12} style={{ display: "inline", verticalAlign: -2 }} /> Share at the bottom,
//             then choose <Text component="span" fw={700} inherit>"Add to Home Screen"</Text>.
//           </Text>
//           <Button fullWidth size="sm" variant="light" color="brand" onClick={onInstall}>
//             How to install
//           </Button>
//         </>
//       ) : nativeInstall ? (
//         <>
//           <Text fz="xs" c="dimmed" mb="sm">
//             Keep Sendly on your home screen for quick, app-like access.
//           </Text>
//           <Button fullWidth size="sm" color="brand" leftSection={<Download size={14} />} onClick={onInstall}>
//             Install app
//           </Button>
//         </>
//       ) : (
//         <>
//           <Text fz="xs" c="dimmed" mb="sm">
//             Your browser controls installation from its menu.
//           </Text>
//           <Button fullWidth size="sm" variant="light" color="brand" leftSection={<Download size={14} />} onClick={onInstall}>
//             How to install
//           </Button>
//         </>
//       )}
//     </Paper>
//   );
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

export function InstallPrompt() {
  const [visible, setVisible] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return !isPwaInstalled() && (isMobileBrowser() || isSmallScreen());
  });

  useEffect(
    () =>
      subscribePwa(() =>
        setVisible(
          !isPwaInstalled() &&
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
    if (outcome === "accepted") toast.success("Sendly installed — check your home screen!");
    setVisible(false);
  };

  return (
    <Paper
      withBorder
      shadow="sm"
      radius="md"
      p={8}
      className="sendly-install-prompt"
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
            {ios ? "Add Sendly to Home Screen" : "Install Sendly"}
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
