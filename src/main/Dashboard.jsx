import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Modal from "@mui/material/Modal";

import dayjs from "dayjs";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from "@mui/material";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import BarChartComponent from "../common/components/BarChartComponent";
import DoughnutChartComponent from "../common/components/DoughnutChartComponent";
import LineChartComponent from "../common/components/LineChartComponent";
import PieChartComponent from "../common/components/PieChartComponent";
import PolarAreaChartComponent from "../common/components/PolarAreaChartComponent";
import EditNoteIcon from "@mui/icons-material/EditNote";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import {
  CloudDone,
  CloudUpload,
  DirectionsCar,
  Groups2,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const StatisticsCard = ({ title, num, icon }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        gap: 30,
        margin: 20,
      }}
    >
      <div>{icon}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
      >
        <Typography variant="h5" style={{ fontSize: 17, color: "gray" }}>
          {title}
        </Typography>
        <Typography variant="h3" style={{ fontSize: 40 }}>
          {num}
        </Typography>
      </div>
    </div>
  );
};

const eventLabels = {
  eventDeviceOnline: "Status online",
  eventDeviceUnknown: "Status desconhecido",
  eventDeviceOffline: "Status offline",
  eventDeviceInactive: "Dispositivo inativo",
  eventQueuedCommandSent: "Comando na fila enviado",
  eventDeviceMoving: "Dispositivo movendo",
  eventDeviceStopped: "Dispositivo parado",
  eventDeviceOverspeed: "Excedido o limite de velocidade",
  eventDeviceFuelDrop: "Queda de combustível",
  eventDeviceFuelIncrease: "Acréscimo de combustível",
  eventCommandResult: "Resultado do comando",
  eventGeofenceEnter: "Entrada na cerca virtual",
  eventGeofenceExit: "Saída da cerca virtual",
  eventAlarm: "Alarme",
  eventIgnitionOn: "Ignição ligada",
  eventIgnitionOff: "Ignição desligada",
  eventMaintenance: "Manutenção necessária",
  eventTextMessage: "Mensagem de texto recebida",
  eventDriverChanged: "Condutor alterado",
  eventMedia: "Media",
  eventsScrollToLast: "Rolar para o último",
  eventsSoundEvents: "Som de eventos",
  eventsSoundAlarms: "Som de alarmes",
  alarmGeneral: "Geral",
  alarmSos: "SOS",
  alarmVibration: "Vibrando",
  alarmMovement: "Movendo",
  alarmLowspeed: "Velocidade baixa",
  alarmOverspeed: "Alta velocidade",
  alarmFallDown: "Cair",
  alarmLowPower: "Carga Baixa",
  alarmLowBattery: "Bateria baixa",
  alarmFault: "Falha",
  alarmPowerOff: "Alimentação desligada",
  alarmPowerOn: "Alimentação ligada",
  alarmDoor: "Porta",
  alarmLock: "Bloqueado",
  alarmUnlock: "Desbloqueado",
  alarmGeofence: "Cerca virtual",
  alarmGeofenceEnter: "Entrando na cerca virtual",
  alarmGeofenceExit: "Saiu da Cerca virtual",
  alarmGpsAntennaCut: "Antena de GPS cortada",
  alarmAccident: "Acidente",
  alarmTow: "Rebocar",
  alarmIdle: "Ocioso",
  alarmHighRpm: "Alta Rotação",
  alarmHardAcceleration: "Aceleração brusca",
  alarmHardBraking: "Frenagem brusca",
  alarmHardCornering: "Curva Acentuada",
  alarmLaneChange: "Mudança de Faixa",
  alarmFatigueDriving: "Condutor Cansado",
  alarmPowerCut: "Alimentação cortada",
  alarmPowerRestored: "Alimentação restaurada",
  alarmJamming: "Interferência",
  alarmTemperature: "Temperatura",
  alarmParking: "Estacionamento",
  alarmBonnet: "Capô",
  alarmFootBrake: "Freio de mão",
  alarmFuelLeak: "Vazamento de combustível",
  alarmTampering: "Manipulando",
  alarmRemoving: "Removendo",
};

const getEventLabel = (rawKey) => {
  if (!rawKey) return "-";

  // Busca exata primeiro
  if (eventLabels[rawKey]) {
    return eventLabels[rawKey];
  }

  // Busca parcial: encontra a primeira chave que termina com o rawKey
  const matchKey = Object.keys(eventLabels).find((key) =>
    key.toLowerCase().endsWith(rawKey.toLowerCase())
  );

  return matchKey ? eventLabels[matchKey] : rawKey;
};

