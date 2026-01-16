import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { snackBarDurationShortMs } from "../common/util/duration";
import { useCatch, useEffectAsync } from "../reactHelper";
import { sessionActions } from "../store";

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

const RegisterPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));


  const server = useSelector((state) => state.session.server);
  const totpForce = useSelector(
    (state) => state.session.server.attributes.totpForce
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpKey, setTotpKey] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loginLayout, setLoginLayout] = useState(1);


  useEffectAsync(async () => {
    if (totpForce) {
      const response = await fetch("/api/users/totp", { method: "POST" });
      if (response.ok) {
        setTotpKey(await response.text());
      } else {
        throw Error(await response.text());
      }
    }
  }, [totpForce, setTotpKey]);

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, totpKey }),
    });
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
            {!server.newServer && (
              <IconButton color="primary" onClick={() => navigate("/login")}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography className={classes.title} color="primary">
              {t("loginRegister")}
            </Typography>
          </div>
          <TextField
            required
            label={t("sharedName")}
            name="name"
            value={name}
            autoComplete="name"
            variant="filled"
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
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
          <TextField
            required
            label={t("userPassword")}
            name="password"
            variant="filled"
            value={password}
            type="password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
          {totpForce && (
            <TextField
              required
              label={t("loginTotpKey")}
              name="totpKey"
              value={totpKey || ""}
              InputProps={{
                readOnly: true,
              }}
            />
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            type="submit"
            disabled={
              !name ||
              !password ||
              !(server.newServer || /(.+)@(.+)\.(.{2,})/.test(email))
            }
            fullWidth
          >
            {t("loginRegister")}
          </Button>
        </div>
        <Snackbar
          open={snackbarOpen}
          onClose={() => {
            dispatch(
              sessionActions.updateServer({ ...server, newServer: false })
            );
            navigate("/login");
          }}
          autoHideDuration={snackBarDurationShortMs}
          message={t("loginCreated")}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
