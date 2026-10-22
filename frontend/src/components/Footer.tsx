// // ============================================================
// // Footer - structured on every screen, compact on phones
// // Mobile: brand row, one-line promise, 2-col link grid, legal row
// // Desktop: same blocks, 4-col grid
// // ============================================================
// import { Link } from "react-router-dom";
// import { Anchor, Group, SimpleGrid, Stack, Text } from "@mantine/core";
// import { Star } from "lucide-react";
// import { Logo } from "./Logo";

// export function Footer() {
//   return (
//     <footer style={{ borderTop: "1px solid var(--mantine-color-default-border)", background: "var(--mantine-color-body)" }}>
//       <Stack gap="md" px="md" py="md" style={{ maxWidth: 1080, margin: "0 auto" }}>
//         {/* Row 1: brand + copyright */}
//         <Group justify="space-between" align="center" wrap="wrap" gap={8}>
//           <Logo />
//           <Text fz={11} c="dimmed">© {new Date().getFullYear()} VaultHub all rights reserved</Text>
//         </Group>

//         {/* Row 2: the one-line promise */}
//         <Text fz="xs" c="dimmed" lh={1.5}>
//           Share files that stay yours. Locked on your device, gone on schedule.
//         </Text>

//         {/* Row 3: link columns (2 on phones, 4 on desktop) */}
//         <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" verticalSpacing="md">
//           <Stack gap={4} align="flex-start">
//             <Text fz={10} fw={700} tt="uppercase" c="dimmed">Product</Text>
//             <Anchor component={Link} to="/how" fz="xs" c="dimmed" underline="never">How it works</Anchor>
//             <Anchor component={Link} to="/faq" fz="xs" c="dimmed" underline="never">FAQ</Anchor>
//             <Anchor component={Link} to="/about" fz="xs" c="dimmed" underline="never">About</Anchor>
//           </Stack>
//           <Stack gap={4} align="flex-start">
//             <Text fz={10} fw={700} tt="uppercase" c="dimmed">Legal</Text>
//             <Anchor component={Link} to="/terms" fz="xs" c="dimmed" underline="never">Terms</Anchor>
//             <Anchor component={Link} to="/privacy" fz="xs" c="dimmed" underline="never">Privacy</Anchor>
//             <Anchor component={Link} to="/cookies" fz="xs" c="dimmed" underline="never">Cookies</Anchor>
//           </Stack>
//           <Stack gap={4} align="flex-start">
//             <Text fz={10} fw={700} tt="uppercase" c="dimmed">Contact</Text>
//             <Anchor href="mailto:rk096327945@gmail.com" fz="xs" c="dimmed" underline="never">Email us</Anchor>
//           </Stack>
//           <Stack gap={4} align="flex-start">
//             <Text fz={10} fw={700} tt="uppercase" c="dimmed">Feedback</Text>
//             <Anchor component={Link} to="/feedback" fz="xs" c="dimmed" underline="never"
//               style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
//               <Star size={12} /> Rate us
//             </Anchor>
//           </Stack>
//         </SimpleGrid>

//         {/* Row 4: legal line */}
//         <Text fz={11} c="dimmed" style={{ borderTop: "1px solid var(--mantine-color-default-border)", paddingTop: 10 }}>
//           All rights reserved. Files expire after 1 day or 10 downloads.
//         </Text>
//       </Stack>
//     </footer>
//   );
// }

// export default Footer;


// ============================================================
// Footer - structured on every screen, compact on phones
// Mobile: brand row, one-line promise, 2-col link grid, legal row
// Desktop: same blocks, 4-col grid
// ============================================================
import { Link } from "react-router-dom";
import { Anchor, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { Star } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="VaultHub-footer" style={{ borderTop: "1px solid var(--mantine-color-default-border)", background: "var(--mantine-color-body)" }}>
      <Stack gap="md" px="md" py="md" style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Row 1: brand + copyright */}
        <Group justify="space-between" align="center" wrap="wrap" gap={8}>
          <Logo />
          <Text fz={11} c="dimmed">© {new Date().getFullYear()} VaultHub. All rights reserved.</Text>
        </Group>

        {/* Row 2: the one-line promise */}
        <Text fz="xs" c="dimmed" lh={1.5}>
          Share files that stay yours. Locked on your device, gone on schedule.
        </Text>

        {/* Row 3: link columns (2 on phones, 4 on desktop) */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" verticalSpacing="md">
          <Stack gap={4} align="flex-start">
            <Text fz={10} fw={700} tt="uppercase" c="dimmed">Product</Text>
            <Anchor component={Link} to="/how" fz="xs" c="dimmed" underline="never">How it works</Anchor>
            <Anchor component={Link} to="/faq" fz="xs" c="dimmed" underline="never">FAQ</Anchor>
            <Anchor component={Link} to="/about" fz="xs" c="dimmed" underline="never">About</Anchor>
          </Stack>
          <Stack gap={4} align="flex-start">
            <Text fz={10} fw={700} tt="uppercase" c="dimmed">Legal</Text>
            <Anchor component={Link} to="/terms" fz="xs" c="dimmed" underline="never">Terms</Anchor>
            <Anchor component={Link} to="/privacy" fz="xs" c="dimmed" underline="never">Privacy</Anchor>
            <Anchor component={Link} to="/cookies" fz="xs" c="dimmed" underline="never">Cookies</Anchor>
          </Stack>
          <Stack gap={4} align="flex-start">
            <Text fz={10} fw={700} tt="uppercase" c="dimmed">Contact</Text>
            <Anchor href="mailto:rk096327945@gmail.com" fz="xs" c="dimmed" underline="never">Email us</Anchor>
          </Stack>
          <Stack gap={4} align="flex-start">
            <Text fz={10} fw={700} tt="uppercase" c="dimmed">Feedback</Text>
            <Anchor component={Link} to="/feedback" fz="xs" c="dimmed" underline="never"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Star size={12} /> Rate us
            </Anchor>
          </Stack>
        </SimpleGrid>

        {/* Row 4: legal line */}
        <Text fz={11} c="dimmed" style={{ borderTop: "1px solid var(--mantine-color-default-border)", paddingTop: 10 }}>
          Temporary shares are removed automatically when their time or download limit is reached.
        </Text>
      </Stack>
    </footer>
  );
}

export default Footer;