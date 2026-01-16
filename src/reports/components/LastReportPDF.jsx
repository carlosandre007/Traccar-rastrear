import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import HeaderPDF from "./HeaderPDF";
import FooterPDF from "./FooterPDF";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extende os plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const styles = StyleSheet.create({
  page: {
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    position: "relative",
  },
  title: {
    marginVertical: 20,
    fontSize: 22,
    textAlign: "center",
  },
  content: {
    marginTop: 10,
  },
  titles: {
    fontSize: 10,
    fontWeight: 800,
  },
  texts: {
    fontSize: 9,
  },
  speed: {
    display: "flex",
    width: "100%",
    height: "175px",
    margin: "0 auto",
    gap: 10,
  },

  boxes: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    border: "0.5px solid lightgrey",
    borderRadius: 10,
  },
  mapImage: {
    width: "100%",
    height: 300,
    marginBottom: 10,
  },
});

const Card13 = ({
  columnTitle,
  value1,
  subtitle,
  value2,
  subtitle2,
  value3,
  subtitle3,
}) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        width: "13%",
        height: "175px",
        margin: "0 auto",
        border: "0.5px solid lightgrey",
        borderRadius: 10,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "175px",
          margin: "0 auto",
          gap: 3,
          padding: 5,
        }}
      >
        <Text style={{ fontSize: 10, marginBottom: 8 }}>{columnTitle}</Text>
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>{value1}</Text>
        <Text style={{ fontSize: 10 }}>{subtitle}</Text>
      </View>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "175px",
          margin: "0 auto",
          gap: 3,
          padding: 5,
          borderTop: "0.5px solid lightgrey",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>{value2}</Text>
        <Text style={{ fontSize: 10 }}>{subtitle2}</Text>
      </View>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "175px",
          margin: "0 auto",
          gap: 3,
          borderTop: "0.5px solid lightgrey",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>{value3}</Text>
        <Text style={{ fontSize: 10 }}>{subtitle3}</Text>
      </View>
    </View>
  );
};