const EventTable = ({
  events,
  devices,
  openModal,
  setOpenModal,
  selectedDevice,
  setSelectedDevice,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: 250,
        width: "100%",
        overflow: "auto",
        position: "relative",
      }}
    >
      <Table stickyHeader aria-label="event table">
        <TableHead>
          <TableRow>
            <TableCell>Objeto</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Alarme</TableCell>
            <TableCell>Data</TableCell>
            {/* <TableCell>Opções</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} hover>
              <TableCell>{devices[event.deviceId].name}</TableCell>
              <TableCell>{getEventLabel(event.type)}</TableCell>
              <TableCell>
                {getEventLabel(event.attributes?.alarm) || "-"}
              </TableCell>
              <TableCell>
                {new Date(event.eventTime).toLocaleString()}
              </TableCell>
              {/* <TableCell>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedDevice(devices[event.deviceId]);
                    setOpenModal(true);
                  }}
                  onTouchStart={() => {
                    setOpenModal(true);
                  }}
                >
                  <EditNoteIcon fontSize="medium" />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => {}}
                  onTouchStart={() => {}}
                >
                  <LocationSearchingIcon fontSize="medium" />
                </IconButton>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const Dashboard = () => {
  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);
  const events = useSelector((state) => state.events.items);

  const [totals, setTotals] = useState(null);
  const [ignitionMotion, setIgnitionMotion] = useState(null);
  const [protocols, setProtocols] = useState({});
  const [lastReportTimes, setLastReportTimes] = useState({});
  const [users, setUsers] = useState({});
  const [statistics, setStatistics] = useState({});
  const [speedCounts, setSpeedCounts] = useState({});
  const [allEvents, setAllEvents] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const styles = {
    chartHolder: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      width: "100%",
      justifyContent: "space-between",
    },
    chartTile: {
      flex: "1 1 calc(25% - 20px)",
      minWidth: 250,
      backgroundColor: "#fff",
      borderRadius: 8,
      padding: 10,
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      height: "80px",
      marginLeft: "25px",
      marginBottom: "-15px",
      color: "gray",
    },
  };

  const getStatuses = () => {
    const total = Object.values(devices).length;
    const online = Object.values(devices).filter(
      (d) => d.status === "online"
    ).length;
    const offline = Object.values(devices).filter(
      (d) => d.status === "offline"
    ).length;
    const unknown = Object.values(devices).filter(
      (d) => d.status === "unknown"
    ).length;
    return [total, online, offline, unknown];
  };

  const getIgnitionMotion = () => {
    const ignOn = Object.values(positions).filter(
      (p) => p.attributes.ignition === true
    ).length;
    const ignOff = Object.values(positions).filter(
      (p) => p.attributes.ignition === false
    ).length;
    const motionTrue = Object.values(positions).filter(
      (p) => p.attributes.motion === true
    ).length;
    const motionFalse = Object.values(positions).filter(
      (p) => p.attributes.motion === false
    ).length;
    return [ignOn, ignOff, motionTrue, motionFalse];
  };

  const getProtocolsCount = () => {
    const counts = Object.values(positions).reduce((acc, obj) => {
      const protocol = obj.protocol;
      acc[protocol] = (acc[protocol] || 0) + 1;
      return acc;
    }, {});
    return counts;
  };

  const getLastReportTimes = () => {
    const now = dayjs();
    const counts = {
      "1h-": 0,
      "1h+": 0,
      "3h+": 0,
      "6h+": 0,
      "12h+": 0,
      "24h+": 0,
      NR: 0,
    };
    null;
    Object.values(devices).forEach((device) => {
      const lastUpdate = device.lastUpdate ? dayjs(device.lastUpdate) : null;
      if (!lastUpdate) {
        counts["NR"]++;
        return;
      }
      const hoursDifference = now.diff(lastUpdate, "hour");
      if (hoursDifference <= 1) {
        counts["1h-"]++;
      } else if (hoursDifference <= 3) {
        counts["1h+"]++;
      } else if (hoursDifference <= 6) {
        counts["3h+"]++;
      } else if (hoursDifference <= 12) {
        counts["6h+"]++;
      } else if (hoursDifference <= 24) {
        counts["12h+"]++;
      } else {
        counts["24h+"]++;
      }
    });
    return counts;
  };

  const getData = async (endpoint) => {
    const response = await fetch(endpoint);
    return await response.json();
  };

  function countDevicesBySpeed(positions) {
    const speedCounts = {};
    const ranges = Array.from(
      { length: 12 },
      (_, i) => `${i * 10}-${i * 10 + 9}`
    );
    ranges.push("120+");
    ranges.forEach((range) => {
      speedCounts[range] = 0;
    });
    Object.values(positions).forEach((device) => {
      const speed = device.speed;
      if (speed !== null && speed >= 0) {
        const rangeKey =
          speed >= 120
            ? "120+"
            : `${Math.floor(speed / 10) * 10}-${
                Math.floor(speed / 10) * 10 + 9
              }`;
        speedCounts[rangeKey]++;
      }
    });
    return speedCounts;
  }

  useEffect(() => {
    setTotals(getStatuses());
    setLastReportTimes(getLastReportTimes());
  }, [devices]);

  useEffect(() => {
    setIgnitionMotion(getIgnitionMotion());
    setProtocols(getProtocolsCount());
    async function fetchData() {
      let deviceIds = "?";

      for (const device in devices) {
        deviceIds += `deviceId=${devices[device].id}&`;
      }

      const today = dayjs();
      const isoYesterday = today.subtract(70, "day").toISOString();
      const isoTomorrow = today.add(1, "day").toISOString();
      deviceIds += `from=${isoYesterday}&to=${isoTomorrow}&type=allEvents&`;
      setAllEvents(await getData(`/api/reports/events?${deviceIds}`));
      console.log(`/api/reports/events?${deviceIds}`);
    }
    fetchData();
  }, [positions]);

  useEffect(() => {
    async function fetchData() {
      setUsers(await getData("/api/users"));
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const now = new Date();
      const startOfDay = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0
        )
      );
      const endOfDay = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          23,
          59,
          59
        )
      );
      const from = startOfDay.toISOString();
      const to = endOfDay.toISOString();

      ///api/reports/events?deviceId=262&deviceId=263&from=2025-04-01T03%3A00%3A00.000Z&to=2025-05-01T02%3A59%3A59.999Z&type=allEvents
      // console.log(await getData(`/api/reports/events?${deviceIds}`));

      // console.log(from, to);

      setStatistics(await getData(`/api/statistics?from=${from}&to=${to}`));
      console.log(statistics);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (
      positions &&
      typeof positions === "object" &&
      Object.keys(positions).length > 0
    ) {
      const counts = countDevicesBySpeed(positions);
      setSpeedCounts(counts);
    }
  }, [positions]);

  const modalStyle = {
    position: "relative",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "450px",
    height: "300px",
    bgcolor: "background.paper",
    boxShadow: 24,
    overflow: "scroll",
    borderRadius: 4,
    padding: "15px",

    display: "flex",
  };

  const CustomModal = ({
    openModal,
    handleCloseModal,
    selectedDevice,
    setSelectedDevice,
  }) => {
    let eventsNotes = selectedDevice?.attributes?.eventsNotes;
    console.log(eventsNotes);

    if (eventsNotes) {
      JSON.stringify(eventsNotes, 2, null);
    } else {
      eventsNotes = "Sem notas para esse evento";
    }

    return (
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
      >
        <Box sx={modalStyle}>{eventsNotes}</Box>
      </Modal>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
        height: "100%",
        padding: 30,
      }}
    >
      {/* Top Section: Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
        }}
      >
        <div style={styles.chartHolder}>
          <div style={styles.chartTile}>
            <StatisticsCard
              title="Total Veículos"
              num={totals?.[0]}
              icon={<DirectionsCar style={{ fontSize: 80, color: "gray" }} />}
            />
          </div>
          <div style={styles.chartTile}>
            <StatisticsCard
              title="Total Usuários"
              num={users?.length || 0}
              icon={<Groups2 style={{ fontSize: 80, color: "gray" }} />}
            />
          </div>
          <div style={styles.chartTile}>
            <StatisticsCard
              title="Mensagens Recebidas"
              num={statistics[0]?.messagesReceived || 0}
              icon={<CloudUpload style={{ fontSize: 80, color: "gray" }} />}
            />
          </div>
          <div style={styles.chartTile}>
            <StatisticsCard
              title="Mensagens Armazenadas"
              num={statistics[0]?.messagesStored || 0}
              icon={<CloudDone style={{ fontSize: 80, color: "gray" }} />}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div style={styles.chartHolder}>
          <div style={styles.chartTile}>
            <DoughnutChartComponent
              values={totals}
              columns={["Total", "Online", "Offline", "Desconhecido"]}
            />
          </div>
          <div style={styles.chartTile}>
            <PieChartComponent
              values={Object.values(protocols)}
              columns={Object.keys(protocols)}
            />
          </div>
          <div style={styles.chartTile}>
            <PolarAreaChartComponent
              values={ignitionMotion}
              columns={["Ligado", "Desligado", "Movimento", "Parado"]}
            />
          </div>
          <div style={styles.chartTile}>
            <LineChartComponent
              values={Object.values(speedCounts)}
              columns={Object.keys(speedCounts)}
            />
            <BarChartComponent
              values={Object.values(lastReportTimes)}
              columns={Object.keys(lastReportTimes)}
            />
          </div>
        </div>
      </div>

      {/* Events Table Section */}
      <div style={{ width: "100%" }}>
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            backgroundColor: "#fff",
            borderRadius: 8,
            padding: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          {allEvents.length > 0 && (
            <EventTable
              events={allEvents}
              devices={devices}
              openModal={openModal}
              setOpenModal={setOpenModal}
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
            />
          )}
        </div>
      </div>
      <CustomModal
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
      >
        <Box sx={modalStyle}>
          {JSON.stringify(selectedDevice?.attributes || {})}
        </Box>
      </CustomModal>
    </div>
  );
};
export default Dashboard;