import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase-config";

// Assuming you have a collection named "users"
const getData = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));

    const datas = [];
    querySnapshot.forEach((doc) => {
      // Access the document data using doc.data()
      const data = doc.data();
      datas.push(data);
    });
    return datas;
  } catch (error) {
    console.log("Error getting documents: ", error);
  }
};

export { getData };
