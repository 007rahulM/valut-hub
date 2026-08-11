

// ============================================================
// NotFoundPage — THE 404 / CATCH-ALL PAGE
// Shown for any URL that doesn't match a route (e.g. /helo).
// Simple: illustration, friendly text, one "Go home" button.
// (Not to be confused with LinkExpiredCard, which is for
// /file/:token links that existed but are now gone.)
// ============================================================


import { Link } from "react-router-dom";
import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import { Illustration } from "../components/Illustration";

export function NotFoundPage() {
  return (
    <Container size="xs" py="xl">
      <Card withBorder shadow="sm" radius="lg" p="xl">
        <Stack align="center" gap="md">
          <Illustration src="/illustrations/not-found.svg" alt="Page not found" maxWidth={260} />
          <Title order={2}>Page not found</Title>
          <Text c="dimmed" fz="sm" ta="center" maw={380}>
            The page you're looking for doesn't exist or has moved. File links also expire this one may have too.
          </Text>
          <Button component={Link} to="/">Go home</Button>
        </Stack>
      </Card>
    </Container>
  );
}

export default NotFoundPage;