import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MiniDrawer from "../../components/Drawer";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, NativeSelect, Snackbar, TextField } from "@mui/material";
import EnhancedTableToolbar from "../../components/Table/TableToolbar";
import TableHeader from "../../components/Table/TableHeader";
import AddIcon from "@mui/icons-material/Add";
import AuthContext from "../../utils/AuthProvider";
import { getAllData, getAllRoom } from "../../utils/DataAccess";
import { Patient, Staff, Room } from "../../utils/interface";

const defaultTheme = createTheme();
interface Ambulance {
  id: string;
  type: string;
  year: number;
  policeNumber: string;
  status: string;
  destination: string;
  patient: Patient;
  driver: Staff;
}

function Row(props: { row: Ambulance; handleOpenDialog: (id: string) => void; handleOpenConfirmationDialog: (id: string) => void }) {
  const { row, handleOpenDialog, handleOpenConfirmationDialog } = props;
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
        <TableCell component="th" scope="row">
          {row.id}
        </TableCell>
        <TableCell>{row.type}</TableCell>
        <TableCell>{row.year}</TableCell>
        <TableCell>{row.policeNumber}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell align="right">
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog(row.id)} sx={{ marginRight: "1rem" }}>
            Detail
          </Button>
          <Button variant="outlined" onClick={() => handleOpenConfirmationDialog(row.id)}>
            Ban
          </Button>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function ManageAmbulance() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [datas, setDatas] = React.useState<Ambulance[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = React.useState<Ambulance | null>(null);
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const [banReason, setBanReason] = React.useState("");
  const [addAmbulance, setAddAmbulance] = React.useState(false);
  const { user } = React.useContext(AuthContext);
  const [patientList, setPatientList] = React.useState([]);
  const [driverList, setDriverList] = React.useState([]);
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const [alertMessage, setAllertMessage] = React.useState("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleOpenDialog = (id: string) => {
    setOpen(true);
    const filteredData = datas.filter((data) => data.id === id);
    setSelectedAmbulance(filteredData[0]);
  };

  const handleOpenConfirmationDialog = (id: string) => {
    setOpenConfirmation(true);
    const filteredData = datas.filter((data) => data.id === id);
    setSelectedAmbulance(filteredData[0]);
  };

  const handleOpenAddAmbulance = () => {
    setSelectedAmbulance(null);
    setAddAmbulance(true);
    setOpen(true);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUseAmbulance = async () => {
    const bed = (await getAllRoom())
      .filter((room) => room.roomType.name === "Emergency")
      .flatMap((room) => room.bedList)
      .find((bed) => bed?.status === "Available");

    if (!bed) {
      // Check if bed is null or undefined
      setAllertMessage("No Bed Available");
      setSnackBarOpen(true);
      setOpen(false);
      setSelectedAmbulance(null);
      return; // Stop execution if there's no available bed
    }

    const newDocRef = doc(collection(db, "jobs"));

    const newData = {
      id: newDocRef.id,
      name: "Use Ambulance",
      status: "Incomplete",
      category: "Ambulance Driver",
      assignDate: serverTimestamp(),
      dueDate: serverTimestamp(),
      description: "Use ambulance to pick up patient",
      roomID: bed.roomID, // Access the roomID directly without optional chaining
      patientID: selectedAmbulance?.patient?.id,
      staffID: selectedAmbulance?.driver?.id,
      bedID: bed.id, // Access the bedID directly without optional chaining
      ambulanceID: selectedAmbulance?.id,
    };

    const newBedRef = doc(collection(db, "beds"), bed.id);
    const bedSnapshot = await getDoc(newBedRef);

    const bedData = {
      ...bedSnapshot.data(),
      status: "Unusable",
      patientID: selectedAmbulance?.patient?.id,
      roomID: bed.roomID, // Access the roomID directly without optional chaining
    };

    const newAmbulanceRef = doc(collection(db, "ambulances"), selectedAmbulance?.id);
    const ambulanceSnapShot = await getDoc(newAmbulanceRef);

    const ambulanceData = {
      ...ambulanceSnapShot.data(),
      status: "used",
    };

    await updateDoc(newBedRef, bedData);
    await updateDoc(newAmbulanceRef, ambulanceData);
    await setDoc(newDocRef, newData);

    setAllertMessage("Ambulance used");
    setSnackBarOpen(true);
    setOpen(false);
    setSelectedAmbulance(null);
    setDataChange(true);
  };

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
      const q = query(collection(db, "ambulances"));
      const querySnapshot = await getDocs(q);
      const Ambulances: Ambulance[] = [];

      querySnapshot.forEach((doc) => {
        const AmbulanceData = doc.data() as Ambulance;
        const Ambulance: Ambulance = {
          ...AmbulanceData,
          id: doc.id,
        };
        Ambulances.push(Ambulance);
      });

      const patientData = await getAllData("Patients");
      setPatientList(patientData);

      const staffData = await getAllData("staffs");
      const driverData = staffData.filter((staff) => staff?.role === "Ambulance Driver");
      setDriverList(driverData);

      setDatas(Ambulances);
    } catch (error) {
      console.log(error);
    }
  };

  const header = ["ID", "Type", "Year", "Police Number", "Status", ""];

  const banAmbulance = async () => {
    const ambulanceRef = doc(db, "ambulances", selectedAmbulance.id);
    const ambulanceSnapShot = await getDoc(ambulanceRef);

    if (ambulanceSnapShot.exists()) {
      const updatedData = {
        ...selectedAmbulance,
        status: "unusable",
        reason: banReason,
      };
      await updateDoc(ambulanceRef, updatedData);
    }
    setOpenConfirmation(false);
    setDataChange(true);
  };

  const handleAddAmbulance = async () => {
    const newAmbulanceRef = doc(collection(db, "ambulances"));

    const newAmbulanceData = {
      ...selectedAmbulance,
      id: newAmbulanceRef.id,
      status: "available",
    };

    await setDoc(newAmbulanceRef, newAmbulanceData);

    setOpen(false);
    setDataChange(true);
    setAddAmbulance(false);
  };

  return (
    <MiniDrawer>
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ width: "100%" }}>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <EnhancedTableToolbar name="Manage Ambulance" showSearch={false} showFilter={false} searchQuery={""} setSearchQuery={null} filterOption={null} setFilterValue={null} />
            <Dialog
              open={open}
              onClose={() => {
                setOpen(false);
                setAddAmbulance(false);
              }}
              fullWidth={true}
              maxWidth="md"
            >
              <DialogTitle>Ambulance Detail</DialogTitle>
              <DialogContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>
                        <TextField required disabled autoFocus fullWidth={true} value={selectedAmbulance ? selectedAmbulance.id : ""} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>
                        <TextField
                          required
                          autoFocus
                          fullWidth={true}
                          disabled={addAmbulance ? false : true}
                          value={selectedAmbulance ? selectedAmbulance.type : ""}
                          onChange={(e) => {
                            setSelectedAmbulance((prevAmbulance) => ({
                              ...prevAmbulance,
                              type: e.target.value,
                            }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell>
                        <TextField
                          required
                          autoFocus
                          fullWidth={true}
                          disabled={addAmbulance ? false : true}
                          value={selectedAmbulance ? selectedAmbulance.year : ""}
                          onChange={(e) => {
                            setSelectedAmbulance((prevAmbulance) => ({
                              ...prevAmbulance,
                              year: Number(e.target.value),
                            }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Police Number</TableCell>
                      <TableCell>
                        <TextField
                          required
                          autoFocus
                          disabled={addAmbulance ? false : true}
                          fullWidth={true}
                          value={selectedAmbulance ? selectedAmbulance.policeNumber : ""}
                          onChange={(e) => {
                            setSelectedAmbulance((prevAmbulance) => ({
                              ...prevAmbulance,
                              policeNumber: e.target.value,
                            }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>
                        <TextField
                          required
                          autoFocus
                          disabled
                          fullWidth={true}
                          value={selectedAmbulance ? selectedAmbulance.status : "available"}
                          onChange={(e) => {
                            setSelectedAmbulance((prevAmbulance) => ({
                              ...prevAmbulance,
                              status: e.target.value,
                            }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Destination</TableCell>
                      <TableCell>
                        <TextField
                          required
                          autoFocus
                          disabled={selectedAmbulance?.status === "used"}
                          fullWidth={true}
                          value={selectedAmbulance ? selectedAmbulance?.destination : " "}
                          onChange={(e) => {
                            setSelectedAmbulance((prevAmbulance) => ({
                              ...prevAmbulance,
                              destination: e.target.value,
                            }));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>
                        <NativeSelect
                          fullWidth
                          onChange={(e) => {
                            setSelectedAmbulance((prevData) => ({
                              ...prevData,
                              patient: patientList.find((patient) => patient?.id === e.target.value),
                            }));
                          }}
                          disabled={selectedAmbulance?.status === "used"}
                        >
                          <option value="">Select a patient</option>
                          {patientList && patientList.length > 0 ? (
                            patientList.map((data) => (
                              <option key={data.id} value={data.id}>
                                {data.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No patient available
                            </option>
                          )}
                        </NativeSelect>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Driver</TableCell>
                      <TableCell>
                        <NativeSelect
                          fullWidth
                          onChange={(e) => {
                            setSelectedAmbulance((prevData) => ({
                              ...prevData,
                              driver: driverList.find((driver) => driver?.id === e.target.value),
                            }));
                          }}
                          disabled={selectedAmbulance?.status === "used"}
                        >
                          <option value="">Select a driver</option>
                          {driverList && driverList.length > 0 ? (
                            driverList.map((data) => (
                              <option key={data.id} value={data.id}>
                                {data?.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No patient available
                            </option>
                          )}
                        </NativeSelect>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </DialogContent>
              <DialogActions>
                {user?.role === "Admin" && selectedAmbulance?.status === "available" ? (
                  <Button variant="contained" color="primary" onClick={() => handleUseAmbulance()}>
                    Use Ambulance
                  </Button>
                ) : (
                  <></>
                )}
              </DialogActions>
            </Dialog>
            <Dialog open={openConfirmation} onClose={() => setOpenConfirmation(false)}>
              <DialogTitle>Are You Sure to Ban Ambulance?</DialogTitle>
              <DialogContent>
                <DialogContentText>Please input reason for banning the ambulance usage</DialogContentText>
                <TextField autoFocus margin="dense" fullWidth variant="standard" onChange={(e) => setBanReason(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" onClick={banAmbulance}>
                  Yes
                </Button>
                <Button variant="contained" color="secondary" onClick={() => setOpenConfirmation(false)}>
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>

            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"medium"}>
                <TableHeader header={header} />
                <TableBody>
                  {visibleRows.map((row, index) => (
                    <Row key={row.id} row={row} handleOpenDialog={handleOpenDialog} handleOpenConfirmationDialog={handleOpenConfirmationDialog} />
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
          onClick={() => handleOpenAddAmbulance()}
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
