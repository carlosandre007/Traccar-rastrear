import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Snackbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginLayout from "./LoginLayout";
import { useTranslation } from "../common/components/LocalizationProvider";
import useQuery from "../common/util/useQuery";
import { snackBarDurationShortMs } from "../common/util/duration";
import { useCatch } from "../reactHelper";

import LogoImage from "./LogoImage";
import bg from "../resources/images/bg-a420e4d9.jpeg";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 25, // theme.spacing(2),
    width: "100%",
    marginTop: -30,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    fontSize: theme.spacing(3),
    fontWeight: 500,
    marginLeft: theme.spacing(1),
    textTransform: "uppercase",
  },
}));

const ResetPasswordPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const query = useQuery();

  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const token = query.get("passwordReset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loginLayout, setLoginLayout] = useState(1);

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    let response;
    if (!token) {
      response = await fetch("/api/password/reset", {
        method: "POST",
        body: new URLSearchParams(`email=${encodeURIComponent(email)}`),
      });
    } else {
      response = await fetch("/api/password/update", {
        method: "POST",
        body: new URLSearchParams(
          `token=${encodeURIComponent(token)}&password=${encodeURIComponent(
            password
          )}`
        ),
      });
    }
    if (response.ok) {
      setSnackbarOpen(true);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          loginLayout === 2 ? "center" : desktop ? "flex-start" : "center",
        width: "100vw",
        height: "100vh",
        // backgroundColor: "#0a0a0a",
        ...(loginLayout === 1 && {
          // backgroundColor: "#0a0a0a",
          backgroundImage: `url("${bg}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }),
      }}
    >
      <div
        style={{
          // borderRadius: '25px',
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          padding: desktop ? "80px" : "30px",
          // backdropFilter: 'blur(20px)',
          // WebkitBackdropFilter: 'blur(20px)',
          // boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          height: loginLayout === 2 ? "600px" : "100vh",
          width: desktop ? "600px" : "100%",
          opacity: 0.88,
          gap: 30,

          backgroundColor: "#FFFFFF",
          // background: 'linear-gradient(to bottom right, #FFFFFF, lightgray)',

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {/* <img src={`${url.origin}/${logo}`} alt="" style={{ width: 330, marginBottom: 20 }} /> */}
        {/*         <img
        src={logo}
        alt=""
        style={{ width: 280, height: 180, marginBottom: 20 }}
      /> */}
        {/*         <Button onClick={() => setLoginLayout(loginLayout === 2 ? 1 : 2)}>
        Change layout
      </Button> */}
        <div style={{ width: 250, height: 180, marginTop: 40 }}>
          <LogoImage color="white" />
        </div>
        <div className={classes.container}>
          <div className={classes.header}>
            <IconButton color="primary" onClick={() => navigate("/login")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography className={classes.title} color="primary">
              {t("loginReset")}
            </Typography>
          </div>
          {!token ? (
            <TextField
              required
              type="email"
              variant="filled"
              label={t("userEmail")}
              name="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          ) : (
            <TextField
              required
              label={t("userPassword")}
              name="password"
              value={password}
              type="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            onClick={handleSubmit}
            disabled={!/(.+)@(.+)\.(.{2,})/.test(email) && !password}
            fullWidth
          >
            {t("loginReset")}
          </Button>
        </div>
        <Snackbar
          open={snackbarOpen}
          onClose={() => navigate("/login")}
          autoHideDuration={snackBarDurationShortMs}
          message={!token ? t("loginResetSuccess") : t("loginUpdateSuccess")}
        />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
