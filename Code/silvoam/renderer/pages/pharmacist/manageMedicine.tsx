import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "../../components/Title";
import MiniDrawer from "../../components/Drawer";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, Timestamp, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, Switch, TextField, styled } from "@mui/material";
import AuthContext from "../../utils/AuthProvider";
import AddIcon from "@mui/icons-material/Add";
import { Medicine } from "../../utils/interface";

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function Request() {
  const [datas, setDatas] = React.useState<Medicine[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedMedicine, setSelectedMedicine] = React.useState<Medicine | null>(null);
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const [alertMessage, setAllertMessage] = React.useState("");
  const [addMedicine, setAddMedicine] = React.useState(false);

  React.useEffect(() => {
    if (dataChange) {
      fetchData();
      setDataChange(false);
    }
  }, [dataChange]);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const q = query(collection(db, "medicines"));
      const querySnapshot = await getDocs(q);
      const requests: Medicine[] = [];

      querySnapshot.forEach((doc) => {
        const request = doc.data() as Medicine;
        request.id = doc.id;
        requests.push(request);
      });

      setDatas(requests);
    } catch (error) {}
  };

  const handleDialog = (id: string) => {
    setOpen(true);
    const filteredData = datas.filter((data) => data.id === id);
    setSelectedMedicine(filteredData[0]);
  };

  const handleDeleteMedicine = (medicineID) => {
    const documentRef = doc(db, "medicines", medicineID);
    deleteDoc(documentRef);
    setOpen(false);
    setDataChange(true);
    setAllertMessage("Sucessfully Delete Medicine");
    setSnackBarOpen(true);
  };

  const handleUpdateMedicine = async () => {
    const medicineRef = doc(db, "medicines", selectedMedicine.id);
    const medicineSnapshot = await getDoc(medicineRef);

    if (medicineSnapshot.exists()) {
      const updatedData = {
        ...selectedMedicine,
      };
      await updateDoc(medicineRef, updatedData);
    }
    setOpen(false);
    setDataChange(true);
    setAllertMessage("Sucessfully Update Medicine");
    setSnackBarOpen(true);
  };

  const handleAddMedicine = async () => {
    const newMedicineRef = doc(collection(db, "medicines"));

    const newMedicineData = {
      ...selectedMedicine,
      id: newMedicineRef.id,
    };

    await setDoc(newMedicineRef, newMedicineData);

    setOpen(false);
    setDataChange(true);
    setAllertMessage("Successfully Added Medicine");
    setSnackBarOpen(true);
  };

  const handleOpenAddMedicine = () => {
    setSelectedMedicine(null);
    setAddMedicine(true);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setAddMedicine(false);
    setOpen(false);
  };

  return (
    <MiniDrawer>
      {" "}
      <React.Fragment>
        <Title>Medicine List</Title>
        <Dialog open={open} onClose={() => handleCloseDialog()} fullWidth={true} maxWidth="md">
          <DialogTitle>Medicine Detail</DialogTitle>
          <DialogContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="name"
                      name="name"
                      autoFocus
                      value={selectedMedicine ? selectedMedicine.name : ""}
                      onChange={(e) => {
                        setSelectedMedicine((prevMedicine) => ({
                          ...prevMedicine,
                          name: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="description"
                      fullWidth
                      name="description"
                      autoFocus
                      value={selectedMedicine ? selectedMedicine.description : ""}
                      onChange={(e) => {
                        setSelectedMedicine((prevMedicine) => ({
                          ...prevMedicine,
                          description: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Price</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="price"
                      name="price"
                      autoFocus
                      value={selectedMedicine ? selectedMedicine.price : ""}
                      onChange={(e) => {
                        setSelectedMedicine((prevMedicine) => ({
                          ...prevMedicine,
                          price: Number(e.target.value),
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Stock</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="stock"
                      name="stock"
                      autoFocus
                      value={selectedMedicine ? selectedMedicine.stock : ""}
                      onChange={(e) => {
                        setSelectedMedicine((prevMedicine) => ({
                          ...prevMedicine,
                          stock: Number(e.target.value),
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Weight</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="weight"
                      name="weight"
                      autoFocus
                      value={selectedMedicine ? selectedMedicine.weight : ""}
                      onChange={(e) => {
                        setSelectedMedicine((prevMedicine) => ({
                          ...prevMedicine,
                          weight: Number(e.target.value),
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            {addMedicine === true ? (
              <Button variant="contained" color="primary" onClick={() => handleAddMedicine()}>
                Add
              </Button>
            ) : (
              <>
                <Button variant="contained" color="primary" onClick={() => handleUpdateMedicine()}>
                  Update
                </Button>
                <Button variant="contained" color="secondary" onClick={() => handleDeleteMedicine(selectedMedicine.id)}>
                  Delete
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datas.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.name}</TableCell>
                <TableCell>{data.price}</TableCell>
                <TableCell>{data.stock}</TableCell>
                <TableCell>{data.weight} g</TableCell>
                <TableCell align="right">
                  <Button variant="contained" color="primary" onClick={() => handleDialog(data.id)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Snackbar open={snackbarOpen} autoHideDuration={6000}>
          <Alert onClose={() => setSnackBarOpen(false)} severity="success">
            {alertMessage}
          </Alert>
        </Snackbar>
        <Fab
          color="primary"
          aria-label="add"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
          }}
          onClick={() => handleOpenAddMedicine()}
        >
          <AddIcon />
        </Fab>
      </React.Fragment>
    </MiniDrawer>
  );
}
