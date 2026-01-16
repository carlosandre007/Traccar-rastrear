import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import Logo from "../../resources/images/LogoRam.png";
import vehiclePicture from "../../resources/images/sem_foto.png";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extende os plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 30,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerColumns: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  logo: {
    width: 70,
    height: "auto",
  },
  vehicle: {
    width: 80,
    height: "auto",
    borderRadius: 12,
  },
  companyInfo: {
    textAlign: "left",
    fontSize: 10,
  },
  deviceInfo: {
    textAlign: "right",
    fontSize: 10,
  },
});

const HeaderPDF = ({ dados, device, from, to, period }) => {

  const [vehicleImage, setVehicleImage] = useState(null);

  useEffect(() => {

    if (device?.attributes?.deviceImage) {
      setVehicleImage(`/api/media/${device?.uniqueId}/${device?.attributes?.deviceImage}`);
    } else {
      setVehicleImage(vehiclePicture);  
    }

  }, []);

  



  return (
    <View style={styles.header} fixed>
      <View style={styles.headerColumns}>
        <Image src={Logo} style={styles.logo} />
        <View style={styles.companyInfo}>
          <Text>{dados.empresa.nome}</Text>
          <Text>{dados.empresa.endereco}</Text>
          <Text>{dados.empresa.email}</Text>
          <Text>{dados.empresa.telefone}</Text>
        </View>
      </View>

      <View style={styles.headerColumns}>
        <Text style={{ fontSize: 19 }}>Histórico</Text>
      </View>

      <View style={styles.headerColumns}>
        <View style={styles.deviceInfo}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            {device?.name}
          </Text>
          <Text>{dayjs(from).format('DD/MM/YYYY HH:mm')}</Text>
          <Text>{dayjs(to).format('DD/MM/YYYY HH:mm')}</Text>
        </View>
        <Image src={vehicleImage} style={styles.vehicle} />
      </View>
    </View>
  );
};

export default HeaderPDF;
