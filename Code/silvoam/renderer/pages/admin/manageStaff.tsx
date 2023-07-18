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
import { Alert, Collapse, DialogActions, Icon, InputBase, InputLabel, Menu, MenuItem, NativeSelect, Radio, Select, Snackbar, styled, Typography } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import { Button, Dialog, DialogContent, DialogTitle, Fab, IconButton, TextField } from "@mui/material";
import EnhancedTableToolbar from "../../components/Table/TableToolbar";
import TableHeader from "../../components/Table/TableHeader";
import { Staff, Shift } from "../../utils/interface";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { TimeClock, TimeClockSlotsComponentsProps } from "@mui/x-date-pickers/TimeClock";
import { DateRangeCalendar } from "@mui/x-date-pickers-pro/DateRangeCalendar";
import { PickersActionBarProps, StaticDatePicker } from "@mui/x-date-pickers";
import { useLocaleText } from "@mui/x-date-pickers/internals";
import dayjs from "dayjs";
import { Padding } from "@mui/icons-material";
import Title from "../../components/Title";

const defaultTheme = createTheme();

function Row(props: { row: Staff; handleOpenDialog: (id: string) => void; handleDeleteStaff: (id: string) => void }) {
  const { row, handleOpenDialog, handleDeleteStaff } = props;

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
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell>{row.role}</TableCell>
        <TableCell>{row.shift && row.shift.name + " (" + row.shift.startHour + " - " + row.shift.endHour + ")"}</TableCell>
        <TableCell style={{ paddingLeft: 0, marginLeft: 0 }}>
          <IconButton aria-label="edit" onClick={() => handleOpenDialog(row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton aria-label="edit" onClick={() => handleDeleteStaff(row.id)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const StaffListTable = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [datas, setDatas] = React.useState<Staff[]>([]);
  const [dataChange, setDataChange] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);
  const [snackbarOpen, setSnackBarOpen] = React.useState(false);
  const [alertMessage, setAllertMessage] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("All");

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
      const q = query(collection(db, "staffs"), where("role", "!=", "unauthorized"));
      const querySnapshot = await getDocs(q);
      const staffs: Staff[] = [];

      for (const doc1 of querySnapshot.docs) {
        const staffData = doc1.data();
        const shiftRef = staffData.shiftID;

        let shiftData = null;

        if (shiftRef) {
          const shiftDocSnapshot = await getDoc(doc(db, "shifts", shiftRef));
          if (shiftDocSnapshot.exists()) {
            shiftData = shiftDocSnapshot.data();
            shiftData.id = shiftDocSnapshot.id;
          }
        }

        const staff = {
          id: doc1.id,
          name: doc1.data().name,
          email: doc1.data().email,
          role: doc1.data().role,
          shift: shiftData,
        };

        staffs.push(staff);
      }
      setDatas(staffs);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleOpenDialog = (id: string) => {
    setOpen(true);
    const filteredData = datas.filter((data) => data.id === id);
    setSelectedStaff(filteredData[0]);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredStaff = datas.filter((staff) => {
    if (filterValue === "All") {
      return true; // Show all data
    } else {
      return staff.shift.id === filterValue;
    }
  });

  // console.log(datas);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - datas.length) : 0;

  const visibleRows = React.useMemo(() => filteredStaff.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [page, datas, rowsPerPage, filteredStaff]);

  const header = ["Name", "Email", "Role", "Shift", ""];

  const handleCloseDialog = () => {
    setSelectedStaff(null);
    setOpen(false);
  };

  const handleUpdateStaff = async () => {
    const StaffRef = doc(db, "staffs", selectedStaff.id);
    const StaffSnapshot = await getDoc(StaffRef);

    if (StaffSnapshot.exists()) {
      const updatedData = {
        ...selectedStaff,
      };
      await updateDoc(StaffRef, updatedData);
    }
    setOpen(false);
    setDataChange(true);
    setAllertMessage("Sucessfully Update Staff");
    setSnackBarOpen(true);
  };

  const handleDeleteStaff = (staffID) => {
    const documentRef = doc(db, "staffs", staffID);
    deleteDoc(documentRef);
    setDataChange(true);
    setAllertMessage("Sucessfully Delete Patient");
    setSnackBarOpen(true);
  };

  const filterOption = [
    { value: "All", text: "All" },
    { value: "1", text: "Morning" },
    { value: "2", text: "Normal" },
    { value: "3", text: "Night" },
  ];

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar name="Manage Staff" showSearch={true} showFilter={true} searchQuery={""} setSearchQuery={null} setFilterValue={setFilterValue} filterOption={filterOption} />
          <Dialog open={open} onClose={() => handleCloseDialog()} fullWidth={true} maxWidth="md">
            <DialogTitle>Staff Detail</DialogTitle>
            <DialogContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>
                      <TextField
                        required
                        id="id"
                        name="id"
                        autoFocus
                        fullWidth={true}
                        disabled={selectedStaff !== null}
                        value={selectedStaff ? selectedStaff.id : ""}
                        onChange={(e) => {
                          setSelectedStaff((prevStaff) => ({
                            ...prevStaff,
                            id: e.target.value,
                          }));
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>
                      <TextField
                        required
                        id="name"
                        name="name"
                        autoFocus
                        fullWidth={true}
                        disabled={selectedStaff !== null}
                        value={selectedStaff ? selectedStaff.name : ""}
                        onChange={(e) => {
                          setSelectedStaff((prevStaff) => ({
                            ...prevStaff,
                            name: e.target.value as string,
                          }));
                        }}
                      ></TextField>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>
                      <TextField
                        required
                        id="email"
                        name="email"
                        autoFocus
                        fullWidth={true}
                        disabled={selectedStaff !== null}
                        value={selectedStaff ? selectedStaff.email : ""}
                        onChange={(e) => {
                          setSelectedStaff((prevStaff) => ({
                            ...prevStaff,
                            role: e.target.value as string,
                          }));
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    <TableCell>
                      <NativeSelect
                        defaultValue={selectedStaff ? selectedStaff.role : ""}
                        fullWidth
                        onChange={(e) => {
                          setSelectedStaff((prevStaff) => ({
                            ...prevStaff,
                            role: e.target.value,
                          }));
                        }}
                      >
                        <option value="Doctor">Doctor</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Cooking Staff">Cooking Staff</option>
                        <option value="Cleaning Service">Cleaning Service</option>
                        <option value="Ambulance Driver">Ambulance Driver</option>
                      </NativeSelect>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Shift</TableCell>
                    <TableCell>
                      <TextField
                        required
                        id="description"
                        name="description"
                        autoFocus
                        fullWidth={true}
                        disabled={selectedStaff !== null}
                        value={selectedStaff ? selectedStaff.shift.name + " (" + selectedStaff.shift.startHour + " - " + selectedStaff.shift.endHour + ")" : ""}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="primary" onClick={() => handleUpdateStaff()}>
                Update
              </Button>
            </DialogActions>
          </Dialog>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"medium"}>
              <TableHeader header={header} />
              <TableBody>
                {visibleRows.map((row, index) => (
                  <Row key={row.id} row={row} handleOpenDialog={handleOpenDialog} handleDeleteStaff={handleDeleteStaff} />
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
      <Snackbar open={snackbarOpen} autoHideDuration={6000}>
        <Alert onClose={() => setSnackBarOpen(false)} severity="success">
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

const DatePickerWrapper = styled(Box)({
  display: "flex",
});

export default function ManageStaffPage() {
  return (
    <MiniDrawer>
      <ThemeProvider theme={defaultTheme}>
        <StaffListTable />
        <DatePickerWrapper>
          <Box sx={{ display: "flex", flex: "1", justifyContent: "flex-start", backgroundColor: "red" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StaticDatePicker
                defaultValue={dayjs("2022-04-17")}
                slotProps={{
                  actionBar: {
                    hidden: true,
                  },
                }}
                sx={{ width: "100%" }}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ display: "flex", flex: "1" }}></Box>
        </DatePickerWrapper>
      </ThemeProvider>
    </MiniDrawer>
  );
}
