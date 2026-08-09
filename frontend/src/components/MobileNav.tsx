import { Link, useLocation } from "react-router-dom";
import { Box, Text } from "@mantine/core";
import { HelpCircle, Info, Star, Upload } from "lucide-react";

const tabs = [
  { to: "/", label: "Send", icon: Upload },
  { to: "/how", label: "How", icon: Info },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/feedback", label: "Rate", icon: Star },
];

export function MobileNav() {
  const location = useLocation();
  return (
    <Box
      hiddenFrom="md"
      component="nav"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--mantine-color-body)",
        borderTop: "1px solid var(--mantine-color-default-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Box style={{ display: "flex" }}>
        {tabs.map((t) => {
          const active = location.pathname === t.to;
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to}
              style={{ flex: 1, textDecoration: "none", padding: "10px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Icon size={20} style={{ color: active ? "var(--mantine-color-brand-6)" : "var(--mantine-color-dimmed)" }} />
              <Text fz={10} fw={active ? 700 : 500} c={active ? "brand" : "dimmed"}>{t.label}</Text>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}

export default MobileNav;