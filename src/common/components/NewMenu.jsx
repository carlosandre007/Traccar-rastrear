import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import Fade from "@mui/material/Fade";
import MuiAppBar from "@mui/material/AppBar";
import Tooltip from "@mui/material/Tooltip";

import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import Checklist from "@mui/icons-material/Checklist";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Dashboard from "../../main/Dashboard";

import SettingsIcon from "@mui/icons-material/Settings";
import CreateIcon from "@mui/icons-material/Create";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FolderIcon from "@mui/icons-material/Folder";
import PersonIcon from "@mui/icons-material/Person";
import StorageIcon from "@mui/icons-material/Storage";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import TodayIcon from "@mui/icons-material/Today";
import PublishIcon from "@mui/icons-material/Publish";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import HelpIcon from "@mui/icons-material/Help";
import CampaignIcon from "@mui/icons-material/Campaign";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";

import DashboardIcon from "@mui/icons-material/Dashboard";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

import DevicesPageCustom from "../../settings/DevicesPageCustom";
import PreferencesPageCustom from "../../settings/PreferencesPageCustom";
import NotificationPageCustom from "../../settings/NotificationPageCustom";
import UsersPage from "../../settings/UsersPage";
import GeofencesPage from "../../other/GeofencesPage";
import GroupPage from "../../settings/GroupPage";
import DriversPage from "../../settings/DriversPage";
import CalendarsPage from "../../settings/CalendarsPage";
import ComputedAttributesPage from "../../settings/ComputedAttributesPage";
import MaintenancesPage from "../../settings/MaintenancesPage";
import CommandsPage from "../../settings/CommandsPage";
import ServerPage from "../../settings/ServerPage";
import AnnouncementPage from "../../settings/AnnouncementPage";
import LogoutIcon from "@mui/icons-material/Logout";

