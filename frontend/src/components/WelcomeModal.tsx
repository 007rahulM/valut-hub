import { useEffect } from "react";
import { Modal, Text, ActionIcon } from "@mantine/core";
import { X } from "lucide-react";

interface WelcomeModalProps {
  opened: boolean;
  onClose: () => void;
}

export function WelcomeModal({ opened, onClose }: WelcomeModalProps) {
  useEffect(() => {
    if (opened) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [opened, onClose]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="sm"
      withCloseButton={false}
      zIndex={201} // ✅ Higher than CookieBanner (100) and InstallPrompt (60)
      styles={{ 
        content: { borderRadius: 16, padding: 0, overflow: "hidden" }, 
        body: { padding: 0 } 
      }}
    >
      <div style={{ 
        background: "linear-gradient(135deg, #FFF4EF 0%, #FFE4D8 100%)", 
        padding: 24, 
        textAlign: "center", 
        position: "relative" 
      }}>
        <ActionIcon 
          variant="subtle" 
          color="gray" 
          size="sm" 
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 202 }}
          aria-label="Close welcome message"
        >
          <X size={16} />
        </ActionIcon>

        <img 
          src="/illustrations/welcome.svg" 
          alt="Welcome" 
          style={{ width: "100%", maxWidth: 180, margin: "0 auto 16px" }}
        />
        <Text fz="lg" fw={700} c="gray.9" mb="xs">Welcome to Sendly</Text>
        <Text fz="sm" c="gray.6">Simple, private file sharing</Text>
      </div>
    </Modal>
  );
}