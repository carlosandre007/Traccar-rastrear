import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import StarIcon from "@mui/icons-material/Star";
import TimelineIcon from "@mui/icons-material/Timeline";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import RouteIcon from "@mui/icons-material/Route";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import NotesIcon from "@mui/icons-material/Notes";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EditNoteIcon from "@mui/icons-material/PlayCircleOutline";

import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  SwipeableDrawer,
  Button,
  BottomNavigationAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import ReplayIcon from "@mui/icons-material/Replay";
import PublishIcon from "@mui/icons-material/Publish";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PendingIcon from "@mui/icons-material/Pending";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { useTranslation } from "./LocalizationProvider";
import RemoveDialog from "./RemoveDialog";
import PositionValue from "./PositionValue";
import { useDeviceReadonly } from "../util/permissions";
import usePositionAttributes from "../attributes/usePositionAttributes";
import { devicesActions } from "../../store";
import { useCatch, useCatchCallback } from "../../reactHelper";
import { useAttributePreference } from "../util/preferences";
import {
  LockOpenOutlined,
  LockOutlined,
  Refresh,
  Share,
  Star,
} from "@mui/icons-material";

import sem_foto from "../../resources/images/sem_foto.png";
import ConfirmCommand from "./ConfirmCommand";

const StatusCardMobile = ({
  deviceId,
  position,
  onClose,
  disableActions,
  desktopPadding = 0,
  desktop,
}) => {
  const useStyles = makeStyles((theme) => ({
    card: {
      pointerEvents: "auto",
      height: desktop ? "100vh" : "50vh",
      maxWidth: desktop ? "415px" : "100%",
      minWidth: "415px",
      width: desktop ? "auto" : "100%",
    },
    media: {
      height: theme.dimensions.popupImageHeight,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start",
    },
    mediaButton: {
      color: theme.palette.primary.contrastText,
      mixBlendMode: "difference",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing(1, 1, 0, 2),
    },
    content: {
      paddingTop: theme.spacing(1),
      // paddingBottom: theme.spacing(1),
      // maxHeight: theme.dimensions.cardContentMaxHeight,
      height: desktop ? "100vh" : "40vh",
      minHeight: desktop ? "100vh" : "40vh",
      overflowY: "scroll",
      overflow: "scroll",
      // marginBottom: 60,
    },
    icon: {
      width: "25px",
      height: "25px",
      filter: "brightness(0) invert(1)",
    },
    table: {
      "& .MuiTableCell-sizeSmall": {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    cell: {
      borderBottom: "none",
    },
    actions: {
      justifyContent: "space-between",
    },
    root: ({ desktopPadding }) => ({
      pointerEvents: "none",
      position: "fixed",
      zIndex: 5,
      left: "50%",
      [theme.breakpoints.up("md")]: {
        left: `calc(50% + ${desktopPadding} / 2)`,
        bottom: theme.spacing(3),
      },
      [theme.breakpoints.down("md")]: {
        left: "50%",
        bottom: `calc(${theme.spacing(3)} + ${
          theme.dimensions.bottomBarHeight
        }px)`,
      },
      transform: "translateX(-50%)",
    }),
  }));

  const CustomButton = ({
    translation,
    icon,
    disableActions,
    position,
    link,
  }) => {
    const t = useTranslation();

    return (
      <Link
        to={link}
        style={{
          textDecoration: "none", // Remove default link styles
          display: "inline-block", // Ensure it behaves like a container for styling
          color: "gray",
        }}
      >
        <div
          onClick={() => {}}
          style={{
            width: 90,
            height: 90,
            flexDirection: "column",
            borderColor: "lightgray",
            borderWidth: 0.5,
            borderStyle: "solid",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            fontSize: 14,
            gap: 5,
            pointerEvents: disableActions || !position ? "none" : "auto", // Disable clicks when needed
            opacity: disableActions || !position ? 0.5 : 1, // Visual feedback for disabled state
          }}
        >
          {icon}
          {t(translation)}
        </div>
      </Link>
    );
  };

  const StatusRow = ({ name, content }) => {
    const classes = useStyles();

    return (
      <TableRow>
        <TableCell className={classes.cell} sx={{ width: "20%" }}>
          <Typography variant="body2">{name}</Typography>
        </TableCell>
        <TableCell className={classes.cell} sx={{ width: "80%" }}>
          <Typography variant="body2" color="textSecondary">
            {content}
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
  });

  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector(
    (state) => state.session.server.attributes.disableShare
  );
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    "positionItems",
    "fixTime,address,speed,totalDistance"
  );

  const navigationAppLink = useAttributePreference("navigationAppLink");
  const navigationAppTitle = useAttributePreference("navigationAppTitle");

  const [anchorEl, setAnchorEl] = useState(null);

  const usePersistedDrawerPosition = (
    key = "drawerPosition",
    defaultValue = "left"
  ) => {
    const [position, setPosition] = useState(() => {
      const saved = localStorage.getItem(key);
      return saved ?? defaultValue;
    });

    useEffect(() => {
      localStorage.setItem(key, position);
    }, [key, position]);

    return [position, setPosition];
  };

  // const [drawerPosition, setDrawerPosition] = useState("left");
  const [drawerPosition, setDrawerPosition] = usePersistedDrawerPosition();

  const [removing, setRemoving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [command, setCommand] = React.useState(null);
  const [cameras, setCameras] = useState([]);

  // const [drawerVisible, setDrawerVisible] = useState(false); // Delayed visibility

  useEffect(() => {
    if (device) {
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
    }

    if (typeof device?.attributes?.dvr !== "undefined") {
      const cameras = JSON.parse(device?.attributes?.dvr);
      setCameras(cameras);
      console.log("tem o caralho do DVR");
    } else {
      setCameras([]);
    }
  }, [device]);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch("/api/devices");
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  const handleCommands = (type, deviceId) => {
    setCommand({ type, deviceId });
    setOpenConfirm(true);
  };

  const sendCommand = async (type, deviceId) => {
    const endpoint = "/api/commands/send";

    let finalType = type;
    let command = null;

    try {
      const commands = JSON.parse(device?.attributes?.customCommands);
      finalType = "custom";
      command = commands[type];
    } catch (error) {}

    const payload = {
      type: finalType,
      attributes: command ? { data: command } : {},
      deviceId: deviceId,
    };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Command sent successfully:", data);
    } catch (error) {
      console.error("Error sending command:", error.message);
    }
    setOpenConfirm(false);
  };

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t("sharedGeofence"),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch("/api/geofences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: position.deviceId,
          geofenceId: item.id,
        }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);

  /*   useEffect(() => {
    if (drawerOpen) {
      const timer = setTimeout(() => {
        setDrawerOpen(true); // Show content after delay
      }, 5000); // Delay in milliseconds
      return () => clearTimeout(timer); // Cleanup timer
    } else {
      setDrawerOpen(false); // Hide content immediately
    }
  }, [drawerOpen]); */

  const resolveDatetime = (utcDatetime) => {
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const localDatetime = new Date(utcDatetime).toLocaleString("pt-BR", {
      timeZone: localTimezone,
    });

    /*     console.log("Fuso horário do navegador:", localTimezone);
    console.log("Data e hora local:", localDatetime); */

    return localDatetime;
  };

  return (
    <>
      {/*       <SwipeableDrawer
        anchor={desktop ? "right" : "bottom"}
        open={reportsMenuOpen}
        style={{
          height: "100%",
          width: "100%",
        }}
        onClose={() => setReportsMenuOpen(false)}
        onOpen={() => setReportsMenuOpen(true)}
        disableSwipeToOpen // Optional: disable swipe-to-open for a more controlled animation
        TransitionComponent={Slide} // Add Slide transition
        TransitionProps={{
          direction: "up", // Slide up on open, down on close
          timeout: { enter: 300, exit: 300 }, // Customize duration in ms
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            flexWrap: "wrap",
            padding: 20,
            gap: 10,
          }}
        >
          <CustomButton
            link="/reports/combined"
            icon={<Star style={{ fontSize: 30, color: "gray" }} />}
            translation="reportCombined"
            position={position}
            disableActions={disableActions}
          />

          <CustomButton
            link="/reports/route"
            icon={<TimelineIcon style={{ fontSize: 30, color: "gray" }} />}
            translation="reportRoute"
            position={position}
            disableActions={disableActions}
          />

          <CustomButton
            link="/reports/event"
            icon={
              <NotificationsActiveIcon
                style={{ fontSize: 30, color: "gray" }}
              />
            }
            translation="reportEvents"
            position={position}
            disableActions={disableActions}
          />

          <CustomButton
            link="/reports/trip"
            icon={
              <PlayCircleFilledIcon style={{ fontSize: 30, color: "gray" }} />
            }
            translation="reportTrips"
            position={position}
            disableActions={disableActions}
          />

          <CustomButton
            link="/reports/stop"
            icon={
              <PauseCircleFilledIcon style={{ fontSize: 30, color: "gray" }} />
            }
            translation="reportStops"
            position={position}
            disableActions={disableActions}
          />

          <CustomButton
            link="/reports/summary"
            icon={
              <FormatListBulletedIcon style={{ fontSize: 30, color: "gray" }} />
            }
            translation="reportSummary"
            position={position}
            disableActions={disableActions}
          />

          <CustomButton
            link="/reports/chart"
            icon={<TrendingUpIcon style={{ fontSize: 30, color: "gray" }} />}
            translation="reportChart"
            position={position}
            disableActions={disableActions}
          />

          <CustomButton
            link="/replay"
            icon={<RouteIcon style={{ fontSize: 30, color: "gray" }} />}
            translation="reportReplay"
            position={position}
            disableActions={disableActions}
          />
        </div>
      </SwipeableDrawer> */}

      <SwipeableDrawer
        PaperProps={{
          sx: {
            minHeight: "50vh", // O Drawer terá no mínimo 50% da altura da tela
            maxHeight: "100vh", // Impede que ele ultrapasse a tela inteira
            overflowY: "scroll",
            overflowX: "hidden",
            // overflow: "scroll",
          },
        }}
        anchor={desktop ? drawerPosition : "bottom"}
        open={drawerOpen}
        variant="persistent"
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        disableSwipeToOpen
        TransitionComponent={Slide}
        TransitionProps={{
          direction: drawerPosition === "right" ? "left" : "right",
          timeout: { enter: 200, exit: 200 },
        }}
      >
        <Box
          sx={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 2px)", // Ajuste para evitar ultrapassar a tela
            overflowX: "hidden",
          }}
        >
          {device && (
            <Card elevation={3} className={classes.card}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30%",
                  }}
                >
                  {deviceImage ? (
                    <div
                      style={{
                        width: 100,
                        height: 100, // Ensure the height matches the width for a perfect circle
                        borderRadius: 50,
                        borderColor: "lightgray",
                        borderWidth: 3,
                        borderStyle: "solid",
                        overflow: "hidden", // Ensure the image is clipped to the border radius
                        display: "flex",
                        justifyContent: "center", // Center the image horizontally
                        alignItems: "center", // Center the image vertically
                      }}
                    >
                      <img
                        style={{
                          width: "100%", // Make the image fill the container
                          height: "100%",
                          objectFit: "cover", // Ensure the image maintains its aspect ratio
                        }}
                        src={`/api/media/${device.uniqueId}/${deviceImage}`}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 100,
                        height: 100, // Ensure the height matches the width for a perfect circle
                        borderRadius: 50,
                        borderColor: "lightgray",
                        borderWidth: 3,
                        borderStyle: "solid",
                        overflow: "hidden", // Ensure the image is clipped to the border radius
                        display: "flex",
                        justifyContent: "center", // Center the image horizontally
                        alignItems: "center", // Center the image vertically
                      }}
                    >
                      <img
                        style={{
                          width: "100%", // Make the image fill the container
                          height: "100%",
                          objectFit: "cover", // Ensure the image maintains its aspect ratio
                        }}
                        src={sem_foto}
                      />
                    </div>
                  )}
                </div>
                <div
                  style={{
                    width: "70%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  <Typography variant="body1" color="textPrimary">
                    {device?.name || ""}
                  </Typography>{" "}
                  <Typography variant="body2" color="textSecondary">
                    {position?.address || ""}
                  </Typography>{" "}
                  <Typography variant="body2" color="textSecondary">
                    {device?.lastUpdate
                      ? resolveDatetime(device?.lastUpdate)
                      : "Sem dados"}
                  </Typography>{" "}
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <IconButton
                  onClick={() => handleCommands("engineResume", deviceId)}
                  disabled={disableActions || !position}
                  style={{
                    width: 60,
                    height: 60,
                    borderColor: "lightgray",
                    borderWidth: 0.5,
                    borderStyle: "solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                  }}
                >
                  <LockOpenOutlined
                    color="secondary"
                    style={{ fontSize: 30 }}
                  />
                </IconButton>

                <IconButton
                  onClick={() => handleCommands("engineStop", deviceId)}
                  disabled={disableActions || !position}
                  style={{
                    width: 60,
                    height: 60,
                    borderColor: "lightgray",
                    borderWidth: 0.5,
                    borderStyle: "solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                  }}
                >
                  <LockOutlined color="error" style={{ fontSize: 30 }} />
                </IconButton>
                <ConfirmCommand
                  openConfirm={openConfirm}
                  setOpenConfirm={setOpenConfirm}
                  sendCommand={sendCommand}
                  setCommand={setCommand}
                  command={command}
                  actions={
                    <>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setOpenConfirm(false)}
                      >
                        Não
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() =>
                          sendCommand(command.type, command.deviceId)
                        }
                      >
                        Sim
                      </Button>
                    </>
                  }
                />

                <IconButton
                  onClick={() =>
                    navigate(`/settings/device/${deviceId}/command`)
                  }
                  disabled={disableActions}
                  style={{
                    width: 60,
                    height: 60,
                    borderColor: "lightgray",
                    borderWidth: 0.5,
                    borderStyle: "solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                  }}
                >
                  <PublishIcon style={{ fontSize: 30 }} />
                </IconButton>

                {/*                   <IconButton
                    onClick={() => navigate("/replay")}
                    disabled={disableActions || !position}
                    style={{
                      width: 60,
                      height: 60,
                      borderColor: "lightgray",
                      borderWidth: 0.5,
                      borderStyle: "solid",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                    }}
                  >
                    <ReplayIcon style={{ fontSize: 30 }} />
                  </IconButton> */}

                <IconButton
                  onClick={() => navigate(`/settings/device/${deviceId}/share`)}
                  disabled={shareDisabled && user.temporary}
                  style={{
                    width: 60,
                    height: 60,
                    borderColor: "lightgray",
                    borderWidth: 0.5,
                    borderStyle: "solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                  }}
                >
                  <Share style={{ fontSize: 30 }} />
                </IconButton>

                <IconButton
                  onClick={() => navigate(`/replay`)}
                  disabled={disableActions || !position}
                  style={{
                    width: 60,
                    height: 60,
                    borderColor: "lightgray",
                    borderWidth: 0.5,
                    borderStyle: "solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                  }}
                >
                  <Refresh style={{ fontSize: 30 }} />
                </IconButton>

                <IconButton
                  color="secondary"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  disabled={!position}
                  style={{
                    width: 60,
                    height: 60,
                    borderColor: "lightgray",
                    borderWidth: 1,
                    borderStyle: "solid",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                  }}
                >
                  <PendingIcon />
                </IconButton>
              </div>

              {position && (
                <CardContent className={classes.content}>
                  {cameras.length > 0 && (
                    <Accordion
                      elevation={0}
                      disableGutters
                      sx={{
                        margin: 0,
                        width: "100%",
                        marginBottom: "20px",
                        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)", // very soft shadow
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ fontSize: 17 }} />}
                        sx={{
                          minHeight: "30px",
                          paddingY: 0,
                          paddingX: 1,
                          "& .MuiAccordionSummary-content": {
                            marginY: "4px",
                          },
                        }}
                      >
                        <Typography variant="body2">
                          Câmeras&nbsp;
                          <sup>
                            <i>Beta</i>
                          </sup>
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ padding: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            margin: "10px",
                          }}
                        >
                          {cameras.map((camera, index) => (
                            <div
                              style={{
                                margin: "3px",
                                height: "120px",
                                width: "45%",
                                display: "flex",
                                flexDirection: "column",

                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "black",
                                color: "white",
                                borderRadius: "15px",
                                fontSize: "13px",
                                gap: "5px",
                              }}
                            >
                              {camera.name}
                              <IconButton
                                size="small"
                                onClick={() => {}}
                                onTouchStart={() => {}}
                              >
                                <PlayCircleOutlineIcon
                                  sx={{ color: "white", fontSize: 32 }}
                                  fontSize="medium"
                                />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      {positionItems
                        .split(",")
                        .filter(
                          (key) =>
                            position.hasOwnProperty(key) ||
                            position.attributes.hasOwnProperty(key)
                        )
                        .map((key) => {
                          if (key === "address") return;
                          return (
                            <StatusRow
                              key={key}
                              name={positionAttributes[key]?.name || key}
                              content={
                                <PositionValue
                                  position={position}
                                  property={
                                    position.hasOwnProperty(key) ? key : null
                                  }
                                  attribute={
                                    position.hasOwnProperty(key) ? null : key
                                  }
                                />
                              }
                            />
                          );
                        })}
                    </TableBody>
                  </Table>
                  <div
                    style={{ height: 100, minHeight: 100, marginTop: 100 }}
                  />
                </CardContent>
              )}
            </Card>
          )}
          {position && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => navigate(`/position/${position.id}`)}>
                <Typography color="secondary">
                  {t("sharedShowDetails")}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleGeofence}>
                {t("sharedCreateGeofence")}
              </MenuItem>
              <MenuItem
                component="a"
                target="_blank"
                href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
              >
                {t("linkGoogleMaps")}
              </MenuItem>
              <MenuItem
                component="a"
                target="_blank"
                href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
              >
                {t("linkAppleMaps")}
              </MenuItem>
              <MenuItem
                component="a"
                target="_blank"
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
              >
                {t("linkStreetView")}
              </MenuItem>
              {navigationAppTitle && (
                <MenuItem
                  component="a"
                  target="_blank"
                  href={navigationAppLink
                    .replace("{latitude}", position.latitude)
                    .replace("{longitude}", position.longitude)}
                >
                  {navigationAppTitle}
                </MenuItem>
              )}
              {!shareDisabled && !user.temporary && (
                <MenuItem
                  onClick={() => navigate(`/settings/device/${deviceId}/share`)}
                >
                  {t("deviceShare")}
                </MenuItem>
              )}
            </Menu>
          )}
          <RemoveDialog
            open={removing}
            endpoint="devices"
            itemId={deviceId}
            onResult={(removed) => handleRemove(removed)}
          />
        </Box>

        {desktop && (
          <div
            style={{
              display: "flex",
              position: "relative",
              margin: 0,
              bottom: 0,
              right: 0,
              left: 0,
              justifyContent:
                drawerPosition === "right" ? "flex-start" : "flex-end",
              padding: 8,
            }}
          >
            <IconButton
              onClick={() => {
                setDrawerOpen(false);

                setTimeout(() => {
                  setDrawerPosition(
                    drawerPosition === "right" ? "left" : "right"
                  );
                  setDrawerOpen(true);
                }, 300);
              }}
              disabled={disableActions || !position}
              style={{
                width: 35,
                height: 35,
                borderColor: "lightgray",
                borderWidth: 0.5,
                borderStyle: "solid",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
              }}
            >
              <SyncAltIcon color="lightgray" style={{ fontSize: 30 }} />
            </IconButton>
          </div>
        )}
      </SwipeableDrawer>
    </>
  );
};

export default StatusCardMobile;
