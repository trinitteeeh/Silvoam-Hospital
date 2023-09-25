import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import MiniDrawer from "../components/Drawer";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  NativeSelect,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-config";
import EnhancedTableToolbar from "../components/Table/TableToolbar";
import { Room, Bed, RoomType, Patient, Staff, Job } from "../utils/interface";
import { getAllData } from "../utils/DataAccess";
import dayjs from "dayjs";
import AuthContext from "../utils/AuthProvider";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { checkingPatient, cleaningRoom, deleteBed, deleteJob, escortPatient, prepareBed, prepareFood, servingFood } from "../utils/CreateJob";

const defaultTheme = createTheme();

function RoomCard({ room, setBedDetailOpen, setSelectedRoom, setSelectedBed, setJobListOpen }) {
  return (
    <Card sx={{ minWidth: 275, maxWidth: 500, minHeight: 400, position: "relative", p: 1 }}>
      <CardContent sx={{ p: 0 }}>
        <Typography variant="h5" component="div" sx={{ textAlign: "center", fontWeight: "bold", color: defaultTheme.palette.primary.main }}>
          {room.id}
        </Typography>
        <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: "center" }}>
          {room.roomType?.name}
        </Typography>
        <Typography gutterBottom variant="h5" component="div" sx={{ textAlign: "center", fontWeight: "bold", color: defaultTheme.palette.primary.main }}></Typography>
        <Grid container spacing={2} sx={{ paddingLeft: 5 }}>
          {room.bedList.map((bed) => (
            <Grid item key={bed.id} xs={12} sm={6} md={4}>
              <Bed bed={bed} setBedDetailOpen={setBedDetailOpen} setSelectedBed={setSelectedBed} setSelectedRoom={() => setSelectedRoom(room)} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
      <CardActions sx={{ position: "absolute", bottom: "1vh", left: "50%", transform: "translateX(-50%)" }}>
        <Button
          size="small"
          onClick={() => {
            setSelectedRoom(room);
            setJobListOpen(true);
          }}
        >
          Current Job in The Room
        </Button>
      </CardActions>
    </Card>
  );
}

function ModifiedFab({ user, setAddBedOpen, setAddRoomOpen }) {
  return (
    <>
      {user?.role === "Admin" ? (
        <>
          <RoomFab setOpen={setAddRoomOpen} />
          <BedFab setOpen={setAddBedOpen} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}

function Bed({ bed, setBedDetailOpen, setSelectedBed, setSelectedRoom }) {
  let cardColor;
  if (bed.status === "Unusable") {
    cardColor = "red";
  } else if (bed.status === "Available") {
    cardColor = "green";
  } else if (bed.status === "Filled with patient") {
    cardColor = "yellow";
  }

  return (
    <Card
      sx={{ minWidth: 50, maxWidth: 70, minHeight: 40, maxHeight: 60, backgroundColor: cardColor }}
      onClick={() => {
        setBedDetailOpen(true);
        setSelectedBed(bed);
        setSelectedRoom();
      }}
    >
      <CardContent>
        <Typography sx={{ textAlign: "center" }} variant="h5">
          {bed.number}
        </Typography>
      </CardContent>
    </Card>
  );
}

const RoomFab = ({ setOpen }) => (
  <Fab
    variant="extended"
    color="primary"
    aria-label="add"
    onClick={() => setOpen(true)}
    sx={{
      position: "fixed",
      bottom: "80px",
      right: "20px",
      minWidth: 140,
    }}
  >
    <AddIcon sx={{ mr: 1 }} />
    Add Room
  </Fab>
);

const BedFab = ({ setOpen }) => (
  <Fab
    variant="extended"
    color="secondary"
    aria-label="add"
    onClick={() => setOpen(true)}
    sx={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      minWidth: 140,
    }}
  >
    <AddIcon sx={{ mr: 1 }} />
    Add Bed
  </Fab>
);

function AddBedDialog({ open, handleConfirm, setData, roomList, setOpen }) {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => handleCloseDialog()} fullWidth={true} maxWidth="md">
      <DialogTitle>Add New Bed</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Room</TableCell>
              <TableCell>
                <NativeSelect
                  fullWidth
                  onChange={(e) =>
                    setData((prevData) => ({
                      ...prevData,
                      roomID: e.target.value,
                    }))
                  }
                >
                  <option value="">Select a room</option>
                  {roomList && roomList.length > 0 ? (
                    roomList.map((data) => (
                      <option key={data.id} value={data.id}>
                        {data.id}
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

function AddRoomDialog({ open, handleConfirm, setData, roomTypeList, setOpen }) {
  const handleCloseDialog = () => {
    setOpen(false);
  };
  return (
    <Dialog open={open} onClose={() => handleCloseDialog()} fullWidth={true} maxWidth="md">
      <DialogTitle>Add New Room</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Room Number</TableCell>
              <TableCell>
                <TextField
                  required
                  autoFocus
                  fullWidth={true}
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      id: e.target.value,
                    }));
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Building Number</TableCell>
              <TableCell>
                <TextField
                  required
                  autoFocus
                  fullWidth={true}
                  type="number"
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      buildingNumber: e.target.value,
                    }));
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Floor Number</TableCell>
              <TableCell>
                <TextField
                  required
                  autoFocus
                  fullWidth={true}
                  type="number"
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      floorNumber: e.target.value,
                    }));
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Room Type</TableCell>
              <TableCell>
                <NativeSelect
                  fullWidth
                  onChange={(e) =>
                    setData((prevData) => ({
                      ...prevData,
                      roomType: e.target.value,
                    }))
                  }
                >
                  <option value="">Select a room type</option>
                  {roomTypeList && roomTypeList.length > 0 ? (
                    roomTypeList.map((data) => (
                      <option key={data.id} value={data.id}>
                        {data.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No room types available
                    </option>
                  )}
                </NativeSelect>
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

function BedDetailDialog({ open, setOpen, data, setData, doctorData, patientData, roomData, handleAssignBed, handleMovePatient, handleMoveBed, handleDeleteBed }) {
  const [openCollapse, setOpenCollapse] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);
  const [isChecked2, setIsChecked2] = React.useState(false);
  const [newRoom, setNewRoom] = React.useState("");

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleOnAssignBed = () => {
    setData((prevData) => ({
      ...prevData,
      id: data.id,
      roomID: data.roomID,
      number: data.number,
    }));
    handleAssignBed();
  };

  const handleOnMovePatient = () => {
    handleMovePatient(newRoom);
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} fullWidth={true} maxWidth="md">
      <DialogTitle>Bed Detail</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Room Number</TableCell>
              <TableCell>
                <TextField required autoFocus fullWidth={true} value={data?.roomID} disabled />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bed Number</TableCell>
              <TableCell>
                <TextField required autoFocus fullWidth={true} type="number" value={data?.number} disabled />
              </TableCell>
            </TableRow>
            {data?.patient ? (
              <>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>
                    <TextField required autoFocus value={data?.patient.name} disabled />
                    <IconButton size="small" onClick={() => setOpenCollapse(!openCollapse)}>
                      {openCollapse ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }}></TableCell>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={2}>
                    <Collapse in={openCollapse} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        <ListItem>
                          <ListItemText primaryTypographyProps={{ component: "span" }} primary="Name" secondary={data?.patient?.name} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primaryTypographyProps={{ component: "span" }} primary="Doctor" secondary={data?.doctor?.name} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primaryTypographyProps={{ component: "span" }} primary="Gender" secondary={data?.patient?.gender} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primaryTypographyProps={{ component: "span" }} primary="Age" secondary={new Date().getFullYear() - data?.patient.dob.toDate().getFullYear()} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primaryTypographyProps={{ component: "span" }} primary="Sickness" secondary={data?.sickness} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primaryTypographyProps={{ component: "span" }} primary="Email" secondary={data?.patient.email} />
                        </ListItem>
                      </List>
                    </Collapse>
                  </TableCell>
                </TableRow>
                {isChecked && (
                  <TableRow>
                    <TableCell>New Room</TableCell>
                    <TableCell>
                      <NativeSelect
                        fullWidth
                        onChange={(e) => {
                          setNewRoom(e.target.value);
                        }}
                        value={newRoom}
                      >
                        <option value="null" key="0">
                          Select new room
                        </option>
                        {roomData && roomData.length > 0 ? (
                          roomData.map((x) =>
                            x.bedList?.map((y) =>
                              y.status === "Available" && y.id !== data.id ? (
                                <option key={y.bed?.id} value={y.id}>
                                  {x?.roomType?.name + "Room " + x.id + " Bed Number " + y?.number}
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
                )}
              </>
            ) : (
              <>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>
                    <NativeSelect
                      fullWidth
                      onChange={(e) => {
                        setData((prevData) => ({
                          ...prevData,
                          patientID: e.target.value,
                        }));
                      }}
                      disabled={!isChecked}
                    >
                      <option value="">Select a patient</option>
                      {patientData && patientData.length > 0 ? (
                        patientData.map((data) => (
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
                  <TableCell>Doctor</TableCell>
                  <TableCell>
                    <NativeSelect
                      fullWidth
                      onChange={(e) => {
                        setData((prevData) => ({
                          ...prevData,
                          doctorID: e.target.value,
                        }));
                      }}
                      disabled={!isChecked}
                    >
                      <option value="">Select a doctor</option>
                      {doctorData && doctorData.length > 0 ? (
                        doctorData.map((data) => (
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
                  <TableCell>Sickness</TableCell>
                  <TableCell>
                    <TextField
                      required
                      autoFocus
                      fullWidth={true}
                      disabled={!isChecked}
                      onChange={(e) => {
                        setData((prevData) => ({
                          ...prevData,
                          sickness: e.target.value,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>New Room</TableCell>
                  <TableCell>
                    <NativeSelect
                      fullWidth
                      onChange={(e) => {
                        setNewRoom(e.target.value);
                      }}
                      value={newRoom}
                      disabled={!isChecked2}
                    >
                      <option value="null" key="0">
                        Select new room
                      </option>
                      {roomData && roomData.length > 0 ? (
                        roomData.map((x) =>
                          x.id !== data?.roomID ? (
                            <option key={x.id} value={x.id}>
                              {x?.roomType?.name + " Room Number " + x.id}
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
              </>
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row" }}>
        {data?.patient && (
          <>
            <FormControlLabel control={<Checkbox color="primary" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />} label="Move Patient" labelPlacement="start" />
            <div>
              <Button variant="contained" color="primary" onClick={handleOnMovePatient} disabled={!isChecked} sx={{ marginRight: "1rem" }}>
                Move Patient
              </Button>
              <Button variant="contained" color="secondary" onClick={handleOnAssignBed}>
                Display Bil
              </Button>
            </div>
          </>
        )}
        {!data?.patient && data?.status === "Available" && (
          <>
            <div>
              <FormControlLabel control={<Checkbox color="primary" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />} label="Assign to Patient" labelPlacement="start" />
              <FormControlLabel control={<Checkbox color="primary" checked={isChecked2} onChange={() => setIsChecked2(!isChecked2)} />} label="Move to Other Room" labelPlacement="start" />
            </div>

            <div>
              <Button variant="contained" color="primary" onClick={handleOnAssignBed} disabled={!isChecked} sx={{ marginRight: "1rem" }}>
                Add Patient
              </Button>
              <Button variant="contained" color="secondary" onClick={() => handleMoveBed(newRoom, data.id)} disabled={!isChecked2} sx={{ marginRight: "1rem" }}>
                Move
              </Button>
              <Button variant="contained" color="error" onClick={() => handleDeleteBed(data.id)}>
                Delete
              </Button>
            </div>
          </>
        )}
        {data?.patient === null && data?.status === "Unusable" && (
          <>
            <Button variant="contained" color="error" onClick={() => handleDeleteBed()}>
              Delete
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

function JobListDialog({ open, jobList, setOpen, room }) {
  console.log("room");
  console.log(room);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth={true} maxWidth="md" PaperProps={{ style: { maxHeight: "70vh" } }}>
      <DialogTitle>Job List</DialogTitle>
      <DialogContent dividers>
        <div style={{ maxHeight: "100%", overflowY: "auto" }}>
          {room?.bedList?.map((bed) => (
            <React.Fragment key={bed?.number}>
              <Typography variant="h6">Bed Number {bed?.number}</Typography>
              <List component="div" disablePadding>
                {jobList
                  .filter((x) => x?.roomID === room?.id && x?.bedID === bed?.id)
                  .map((job) => (
                    <ListItem key={job?.id}>
                      <ListItemText primaryTypographyProps={{ component: "span" }} primary={job?.name} secondary={"Assigned to: " + job?.staff?.name} />
                      <ListItemText
                        secondaryTypographyProps={{ component: "span", align: "right" }}
                        secondary={
                          <>
                            <Typography variant="body2">Assign Date: {String(job?.assignDate)}</Typography>
                            <Typography variant="body2">Due Date: {String(job?.dueDate)}</Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </React.Fragment>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ManageRoom() {
  const [datas, setDatas] = React.useState<Room[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const [alertMessage, setAllertMessage] = React.useState("");
  const { user } = React.useContext(AuthContext);
  const [addRoomOpen, setAddRoomOpen] = React.useState(false);
  const [addBedOpen, setAddBedOpen] = React.useState(false);
  const [bedDetailOpen, setBedDetailOpen] = React.useState(false);
  const [jobListOpen, setJobListOpen] = React.useState(false);
  const [room, setRoom] = React.useState<Room | null>(null);
  const [bed, setBed] = React.useState(null);
  const [roomTypeList, setRoomTypeList] = React.useState([]);
  const [patientList, setPatientList] = React.useState([]);
  const [doctorList, setDoctorList] = React.useState([]);
  const [jobList, setJobList] = React.useState([]);
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
      const collectionName = "rooms";
      const collectionData = await getAllData(collectionName);

      const collectionName2 = "beds";
      const collectionData2 = await getAllData(collectionName2);

      const roomTypeData = await getAllData("roomtypes");
      setRoomTypeList(roomTypeData);

      const patientData = await getAllData("Patients");
      setPatientList(patientData);

      const staffData = await getAllData("staffs");
      const doctorData = staffData.filter((staff) => staff?.role === "Doctor");
      setDoctorList(doctorData);

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
      setDatas(newDatas);

      const data = await getAllData("jobs");
      const jobsData: Job[] = await Promise.all(
        data.map(async (job) => {
          const patientSnapshot = await getDoc(doc(db, "Patients", job.patientID));
          const patientData = patientSnapshot.data() as Patient;

          const staffSnapshot = await getDoc(doc(db, "staffs", job.staffID));
          const staffData = staffSnapshot.data();

          if (job?.status === "Incomplete") {
            return {
              ...job,
              assignDate: dayjs(job.assignDate.toDate()),
              dueDate: dayjs(job.dueDate.toDate()),
              patient: patientData,
              staff: staffData,
            };
          }
        })
      );
      setJobList(jobsData);
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  };

  const handleAddRoom = async () => {
    const roomIDPattern = /^\d{3}$/; // Regular expression pattern for 3-digit number
    const isValidRoomID = roomIDPattern.test(room?.id ? room.id : "");

    if (!isValidRoomID) {
      setAllertMessage("Room Number must be 3 digit number");
      setSnackBarOpen(true);
      setAddRoomOpen(false);
      return;
    } else if (room?.floorNumber == null || room?.roomType == null || room?.buildingNumber == null) {
      setAllertMessage("All field must be filled!");
      setSnackBarOpen(true);
      setAddRoomOpen(false);
      return;
    }
    const id = room.buildingNumber.toString() + room.floorNumber.toString() + room.id;
    const newDocRef = doc(collection(db, "rooms"), id);

    const newData = {
      id: id,
      bedQuantity: 0,
      buildingNumber: room.buildingNumber,
      floorNumber: room.floorNumber,
      roomTypeID: room.roomType,
    };

    await setDoc(newDocRef, newData);

    setRoom(null);
    setAddRoomOpen(false);
    setDataChange(true);
    setAllertMessage("New Room Aded");
    setSnackBarOpen(true);
  };

  const handleAddBed = async () => {
    if (bed?.roomID == null) {
      setAllertMessage("All field must be filled!");
      setSnackBarOpen(true);
      setAddBedOpen(false);
      return;
    }

    const currentRoom = datas.find((data) => data.id === bed.roomID);
    if (currentRoom.bedQuantity >= currentRoom.roomType.maxBedCapacity) {
      setAllertMessage("Room Bed Capacity is Full!");
      setSnackBarOpen(true);
      setAddBedOpen(false);
      return;
    }

    const newDocRef = doc(collection(db, "beds"));
    const staffData = await getAllData("staffs");
    const bedNumber = currentRoom.bedQuantity + 1;

    const newData = {
      id: newDocRef.id,
      patientID: " ",
      roomID: bed.roomID,
      sickness: " ",
      doctorID: " ",
      status: "Unusable",
      number: bedNumber,
    };

    const docRef = doc(db, "rooms", currentRoom.id);
    const docSnapShot = await getDoc(docRef);
    if (docSnapShot.exists()) {
      const updatedData = {
        ...docSnapShot.data(),
        bedQuantity: bedNumber,
      };
      await updateDoc(docRef, updatedData);
    }

    await setDoc(newDocRef, newData);
    prepareBed(newData.roomID, newData.patientID, staffData, newData.id);

    setBed(null);
    setAddBedOpen(false);
    setDataChange(true);
    setAllertMessage("New Bed Aded");
    setSnackBarOpen(true);
  };

  const handleAssignBed = async () => {
    if (bed?.sickness == null) {
      setAllertMessage("All field must be filled!");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      return;
    }

    if (datas.find((x) => x.bedList.find((y) => y.patient?.id === bed.patientID))) {
      setAllertMessage("Patient already assigned to a bed!");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      return;
    }

    const docRef = doc(db, "beds", bed.id);
    const docSnapshot = await getDoc(docRef);
    const staffData = await getAllData("staffs");

    if (docSnapshot.exists()) {
      const updatedData = {
        id: bed?.id,
        status: "Unusable",
        patientID: bed.patientID,
        doctorID: bed.doctorID,
        number: bed?.number,
        roomID: bed?.roomID,
        sickness: bed?.sickness,
      };

      await updateDoc(docRef, updatedData);
      escortPatient(bed?.roomID, bed?.patientID, staffData, bed?.id);

      setAllertMessage("Patient assigned to a bed");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      setDataChange(true);
    }
  };

  const handleMovePatient = async (newBedID) => {
    const newBedRef = doc(db, "beds", newBedID);
    const newBedSnapshot = await getDoc(newBedRef);

    const oldBedRef = doc(db, "beds", bed?.id);
    const oldBedSnapshot = await getDoc(oldBedRef);

    if (!newBedSnapshot.exists() || !oldBedSnapshot.exists()) {
      setAllertMessage("Error");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      return;
    }

    if (!oldBedSnapshot.exists()) {
      setAllertMessage("Error Atas");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      return;
    }

    if (!newBedSnapshot.exists()) {
      setAllertMessage("Error");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      return;
    }

    const newBedData = {
      id: newBedID,
      status: "Unusable",
      patientID: bed.patientID,
      doctorID: bed.doctorID,
      number: newBedSnapshot.data().number,
      roomID: newBedSnapshot.data().roomID,
      sickness: bed?.sickness,
    };

    const oldBedData = {
      id: bed?.id,
      status: "Unusable",
      patientID: " ",
      doctorID: " ",
      number: bed?.number,
      roomID: bed?.roomID,
      sickness: " ",
    };

    deleteJob(bed.id);
    await updateDoc(oldBedRef, oldBedData);
    await updateDoc(newBedRef, newBedData);
    const staffData = await getAllData("staffs");
    prepareBed(oldBedData.roomID, oldBedData.patientID, staffData, oldBedData.id);
    escortPatient(newBedData.roomID, newBedData.patientID, staffData, newBedData.id);

    setAllertMessage("Patient is moved to another bed");
    setSnackBarOpen(true);
    setBedDetailOpen(false);
    setBed(null);
    setDataChange(true);
  };

  const handleMoveBed = async (newRoomID, bedID) => {
    const newRoomRef = doc(db, "rooms", newRoomID);
    const newRoomSnapshot = await getDoc(newRoomRef);

    const oldRoomRef = doc(db, "rooms", room?.id);
    const oldRoomSnapshot = await getDoc(oldRoomRef);

    const selectedBedRef = doc(db, "beds", bedID);
    const selectedBedSnapshot = await getDoc(selectedBedRef);

    if (!newRoomSnapshot.exists() || !oldRoomSnapshot.exists() || !selectedBedSnapshot.exists()) {
      setAllertMessage("Error");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      return;
    }

    const maxBed = roomTypeList.find((x) => newRoomSnapshot.data().roomTypeID === x.id);

    if (newRoomSnapshot.data()?.bedQuantity >= maxBed) {
      setAllertMessage("The new room doesn;t have enough space");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      return;
    }

    const oldRoomData = {
      ...oldRoomSnapshot.data(),
      bedQuantity: oldRoomSnapshot.data().bedQuantity - 1,
    };

    const newRoomData = {
      ...newRoomSnapshot.data(),
      bedQuantity: newRoomSnapshot.data().bedQuantity + 1,
    };

    const bedData = {
      ...BedDetailDialog,
      number: newRoomSnapshot.data().bedQuantity + 1,
      roomID: newRoomSnapshot.id,
      status: "Unusable",
    };

    const staffData = await getAllData("staffs");
    prepareBed(bedData.roomID, " ", staffData, bedID);

    await updateDoc(oldRoomRef, oldRoomData);
    await updateDoc(newRoomRef, newRoomData);
    await updateDoc(selectedBedRef, bedData);

    setAllertMessage("Bed is moved to another room");
    setSnackBarOpen(true);
    setBedDetailOpen(false);
    setBed(null);
    setDataChange(true);
  };

  const handleDeleteBed = async () => {
    const roomRef = doc(db, "rooms", room?.id);
    const roomSnapshot = await getDoc(roomRef);

    const bedRef = doc(db, "beds", bed?.id);
    const bedSnapshot = await getDoc(bedRef);

    if (!roomSnapshot.exists() || !bedSnapshot.exists()) {
      setAllertMessage("Error");
      setSnackBarOpen(true);
      setBedDetailOpen(false);
      setBed(null);
      return;
    }

    const roomData = {
      ...roomSnapshot.data(),
      bedQuantity: roomSnapshot.data().bedQuantity - 1,
    };
    const bedData = {
      ...bedSnapshot.data(),
      status: "Unusable",
    };
    updateDoc(bedRef, bedData);
    updateDoc(roomRef, roomData);
    const staffList = await getAllData("staffs");
    deleteBed(room?.id, bed?.patientID, staffList, bed?.id);

    setAllertMessage("Bed is deleted");
    setSnackBarOpen(true);
    setBedDetailOpen(false);
    setBed(null);
    setDataChange(true);
  };

  const handleSeachQueryChange = (query) => {
    setSearchQuery(query);
    const formattedQuery = searchQuery.toLowerCase();
    const filteredDatas = datas.filter((data) => data.id.toLowerCase().includes(formattedQuery));
    setSearchResults(filteredDatas);
    console.log(searchQuery);
  };

  const filteredDatas = searchQuery ? searchResults : datas;

  return (
    <MiniDrawer>
      <ThemeProvider theme={defaultTheme}>
        <AddRoomDialog setOpen={setAddRoomOpen} handleConfirm={handleAddRoom} open={addRoomOpen} roomTypeList={roomTypeList} setData={setRoom} />
        <AddBedDialog setOpen={setAddBedOpen} handleConfirm={handleAddBed} open={addBedOpen} roomList={datas} setData={setBed} />
        <BedDetailDialog
          data={bed}
          open={bedDetailOpen}
          setOpen={setBedDetailOpen}
          doctorData={doctorList}
          patientData={patientList}
          setData={setBed}
          handleAssignBed={handleAssignBed}
          roomData={datas}
          handleMovePatient={handleMovePatient}
          handleMoveBed={handleMoveBed}
          handleDeleteBed={handleDeleteBed}
        />
        <JobListDialog jobList={jobList} open={jobListOpen} setOpen={setJobListOpen} room={room} />
        <Box sx={{ width: "100%" }}>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <EnhancedTableToolbar name="Manage Room" showSearch={true} showFilter={false} searchQuery={searchQuery} setSearchQuery={handleSeachQueryChange} filterOption={null} setFilterValue={null} />
          </Paper>
          <Box sx={{ p: 2, backgroundColor: "#eceff1", borderRadius: defaultTheme.shape.borderRadius, minHeight: "77vh" }}>
            <Grid container spacing={2}>
              {filteredDatas.map((data) => (
                <Grid item xs={12} sm={4} key={data.id}>
                  <RoomCard room={data} setBedDetailOpen={setBedDetailOpen} setSelectedRoom={setRoom} setSelectedBed={setBed} setJobListOpen={setJobListOpen} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
        <ModifiedFab setAddBedOpen={setAddBedOpen} setAddRoomOpen={setAddRoomOpen} user={user} />
        <Snackbar open={snackbarOpen} autoHideDuration={6000}>
          <Alert onClose={() => setSnackBarOpen(false)} severity="success">
            {alertMessage}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </MiniDrawer>
  );
}
