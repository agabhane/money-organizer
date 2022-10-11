import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Group,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconWallet } from "@tabler/icons";
import { Auth, Hub } from "aws-amplify";
import { MouseEventHandler, useEffect, useState } from "react";
import { SignUpFormAttributes } from "../../contexts/authContext";
import { useAuth } from "../../hooks/useAuth";

export function Login() {
  const { signIn } = useAuth();
  const [step, setStep] = useState<"SIGNUP" | "VERIFICATION">("SIGNUP");
  const [error, setError] = useState();
  const form = useForm<SignUpFormAttributes>({
    initialValues: { email: "", password: "", verificationCode: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 8 ? "Password length should be greater than 8" : null,
    },
  });

  function listenToAutoSignInEvent() {
    Hub.listen("auth", ({ payload }) => {
      const { event } = payload;
      if (event === "autoSignIn") {
        const user = payload.data;
        console.log(user);
      } else if (event === "autoSignIn_failure") {
        // redirect to sign in page
        console.log("redirect to login");
      }
    });
  }

  useEffect(() => {
    listenToAutoSignInEvent();
  }, []);

  async function signUp(data: SignUpFormAttributes) {
    try {
      const { user } = await Auth.signUp({
        username: data.email,
        password: data.password,
        autoSignIn: {
          enabled: true,
        },
      });
      setStep("VERIFICATION");
    } catch (error) {
      console.log("error signing up:", error);
    }
  }

  async function confirmSignUp(data: SignUpFormAttributes) {
    try {
      await Auth.confirmSignUp(data.email, data.verificationCode);
    } catch (error) {
      console.log("error confirming sign up", error);
    }
  }

  function handleSignUp(v: SignUpFormAttributes) {
    if (step === "SIGNUP") {
      signUp(v);
    } else {
      confirmSignUp(v);
    }
  }

  async function handleLogin(v: SignUpFormAttributes) {
    const error = await signIn(v);
    if (error) {
      setError(error.message);
    }
  }

  return (
    <Center style={{ width: "100vw", height: "100vh" }}>
      <Card p={"lg"} sx={{ width: "100%" }}>
        <Group position="center" spacing={10}>
          <IconWallet className="logo" size={30} color="#555" />
          <Text
            className="logo"
            size={28}
            weight={500}
            sx={{ letterSpacing: 2 }}
            color="#555"
          >
            MO
          </Text>
        </Group>
        <form onSubmit={form.onSubmit(handleLogin)}>
          {step === "SIGNUP" && (
            <>
              <TextInput
                mt="sm"
                label="Email"
                placeholder="Email"
                {...form.getInputProps("email")}
              />
              <TextInput
                mt="sm"
                label="Password"
                type="password"
                placeholder="Password"
                {...form.getInputProps("password")}
              />
              {error && (
                <Alert mt="md" color="red">
                  {error}
                </Alert>
              )}
            </>
          )}
          {step === "VERIFICATION" && (
            <Box mt={"md"}>
              <Alert>
                Verification code has been sent on your email address
              </Alert>
              <TextInput
                mt="sm"
                label="Verification Code"
                placeholder="Verification Code"
                {...form.getInputProps("verificationCode")}
              />
            </Box>
          )}
          <Group position="center" grow mt={"lg"}>
            {step === "SIGNUP" && (
              <>
                <Button
                  mt="sm"
                  variant="outline"
                  onClick={
                    form.onSubmit(
                      handleSignUp
                    ) as unknown as MouseEventHandler<HTMLButtonElement>
                  }
                >
                  Signup
                </Button>
                <Button type="submit" mt="sm">
                  Login
                </Button>
              </>
            )}
            {step === "VERIFICATION" && (
              <Button
                mt="sm"
                onClick={
                  form.onSubmit(
                    handleSignUp
                  ) as unknown as MouseEventHandler<HTMLButtonElement>
                }
              >
                Verify
              </Button>
            )}
          </Group>
        </form>
      </Card>
    </Center>
  );
}
