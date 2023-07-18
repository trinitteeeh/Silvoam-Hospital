import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import { Bed, Patient, Room, RoomType, Staff } from "./interface";
import dayjs from "dayjs";

// Insert data into a Firestore collection
export async function insertData(collectionName: string, data: any): Promise<void> {
  try {
    await addDoc(collection(db, collectionName), data);
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error;
  }
}

// Update data in a Firestore document
export async function updateData(collectionName: string, documentId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}

// Delete a Firestore document
export async function deleteData(collectionName: string, documentId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
}

// Retrieve all documents from a Firestore collection
export async function getAllData(collectionName: string): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data;
  } catch (error) {
    console.error("Error retrieving data:", error);
    throw error;
  }
}

export async function getAllRoom() {
  try {
    const collectionName = "rooms";
    const collectionData = await getAllData(collectionName);

    const collectionName2 = "beds";
    const collectionData2 = await getAllData(collectionName2);

    const allBedList: Bed[] = await Promise.all(
      collectionData2.map(async (data) => {
        const patientSnapshot = await getDoc(doc(db, "Patients", data.patientID));
        const doctorSnapshot = await getDoc(doc(db, "staffs", data.doctorID));
        if (patientSnapshot.exists()) {
          const patientData = patientSnapshot.data() as Patient;
          const patient: Patient = {
            ...patientData,
            id: patientSnapshot.id,
            dob: dayjs(patientData.dob.toDate()),
          };
          data.patient = patient;
        }

        if (doctorSnapshot.exists()) {
          const doctorData = doctorSnapshot.data() as Staff;
          const doctor: Staff = {
            ...doctorData,
            id: doctorSnapshot.id,
            shift: null,
          };
          data.doctor = doctor;
        }

        return {
          ...data,
          id: data.id,
        };
      })
    );

    const newDatas: Room[] = await Promise.all(
      collectionData.map(async (data) => {
        const roomTypeSnapshot = await getDoc(doc(db, "roomtypes", data.roomTypeID));
        const roomTypeData = roomTypeSnapshot.data() as RoomType;

        const bedList = allBedList.filter((bed) => bed.roomID === data.id);

        return {
          id: data.id,
          roomType: roomTypeData,
          buildingNumber: data.buildingNumber,
          floorNumber: data.floorNumber,
          bedQuantity: data.bedQuantity,
          bedList: bedList,
        };
      })
    );

    return newDatas;
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
}
