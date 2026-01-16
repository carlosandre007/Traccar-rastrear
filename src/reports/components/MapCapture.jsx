import React, { useEffect, useRef, useState } from 'react';
import MapPreview from './MapPreview';
import { toPng } from 'html-to-image';
import PDFWithMap from './PDFWithMap'; // o componente que recebe o mapa em base64

const MapCapture = ({ positions }) => {
  const [mapImage, setMapImage] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Aguarda o mapa renderizar completamente
    const timer = setTimeout(() => {
      exportMapAsImage();
    }, 1500); // tempo suficiente para o mapa carregar

    return () => clearTimeout(timer);
  }, []);

  const exportMapAsImage = async () => {
    if (mapRef.current) {
      const dataUrl = await toPng(mapRef.current);
      setMapImage(dataUrl);
    }
  };

  return (
    <div>
      <div ref={mapRef} id="map-container" style={{ width: '100%', height: 400 }}>
        <MapPreview positions={positions} />
      </div>

      {mapImage && (
        <PDFWithMap mapImage={mapImage} />
      )}
    </div>
  );
};

export default MapCapture;
