import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MiniDrawer from "../components/Drawer";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Alert, Chip, Collapse, DialogActions, Icon, InputBase, InputLabel, MenuItem, NativeSelect, OutlinedInput, Radio, Select, Snackbar, styled, Typography } from "@mui/material";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import { Button, Dialog, DialogContent, DialogTitle, Fab, IconButton, TextField } from "@mui/material";
import EnhancedTableToolbar from "../components/Table/TableToolbar";
import TableHeader from "../components/Table/TableHeader";
import AddIcon from "@mui/icons-material/Add";
import { Prescription, Staff, Queue } from "../utils/interface";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import { getAllData, getAllRoom } from "../utils/DataAccess";

const defaultTheme = createTheme();

function Row(props: { row: Prescription; handleOpenDialog: (id: string) => void }) {
  const { row, handleOpenDialog } = props;
  const [arrowOpen, setArrowOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": {
            borderBottom: "unset",
            backgroundColor: isHovered ? "#e6f7ff" : "inherit",
          },
        }}
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setArrowOpen(!arrowOpen)}>
            {arrowOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.id}
        </TableCell>
        <TableCell>{row.queue?.name}</TableCell>
        <TableCell>{row.roomNumber}</TableCell>
        <TableCell>{row.doctor?.name}</TableCell>
        <TableCell>{row.patient?.name}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell style={{ paddingRight: 0, marginRight: 0 }}>
          <Radio checked={isChecked} icon={isHovered ? <CheckIcon /> : <Radio />} checkedIcon={<CheckIcon />} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} />
        </TableCell>
        <TableCell style={{ paddingLeft: 0, marginLeft: 0 }}>
          <IconButton aria-label="edit" onClick={() => handleOpenDialog(row.id)}>
            <EditIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={arrowOpen} timeout="auto" unmountOnExit>
            <Typography gutterBottom component="div">
              {row.notes}
            </Typography>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function ManagePrescription() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [datas, setDatas] = React.useState<Prescription[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedPrescription, setSelectedPrescription] = React.useState<Prescription | null>(null);
  const [addPrescription, setAddPrescription] = React.useState(false);
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const [alertMessage, setAllertMessage] = React.useState("");
  const [roomList, setRoomList] = React.useState([]);
  const [patientList, setPatientList] = React.useState([]);
  const [doctorList, setDoctorList] = React.useState([]);
  const [bedList, setBedList] = React.useState([]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleOpenDialog = (id: string) => {
    setOpen(true);
    const filteredData = datas.filter((data) => data.id === id);
    setSelectedPrescription(filteredData[0]);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - datas.length) : 0;

  const visibleRows = React.useMemo(() => datas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [page, datas, rowsPerPage]);

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
      const q = query(collection(db, "prescriptions"));
      const querySnapshot = await getDocs(q);
      const prescriptions: Prescription[] = [];

      const bedData = await getAllData("beds");
      setBedList(bedData);

      for (const doc1 of querySnapshot.docs) {
        const prescriptionData = doc1.data();
        const doctorRef = prescriptionData.doctorID;
        const queueRef = prescriptionData.queueID;
        const patientRef = prescriptionData.patientID;

        let doctorData = null;
        let queueData = null;
        let patientData = null;

        if (doctorRef) {
          const doctorDocSnapshot = await getDoc(doc(db, "staffs", doctorRef));
          if (doctorDocSnapshot.exists()) {
            doctorData = doctorDocSnapshot.data();
          }
        }

        if (queueRef) {
          const queueDocSnapshot = await getDoc(doc(db, "queue", queueRef));
          if (queueDocSnapshot.exists()) {
            queueData = queueDocSnapshot.data();
          }
        }

        if (patientRef) {
          const patientDocSnapshot = await getDoc(doc(db, "Patients", patientRef));
          if (patientDocSnapshot.exists()) {
            patientData = patientDocSnapshot.data();
          }
        }

        const prescription = {
          id: doc1.id,
          queue: queueData,
          roomNumber: doc1.data().roomNumber,
          notes: doc1.data().notes,
          doctor: doctorData,
          patient: patientData,
          status: doc1.data().status,
          bed: bedData.find((bed) => bed?.id === doc1.data().bedID),
        };

        prescriptions.push(prescription);

        const patientDatas = await getAllData("Patients");
        setPatientList(patientDatas);

        const staffData = await getAllData("staffs");
        const doctorDatas = staffData.filter((staff) => staff?.role === "Doctor");
        setDoctorList(doctorDatas);

        const roomList = await getAllRoom();
        console.log("ROOMS");
        console.log(roomList);
        setRoomList(roomList);
      }
      setDatas(prescriptions);
    } catch (error) {
      console.log(error);
    }
  };

  const header = [" ", "ID", "Queue Type", "Room Number", "Doctor Name", "Patient Name", "Status", ""];

  const handleCloseDialog = () => {
    setAddPrescription(false);
    setSelectedPrescription(null);
    setOpen(false);
  };

  const handleOpenAddPrescription = () => {
    setSelectedPrescription(null);
    setAddPrescription(true);
    setOpen(true);
  };

  const handleAddPrescription = async () => {
    console.log("data");
    console.log(selectedPrescription);
    const newPrescriptionRef = doc(collection(db, "prescriptions"));

    const newPrescriptionData = {
      ...selectedPrescription,
      id: newPrescriptionRef.id,
      patientID: selectedPrescription.patient.id,
    };

    await setDoc(newPrescriptionRef, newPrescriptionData);

    setOpen(false);
    setDataChange(true);
    setAllertMessage("Successfully Added New Prescription");
    setSnackBarOpen(true);
  };

  const handleUpdatePrescription = async () => {
    const PrescriptionRef = doc(db, "Patients", selectedPrescription.id);
    const PrescriptionSnapshot = await getDoc(PrescriptionRef);

    if (PrescriptionSnapshot.exists()) {
      const updatedData = {
        ...selectedPrescription,
      };
      await updateDoc(PrescriptionRef, updatedData);
    }
    setOpen(false);
    setDataChange(true);
    setAllertMessage("Sucessfully Update Patient");
    setSnackBarOpen(true);
  };

  return (
    <MiniDrawer>
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ width: "100%" }}>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <EnhancedTableToolbar name="Manage Prescription" showSearch={false} showFilter={false} searchQuery={""} setSearchQuery={null} filterOption={null} setFilterValue={null} />
            <Dialog open={open} onClose={() => handleCloseDialog()} fullWidth={true} maxWidth="md">
              <DialogTitle>Prescription Detail</DialogTitle>
              <DialogContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Queue Type</TableCell>
                      <TableCell>
                        <Select
                          labelId="queue-label"
                          id="queue"
                          name="queue"
                          fullWidth
                          value={selectedPrescription?.queue?.name}
                          onChange={(e) => {
                            setSelectedPrescription((prevPrescription) => ({
                              ...prevPrescription,
                              queue: {
                                ...prevPrescription?.queue,
                                name: e.target.value as string,
                              },
                            }));
                          }}
                        >
                          <MenuItem value="Normal">Normal</MenuItem>
                          <MenuItem value="Urgent">Urgent</MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Room Number</TableCell>
                      <TableCell>
                        <NativeSelect
                          fullWidth
                          onChange={(e) => {
                            setSelectedPrescription((prevPrescription) => ({
                              ...prevPrescription,
                              roomNumber: e.target.value,
                            }));
                          }}
                        >
                          <option value="null" key="0">
                            Select new room
                          </option>
                          {roomList && roomList.length > 0 ? (
                            roomList.map((x) =>
                              x.bedList?.map((y) =>
                                y.status === "Filled with patient" ? (
                                  <option key={y.bed?.id} value={x?.id}>
                                    {x?.roomType?.name + " Room " + x.id}
                                  </option>
                                ) : null
                              )
                            )
                          ) : (
                            <option value="null" key="null" disabled>
                              No room available
                            </option>
                          )}
                        </NativeSelect>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Bed Number</TableCell>
                      <TableCell>
                        <NativeSelect
                          fullWidth
                          onChange={(e) => {
                            const newBed = bedList.find((bed) => bed.id === e.target.value);
                            const newPatient = patientList.find((patient) => patient.id === newBed?.patientID);
                            console.log("patient");
                            console.log(newPatient);
                            setSelectedPrescription((prevPrescription) => ({
                              ...prevPrescription,
                              bed: newBed,
                              patient: newPatient,
                            }));
                          }}
                        >
                          <option value="null" key="0">
                            Select bed
                          </option>
                          {selectedPrescription?.roomNumber ? (
                            roomList
                              .find((room) => room?.id === selectedPrescription.roomNumber)
                              .bedList?.map((y) =>
                                y.status === "Filled with patient" ? (
                                  <option key={y?.id} value={y?.id}>
                                    {"Bed number " + y?.number + " patient " + y?.patient?.name}
                                  </option>
                                ) : null
                              )
                          ) : (
                            <option value="null" key="null" disabled>
                              No room available
                            </option>
                          )}
                        </NativeSelect>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Patient Name</TableCell>
                      <TableCell>
                        <TextField fullWidth disabled value={selectedPrescription?.patient ? selectedPrescription?.patient?.name : ""}></TextField>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Doctor Name</TableCell>
                      <TableCell>
                        <NativeSelect
                          fullWidth
                          onChange={(e) => {
                            setSelectedPrescription((prevData) => ({
                              ...prevData,
                              doctorID: e.target.value,
                            }));
                          }}
                        >
                          <option value="">Select a doctor</option>
                          {doctorList && doctorList.length > 0 ? (
                            doctorList.map((data) => (
                              <option key={data.id} value={data.id}>
                                {data.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No doctor available
                            </option>
                          )}
                        </NativeSelect>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Notes</TableCell>
                      <TableCell>
                        <TextField
                          required
                          autoFocus
                          fullWidth={true}
                          value={selectedPrescription ? selectedPrescription.notes : ""}
                          onChange={(e) => {
                            setSelectedPrescription((prevPrescription) => ({
                              ...prevPrescription,
                              notes: e.target.value,
                            }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </DialogContent>
              <DialogActions>
                {addPrescription === true ? (
                  <Button variant="contained" color="primary" onClick={() => handleAddPrescription()}>
                    Add
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" color="primary" onClick={() => handleUpdatePrescription()}>
                      Update
                    </Button>
                  </>
                )}
              </DialogActions>
            </Dialog>
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"medium"}>
                <TableHeader header={header} />
                <TableBody>
                  {visibleRows.map((row, index) => (
                    <Row key={row.id} row={row} handleOpenDialog={handleOpenDialog} />
                  ))}
                  {emptyRows > 0 && (
                    <TableRow
                      style={{
                        height: 53 * emptyRows,
                      }}
                    >
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={datas.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
          </Paper>
        </Box>
        <Fab
          color="primary"
          aria-label="add"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
          }}
          onClick={() => handleOpenAddPrescription()}
        >
          <AddIcon />
        </Fab>
        <Snackbar open={snackbarOpen} autoHideDuration={6000}>
          <Alert onClose={() => setSnackBarOpen(false)} severity="success">
            {alertMessage}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </MiniDrawer>
  );
}