const HistoryPDF = ({
  dados,
  items,
  device,
  mapImage,
  from,
  to,
  period,
  dadosTempo,
  gastos,
  logo,
  vehicleImage,
}) => {
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

  return (
    <Document>
      <Page orientation="landscape" size="A4" style={styles.page}>
        <HeaderPDF
          dados={dados}
          device={device}
          from={from}
          to={to}
          period={period}
          logo={logo}
          vehicleImage={vehicleImage}
        />

        <View style={styles.content}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                // width: "60%",
                // height: "175px",
                margin: "0 auto",
                padding: 10,
                gap: 10,
                border: "0.5px solid lightgrey",
                borderRadius: 10,
              }}
            >
              <Text style={styles.titles}>Ligado</Text>
              <Text>{dadosTempo.totalLigado}</Text>
            </View>

            {/* 
            
                distanciaKm: distanciaKm.toFixed(2),
    odometroInicial: odometroInicial
      ? (odometroInicial / 1000).toFixed(2) + " km"
      : "N/A",
    odometroFinal: odometroFinal
      ? (odometroFinal / 1000).toFixed(2) + " km"
      : "N/A",
    consumoEstimadoLitros: litros.toFixed(2),
    custoEstimadoCombustivel: `R$ ${custo.toFixed(2)}`,
    mediaKmPorLitro: mediaConsumo.toFixed(2),
            
            
            
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "40%",
                height: "175px",
                margin: "0 auto",
                gap: 10,
                border: "0.5px solid lightgrey",
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "33%",
                  padding: 10,
                }}
              >
                <View style={{ display: "flex", flexDirection: "column" }}>
                  <Text>Velocidade</Text>
                </View>
                <View>
                  <Text>Linha 2</Text>
                </View>
                <View>
                  <Text>Linha 3</Text>
                </View>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "33%",
                }}
              >
                {" "}
                <View>
                  <Text>Distância</Text>
                </View>
                <View>
                  <Text>Linha 2</Text>
                </View>
                <View>
                  <Text>Linha 3</Text>
                </View>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "33%",
                }}
              >
                {" "}
                <View>
                  <Text>Combustível</Text>
                </View>
                <View>
                  <Text>Linha 2</Text>
                </View>
                <View>
                  <Text>Linha 3</Text>
                </View>
              </View>
            </View> */}
          </View>

          {mapImage && (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "220px",
                marginTop: 5,
              }}
            >
              <Image
                src={mapImage}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "auto",
                  borderRadius: 15,
                }}
              />
            </View>
          )}

          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              width: "100%",
              height: "35px",
              borderRadius: 10,
              marginTop: 20,
              padding: 8,

              backgroundColor: "#EDEDED",
            }}
          >
            <Text style={{ fontSize: 9, width: "10%", fontWeight: 300 }}>
              Motor
            </Text>
            <Text style={{ fontSize: 9, width: "10%", fontWeight: 300 }}>
              Data e Hora
            </Text>
            <Text style={{ fontSize: 9, width: "30%", fontWeight: 300 }}>
              Endereço
            </Text>
            <Text style={{ fontSize: 9, width: "10%", fontWeight: 300 }}>
              Velocidade
            </Text>
            <Text style={{ fontSize: 9, width: "10%", fontWeight: 300 }}>
              Evento
            </Text>
            <Text style={{ fontSize: 9, width: "10%", fontWeight: 300 }}>
              Alerta
            </Text>
            <Text style={{ fontSize: 9, width: "10%", fontWeight: 300 }}>
              Motorista
            </Text>
            <Text style={{ fontSize: 9, width: "10%", fontWeight: 300 }}>
              Bloqueio
            </Text>
          </View>

          {items.map((item, index) => (
            <View
              break={false}
              wrap={false}
              key={index}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                width: "100%",
                height: "30px",
                marginTop: 5,
                padding: 6,
                gap: 4,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "10%",

                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: 50,
                    backgroundColor: item?.attributes?.ignition
                      ? "green"
                      : "red",
                  }}
                />
                <Text
                  style={{
                    fontSize: 7,
                    fontWeight: 200,
                    color:
                      item?.attributes?.ignition === true ? "green" : "red",
                  }}
                >
                  {item?.attributes?.ignition === true ? "Ligado" : "Desligado"}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 7,
                  fontWeight: 200,
                  width: "10%",
                }}
              >
                {dayjs(item?.fixTime).format("DD/MM/YYYY HH:mm")}
              </Text>
              <View
                style={{
                  width: "30%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  textAlign: "left",
                }}
              >
                <Text
                  style={{
                    fontSize: 7,
                    fontWeight: 200,
                    color: "grey",
                  }}
                >
                  ({(item?.latitude || 0).toFixed(5)},{" "}
                  {(item?.longitude || 0).toFixed(5)})
                </Text>
                <Text
                  style={{
                    fontSize: 7,
                    fontWeight: 200,
                    color: "#055688",
                  }}
                >
                  {item?.address}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 7,
                  fontWeight: 200,
                  width: "10%",
                }}
              >
                {(item?.speed || 0).toFixed(2) * 1.8} km/h
              </Text>
              <Text
                style={{
                  fontSize: 7,
                  fontWeight: 200,
                  width: "10%",
                }}
              >
                Sem Eventos
              </Text>
              <Text
                style={{
                  fontSize: 7,
                  fontWeight: 200,
                  width: "10%",
                }}
              >
                {item?.attributes?.alarm
                  ? getEventLabel(item?.attributes?.alarm.split(",")[0])
                  : "Sem Alertas"}
              </Text>

              <Text
                style={{
                  fontSize: 7,
                  fontWeight: 200,
                  width: "10%",
                }}
              >
                Sem Motorista
              </Text>
              <Text
                style={{
                  fontSize: 7,
                  fontWeight: 200,
                  width: "10%",

                  color: item?.attributes?.blocked === true ? "red" : "green",
                }}
              >
                {item?.attributes?.blocked === true
                  ? "Bloqueado"
                  : "Desbloqueado"}
              </Text>
            </View>
          ))}
        </View>

        <FooterPDF device={device} />
      </Page>
    </Document>
  );
};

export default HistoryPDF;
