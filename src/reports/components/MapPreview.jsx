import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import React, { useEffect, useRef } from "react";

const MapPreview = ({ positions, mapImage, setMapImage }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!positions?.length) return;

    const coordinates = positions.map((pos) => [pos.longitude, pos.latitude]);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"], // CORS OK
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: coordinates[0],
      zoom: 17,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#055688",
          "line-width": 3,
        },
      });

      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.fitBounds(bounds, { padding: 40, duration: 0 });

      // Espera o mapa estar totalmente renderizado
      map.once("idle", () => {
        const canvas = map.getCanvas();
        const dataUrl = canvas.toDataURL("image/png");
        setMapImage(dataUrl);
      });

      map.resize();
    });

    return () => {
      map.remove();
    };
  }, [positions]);

  return (
    <div
      id="map-container"
      ref={mapContainerRef}
      style={{ height: "300px", width: "100%" }}
    />
  );
};

export default MapPreview;
