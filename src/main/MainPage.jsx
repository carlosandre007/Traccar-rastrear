import React, { useState, useCallback, useEffect } from "react";
import {
  BottomNavigationAction,
  Box,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  SwipeableDrawer,
  Typography,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import Switch from "@mui/material/Switch";
import Modal from "@mui/material/Modal";

import DevicesPageCustom from "../settings/DevicesPageCustom";

import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import DeviceList from "./DeviceList";
import BottomMenu from "../common/components/BottomMenu";
import StatusCardMobile from "../common/components/StatusCardMobile";
import StatusCardDesktop from "../common/components/StatusCardDesktop";
import { devicesActions } from "../store";
import usePersistedState from "../common/util/usePersistedState";
import EventsDrawer from "./EventsDrawer";
import useFilter from "./useFilter";
import MainToolbar from "./MainToolbar";
import MainMap from "./MainMap";
import { useAttributePreference } from "../common/util/preferences";
import { useTranslation } from "../common/components/LocalizationProvider";
import { LockOpenOutlined, Person, Settings } from "@mui/icons-material";
import { nativePostMessage } from "../common/components/NativeInterface";
import { useNavigate } from "react-router-dom";

import SettingsIcon from "@mui/icons-material/Settings";
import NewMenu from "../common/components/NewMenu";

import whatsapp from "../resources/images/WhatsApp.svg";


import GestaoPage from "../other/GestaoPage";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  sidebar: {
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      position: "fixed",
      left: 50,
      top: 0,
      height: "100%", // `calc(100% - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      // margin: theme.spacing(1.5),
      zIndex: 3,
    },
    [theme.breakpoints.down("md")]: {
      height: "100%",
      width: "100%",
    },
  },
  header: {
    pointerEvents: "auto",
    zIndex: 6,
  },
  footer: {
    pointerEvents: "auto",
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: "grid",
  },
  contentMap: {
    pointerEvents: "auto",
    gridArea: "1 / 1",
  },
  contentList: {
    pointerEvents: "auto",
    gridArea: "1 / 1",
    zIndex: 4,
  },
}));

const CustomRow = ({ title, button }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        width: "100%",
      }}
    >
      <div>
        <Typography style={{ fontSize: 17 }} color="textPrimary">
          {title}
        </Typography>
      </div>
      <div>{button}</div>
    </div>
  );
};

