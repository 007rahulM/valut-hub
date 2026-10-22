


// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { ActionIcon, Box, Group, Menu, Text, Tooltip } from "@mantine/core";
// import { Menu as MenuIcon } from "lucide-react";
// import { Logo } from "./Logo";

// const links = [
//   { to: "/", label: "Upload", tip: "Send a file" },
//   { to: "/how", label: "How it works", tip: "Four simple steps" },
//   { to: "/faq", label: "FAQ", tip: "Quick answers" },
//   { to: "/about", label: "About", tip: "Why VaultHub" },
//   { to: "/terms", label: "Terms", tip: "The rules" },
//   { to: "/privacy", label: "Privacy", tip: "What we store" },
// ];

// export function Header() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   return (
//     <Box
//   px="md" py={{ base: 4, sm: "xs" }}
//       style={{
//         position: "sticky", top: 0, zIndex: 40,
//         borderBottom: "1px solid var(--mantine-color-default-border)",
//         background: "color-mix(in srgb, var(--mantine-color-body) 85%, transparent)",
//         backdropFilter: "blur(8px)",
//       }}
//     >
//       <Group justify="space-between">
//         <Link to="/" style={{ textDecoration: "none" }}><Logo /></Link>

//         <Group gap="lg" visibleFrom="md">
//           {links.map((l) => (
//             <Tooltip key={l.to} label={l.tip} events={{ hover: true, focus: true, touch: true }}>
//               <Text
//                 component={Link} to={l.to} fz="sm"
//                 fw={location.pathname === l.to ? 700 : 500}
//                 c={location.pathname === l.to ? "var(--mantine-color-brand-7)" : "dimmed"}
//                 style={{ textDecoration: "none" }}
//               >
//                 {l.label}
//               </Text>
//             </Tooltip>
//           ))}
//         </Group>

//         <Box hiddenFrom="md">
//           <Menu shadow="md" width={220} position="bottom-end">
//             <Menu.Target>
//               <ActionIcon variant="default" radius="md" size="lg" aria-label="Open menu">
//                 <MenuIcon size={18} />
//               </ActionIcon>
//             </Menu.Target>
//             <Menu.Dropdown>
//               {links.map((l) => (
//                 <Menu.Item key={l.to} onClick={() => navigate(l.to)}>{l.label}</Menu.Item>
//               ))}
//             </Menu.Dropdown>
//           </Menu>
//         </Box>
//       </Group>
//     </Box>
//   );
// }

// export default Header;


// ============================================================
// Header - sticky top bar with theme toggle always visible.
// Desktop: logo + links with tooltips + toggle
// Mobile:  logo + toggle + hamburger menu
// ============================================================
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ActionIcon, Box, Group, Menu, Text, Tooltip } from "@mantine/core";
import { Menu as MenuIcon } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Upload", tip: "Send a file" },
  { to: "/how", label: "How it works", tip: "Four simple steps" },
  { to: "/faq", label: "FAQ", tip: "Quick answers" },
  { to: "/about", label: "About", tip: "Why VaultHub" },
  { to: "/terms", label: "Terms", tip: "The rules" },
  { to: "/privacy", label: "Privacy", tip: "What we store" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      px="md" py={{ base: 4, sm: "xs" }}
      style={{
        position: "sticky", top: 0, zIndex: 40,
        borderBottom: "1px solid var(--mantine-color-default-border)",
        background: "color-mix(in srgb, var(--mantine-color-body) 85%, transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Group justify="space-between">
        <Link to="/" style={{ textDecoration: "none" }}><Logo /></Link>

        <Group gap="lg" visibleFrom="md">
          {links.map((l) => (
            <Tooltip key={l.to} label={l.tip} events={{ hover: true, focus: true, touch: true }}>
              <Text
                component={Link} to={l.to} fz="sm"
                fw={location.pathname === l.to ? 700 : 500}
                c={location.pathname === l.to ? "var(--mantine-color-brand-7)" : "dimmed"}
                style={{ textDecoration: "none" }}
              >
                {l.label}
              </Text>
            </Tooltip>
          ))}
        </Group>

        <Group gap="xs">
          <ThemeToggle />
          <Box hiddenFrom="md">
            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="default" radius="md" size="lg" aria-label="Open menu">
                  <MenuIcon size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {links.map((l) => (
                  <Menu.Item key={l.to} onClick={() => navigate(l.to)}>{l.label}</Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Group>
      </Group>
    </Box>
  );
}

export default Header;