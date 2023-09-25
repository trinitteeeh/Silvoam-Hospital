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
import { Alert, Collapse, DialogActions, Icon, InputBase, InputLabel, MenuItem, Radio, Select, Snackbar, styled, Typography } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import { Button, Dialog, DialogContent, DialogTitle, Fab, IconButton, TextField } from "@mui/material";
import EnhancedTableToolbar from "../components/Table/TableToolbar";
import TableHeader from "../components/Table/TableHeader";
import AddIcon from "@mui/icons-material/Add";
import { Appointment, Staff, Queue } from "../utils/interface";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";

const defaultTheme = createTheme();

function Row(props: { row: Appointment; handleOpenDialog: (id: string) => void; handleDeleteAppointment: (id: string) => void }) {
  const { row, handleOpenDialog, handleDeleteAppointment } = props;
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
        <TableCell>{row.patient?.name}</TableCell>
        <TableCell>{row.doctor?.name}</TableCell>
        <TableCell>{row.roomID}</TableCell>
        <TableCell>{row.bed?.number}</TableCell>
        <TableCell>{row.appointmentDate.format("MM/DD/YYYY")}</TableCell>
        <TableCell>{row.queueNumber}</TableCell>
        <TableCell>{row.queueCategory}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell style={{ paddingRight: 0, marginRight: 0 }}>
          <Radio checked={isChecked} icon={isHovered ? <CheckIcon /> : <Radio />} checkedIcon={<CheckIcon />} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} />
        </TableCell>
        <TableCell style={{ paddingLeft: 0, marginLeft: 0 }}>
          <IconButton aria-label="edit" onClick={() => handleOpenDialog(row.id)}>
            <EditIcon />
          </IconButton>
        </TableCell>
        <TableCell style={{ paddingLeft: 0, marginLeft: 0 }}>
          <IconButton aria-label="edit" onClick={() => handleDeleteAppointment(row.id)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={arrowOpen} timeout="auto" unmountOnExit>
            <Typography gutterBottom component="div">
              {row?.result}
            </Typography>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function ManageAppointment() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [datas, setDatas] = React.useState<Appointment[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [addAppointment, setAddAppointment] = React.useState(false);
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const [alertMessage, setAllertMessage] = React.useState("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleOpenDialog = (id: string) => {
    setOpen(true);
    const filteredData = datas.filter((data) => data.id === id);
    setSelectedAppointment(filteredData[0]);
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
      const q = query(collection(db, "appointments"));
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = [];

      for (const doc1 of querySnapshot.docs) {
        const appointmentData = doc1.data();
        const doctorRef = appointmentData.doctorID;
        const bedRef = appointmentData.bedID;
        const patientRef = appointmentData.patientID;

        let doctorData = null;
        let patientData = null;
        let bedData = null;

        if (doctorRef) {
          const doctorDocSnapshot = await getDoc(doc(db, "staffs", doctorRef));
          if (doctorDocSnapshot.exists()) {
            doctorData = doctorDocSnapshot.data();
          }
        }

        if (patientRef) {
          const patientDocSnapshot = await getDoc(doc(db, "Patients", patientRef));
          if (patientDocSnapshot.exists()) {
            patientData = patientDocSnapshot.data();
          }
        }

        if (bedRef) {
          const bedDocSnapshot = await getDoc(doc(db, "beds", bedRef));
          if (bedDocSnapshot.exists()) {
            bedData = bedDocSnapshot.data();
          }
        }

        const appointment = {
          id: doc1.id,
          patient: patientData,
          doctor: doctorData,
          roomID: doc1.data().roomID,
          bed: bedData,
          queueCategory: doc1.data().queueCategory,
          queueNumber: doc1.data().queueNumber,
          status: doc1.data().status,
          appointmentDate: dayjs(doc1.data().appointmentDate.toDate()),
          result: doc1.data().result,
        };

        appointments.push(appointment);
      }
      setDatas(appointments);
      console.log(appointments);
    } catch (error) {
      console.log(error);
    }
  };

  const header = ["", "Patient Name", "Doctor Name", "Room Number", "Bed Number", "Appointment Date", "Queue Number", "Queue Category", "Appointment Status", " "];

  const handleCloseDialog = () => {
    setAddAppointment(false);
    setSelectedAppointment(null);
    setOpen(false);
  };

  const handleOpenAddAppointment = () => {
    setSelectedAppointment(null);
    setAddAppointment(true);
    setOpen(true);
  };

  const handleAddAppointment = async () => {
    const newAppointmentRef = doc(collection(db, "appointments"));

    const newAppointmentData = {
      ...selectedAppointment,
      id: newAppointmentRef.id,
    };

    await setDoc(newAppointmentRef, newAppointmentData);

    setOpen(false);
    setDataChange(true);
    setAllertMessage("Successfully Added New Appointment");
    setSnackBarOpen(true);
  };

  const handleUpdateAppointment = async () => {
    const AppointmentRef = doc(db, "Patients", selectedAppointment.id);
    const AppointmentSnapshot = await getDoc(AppointmentRef);

    if (AppointmentSnapshot.exists()) {
      const updatedData = {
        ...selectedAppointment,
      };
      await updateDoc(AppointmentRef, updatedData);
    }
    setOpen(false);
    setDataChange(true);
    setAllertMessage("Sucessfully Update Patient");
    setSnackBarOpen(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    const documentRef = doc(db, "appointments", id);
    deleteDoc(documentRef);
    setOpen(false);
    setDataChange(true);
    setAllertMessage("Sucessfully Delete Appointment");
    setSnackBarOpen(true);
  };

  return (
    <MiniDrawer>
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ width: "100%" }}>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <EnhancedTableToolbar name="Manage Appointment" showSearch={false} showFilter={false} searchQuery={""} setSearchQuery={null} filterOption={null} setFilterValue={null} />
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"medium"}>
                <TableHeader header={header} />
                <TableBody>
                  {visibleRows.map((row, index) => (
                    <Row key={row.id} row={row} handleOpenDialog={handleOpenDialog} handleDeleteAppointment={handleDeleteAppointment} />
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
          onClick={() => handleOpenAddAppointment()}
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
