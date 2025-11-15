// src/store/AuthStore.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential, User } from "firebase/auth";
import { auth } from "../config/firebase";

GoogleSignin.configure({
  webClientId:
    "629243027134-m19gr4q3erpvtoeh7lmuc4uf5u9bti21.apps.googleusercontent.com",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

type AuthContextType = {
  user: User;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((usr) => {
      console.log("Auth State Changed:", usr);
      setUser(usr);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        // setUser(response.data);
        console.log("Google Sign-In Success:", response.data);
        let idToken = response.data.idToken;
        if (idToken) {
          console.log("Got idToken, signing in to Firebase...");
          const credential = GoogleAuthProvider.credential(idToken);
          const result = await signInWithCredential(auth, credential);
          console.log("Firebase sign-in successful:", result.user.email);
        } else {
          console.log("No idToken received from Google");
        }
      } else {
        // sign in was cancelled by user
        console.log("Google Sign-In cancelled by user");
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            console.log("Sign-in already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            console.log("Play services not available or outdated");
            break;
          default:
            // some other error happened
            console.error("Google Sign-In Error:", error);
        }
      } else {
        // an error that's not related to google sign in occurred
        console.error("Google Sign-In Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await auth.signOut();
    await GoogleSignin.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
