import { Link } from "react-router-dom";
import { Button, Card, Stack, Text, Title } from "@mantine/core";
import { Upload } from "lucide-react";
import { Illustration } from "../Illustration";

export function LinkExpiredCard() {
  return (
    <Card withBorder shadow="sm" radius="lg" p="xl">
      <Stack align="center" gap="md">
        <Illustration src="/illustrations/link-expired.svg" alt="Link no longer available" maxWidth={260} />
        <Title order={2}>This link is no longer available</Title>
       <Text c="dimmed" fz="sm" ta="center" maw={420}>
  Sendly links delete themselves after their configured time or download limit this one has already
  done its job, If you were expecting a file, ask the sender for a fresh link.
</Text>
        <Button component={Link} to="/" leftSection={<Upload size={16} />}>Send a file instead</Button>
      </Stack>
    </Card>
  );
}

export default LinkExpiredCard; 