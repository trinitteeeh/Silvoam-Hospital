import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MiniDrawer from "../components/Drawer";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import EnhancedTableToolbar from "../components/Table/TableToolbar";
import TableHeader from "../components/Table/TableHeader";
import { Certificate, Patient } from "../utils/interface";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, NativeSelect, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getAllData } from "../utils/DataAccess";
import AuthContext from "../utils/AuthProvider";

const defaultTheme = createTheme();

function Row(props: { row: Certificate; user: any; handleApproveCertificate: (id: string) => void }) {
  const { row, user, handleApproveCertificate } = props;
  const [isHovered, setIsHovered] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [fileUploaded, setFileUploaded] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFileUploaded(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFileUploaded(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the uploaded file

    if (file) {
      setFileUploaded(true);
      // Perform additional actions with the uploaded file
    } else {
      setFileUploaded(false);
    }
  };

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
        <TableCell>{row.patient.name}</TableCell>
        <TableCell>{row.doctor.name}</TableCell>
        <TableCell>{row.type}</TableCell>
        <TableCell>{row.dateRequested.format("DD/MM/YYYY")}</TableCell>
        <TableCell>{row.status}</TableCell>
        {user?.role === "Doctor" && row.status === "Pending" ? (
          <TableCell>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
              Approve
            </Button>
          </TableCell>
        ) : (
          <TableCell></TableCell>
        )}
      </TableRow>
      <ApproveDialog open={openDialog} handleCloseDialog={handleCloseDialog} handleApprove={handleApproveCertificate} id={row.id} fileUploaded={fileUploaded} handleFileUpload={handleFileUpload} />
    </React.Fragment>
  );
}

const ApproveDialog = ({ open, handleCloseDialog, handleApprove, id, fileUploaded, handleFileUpload }) => (
  <Dialog open={open} onClose={handleCloseDialog} fullWidth={true} maxWidth="md">
    <DialogTitle>Approve Certificate</DialogTitle>
    <DialogContent>
      <Typography>Please upload your signature</Typography>
      <input type="file" onChange={handleFileUpload} />
    </DialogContent>
    <DialogActions>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          handleApprove(id);
          handleCloseDialog();
        }}
        disabled={!fileUploaded}
      >
        Submit
      </Button>
      <Button variant="contained" color="secondary" onClick={handleCloseDialog}>
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
);

export default function ManageCertificate() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [datas, setDatas] = React.useState<Certificate[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [selectedCertificate, setSelectedCertificate] = React.useState<Certificate | null>(null);
  const [open, setOpen] = React.useState(false);
  const [patientList, setPatientList] = React.useState<Patient[]>([]);
  const [selectedPatientID, setSelectedPatientID] = React.useState("");

  const { user } = React.useContext(AuthContext);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
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
      const q = query(collection(db, "certificates"));
      const querySnapshot = await getDocs(q);
      const certificates: Certificate[] = [];

      for (const doc1 of querySnapshot.docs) {
        const certificateData = doc1.data();
        const doctorRef = certificateData.doctorID;
        const patientRef = certificateData.patientID;

        let doctorData = null;
        let patientData = null;

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

        const certificate = {
          id: doc1.id,
          patient: patientData,
          doctor: doctorData,
          status: doc1.data().status,
          type: doc1.data().type,
          dateRequested: dayjs(doc1.data().dateRequested.toDate()),
        };

        certificates.push(certificate);
      }
      setDatas(certificates);
      const patientList = await getAllData("Patients");
      setPatientList(patientList);
    } catch (error) {
      console.log(error);
    }
  };

  const header = ["ID", "Patient Name", "Doctor Name", "Type", "Date Requested", "Status", ""];

  const handleOpenAddCertificate = () => {
    setSelectedCertificate(null);
    setOpen(true);
    setSelectedCertificate((prevCertificate) => ({
      ...prevCertificate,
      type: "Birth",
    }));
    setSelectedPatientID(patientList[0].id);
  };

  const handleCloseAddCertificate = () => {
    setOpen(false);
  };

  const handleAddCertificate = async () => {
    const newCertificateRef = doc(collection(db, "certificates"));
    console.log("selected certificate");
    console.log(selectedCertificate);

    const newCertificateData = {
      id: newCertificateRef.id,
      dateRequested: serverTimestamp(),
      patientID: selectedPatientID,
      status: "Pending",
      type: selectedCertificate.type,
      doctorID: "iNkfaQla1QatKaJWw0OnzXB9NBV2",
    };

    await setDoc(newCertificateRef, newCertificateData);

    setSelectedCertificate(null);
    setOpen(false);
    setDataChange(true);
  };

  const handleApproveCertificate = async (id: string) => {
    const docRef = doc(db, "certificates", id);
    const docSnapShot = await getDoc(docRef);

    if (docSnapShot.exists()) {
      const updatedData = {
        ...docSnapShot.data(),
        status: "Approved",
      };
      await updateDoc(docRef, updatedData);
    }
    setDataChange(true);
  };

  return (
    <MiniDrawer>
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ width: "100%" }}>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <EnhancedTableToolbar name="Certificates" showSearch={false} showFilter={false} searchQuery="" setSearchQuery={null} filterOption={null} setFilterValue={null} />
            <Dialog open={open} onClose={() => handleCloseAddCertificate()} fullWidth={true} maxWidth="md">
              <DialogTitle>Add New Certificate</DialogTitle>
              <DialogContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>
                        <NativeSelect fullWidth value={patientList.length > 0 ? patientList[0].id : ""} onChange={(e) => setSelectedPatientID(e.target.value)}>
                          {patientList.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.name}
                            </option>
                          ))}
                        </NativeSelect>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>
                        <NativeSelect
                          fullWidth
                          value="Birth"
                          onChange={(e) => {
                            setSelectedCertificate((prevCertificate) => ({
                              ...prevCertificate,
                              type: e.target.value,
                            }));
                          }}
                        >
                          <option key="Birth" value="Birth">
                            Birth
                          </option>
                          <option key="Death" value="Death">
                            Death
                          </option>
                        </NativeSelect>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Doctor</TableCell>
                      <TableCell>
                        <TextField required autoFocus fullWidth={true} value={selectedCertificate?.doctor ? selectedCertificate.doctor.name : ""} disabled />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" onClick={() => handleAddCertificate()}>
                  Add
                </Button>
              </DialogActions>
            </Dialog>
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"medium"}>
                <TableHeader header={header} />
                <TableBody>
                  {visibleRows.map((row) => (
                    <Row key={row.id} row={row} user={user} handleApproveCertificate={handleApproveCertificate} />
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
        {user?.role !== "Doctor" ? (
          <Fab
            color="primary"
            aria-label="add"
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
            }}
            onClick={() => handleOpenAddCertificate()}
          >
            <AddIcon />
          </Fab>
        ) : (
          <></>
        )}
      </ThemeProvider>
    </MiniDrawer>
  );
}
