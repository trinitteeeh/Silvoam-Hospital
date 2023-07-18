import { collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import { checkingPatient, cleaningRoom, prepareFood, servingFood } from "./CreateJob";
import { getAllData } from "./DataAccess";

export async function handleMakeBedAvailable(bedID) {
  const bedRef = doc(db, "beds", bedID);
  const bedSnapshot = await getDoc(bedRef);

  const newData = {
    ...bedSnapshot.data(),
    status: "Available",
  };
  await updateDoc(bedRef, newData);
}

export async function handleEscortPatient(bedID, roomID, patientID) {
  const bedRef = doc(db, "beds", bedID);
  const bedSnapshot = await getDoc(bedRef);

  const newData = {
    ...bedSnapshot.data(),
    status: "Filled with patient",
  };
  await updateDoc(bedRef, newData);
  const staffData = await getAllData("staffs");

  prepareFood(roomID, patientID, staffData, bedID);
  servingFood(roomID, patientID, staffData, bedID);
  cleaningRoom(roomID, patientID, staffData, bedID);
  checkingPatient(roomID, patientID, staffData, bedID);
}

export async function handleDeleteBed(bedID) {
  const bedRef = doc(db, "beds", bedID);
  deleteDoc(bedRef);
}

export async function handleUseAmbulance(bedID, roomID, patientID, ambulanceID) {
  handleEscortPatient(bedID, roomID, patientID);
  const bedRef = doc(db, "beds", bedID);
  const bedSnapshot = await getDoc(bedRef);

  const newData = {
    ...bedSnapshot.data(),
    status: "Filled with patient",
    sickness: "Emergency",
    doctorID: "iNkfaQla1QatKaJWw0OnzXB9NBV2",
  };
  await updateDoc(bedRef, newData);

  const newAmbulanceRef = doc(collection(db, "ambulances"), ambulanceID);
  const ambulanceSnapShot = await getDoc(newAmbulanceRef);

  const ambulanceData = {
    ...ambulanceSnapShot.data(),
    status: "available",
  };

  await updateDoc(newAmbulanceRef, ambulanceData);
}
