// import { Link } from 'react-router-dom';

// export function Footer() {
//   return (
//     <footer className="border-t border-gray-200 bg-white mt-16">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//           <div className="text-sm text-gray-500">
//             © {new Date().getFullYear()} VaultHub. All rights reserved.
//           </div>
//           <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
//             <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link>
//             <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</Link>
//             <Link to="/cookies" className="text-gray-600 hover:text-blue-600 transition-colors">Cookie Policy</Link>
//             <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
//             <Link to="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</Link>
//             <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
//           </nav>
//         </div>
//       </div>
//     </footer>
//   );
// }

import { Link } from "react-router-dom";
import { Anchor, Divider, Group, Stack, Text } from "@mantine/core";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--mantine-color-default-border)", background: "var(--mantine-color-body)" }}>
      <Stack gap="lg" px="md" py="xl" style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Group justify="space-between" wrap="wrap" align="flex-start" gap="xl">
          <Stack gap={6}>
            <Logo />
            <Text fz="xs" c="dimmed" maw={300}>
              Simple, private file sharing. Encrypted in your browser, deleted on schedule — nothing stays online forever.
            </Text>
          </Stack>

          <Stack gap={4} align="flex-start">
            <Text fz={11} fw={700} tt="uppercase" c="dimmed">Product</Text>
            <Anchor component={Link} to="/how" fz="sm" c="dimmed" underline="never">How it works</Anchor>
            <Anchor component={Link} to="/faq" fz="sm" c="dimmed" underline="never">FAQ</Anchor>
            <Anchor component={Link} to="/about" fz="sm" c="dimmed" underline="never">About</Anchor>
          </Stack>

          <Stack gap={4} align="flex-start">
            <Text fz={11} fw={700} tt="uppercase" c="dimmed">Legal</Text>
            <Anchor component={Link} to="/terms" fz="sm" c="dimmed" underline="never">Terms</Anchor>
            <Anchor component={Link} to="/privacy" fz="sm" c="dimmed" underline="never">Privacy</Anchor>
            <Anchor component={Link} to="/cookies" fz="sm" c="dimmed" underline="never">Cookies</Anchor>
          </Stack>

          <Stack gap={4} align="flex-start">
            <Text fz={11} fw={700} tt="uppercase" c="dimmed">Contact</Text>
            {/* TODO: replace with your real email */}
            <Anchor href="mailto:rk096327945@gmail.com" fz="sm" c="dimmed" underline="never">rk096327945@gmail.com</Anchor>
          </Stack>
        </Group>

        <Divider />

        <Group justify="space-between" wrap="wrap" gap="xs">
          <Text fz="xs" c="dimmed">© {new Date().getFullYear()} VaultHub. All rights reserved.</Text>
          <Text fz="xs" c="dimmed">Files expire after 1 day or 10 downloads — automatically.</Text>
        </Group>
      </Stack>
    </footer>
  );
}

export default Footer;