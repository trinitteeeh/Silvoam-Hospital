import { collection, deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import { getAllData } from "./DataAccess";

export async function prepareFood(roomID, patientID, staffList, bedID) {
  const kitchenStaffList = staffList.filter((staff) => staff.role === "Kitchen Staff");

  for (let i = 0; i < 3; i++) {
    const newDocRef = doc(collection(db, "jobs"));
    const randomIndex = Math.floor(Math.random() * kitchenStaffList.length);
    const staffID = kitchenStaffList[randomIndex]?.id;

    const dueDate = new Date();

    if (i === 0) {
      dueDate.setHours(8, 0, 0, 0);
    } else if (i === 1) {
      dueDate.setHours(12, 0, 0, 0);
    } else if (i === 2) {
      dueDate.setHours(18, 0, 0, 0);
    }

    const newData = {
      id: newDocRef.id,
      name: "Preparing Food",
      status: "Incomplete",
      category: "Kitchen Staff",
      assignDate: serverTimestamp(),
      dueDate,
      description: "Preparing food for the patient",
      roomID: roomID,
      patientID: patientID,
      staffID: staffID,
      bedID: bedID,
    };
    await setDoc(newDocRef, newData);
  }
}

export async function servingFood(roomID, patientID, staffList, bedID) {
  const kitchenStaffList = staffList.filter((staff) => staff.role === "Kitchen Staff");

  for (let i = 0; i < 3; i++) {
    const newDocRef = doc(collection(db, "jobs"));
    const randomIndex = Math.floor(Math.random() * kitchenStaffList.length);
    const staffID = kitchenStaffList[randomIndex]?.id;

    const dueDate = new Date();

    if (i === 0) {
      dueDate.setHours(9, 0, 0, 0);
    } else if (i === 1) {
      dueDate.setHours(13, 0, 0, 0);
    } else if (i === 2) {
      dueDate.setHours(19, 0, 0, 0);
    }

    const newData = {
      id: newDocRef.id,
      name: "Serving Food",
      status: "Incomplete",
      category: "Kitchen Staff",
      assignDate: serverTimestamp(),
      dueDate,
      description: "Serving food for the patient",
      roomID: roomID,
      patientID: patientID,
      staffID: staffID,
      bedID: bedID,
    };
    await setDoc(newDocRef, newData);
  }
}

export async function cleaningRoom(roomID, patientID, staffList, bedID) {
  const newDocRef = doc(collection(db, "jobs"));
  const kitchenStaffList = staffList.filter((staff) => staff.role === "Cleaning Service");

  const randomIndex = Math.floor(Math.random() * kitchenStaffList.length);
  const staffID = kitchenStaffList[randomIndex]?.id;

  const dueDate = new Date();
  dueDate.setHours(Math.random() < 0.5 ? 11 : 19, 0, 0, 0);

  const newData = {
    id: newDocRef.id,
    name: "Cleaning Room",
    status: "Incomplete",
    category: "Cleaning Service",
    assignDate: serverTimestamp(),
    dueDate,
    description: "Cleaning the patient room",
    roomID: roomID,
    patientID: patientID,
    staffID: staffID,
    bedID: bedID,
  };
  await setDoc(newDocRef, newData);
}

export async function checkingPatient(roomID, patientID, staffList, bedID) {
  const kitchenStaffList = staffList.filter((staff) => staff.role === "Nurse");

  for (let i = 0; i < 3; i++) {
    const newDocRef = doc(collection(db, "jobs"));
    const randomIndex = Math.floor(Math.random() * kitchenStaffList.length);
    const staffID = kitchenStaffList[randomIndex]?.id;

    const dueDate = new Date();

    if (i === 0) {
      dueDate.setHours(10, 0, 0, 0);
    } else if (i === 1) {
      dueDate.setHours(14, 0, 0, 0);
    } else if (i === 2) {
      dueDate.setHours(20, 0, 0, 0);
    }

    const newData = {
      id: newDocRef.id,
      name: "Checking Patient",
      status: "Incomplete",
      category: "Nurse",
      assignDate: serverTimestamp(),
      dueDate,
      description: "Checking the patient condition",
      roomID: roomID,
      patientID: patientID,
      staffID: staffID,
      bedID: bedID,
    };
    await setDoc(newDocRef, newData);
  }
}

export async function escortPatient(roomID, patientID, staffList, bedID) {
  const kitchenStaffList = staffList.filter((staff) => staff.role === "Nurse");

  const newDocRef = doc(collection(db, "jobs"));
  const randomIndex = Math.floor(Math.random() * kitchenStaffList.length);
  const staffID = kitchenStaffList[randomIndex]?.id;

  const dueDate = new Date();
  dueDate.setHours(19, 0, 0, 0);

  const newData = {
    id: newDocRef.id,
    name: "Escort Patient to Bed",
    status: "Incomplete",
    category: "Nurse",
    assignDate: serverTimestamp(),
    dueDate,
    description: "Escort Patient to newly assigned bed",
    roomID: roomID,
    patientID: patientID,
    staffID: staffID,
    bedID: bedID,
  };
  await setDoc(newDocRef, newData);
}

export async function prepareBed(roomID, patientID, staffList, bedID) {
  const newDocRef = doc(collection(db, "jobs"));
  const kitchenStaffList = staffList.filter((staff) => staff.role === "Cleaning Service");

  const randomIndex = Math.floor(Math.random() * kitchenStaffList.length);
  const staffID = kitchenStaffList[randomIndex]?.id;

  const dueDate = new Date();
  dueDate.setHours(23, 59, 59, 0);

  const newData = {
    id: newDocRef.id,
    name: "Making the Bed",
    status: "Incomplete",
    category: "Cleaning Service",
    assignDate: serverTimestamp(),
    dueDate,
    description: "Prepare the bed to be usable",
    roomID: roomID,
    patientID: patientID,
    staffID: staffID,
    bedID: bedID,
  };
  await setDoc(newDocRef, newData);
}

export async function deleteBed(roomID, patientID, staffList, bedID) {
  const newDocRef = doc(collection(db, "jobs"));
  const kitchenStaffList = staffList.filter((staff) => staff.role === "Cleaning Service");

  const randomIndex = Math.floor(Math.random() * kitchenStaffList.length);
  const staffID = kitchenStaffList[randomIndex]?.id;

  const dueDate = new Date();
  dueDate.setHours(23, 59, 59, 0);

  const newData = {
    id: newDocRef.id,
    name: "Delete Bed",
    status: "Incomplete",
    category: "Cleaning Service",
    assignDate: serverTimestamp(),
    dueDate,
    description: "Remove the bed from the room",
    roomID: roomID,
    patientID: patientID,
    staffID: staffID,
    bedID: bedID,
  };
  await setDoc(newDocRef, newData);
}


export async function deleteJob(bedID) {
  const jobList = await getAllJob();

  const filteredList = jobList.filter((job) => job.bedID == bedID);

  filteredList.map((job) => {
    const documentRef = doc(db, "jobs", job.id);
    deleteDoc(documentRef);
  });
}

export async function getAllJob() {
  const collectionName = "jobs";
  const data = await getAllData(collectionName);
  return data;
}
