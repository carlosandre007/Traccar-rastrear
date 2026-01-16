import { Document, Page, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 300,
  },
});

const PDFWithMap = ({ mapImage }) => (
  <Document>
    <Page size="A4">
      <Image src={mapImage} style={styles.image} />
    </Page>
  </Document>
);

export default PDFWithMap;
