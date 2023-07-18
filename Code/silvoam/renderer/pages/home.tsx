import React, { useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Button from "@mui/material/Button";
import { Typography, styled } from "@mui/material";

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
  const handleButtonClick = () => {
    Router.push("/unauthorized/signup");
  };

  useEffect(() => {
    const currentUser = localStorage.getItem("id");
    if (currentUser) {
      Router.push("/dashboard");
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Landing Page</title>
      </Head>
      <Root>
        <Typography variant="h2" gutterBottom>
          Silvoam Hospital
        </Typography>
        <img src="/images/logo.png" alt="Logo" />
        <Button variant="contained" color="secondary" onClick={handleButtonClick}>
          Get Started
        </Button>
      </Root>
    </React.Fragment>
  );
}

export default Home;