const MainPage = () => {
  const t = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const mapOnSelect = useAttributePreference("mapOnSelect", true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [component, setComponent] = useState(<DevicesPageCustom />);
  const [drawerPosition, setDrawerPosition] = useState("right");

  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId
  );

  const [anchorElAccount, setAnchorElAccount] = useState(null);

  const handleMenuClose = () => {
    setAnchorElAccount(null); // Clear the anchor element
  };

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = usePersistedState("filter", {
    statuses: [],
    groups: [],
  });
  const [filterSort, setFilterSort] = usePersistedState("filterSort", "");
  const [filterMap, setFilterMap] = usePersistedState("filterMap", false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);

  const [showMainToolbar, setShowMainToolbar] = useState(false);

  const navigate = useNavigate();

  const user = useSelector((state) => state.session.user);
  const server = useSelector((state) => state.session.server);

  const [accountOpen, setAccountOpen] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleAccountMenu = () => {
    console.log("clicado porra");
  };

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  const onAccountClick = useCallback(
    () => handleAccountMenu(),
    [setAccountOpen]
  );

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions
  );

  const handleAccount = () => {
    setAnchorElAccount(null);
    navigate(`/settings/user/${user.id}`);
  };

  const handleSettings = () => {
    setAnchorElAccount(null);
    navigate(`/settings/preferences`);
  };

  const handleReports = () => {
    setAnchorElAccount(null);
    navigate(`/reports/combined`);
  };

  // ----- INÍCIO DA MUDANÇA -----
  // Adiciona a nova função para navegar para a página de gestão
  const handleGestao = () => {
    setAnchorElAccount(null);
    // A rota correta agora é "/settings/gestao"
    navigate('/settings/gestao');
  };
  // ----- FIM DA MUDANÇA -----

  const handleLogout = async () => {
    setAnchorElAccount(null);

    const notificationToken = window.localStorage.getItem("notificationToken");
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem("notificationToken");
      const tokens = user.attributes.notificationTokens?.split(",") || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((it) => it !== notificationToken).join(",")
                : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch("/api/session", { method: "DELETE" });
    nativePostMessage("logout");
    navigate("/login");
    dispatch(sessionActions.updateUser(null));
  };

  const handleMenuOpen = (event) => {
    setAnchorElAccount(event.currentTarget); // Set the anchor element
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    height: "90%",
    bgcolor: "background.paper",
    boxShadow: 24,
    overflow: "scroll",
    borderRadius: 4,

    display: "flex",
  };

  return (
    <div className={classes.root}>
      <NewMenu
        desktop={desktop}
        component={component}
        setComponent={setComponent}
        openModal={openModal}
        setOpenModal={setOpenModal}
        showMainToolbar={showMainToolbar}
        setShowMainToolbar={setShowMainToolbar}
      />

        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
          onAccountClick={onAccountClick}
        />
      <Slide
        direction="right"
        in={showMainToolbar}
        mountOnEnter
        // ⛔ Don't use unmountOnExit
        timeout={{ enter: 180, exit: 180 }}
      >
        <div className={classes.sidebar}>
          <Paper square elevation={0} className={classes.header}>
            <MainToolbar
              filteredDevices={filteredDevices}
              devicesOpen={devicesOpen}
              setDevicesOpen={setDevicesOpen}
              keyword={keyword}
              setKeyword={setKeyword}
              filter={filter}
              setFilter={setFilter}
              filterSort={filterSort}
              setFilterSort={setFilterSort}
              filterMap={filterMap}
              setFilterMap={setFilterMap}
              desktop={desktop}
            />
          </Paper>
          <div className={classes.middle}>
            {!desktop && (
              <div className={classes.contentMap}>
                <MainMap
                  filteredPositions={filteredPositions}
                  selectedPosition={selectedPosition}
                  onEventsClick={onEventsClick}
                  onAccountClick={onAccountClick}
                />
              </div>
            )}
            <Paper
              square
              className={classes.contentList}
              style={devicesOpen ? {} : { visibility: "hidden" }}
            >
              <DeviceList devices={filteredDevices} />
            </Paper>
          </div>
          {desktop === 1000 && (
            <div className={classes.footer}>
              <BottomMenu />
            </div>
          )}
        </div>
      </Slide>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {selectedDeviceId &&
        (desktop ? (
          <StatusCardMobile
            deviceId={selectedDeviceId}
            position={selectedPosition}
            onClose={() => dispatch(devicesActions.selectId(null))}
            desktopPadding={theme.dimensions.drawerWidthDesktop}
            desktop={desktop}
          />
        ) : (
          <StatusCardMobile
            deviceId={selectedDeviceId}
            position={selectedPosition}
            onClose={() => dispatch(devicesActions.selectId(null))}
            desktopPadding={theme.dimensions.drawerWidthDesktop}
            desktop={desktop}
          />
        ))}

      {server.attributes?.whatsapp && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 40,
            right: 2,
            zIndex: 20,
            width: 40,
            height: 40,
            opacity: 0.9,
          }}
        >
          <a
            href={`https://wa.me/${
              JSON.parse(server.attributes?.whatsapp)?.number || ""
            }`}
            target="_blank"
          >
            <img
              style={{
                width: "100%", // Make the image fill the container
                height: "100%",
                objectFit: "cover", // Ensure the image maintains its aspect ratio
              }}
              src={whatsapp}
            />
          </a>
        </div>
      )}

      {/* <IconButton
          onClick={() => {}}
          style={{
            posiiton: "fixed",
            bottom: 100,
            right: 100,
            width: 60,
            height: 60,
            borderColor: "lightgray",
            borderWidth: 0.5,
            borderStyle: "solid",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            zIndex: 10,
            backgroundColor: "red",
          }}
        >
          <LockOpenOutlined color="secondary" style={{ fontSize: 30 }} />
        </IconButton> */}

      <SwipeableDrawer
        anchor={drawerPosition}
        open={settingsOpen}
        style={{
          height: "100%",
          width: "100%",
        }}
        onClose={() => setSettingsOpen(false)}
        onOpen={() => setSettingsOpen(true)}
        disableSwipeToOpen // Optional: disable swipe-to-open for a more controlled animation
        TransitionComponent={Slide} // Add Slide transition
        TransitionProps={{
          direction: drawerPosition === "right" ? "left" : "right", // Slide up on open, down on close
          timeout: { enter: 300, exit: 300 }, // Customize duration in ms
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            padding: 15,
            width: "100%",
            gap: 10,
          }}
        >
          <Typography
            style={{ marginBottom: 10 }}
            variant="h6"
            color="textPrimary"
          >
            Notificações
          </Typography>
          <CustomRow
            title="Ignição Ligada"
            button={<Switch defaultChecked color="secondary" />}
          />

          <CustomRow
            title="Ignição Desligada"
            button={<Switch defaultChecked color="secondary" />}
          />

          <CustomRow
            title="Dispositivo se Movendo"
            button={<Switch defaultChecked color="secondary" />}
          />

          <CustomRow
            title="Entrou na Geocerca"
            button={<Switch color="secondary" />}
          />
          <CustomRow
            title="Saiu da Geocerca"
            button={<Switch defaultChecked color="secondary" />}
          />
          <CustomRow
            title="Dispositivo Online"
            button={<Switch color="secondary" />}
          />

          <CustomRow
            title="Dispositivo Offline"
            button={<Switch defaultChecked color="secondary" />}
          />

          <CustomRow
            title="Status Desconhecido"
            button={<Switch color="secondary" />}
          />
        </div>
      </SwipeableDrawer>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>{component}</Box>
      </Modal>

      <div
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          backgroundColor: "white",
          borderRadius: 50,
          width: 40,
          height: 40,
          bottom: 180,
          right: 10,
          zIndex: 10,
          boxShadow: "2px 3px 5px rgba(0, 0, 0, 0.4)", // Add box shadow
        }}
      >
        <IconButton
          onClick={() => setOpenModal(true)}
          style={{
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
          }}
        >
          T
        </IconButton>
      </div>

      <div
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          backgroundColor: "white",
          borderRadius: 50,
          width: 40,
          height: 40,
          bottom: 90,
          right: 10,
          zIndex: 10,
          boxShadow: "2px 3px 5px rgba(0, 0, 0, 0.4)", // Add box shadow
        }}
      >
        <IconButton
          onClick={() => setSettingsOpen(true)}
          style={{
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
          }}
        >
          <SettingsIcon style={{ fontSize: 30 }} />
        </IconButton>
      </div>

      {!desktop && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            backgroundColor: "white",
            borderRadius: 50,
            width: 33,
            height: 33,
            bottom: 85,
            right: 7,
            zIndex: 10,
            boxShadow: "2px 3px 5px rgba(0, 0, 0, 0.4)", // Add box shadow
          }}
        >
          <BottomNavigationAction
            label={t("settingsUser")}
            icon={<Settings style={{ fontSize: 22 }} />}
            value="account"
            onClick={handleMenuOpen} // Open menu on click
          />

          <Menu
            anchorEl={anchorElAccount}
            open={Boolean(anchorElAccount)} // Open if anchorElAccount is set
            onClose={handleMenuClose} // Close the menu when requested
          >
            <MenuItem
              onClick={() => {
                handleSettings();
                handleMenuClose();
              }}
            >
              <Typography color="textPrimary">{t("settingsTitle")}</Typography>
            </MenuItem>
            
            {/* NOVO ITEM DE MENU PARA A GESTÃO DE FROTAS */}
            <MenuItem
              onClick={() => {
                handleGestao();
                handleMenuClose();
              }}
            >
              <Typography color="textPrimary">Gestão de Frota</Typography>
            </MenuItem>
            
            <MenuItem
              onClick={() => {
                handleReports();
                handleMenuClose();
              }}
            >
              <Typography color="textPrimary">{t("reportTitle")}</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleLogout();
                handleMenuClose();
              }}
            >
              <Typography color="error">{t("loginLogout")}</Typography>
            </MenuItem>
          </Menu>
        </div>
      )}
    </div>
  );
};

export default MainPage;