import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase-config";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";

interface User {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const { email, uid } = authUser;
        const staffDocRef = doc(db, "staffs", uid);
        const staffDocSnapshot = await getDoc(staffDocRef);

        if (staffDocSnapshot.exists()) {
          const staffData = staffDocSnapshot.data();
          const { name, role } = staffData;
          setUser({ email, name, password: "", role });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      router.push("/home");
    } catch (error) {}
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/home");
    } catch (error) {}
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    try {
      const staffRef = collection(db, "registrationrequests");
      await setDoc(doc(staffRef), {
        name: name,
        email: email,
        password: password,
        role: role,
        startHour: "",
        endHour: "",
        // requestDate: serverTimestamp,
        isAuth: false,
      });
      router.push("/home");
    } catch (error) {
      console.log(error.message);
    }
  };

  return <AuthContext.Provider value={{ user, signin, logout, signup } as AuthContextProps}>{children}</AuthContext.Provider>;
}

export default AuthContext;
