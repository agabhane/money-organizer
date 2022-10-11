import { CognitoUser } from "@aws-amplify/auth";
import { Auth, Hub } from "aws-amplify";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: CognitoUser;
  signOut: () => void;
  signIn: (v: SignUpFormAttributes) => void | any;
};

export type SignUpFormAttributes = {
  email: string;
  password: string;
  verificationCode: string;
};

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<CognitoUser>(null!);
  const [loading, setLoading] = useState(true);

  function listenToAutoSignInEvent() {
    Hub.listen("auth", ({ payload }) => {
      const { event } = payload;
      if (event === "autoSignIn") {
        const user = payload.data;
        setUser(user);
        navigate("/");
      }
    });
  }

  const signOut = useCallback(() => {
    Auth.signOut().then(() => {
      setUser(null!);
    });
  }, []);

  const signIn = useCallback(async (v: SignUpFormAttributes) => {
    try {
      const user = await Auth.signIn(v.email, v.password);
      if (user) {
        setUser(user);
        navigate("/");
      }
    } catch (error: any) {
      return error;
    }
  }, []);

  const contextValue = useMemo<AuthContextType>(() => {
    return {
      user,
      signOut,
      signIn,
    };
  }, [user, signOut]);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      Auth.currentAuthenticatedUser()
        .then((user) => {
          console.log(user);
          setUser(user);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    listenToAutoSignInEvent();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
