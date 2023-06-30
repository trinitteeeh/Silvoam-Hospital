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

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignIn() {
  const { signin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      signin(email, password);
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
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>{/* <LockOutlinedIcon /> */}</Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="form" onSubmit={handleForm} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Sign In
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
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
