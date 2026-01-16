import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import ReactCountryFlag from "react-country-flag";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sessionActions } from "../store";
import {
  useLocalization,
  useTranslation,
} from "../common/components/LocalizationProvider";
import usePersistedState from "../common/util/usePersistedState";
import {
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from "../common/components/NativeInterface";
import { useCatch } from "../reactHelper";
import Loader from "../common/components/Loader";
import ParticlesBackground from "./ParticlesBackground";

// import Logo from "../resources/images/image170.png";
// import Logo from '../resources/images/logo_save.png';
import bg from "../resources/images/fundo.png";
import LogoImage from "./LogoImage";
// import app_store from "../resources/images/app-store-selo.png";
// import play_store from "../resources/images/google-play-selo.png";

const useStyles = makeStyles((theme) => ({
  options: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(1),
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 25, // theme.spacing(2),
    width: "100%",
    maxWidth: 400, // Adicione uma largura máxima para evitar que o formulário se estique demais
  },
  extraContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  registerButton: {
    minWidth: "unset",
  },
  link: {
    cursor: "pointer",
  },
  loginCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "rgba(255, 255, 255, 0.5)", 
    boxShadow: theme.shadows[2],
    gap: theme.spacing(3),
    width: "100%",
    maxWidth: 450, // Largura máxima para o cartão de login
  },
}));

const LoginPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState("loginEmail", "");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loginLayout, setLoginLayout] = useState(1);

  const [logo, setLogo] = useState("");

  const registrationEnabled = useSelector(
    (state) => state.session.server.registration
  );
  const languageEnabled = useSelector(
    (state) => !state.session.server.attributes["ui.disableLoginLanguage"]
  );
  const changeEnabled = useSelector(
    (state) => !state.session.server.attributes.disableChange
  );
  const emailEnabled = useSelector(
    (state) => state.session.server.emailEnabled
  );
  const openIdEnabled = useSelector(
    (state) => state.session.server.openIdEnabled
  );
  const openIdForced = useSelector(
    (state) =>
      state.session.server.openIdEnabled && state.session.server.openIdForce
  );
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector(
    (state) => state.session.server.announcement
  );

  const generateLoginToken = async () => {
    if (nativeEnvironment) {
      let token = "";
      try {
        const expiration = dayjs().add(6, "months").toISOString();
        const response = await fetch("/api/session/token", {
          method: "POST",
          body: new URLSearchParams(`expiration=${expiration}`),
        });
        if (response.ok) {
          token = await response.text();
        }
      } catch (error) {
        token = "";
      }
      nativePostMessage(`login|${token}`);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`;
      const response = await fetch("/api/session", {
        method: "POST",
        body: new URLSearchParams(
          code.length ? `${query}&code=${code}` : query
        ),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate("/");
      } else if (
        response.status === 401 &&
        response.headers.get("WWW-Authenticate") === "TOTP"
      ) {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setFailed(true);
      setPassword("");
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(
      `/api/session?token=${encodeURIComponent(token)}`
    );
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate("/");
    } else {
      throw Error(await response.text());
    }
  });

  const handleOpenIdLogin = () => {
    document.location = "/api/session/openid/auth";
  };

  useEffect(() => nativePostMessage("authentication"), []);

  useEffect(() => {
    fetch("/api/server")
      .then((response) => response.json())
      .then((data) => {
        setLogo(data.attributes.logo);
      });
  }, []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return <Loader />;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // Centraliza horizontalmente
        width: "100vw",
        height: "100vh",
        ...(loginLayout === 1 && {
          backgroundImage: `url("${bg}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }),
      }}
    >
      {loginLayout === 2 && <ParticlesBackground />}

      <div className={classes.loginCard}>
        <div style={{ width: 250, height: 180, marginBottom: 20 }}>
          <LogoImage color={theme.palette.secondary.main} />
        </div>

        <div className={classes.container}>
          <TextField
            required
            error={failed}
            label={"Login"}
            name="email"
            value={email}
            autoComplete="email"
            autoFocus={!email}
            onChange={(e) => setEmail(e.target.value)}
            helperText={failed && "Invalid username or password"}
            variant="outlined" // Use outlined para melhor visualização no fundo claro
          />
          <TextField
            required
            error={failed}
            label={t("userPassword")}
            name="password"
            value={password}
            type="password"
            autoComplete="current-password"
            autoFocus={!!email}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />
          {codeEnabled && (
            <TextField
              required
              error={failed}
              label={t("loginTotpCode")}
              name="code"
              value={code}
              type="number"
              onChange={(e) => setCode(e.target.value)}
              variant="outlined"
            />
          )}
          <Button
            onClick={handlePasswordLogin}
            type="submit"
            variant="contained"
            color="secondary"
          >
            {t("loginLogin")}
          </Button>
          <div className={classes.extraContainer}>
            {registrationEnabled && (
              <Link
                onClick={() => navigate("/register")}
                className={classes.link}
                underline="none"
                variant="caption"
              >
                {t("loginRegister")}
              </Link>
            )}
            {emailEnabled && (
              <Link
                onClick={() => navigate("/reset-password")}
                className={classes.link}
                underline="none"
                variant="caption"
              >
                {t("loginReset")}
              </Link>
            )}
          </div>
          {openIdEnabled && (
            <Button
              onClick={() => handleOpenIdLogin()}
              variant="contained"
              color="secondary"
            >
              {t("loginOpenId")}
            </Button>
          )}
        </div>
      </div>

      <div className={classes.options}>
        {nativeEnvironment && changeEnabled && (
          <Tooltip title={t("settingsServer")}>
            <IconButton onClick={() => navigate("/change-server")}>
              <LockOpenIcon />
            </IconButton>
          </Tooltip>
        )}
        {languageEnabled && (
          <FormControl>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languageList.map((it) => (
                <MenuItem key={it.code} value={it.code}>
                  <Box component="span" sx={{ mr: 1 }}>
                    <ReactCountryFlag countryCode={it.country} svg />
                  </Box>
                  {it.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setAnnouncementShown(true)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
};

export default LoginPage;


