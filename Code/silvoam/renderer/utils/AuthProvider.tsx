import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase-config";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import { deleteUser } from "firebase/auth";

interface User {
  id: string;
  name: string;
  role: string;
  email: String;
}

interface AuthContextProps {
  user: User | null;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
  approve: (id: string, selectedShift: string) => Promise<void>;
  deleteUserCredential: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("id");
      const name = localStorage.getItem("name");
      const role = localStorage.getItem("role");
      const email = localStorage.getItem("email");
      if (name !== null) {
        setUser({ id, name, role, email });
      }
    }
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password).then(async (userCredentials) => {
        const user = userCredentials.user;
        const docStaffRef = doc(db, "staffs", user.uid);
        localStorage.clear();

        try {
          const snapShot = await getDoc(docStaffRef);

          if (snapShot.exists()) {
            const id = snapShot.id;
            const name = snapShot.data().name;
            const role = snapShot.data().role;
            const email = snapShot.data().email;

            localStorage.setItem("id", id);
            localStorage.setItem("name", name);
            localStorage.setItem("role", role);
            localStorage.setItem("email", email);

            setUser({ id, name, role, email });
          }
        } catch (error) {
          console.error(error);
        }
      });
      router.push("/dashboard");
    } catch (error) {}
  };

  const logout = async () => {
    try {
      console.log("logout");
      localStorage.clear();
      await signOut(auth);
      setUser(null);
      router.push("/home");
    } catch (error) {}
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const userdb = userCredentials.user;

      const staffRef = collection(db, "staffs");
      await setDoc(doc(staffRef, userdb.uid), {
        name: name,
        email: email,
        password: password,
        role: "unauthorized",
        shiftID: "",
      });

      const requestRef = collection(db, "registrationrequests");
      await setDoc(doc(requestRef, userdb.uid), {
        name: name,
        email: email,
        password: password,
        role: role,
        shiftID: "",
        isAuth: false,
        requestDate: serverTimestamp(),
      });
      const id = userdb.uid;

      setUser({ id, name, role, email });
    } catch (error) {
      console.log(error.message);
    }
    router.push("/unauthorized/landing");
  };

  const approve = async (id: string, selectedShift: string) => {
    try {
      const registrationRef = doc(db, "registrationrequests", id);
      const registrationSnapshot = await getDoc(registrationRef);

      const staffRef = doc(db, "staffs", id);
      const staffSnapshot = await getDoc(staffRef);

      if (registrationSnapshot.exists()) {
        await updateDoc(registrationRef, {
          isAuth: true,
          shiftID: selectedShift,
          approved_at: serverTimestamp(),
        });
        if (staffSnapshot.exists()) {
          await updateDoc(staffRef, {
            role: registrationSnapshot.data().role,
            shiftID: selectedShift,
          });
        }
      }
    } catch (error) {
      console.error("Error updating user approval status:", error);
    }
  };

  const deleteUserCredential = async (id: string) => {};

  return <AuthContext.Provider value={{ user, signin, logout, signup, approve, deleteUserCredential } as AuthContextProps}>{children}</AuthContext.Provider>;
}

export default AuthContext;
