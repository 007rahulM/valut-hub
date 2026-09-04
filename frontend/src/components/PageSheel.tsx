// import type { ReactNode } from "react";
// import { Box, Card, Container, Text, Title } from "@mantine/core";

// interface PageShellProps {
//   title: string;
//   subtitle?: string;
//   children: ReactNode;
// }

// // Shared shell for info pages.
// // lg = wide on laptops, still full-width and stacked on phones.
// export function PageShell({ title, subtitle, children }: PageShellProps) {
//   return (
//     <Container size="lg" py={{ base: "md", sm: "xl" }}>
//       <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
//         <Title order={2}>{title}</Title>
//         {subtitle && <Text c="dimmed" fz="sm" mt={4}>{subtitle}</Text>}
//         <Box mt="md">{children}</Box>
//       </Card>
//     </Container>
//   );
// }

// export default PageShell;


import type { ReactNode } from "react";
import { Box, Card, Container, Text, Title } from "@mantine/core";

interface PageShellProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  children: ReactNode;
}

export function PageShell({ title, subtitle, center = false, children }: PageShellProps) {
  return (
    <Container size="lg" py={{ base: "md", sm: "xl" }}>
      <Card withBorder shadow="sm" radius="lg" p={{ base: "md", sm: "xl" }}>
        <Title order={2} ta={center ? "center" : undefined}>{title}</Title>
        {subtitle && (
          <Text c="dimmed" fz="sm" mt={4} ta={center ? "center" : undefined}>
            {subtitle}
          </Text>
        )}
        <Box mt="md">{children}</Box>
      </Card>
    </Container>
  );
}

export default PageShell;