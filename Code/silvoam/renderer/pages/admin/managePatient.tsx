import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MiniDrawer from "../../components/Drawer";
import { collection, doc, getDoc, getDocs, query, updateDoc, Timestamp, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Snackbar, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import EnhancedTableToolbar from "../../components/Table/TableToolbar";
import { Patient } from "../../utils/interface";

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function Request() {
  const [datas, setDatas] = React.useState<Patient[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const [alertMessage, setAllertMessage] = React.useState("");
  const [addPatient, setAddPatient] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);

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
      const q = query(collection(db, "Patients"));
      const querySnapshot = await getDocs(q);
      const patients: Patient[] = [];

      querySnapshot.forEach((doc) => {
        const patientData = doc.data() as Patient;
        const patient: Patient = {
          ...patientData,
          id: doc.id,
          dob: dayjs(patientData.dob.toDate()),
        };
        patients.push(patient);
      });

      setDatas(patients);
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  const handleDialog = (id: string) => {
    setOpen(true);
    const filteredData = datas.filter((data) => data.id === id);
    setSelectedPatient(filteredData[0]);
  };

  const handleDeletePatient = (PatientID) => {
    const documentRef = doc(db, "Patients", PatientID);
    deleteDoc(documentRef);
    setOpen(false);
    setDataChange(true);
    setAllertMessage("Sucessfully Delete Patient");
    setSnackBarOpen(true);
  };

  const handleUpdatePatient = async () => {
    const PatientRef = doc(db, "Patients", selectedPatient.id);
    const PatientSnapshot = await getDoc(PatientRef);

    if (PatientSnapshot.exists()) {
      const dobTimestamp = Timestamp.fromDate(selectedPatient.dob.toDate());
      const updatedData = {
        ...selectedPatient,
        dob: dobTimestamp,
      };
      await updateDoc(PatientRef, updatedData);
    }
    setOpen(false);
    setDataChange(true);
    setAllertMessage("Sucessfully Update Patient");
    setSnackBarOpen(true);
  };

  const handleAddPatient = async () => {
    const newPatientRef = doc(collection(db, "Patients"));

    const newPatientData = {
      ...selectedPatient,
      id: newPatientRef.id,
      dob: Timestamp.fromDate(selectedPatient.dob.toDate()),
    };

    await setDoc(newPatientRef, newPatientData);

    setOpen(false);
    setDataChange(true);
    setAllertMessage("Successfully Added Patient");
    setSnackBarOpen(true);
  };

  const handleOpenAddPatient = () => {
    setSelectedPatient(null);
    setAddPatient(true);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setAddPatient(false);
    setOpen(false);
  };

  const handleSeachQueryChange = (query) => {
    setSearchQuery(query);
    const formattedQuery = searchQuery.toLowerCase();
    const filteredDatas = datas.filter((data) => data.name.toLowerCase().includes(formattedQuery));
    setSearchResults(filteredDatas);
    console.log(searchQuery);
  };

  const filteredDatas = searchQuery ? searchResults : datas;

  return (
    <MiniDrawer>
      {" "}
      <React.Fragment>
        <EnhancedTableToolbar name="Manage Patient" showSearch={true} showFilter={false} searchQuery={searchQuery} setSearchQuery={handleSeachQueryChange} filterOption={null} setFilterValue={null} />
        <Dialog open={open} onClose={() => handleCloseDialog()} fullWidth={true} maxWidth="md">
          <DialogTitle>Patient Detail</DialogTitle>
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
                      fullWidth={true}
                      value={selectedPatient ? selectedPatient.name : ""}
                      onChange={(e) => {
                        setSelectedPatient((prevPatient) => ({
                          ...prevPatient,
                          name: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Phone</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="description"
                      name="description"
                      autoFocus
                      fullWidth={true}
                      value={selectedPatient ? selectedPatient.phone : ""}
                      onChange={(e) => {
                        setSelectedPatient((prevPatient) => ({
                          ...prevPatient,
                          phone: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>gender</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="price"
                      name="price"
                      autoFocus
                      fullWidth={true}
                      value={selectedPatient ? selectedPatient.gender : ""}
                      onChange={(e) => {
                        setSelectedPatient((prevPatient) => ({
                          ...prevPatient,
                          gender: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DOB</TableCell>
                  <TableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="DOB"
                        value={selectedPatient ? selectedPatient.dob : null}
                        onChange={(date) => {
                          setSelectedPatient((prevPatient) => ({
                            ...prevPatient,
                            dob: date || null,
                          }));
                        }}
                        sx={{ width: "100%", marginTop: "28px" }}
                      />
                    </LocalizationProvider>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="weight"
                      name="weight"
                      autoFocus
                      fullWidth={true}
                      value={selectedPatient ? selectedPatient.email : ""}
                      onChange={(e) => {
                        setSelectedPatient((prevPatient) => ({
                          ...prevPatient,
                          email: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="weight"
                      name="weight"
                      autoFocus
                      fullWidth={true}
                      value={selectedPatient ? selectedPatient.address : ""}
                      onChange={(e) => {
                        setSelectedPatient((prevPatient) => ({
                          ...prevPatient,
                          address: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            {addPatient === true ? (
              <Button variant="contained" color="primary" onClick={() => handleAddPatient()}>
                Add
              </Button>
            ) : (
              <>
                <Button variant="contained" color="primary" onClick={() => handleUpdatePatient()}>
                  Update
                </Button>
                <Button variant="contained" color="secondary" onClick={() => handleDeletePatient(selectedPatient.id)}>
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
              <TableCell>Phone</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDatas.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.name}</TableCell>
                <TableCell>{data.phone}</TableCell>
                <TableCell>{data.gender}</TableCell>
                <TableCell>{data.dob.format("MM/DD/YYYY")}</TableCell>
                <TableCell>{data.email} g</TableCell>
                <TableCell>{data.address} g</TableCell>
                <TableCell align="right">
                  <Button variant="contained" style={{ marginRight: "1rem" }} color="primary" onClick={() => handleDialog(data.id)}>
                    Detail
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDialog(data.id)}>
                    Bill
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
          onClick={() => handleOpenAddPatient()}
        >
          <AddIcon />
        </Fab>
      </React.Fragment>
    </MiniDrawer>
  );
}
