import React, { useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Button from "@mui/material/Button";
import { Typography, styled } from "@mui/material";
import AuthContext from "../../utils/AuthProvider";

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  backgroundImage: `radial-gradient(circle at center, gray, white)`,
  backgroundSize: "50%",
  "& img": {
    maxWidth: "30%",
    height: "auto",
  },
  "& button": {
    marginTop: theme.spacing(2),
  },
}));

function Home() {
  const { logout } = React.useContext(AuthContext);
  const handleButtonClick = async () => {
    try {
      await logout();
    } catch (error) {}
    Router.push("/home");
  };

  return (
    <React.Fragment>
      <Head>
        <title>Landing Page</title>
      </Head>
      <Root>
        <Typography variant="h2" gutterBottom>
          Please Wait until We Verified Your Account
        </Typography>
        <img src="/images/logo.png" alt="Logo" />
        <Button variant="contained" color="secondary" onClick={handleButtonClick}>
          Back to Main Page
        </Button>
      </Root>
    </React.Fragment>
  );
}

export default Home;
