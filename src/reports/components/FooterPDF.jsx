import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 9,
    color: "#000",
  },
  leftTextBlock: {
    flexDirection: "column",
  },
  circleNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 50,
    textAlign: "center",
    // lineHeight: 24,
    backgroundColor: "#055688",
    color: "#FFF",
    fontSize: 9,
  },
});

const FooterPDF = ({device}) => (
  <View style={styles.footer} fixed>
    <View style={styles.leftTextBlock}>
      <Text>Auto Ram Rastreamento</Text>
      <Text>{device?.name || ""}</Text>
    </View>
    <View style={styles.circleNumber}>
      <Text render={({ pageNumber }) => `${pageNumber}`} />
    </View>
  </View>
);

export default FooterPDF;
