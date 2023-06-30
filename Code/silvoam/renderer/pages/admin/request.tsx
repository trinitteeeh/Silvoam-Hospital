import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "../../components/Title";
import MiniDrawer from "../../components/Drawer";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, Switch, styled } from "@mui/material";
import AuthContext from "../../utils/AuthProvider";

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  requestDate: Date;
  approveDate: Date;
  isAuth: boolean;
}

export default function Request() {
  const [datas, setDatas] = React.useState<RegistrationRequest[]>([]);
  const [approveID, setApproveID] = React.useState("");
  const [dataChange, setDataChange] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<RegistrationRequest | null>(null);
  const [selectedShift, setSelectedShift] = React.useState("");
  const { approve } = React.useContext(AuthContext);

  const handleClose = () => setOpen(false);

  React.useEffect(() => {
    if (dataChange) {
      fetchData();
    }
  }, [dataChange]);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const q = query(collection(db, "registrationrequests"), where("isAuth", "==", false));
      const querySnapshot = await getDocs(q);
      const requests: RegistrationRequest[] = [];

      querySnapshot.forEach((doc) => {
        const request = doc.data() as RegistrationRequest;
        request.id = doc.id;
        requests.push(request);
      });

      setDatas(requests);
    } catch (error) {
      console.log("Error fetching registration requests: ", error);
    }
  };

  const handleDialog = (id: string) => {
    setOpen(true);
    const filteredData = datas.filter((data) => data.id === id);
    setSelectedRequest(filteredData[0]);
  };

  const handleSelectedShift = (event: SelectChangeEvent<typeof selectedShift>) => {
    setSelectedShift(event.target.value);
  };

  const handleApprove = async (id: string) => {
    console.log(id);
    setOpen(false);
    setApproveID(id);
    try {
      const docRef = doc(db, "registrationrequests", id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        await updateDoc(docRef, {
          isAuth: true,
          userShift: selectedShift,
          approved_at: serverTimestamp(),
        });
        console.log("User approval status updated successfully!");
        setDataChange(true);
        setApproveID(null);
        approve(selectedRequest.email, selectedRequest.password, selectedRequest.name, selectedRequest.role, selectedShift);
      } else {
        console.log("User not found!");
      }
    } catch (error) {
      console.error("Error updating user approval status:", error);
    }
  };

  return (
    <MiniDrawer>
      {" "}
      <React.Fragment>
        <Title>Registration Request</Title>
        <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth="md">
          <DialogTitle>Approve Registration</DialogTitle>
          <DialogContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>{selectedRequest ? selectedRequest.name : ""}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>{selectedRequest ? selectedRequest.email : ""}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>{selectedRequest ? selectedRequest.role : ""}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Shift</TableCell>
                  <TableCell>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel htmlFor="shift">Shift</InputLabel>
                      <Select autoFocus value={selectedShift} onChange={handleSelectedShift} label="shift">
                        <MenuItem value="1">morning (07.00 - 17.00)</MenuItem>
                        <MenuItem value="2">normal (10.00 - 20.00)</MenuItem>
                        <MenuItem value="3">noon (13.00 - 23.00)</MenuItem>
                        <MenuItem value="4">night (16.00 - 07.00)</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            {selectedShift !== null ? (
              <Button variant="contained" color="primary" onClick={() => handleApprove(selectedRequest.id)}>
                Approve
              </Button>
            ) : (
              <Button variant="contained" disabled color="primary">
                Approve
              </Button>
            )}
          </DialogActions>
        </Dialog>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Approve</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datas.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.name}</TableCell>
                <TableCell>{data.email}</TableCell>
                <TableCell>{data.role}</TableCell>
                <TableCell align="right">
                  {approveID !== data.id ? (
                    <Button variant="contained" color="primary" onClick={() => handleDialog(data.id)}>
                      Approve
                    </Button>
                  ) : (
                    <Button variant="contained" disabled color="primary">
                      Approving
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </React.Fragment>
    </MiniDrawer>
  );
}