import { useTranslation } from "./LocalizationProvider";
import {
  useAdministrator,
  useManager,
  useRestriction,
} from "../util/permissions";
import { useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";

import useFeatures from "../util/useFeatures";
import LogoImage from "../../login/LogoImage";
import GestaoPage from "../../other/GestaoPage";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

export default function NewMenu({
  component,
  setComponent,
  openModal,
  setOpenModal,
  desktop,
  setShowMainToolbar,
  showMainToolbar,
}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const t = useTranslation();
  const location = useLocation();

  const readonly = useRestriction("readonly");
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);
  const supportLink = useSelector(
    (state) => state.session.server.attributes.support
  );

  const server = useSelector((state) => state.session.server);

  const features = useFeatures();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const CustomButton = ({
    link = null,
    icon,
    title,
    component,
    setComponent,
    open,
    openModal,
    setOpenModal,
    setShowMainToolbar,
    showMainToolbar,
    handleDrawerClose,
    isExit,
  }) => (
    <ListItem disablePadding sx={{ display: "block", my: 0 }}>
      {/* <Tooltip enterDelay={3} title={title} arrow placement="right"> */}
      <ListItemButton
        component={link ? Link : "button"}
        to={link || undefined}
        onClick={() => {
          if (isExit) {
            fetch("/api/session", {
              method: "DELETE",
            }).then((e) => {
              window.location.href = "/login";
            });

            // alert("ssssss");
            // preventDefault();
            return;
          } else {
            handleDrawerClose();
            if (!link && !component) {
              setShowMainToolbar(!showMainToolbar);
            } else if (!link) {
              setComponent(component);
              setOpenModal(true);
            }
          }
        }}
        sx={[
          {
            minHeight: 48,
            px: 2.5,
          },
          open
            ? {
              justifyContent: "initial",
            }
            : {
              justifyContent: "center",
            },
        ]}
      >
        <ListItemIcon
          sx={[
            {
              minWidth: 0,
              justifyContent: "center",
            },
            open
              ? {
                mr: 3,
              }
              : {
                mr: "auto",
              },
          ]}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={title}
          sx={[
            open
              ? {
                opacity: 1,
              }
              : {
                opacity: 0,
              },
          ]}
        />
      </ListItemButton>
      {/* </Tooltip> */}
    </ListItem>
  );
  return (
    <Box sx={{ display: desktop ? "flex" : "none" }}>
      <CssBaseline />

      <Fade in={open}>
        <div
          onClick={handleDrawerClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 1199,
          }}
        />
      </Fade>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          {open ? (
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogoImage color={"white"} />
              </div>
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                {" "}
                <IconButton onClick={handleDrawerClose}>
                  <ChevronLeftIcon />
                </IconButton>
              </div>
            </div>
          ) : (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              style={{
                marginRight: 4,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </DrawerHeader>
        <Divider />

        <div
          style={{ display: "flex", flexDirection: "column", height: "100%", }}
        >
          <div style={{ flex: 1, overflowY: "hidden" }}>
            <List>
              {desktop && (
                <CustomButton
                  handleDrawerClose={handleDrawerClose}
                  icon={<LocalTaxiIcon />}
                  title="Lista de Veículos"
                  open={open}
                  setComponent={setComponent}
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                  setShowMainToolbar={setShowMainToolbar}
                  showMainToolbar={showMainToolbar}
                />
              )}
              <CustomButton
                handleDrawerClose={handleDrawerClose}
                icon={<Checklist />}
                link="/settings/gestao" 
                title={t("vehicleManagement")}
                component={<GestaoPage />}
                open={open}
                setComponent={setComponent}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
              <CustomButton
                handleDrawerClose={handleDrawerClose}
                icon={<DashboardIcon />}
                title={t("dashboard")}
                component={<Dashboard />}
                open={open}
                setComponent={setComponent}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
              <CustomButton
                handleDrawerClose={handleDrawerClose}
                title={"Relatórios"}
                link="/reports/summary"
                icon={<QueryStatsIcon />}
                component={<Dashboard />}
                open={open}
                setComponent={setComponent}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
              <CustomButton
                handleDrawerClose={handleDrawerClose}
                Link="/settings/preferences"
                icon={<SettingsIcon />}
                title={t("sharedPreferences")}
                component={
                  <PreferencesPageCustom open={open} setOpen={setOpenModal} />
                }
                open={open}
                setComponent={setComponent}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
              <CustomButton
                handleDrawerClose={handleDrawerClose}
                link="/settings/devices"
                icon={<SmartphoneIcon />}
                title={t("deviceTitle")}
                component={<DevicesPageCustom />}
                open={open}
                setComponent={setComponent}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
              {!readonly && (
                <>
                  <CustomButton
                    handleDrawerClose={handleDrawerClose}
                    link="/settings/notifications"
                    icon={<NotificationsIcon />}
                    title={t("sharedNotifications")}
                    component={<NotificationPageCustom />}
                    open={open}
                    setComponent={setComponent}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                  />
                  <CustomButton
                    handleDrawerClose={handleDrawerClose}
                    link="/settings/users"
                    icon={<PersonIcon />}
                    title={t("settingsUser")}
                    component={<UsersPage />}
                    open={open}
                    setComponent={setComponent}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                  />
                  <CustomButton
                    handleDrawerClose={handleDrawerClose}
                    link="/settings/geofences"
                    title={t("sharedGeofences")}
                    icon={<CreateIcon />}
                    component={<GeofencesPage />}
                    open={open}
                    setComponent={setComponent}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                  />
                  {!features.disableGroups && (
                    <CustomButton
                      handleDrawerClose={handleDrawerClose}
                      link="/settings/groups"
                      title={t("settingsGroups")}
                      icon={<FolderIcon />}
                      component={<GroupPage />}
                      open={open}
                      setComponent={setComponent}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                    />
                  )}
                  {!features.disableDrivers && (
                    <CustomButton
                      handleDrawerClose={handleDrawerClose}
                      link="/settings/drivers"
                      title={t("sharedDrivers")}
                      icon={<PersonIcon />}
                      component={<DriversPage />}
                      open={open}
                      setComponent={setComponent}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                    />
                  )}
                  {!features.disableCalendars && (
                    <CustomButton
                      handleDrawerClose={handleDrawerClose}
                      link="/settings/calendars"
                      title={t("sharedCalendars")}
                      icon={<TodayIcon />}
                      component={<CalendarsPage />}
                      open={open}
                      setComponent={setComponent}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                    />
                  )}
                  {!features.disableComputedAttributes && (
                    <CustomButton
                      handleDrawerClose={handleDrawerClose}
                      link="/settings/attributes"
                      title={t("sharedComputedAttributes")}
                      icon={<StorageIcon />}
                      component={<ComputedAttributesPage />}
                      open={open}
                      setComponent={setComponent}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                    />
                  )}
                  {!features.disableMaintenance && (
                    <CustomButton
                      handleDrawerClose={handleDrawerClose}
                      link="/settings/maintenances"
                      title={t("sharedMaintenance")}
                      icon={<BuildIcon />}
                      component={<MaintenancesPage />}
                      open={open}
                      setComponent={setComponent}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                    />
                  )}
                  {!features.disableSavedCommands && (
                    <CustomButton
                      handleDrawerClose={handleDrawerClose}
                      link="/settings/commands"
                      title={t("sharedSavedCommands")}
                      icon={<PublishIcon />}
                      component={<CommandsPage />}
                      open={open}
                      setComponent={setComponent}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                    />
                  )}
                  {supportLink && (
                    <CustomButton
                      handleDrawerClose={handleDrawerClose}
                      link={supportLink}
                      title={t("settingsSupport")}
                      icon={<HelpIcon />}
                      component={<UsersPage />}
                      open={open}
                      setComponent={setComponent}
                      openModal={openModal}
                      setOpenModal={setOpenModal}
                    />
                  )}
                </>
              )}
            </List>
          </div>

          {manager && (
            <div style={{ paddingBottom: 8 }}>
              <Divider />
              <List>
                <CustomButton
                  handleDrawerClose={handleDrawerClose}
                  link="/settings/announcement"
                  title={t("serverAnnouncement")}
                  icon={<CampaignIcon />}
                  component={<AnnouncementPage />}
                  open={open}
                  setComponent={setComponent}
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                />
                {admin && (
                  <CustomButton
                    handleDrawerClose={handleDrawerClose}
                    link="/settings/server"
                    title={t("settingsServer")}
                    icon={<StorageIcon />}
                    component={<ServerPage />}
                    open={open}
                    setComponent={setComponent}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                  />
                )}
                <CustomButton
                  handleDrawerClose={handleDrawerClose}
                  link="/settings/users"
                  title={t("settingsUsers")}
                  icon={<PeopleIcon />}
                  component={<UsersPage />}
                  open={open}
                  setComponent={setComponent}
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                />
              </List>
            </div>
          )}

          <div style={{ paddingBottom: 8 }}>
            <List>
              <CustomButton
                handleDrawerClose={handleDrawerClose}
                isExit={true}
                VAI_TOMAR_NO_CU_link="/login"
                title={t("loginLogout")}
                icon={<LogoutIcon />}
                component={<UsersPage />}
                open={open}
                setComponent={setComponent}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
            </List>
          </div>
        </div>
      </Drawer>
    </Box>
  );
}
