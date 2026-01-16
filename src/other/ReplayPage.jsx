/*import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IconButton,
  Paper,
  Slider,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TuneIcon from "@mui/icons-material/Tune";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import MapRoutePoints from "../map/MapRoutePoints";
import MapPositions from "../map/MapPositions";
import { formatTime } from "../common/util/formatter";
import ReportFilter from "../reports/components/ReportFilter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { useCatch } from "../reactHelper";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import MapScale from "../map/MapScale";
import StatusCardDesktop from "../common/components/StatusCardDesktop";
import StatusCardMobile from "../common/components/StatusCardMobile";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    zIndex: 3,
    left: 0,
    top: 0,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
  },
  slider: {
    width: "100%",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formControlLabel: {
    height: "100%",
    width: "100%",
    paddingRight: theme.spacing(1),
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.up("md")]: {
      marginTop: theme.spacing(1),
    },
  },
}));

const ReplayPage = () => {
  const t = useTranslation();
  const classes = useStyles();
  const navigate = useNavigate();
  const timerRef = useRef();

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const [showCard, setShowCard] = useState(false);
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(false);

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });


  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((prevIndex) => {
          if (prevIndex < positions.length - 1) {
            return prevIndex + 1;
          } else {
            clearInterval(timerRef.current);
            setPlaying(false);
            return prevIndex;
          }
        });
      }, 5000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions.length]);

  useEffect(() => {
    if (index >= positions.length - 1) {
      clearInterval(timerRef.current);
      setPlaying(false);
    }
  }, [index, positions]);

  const onPointClick = useCallback(
    (_, index) => {
      setIndex(index);
    },
    [setIndex]
  );

  const onMarkerClick = useCallback(
    (positionId) => {
      setShowCard(!!positionId);
    },
    [setShowCard]
  );

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    setSelectedDeviceId(deviceId);
    setFrom(from);
    setTo(to);
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/positions?${query.toString()}`);
    if (response.ok) {
      setIndex(0);
      const positions = await response.json();
      setPositions(positions);
      if (positions.length) {
        setExpanded(false);
      } else {
        throw Error(t("sharedNoData"));
      }
    } else {
      throw Error(await response.text());
    }
  });

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div className={classes.root}>
      <MapView>
        <MapGeofence />
        <MapRoutePath positions={positions} />
        <MapRoutePoints positions={positions} onClick={onPointClick} />
        {index < positions.length && (
          <MapPositions
            positions={[positions[index]]}
            onClick={onMarkerClick}
            titleField="fixTime"
          />
        )}
      </MapView>
      <MapScale />
      <MapCamera positions={positions} />
      <div className={classes.sidebar}>
        <Paper elevation={3} square>
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {t("reportReplay")}
            </Typography>
            {!expanded && (
              <>
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => setExpanded(true)}>
                  <TuneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Paper>
        <Paper className={classes.content} square>
          {!expanded ? (
            <>
              <Typography variant="subtitle1" align="center">
                {deviceName}
              </Typography>
              <Slider
                className={classes.slider}
                max={positions.length - 1}
                step={null}
                marks={positions.map((_, index) => ({ value: index }))}
                value={index}
                onChange={(_, index) => setIndex(index)}
              />
              <div className={classes.controls}>
                {`${index + 1}/${positions.length}`}
                <IconButton
                  onClick={() => setIndex((index) => index - 1)}
                  disabled={playing || index <= 0}
                >
                  <FastRewindIcon />
                </IconButton>
                <IconButton
                  onClick={() => setPlaying(!playing)}
                  disabled={index >= positions.length - 1}
                >
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton
                  onClick={() => setIndex((index) => index + 1)}
                  disabled={playing || index >= positions.length - 1}
                >
                  <FastForwardIcon />
                </IconButton>
                {formatTime(positions[index].fixTime, "seconds")}
              </div>
            </>
          ) : (
            <ReportFilter handleSubmit={handleSubmit} fullScreen showOnly />
          )}
        </Paper>
      </div>
      {showCard &&
        index < positions.length &&
        (desktop ? (
          <StatusCardDesktop
            deviceId={selectedDeviceId}
            position={positions[index]}
            onClose={() => setShowCard(false)}
            disableActions
          />
        ) : (
          <StatusCardMobile
            deviceId={selectedDeviceId}
            position={positions[index]}
            onClose={() => setShowCard(false)}
            disableActions
          />
        ))}
    </div>
  );
};

export default ReplayPage;
*/
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IconButton,
  Paper,
  Slider,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TuneIcon from "@mui/icons-material/Tune";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import MapRoutePoints from "../map/MapRoutePoints";
import MapPositions from "../map/MapPositions";
import { formatTime } from "../common/util/formatter";
import ReportFilter from "../reports/components/ReportFilter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { useCatch } from "../reactHelper";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import MapScale from "../map/MapScale";
import StatusCardDesktop from "../common/components/StatusCardDesktop";
import StatusCardMobile from "../common/components/StatusCardMobile";

