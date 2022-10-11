import { Button, Container, Text } from "@mantine/core";
import { useAuth } from "../../hooks/useAuth";

export function Home() {
  const { user, signOut } = useAuth();
  return (
    <Container>
      <Text>You are logged in with {(user as any)?.attributes?.email}</Text>
      <Button onClick={signOut}>Signout</Button>
    </Container>
  );
}
