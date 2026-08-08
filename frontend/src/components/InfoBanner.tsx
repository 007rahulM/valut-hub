import { Alert } from "@mantine/core";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface InfoBannerProps {
  children: ReactNode;
  color?: "blue" | "green" | "red";
}

export function InfoBanner({ children, color = "blue" }: InfoBannerProps) {
  return (
    <Alert color={color} variant="light" icon={<Info size={16} />} radius="md">
      {children}
    </Alert>
  );
}