// Constante para a velocidade base da reprodução em milissegundos
const BASE_INTERVAL = 4000; // 4 segundos na velocidade 1x

const ReplayPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const timerRef = useRef();

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // NOVO: Estado para controlar a velocidade da reprodução
  const [speed, setSpeed] = useState(1);

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      return state.devices.items[selectedDeviceId]?.name;
    }
    return null;
  });

  
  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((prevIndex) => {
          if (prevIndex < positions.length - 1) {
            return prevIndex + 1;
          }
          // Para a reprodução ao chegar no final
          clearInterval(timerRef.current);
          setPlaying(false);
          return prevIndex;
        });
      }, BASE_INTERVAL / speed); // O intervalo é dividido pela velocidade
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions.length, speed]); // Adicionado 'speed' às dependências

  useEffect(() => {
    if (index >= positions.length - 1) {
      clearInterval(timerRef.current);
      setPlaying(false);
    }
  }, [index, positions.length]);

  const onPointClick = useCallback((_, pointIndex) => setIndex(pointIndex), [setIndex]);
  const onMarkerClick = useCallback(() => setShowCard(true), []);

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    setSelectedDeviceId(deviceId);
    setFrom(from);
    setTo(to);
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/positions?${query.toString()}`);
    if (response.ok) {
      setIndex(0);
      const positions = await response.json();
      setPositions(positions);
      if (positions.length) {
        setExpanded(false);
      } else {
        throw Error(t("sharedNoData"));
      }
    } else {
      throw Error(await response.text());
    }
  });

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  const currentPosition = positions.length > 0 ? positions[index] : null;

  return (
    <Box sx={{ height: "100%" }}>
      <MapView>
        <MapGeofence />
        <MapRoutePath positions={positions} />
        <MapRoutePoints positions={positions} onClick={onPointClick} />
        {currentPosition && (
          <MapPositions
            positions={[currentPosition]}
            onClick={onMarkerClick}
            titleField="fixTime"
          />
        )}
      </MapView>
      <MapScale />
      <MapCamera positions={positions} />
      <Box sx={{
        display: "flex", flexDirection: "column", position: "fixed", zIndex: 3,
        left: 0, top: 0, margin: { md: 1.5, xs: 0 }, width: { md: theme.dimensions.drawerWidthDesktop, xs: '100%' }
      }}>
        <Paper elevation={3} square>
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>{t("reportReplay")}</Typography>
            {!expanded && (
              <>
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => setExpanded(true)}>
                  <TuneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Paper>
        <Paper sx={{ p: 2, m: { xs: 1, md: 0 }, mt: { md: 1 } }} square>
          {!expanded ? (
            <>
              <Typography variant="subtitle1" align="center">{deviceName}</Typography>
              <Slider
                max={positions.length - 1}
                value={index}
                onChange={(_, newIndex) => setIndex(newIndex)}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Typography variant="body2">{`${index + 1}/${positions.length}`}</Typography>
                <IconButton onClick={() => setIndex((i) => i - 1)} disabled={playing || index <= 0}>
                  <FastRewindIcon />
                </IconButton>
                <IconButton onClick={() => setPlaying(!playing)} disabled={index >= positions.length - 1}>
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={() => setIndex((i) => i + 1)} disabled={playing || index >= positions.length - 1}>
                  <FastForwardIcon />
                </IconButton>
                <Typography variant="body2">{currentPosition ? formatTime(currentPosition.fixTime, "seconds") : ""}</Typography>
              </Box>
              
              {/* NOVO: Controle para selecionar a velocidade */}
              <FormControl size="small" fullWidth sx={{ mt: 2 }}>
                <InputLabel>{t('reportSpeed')}</InputLabel>
                <Select
                  value={speed}
                  label={t('reportSpeed')}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  <MenuItem value={1}>1x</MenuItem>
                  <MenuItem value={2}>2x</MenuItem>
                  <MenuItem value={5}>5x</MenuItem>
                  <MenuItem value={10}>10x</MenuItem>
                  <MenuItem value={15}>15x</MenuItem>
                </Select>
              </FormControl>
            </>
          ) : (
            <ReportFilter handleSubmit={handleSubmit} fullScreen showOnly />
          )}
        </Paper>
      </Box>
      {showCard && currentPosition && (
        desktop ? (
          <StatusCardDesktop
            deviceId={selectedDeviceId}
            position={currentPosition}
            onClose={() => setShowCard(false)}
            disableActions
          />
        ) : (
          <StatusCardMobile
            deviceId={selectedDeviceId}
            position={currentPosition}
            onClose={() => setShowCard(false)}
            disableActions
          />
        )
      )}
    </Box>
  );
};

export default ReplayPage;