"use client";
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useContext } from "react";
import AuthContext from "../utils/AuthProvider";
import MiniDrawer from "../components/Drawer";
import { InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = React.useState("");

  const { signup } = useContext(AuthContext);

  const handleForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      console.log(name);
      console.log(email);
      console.log(password);
      console.log(name);
      signup(email, password, name, role);
    } catch (error) {}
  };

  return (
    <MiniDrawer>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}></Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleForm} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    autoComplete="given-name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel htmlFor="role">Shift</InputLabel>
                  <Select
                    autoFocus
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                    }}
                    label="role"
                    sx={{ width: "100%" }}
                  >
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="pharmasist">Pharmasist</MenuItem>
                  </Select>
                </Grid>
              </Grid>

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="#" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </MiniDrawer>
  );
}
