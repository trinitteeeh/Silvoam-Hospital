import admin from "firebase-admin";
import { db } from "../firebase/firebase-config";
import { collection, doc, setDoc } from "firebase/firestore";

const serviceAccount = require("../firebase/silvoam-hospital-2a591-firebase-adminsdk-sxrxw-bf2270d821.json");

const adminApp = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "adminApp"
);

const approve = async (email: string, password: string, name: string, role: string, shiftID: string) => {
  try {
    const userRecord = await adminApp.auth().createUser({
      email: email,
      password: password,
    });

    const staffRef = collection(db, "staffs");
    await setDoc(doc(staffRef, userRecord.uid), {
      name: name,
      email: email,
      password: password,
      role: role,
      shiftID: shiftID,
    });

    console.log("User created and staff details saved successfully.");
  } catch (error) {
    console.log("Error approving registration:", error.message);
  }
};
