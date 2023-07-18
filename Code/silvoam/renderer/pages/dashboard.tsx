import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import MiniDrawer from "../components/Drawer";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Alert, Button, Checkbox, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControlLabel, InputBase, NativeSelect, Radio, Select, Snackbar, styled, TextField } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { insertData, updateData, deleteData, getAllData } from "../utils/DataAccess";
import TableToolbar from "../components/Table/TableToolbar";
import TableHeader from "../components/Table/TableHeader";
import { Bed, Job, Patient, Report, Room, RoomType, Staff } from "../utils/interface";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AuthContext from "../utils/AuthProvider";
import AddIcon from "@mui/icons-material/Add";
import { handleDeleteBed, handleEscortPatient, handleMakeBedAvailable, handleUseAmbulance } from "../utils/CompleteJob";

const defaultTheme = createTheme();

function AddJobDialog({ open, handleConfirm, setData, roomData, setOpen, staffData }) {
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const handleCloseDialog = () => {
    setOpen(false);
  };

  const categories = ["Admin", "Doctor", "Nurse", "Pharmacist", "Kitchen Staff", "Ambulance Driver", "Cleaning Service"];

  return (
    <Dialog open={open} onClose={() => handleCloseDialog()} fullWidth={true} maxWidth="md">
      <DialogTitle>Add New Job</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>
                <TextField
                  required
                  autoFocus
                  fullWidth={true}
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
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
                  autoFocus
                  fullWidth={true}
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      description: e.target.value,
                    }));
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Room</TableCell>
              <TableCell>
                <NativeSelect
                  fullWidth
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      roomID: e.target.value,
                    }));
                    setSelectedRoom(roomData.find((room) => room?.id === e.target.value));
                  }}
                >
                  <option value="">Select a room</option>
                  {roomData && roomData.length > 0 ? (
                    roomData.map((data) => (
                      <option key={data.id} value={data.id}>
                        {data.roomType?.name + " Room Number " + data.id}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No room Available
                    </option>
                  )}
                </NativeSelect>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bed and Patient</TableCell>
              <TableCell>
                <NativeSelect
                  fullWidth
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      patientID: e.target.value,
                    }));
                  }}
                >
                  <option value="null" key="0">
                    Select Bed
                  </option>
                  {selectedRoom ? (
                    selectedRoom.bedList.map((x) => {
                      if (x.status === "Filled with patient") {
                        return (
                          <option key={x.id} value={x.patient.id}>
                            {"Patien " + x?.patient?.name + "in bed number " + x.number}
                          </option>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <option value="null" key="null" disabled>
                      No room selected
                    </option>
                  )}
                </NativeSelect>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>
                <NativeSelect
                  fullWidth
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      category: e.target.value,
                    }));
                    setSelectedCategory(e.target.value);
                  }}
                >
                  <option value="null" key="0">
                    Select category
                  </option>
                  {categories.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </NativeSelect>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Staff</TableCell>
              <TableCell>
                <NativeSelect
                  fullWidth
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      staffID: e.target.value,
                    }));
                  }}
                >
                  <option value="">Select a staff</option>
                  {staffData && staffData.length > 0 ? (
                    staffData.map((data) => {
                      if (data.role === selectedCategory) {
                        return (
                          <option key={data.id} value={data.id}>
                            {"Staff " + data?.name}
                          </option>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <option value="" disabled>
                      No staff available
                    </option>
                  )}
                </NativeSelect>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Due Date</TableCell>
              <TableCell>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Due Date"
                    onChange={(date) => {
                      setData((prevData) => ({
                        ...prevData,
                        dueDate: date || null,
                      }));
                    }}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={() => handleConfirm()}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function JobRow({ row, handleJobCompleted, setSelectedJob, selectedJob }) {
  const [arrowOpen, setArrowOpen] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);

  const onHandleJobCompleted = () => {
    setSelectedJob(row);
    console.log("testing");
    console.log(selectedJob);
  };

  React.useEffect(() => {
    if (selectedJob) {
      handleJobCompleted();
    }
  }, [selectedJob]);

  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": {
            borderBottom: "unset",
          },
        }}
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setArrowOpen(!arrowOpen)}>
            {arrowOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row?.name}
        </TableCell>
        <TableCell>{row?.status}</TableCell>
        <TableCell>{row?.patient?.name ? row.patient.name : ""}</TableCell>
        <TableCell>{row?.roomID}</TableCell>
        <TableCell>{row?.category}</TableCell>
        <TableCell>{row?.assignDate ? row.dueDate.format("MM/DD/YYYY - hh:mm:ss") : ""}</TableCell>
        <TableCell>{row?.dueDate ? row.dueDate.format("MM/DD/YYYY - hh:mm:ss") : ""}</TableCell>

        <TableCell>
          <Radio checked={isChecked} onChange={onHandleJobCompleted} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={arrowOpen} timeout="auto" unmountOnExit>
            <Typography gutterBottom component="div">
              {row?.description}
            </Typography>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const JobTable = () => {
  const [jobDatas, setJobDatas] = React.useState<Job[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState(null);
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const [alertMessage, setAllertMessage] = React.useState("");
  const [openDialogForm, setOpenDialogForm] = React.useState(false);
  const [roomList, setRoomList] = React.useState<Room[]>([]);
  const { user } = React.useContext(AuthContext);
  const [staffList, setStaffList] = React.useState([]);
  const [isChecked, setIsChecked] = React.useState(false);

  const handleJobCompleted = async () => {
    console.log("MASUK");
    console.log(selectedJob);
    const jobRef = doc(db, "jobs", selectedJob ? selectedJob.id : "  ");
    const jobSnapshot = await getDoc(jobRef);

    if (!jobSnapshot.exists()) {
      setAllertMessage("Error");
      setSnackBarOpen(true);
      setSelectedJob(null);
      return;
    }

    const jobData = {
      ...jobSnapshot.data(),
      status: "Complete",
    };

    if (selectedJob?.name === "Making the Bed") {
      handleMakeBedAvailable(selectedJob.bedID);
    } else if (selectedJob?.name === "Escort Patient to Bed") {
      handleEscortPatient(selectedJob?.bedID, selectedJob?.roomID, selectedJob?.patientID);
    } else if (selectedJob?.name === "Delete Bed") {
      handleDeleteBed(selectedJob?.bedID);
    } else if (selectedJob?.name === "Use Ambulance") {
      handleUseAmbulance(selectedJob?.bedID, selectedJob?.roomID, selectedJob?.patientID, selectedJob?.ambulanceID);
    }

    await updateDoc(jobRef, jobData);
    setAllertMessage("Job Completed");
    setSnackBarOpen(true);
    setSelectedJob(null);
    setDataChange(true);
  };

  const handleAddJob = async () => {
    const newDocRef = doc(collection(db, "jobs"));

    const newData = {
      id: newDocRef.id,
      name: selectedJob?.name,
      status: "Incomplete",
      category: selectedJob?.category,
      assignDate: serverTimestamp(),
      dueDate: Timestamp.fromDate(selectedJob.dueDate.toDate()),
      description: selectedJob?.description,
      roomID: selectedJob?.roomID,
      patientID: selectedJob?.patientID,
      staffID: user.id,
      bedID: selectedJob?.bedID,
    };

    console.log(newData);

    await setDoc(newDocRef, newData);
    setAllertMessage("Job Assigned");
    setSnackBarOpen(true);
    setSelectedJob(null);
    setDataChange(true);
    setOpenDialogForm(false);
  };

  React.useEffect(() => {
    if (dataChange) {
      fetchData();
      setDataChange(!dataChange);
    }
  }, [dataChange]);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const collectionName = "jobs";
      const data = await getAllData(collectionName);

      const staffDatas = await getAllData("staffs");
      setStaffList(staffDatas);

      const jobsData: Job[] = await Promise.all(
        data.map(async (job) => {
          const patientSnapshot = await getDoc(doc(db, "Patients", job.patientID ? job.patientID : "  "));
          const patientData = patientSnapshot.data() as Patient;

          const staffSnapshot = await getDoc(doc(db, "staffs", job.staffID ? job.staffID : "  "));
          const staffData = staffSnapshot.data();

          if (job?.status === "Incomplete") {
            return {
              ...job,
              assignDate: dayjs(job.assignDate.toDate()),
              dueDate: dayjs(job.dueDate.toDate()),
              patient: patientData,
              staff: staffData,
            };
          } else {
            return null;
          }
        })
      );

      setJobDatas(jobsData);

      const collectionName2 = "rooms";
      const collectionData2 = await getAllData(collectionName2);

      const collectionName3 = "beds";
      const collectionData3 = await getAllData(collectionName3);

      const allBedList: Bed[] = await Promise.all(
        collectionData3.map(async (data) => {
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
        collectionData2.map(async (data) => {
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
      setRoomList(newDatas);
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const header = [" ", "Name", "Status", "Patient", "Room", "Category", "Assign Date", "Due Date", ""];

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableToolbar name="Jobs" showSearch={true} showFilter={false} searchQuery="" setSearchQuery={null} filterOption={null} setFilterValue={null} />
        <AddJobDialog handleConfirm={handleAddJob} open={openDialogForm} setData={setSelectedJob} setOpen={setOpenDialogForm} roomData={roomList} staffData={staffList} />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"medium"}>
            <TableHeader header={header} />
            <TableBody>
              {isChecked ? (
                <>{jobDatas.map((row) => row?.status === "Incomplete" && <JobRow key={row?.id} row={row} handleJobCompleted={handleJobCompleted} setSelectedJob={setSelectedJob} selectedJob={selectedJob} />)}</>
              ) : (
                <>
                  {jobDatas
                    .filter((job) => job?.staff?.id === user?.id)
                    .map((row) => row?.status === "Incomplete" && <JobRow key={row?.id} row={row} handleJobCompleted={handleJobCompleted} setSelectedJob={setSelectedJob} selectedJob={selectedJob} />)}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {user?.role === "Admin" && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
            <FormControlLabel control={<Checkbox color="primary" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />} label="View All Job" labelPlacement="start" />
            <Button
              variant="contained"
              style={{ marginRight: "1rem" }}
              color="primary"
              onClick={() => {
                setSelectedJob(null);
                setOpenDialogForm(true);
              }}
            >
              Add New Job
            </Button>
          </Box>
        )}

        <Snackbar open={snackbarOpen} autoHideDuration={6000}>
          <Alert onClose={() => setSnackBarOpen(false)} severity="success">
            {alertMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

function ReportRow(props: { row: Report }) {
  const { row } = props;
  const [arrowOpen, setArrowOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": {
            borderBottom: "unset",
            backgroundColor: "inherit",
          },
        }}
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setArrowOpen(!arrowOpen)}>
            {arrowOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.roomNumber}
        </TableCell>
        <TableCell>{row.patient.name}</TableCell>
        <TableCell>{row.dateReported.format("DD/MM/YYYY - hh:mm:ss")}</TableCell>
        <TableCell>{row.reportedBy.name}</TableCell>
        <TableCell>{row.division}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={arrowOpen} timeout="auto" unmountOnExit>
            <Typography gutterBottom component="div">
              {row.description}
            </Typography>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const ReportTable = () => {
  const [page, setPage] = React.useState(0);
  const [reportDatas, setReportDatas] = React.useState<Report[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [openDialogForm, setOpenDialogForm] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [alertMessage, setAllertMessage] = React.useState("");
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const { user } = React.useContext(AuthContext);
  const [patientList, setPatientList] = React.useState<Patient[]>([]);
  const [selectedPatientID, setSelectedPatientID] = React.useState("");

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
      const q = query(collection(db, "reports"));
      const querySnapshot = await getDocs(q);
      const reports: Report[] = [];

      for (const doc1 of querySnapshot.docs) {
        const reportData = doc1.data();
        const reporterRef = reportData.reportedBy;
        const patientRef = reportData.patientID;

        let reporterData = null;
        let patientData = null;

        if (reporterRef) {
          const reporterDocSnapshot = await getDoc(doc(db, "staffs", reporterRef));
          if (reporterDocSnapshot.exists()) {
            reporterData = reporterDocSnapshot.data();
          }
        }

        if (patientRef) {
          const patientDocSnapshot = await getDoc(doc(db, "Patients", patientRef));
          if (patientDocSnapshot.exists()) {
            patientData = patientDocSnapshot.data();
          }
        }

        const report = {
          id: doc1.id,
          patient: patientData,
          roomNumber: doc1.data().roomNumber,
          description: doc1.data().description,
          dateReported: dayjs(doc1.data().dateReported.toDate()),
          reportedBy: reporterData,
          division: doc1.data().division,
        };

        reports.push(report);
      }
      setReportDatas(reports);
      const patientList = await getAllData("Patients");
      setPatientList(patientList);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialogForm(false);
  };

  const handleAddReport = async () => {
    const newReportRef = doc(collection(db, "reports"));

    console.log(selectedPatientID);

    const newReportData = {
      id: newReportRef.id,
      dateReported: Timestamp.fromDate(selectedReport.dateReported.toDate()),
      division: user.role,
      reportedBy: user.id,
      patientID: selectedPatientID,
      roomNumber: selectedReport.roomNumber,
      description: selectedReport.description,
    };

    await setDoc(newReportRef, newReportData);

    setOpenDialogForm(false);
    setDataChange(true);
    setAllertMessage("Successfully Added Patient");
    setSnackBarOpen(true);
  };

  const header = [" ", "Room Number", "Patient Name", "Date Reported", "Reported By", "Division", ""];

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableToolbar name="Reports" showSearch={false} showFilter={false} searchQuery="" setSearchQuery={null} filterOption={null} setFilterValue={null} />
        <Dialog open={openDialogForm} onClose={() => handleCloseDialog()} fullWidth={true} maxWidth="md">
          <DialogTitle>New Report</DialogTitle>
          <DialogContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Room Number</TableCell>
                  <TableCell>
                    <TextField
                      required
                      id="roomNumber"
                      name="roomNumber"
                      autoFocus
                      fullWidth={true}
                      onChange={(e) => {
                        setSelectedReport((prevPatient) => ({
                          ...prevPatient,
                          roomNumber: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Patient Name</TableCell>
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
                  <TableCell>Date Reported</TableCell>
                  <TableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date Reported"
                        onChange={(dateReported: Dayjs | null) => {
                          setSelectedReport((prevReport) => ({
                            ...prevReport!,
                            dateReported: dateReported || null,
                          }));
                        }}
                        sx={{ width: "100%", marginTop: "28px" }}
                      />
                    </LocalizationProvider>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Reported By</TableCell>
                  <TableCell>
                    <TextField required id="weight" name="weight" autoFocus fullWidth={true} value={user ? user.name : ""} disabled />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Division</TableCell>
                  <TableCell>
                    <TextField required id="division" name="division" autoFocus fullWidth={true} value={user ? user.role : ""} disabled />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>
                    <TextField
                      required
                      autoFocus
                      fullWidth={true}
                      onChange={(e) => {
                        setSelectedReport((prevPatient) => ({
                          ...prevPatient,
                          description: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={() => handleAddReport()}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"medium"}>
            <TableHeader header={header} />
            <TableBody>
              {reportDatas.map((row, index) => (
                <ReportRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", padding: "1rem" }}>
          <Button variant="contained" style={{ marginRight: "1rem" }} color="primary" onClick={() => setOpenDialogForm(true)}>
            Add New Report
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default function Dashboard() {
  return (
    <MiniDrawer>
      <ThemeProvider theme={defaultTheme}>
        <JobTable />
        <ReportTable />
      </ThemeProvider>
    </MiniDrawer>
  );
}
