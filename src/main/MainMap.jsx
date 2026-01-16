import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import MapView from "../map/core/MapView";
import MapSelectedDevice from "../map/main/MapSelectedDevice";
import MapAccuracy from "../map/main/MapAccuracy";
import MapGeofence from "../map/MapGeofence";
import MapCurrentLocation from "../map/MapCurrentLocation";
import PoiMap from "../map/main/PoiMap";
import MapPadding from "../map/MapPadding";
import { devicesActions } from "../store";
import MapDefaultCamera from "../map/main/MapDefaultCamera";
import MapLiveRoutes from "../map/main/MapLiveRoutes";
import MapPositions from "../map/MapPositions";
import MapOverlay from "../map/overlay/MapOverlay";
import MapGeocoder from "../map/geocoder/MapGeocoder";
import MapScale from "../map/MapScale";
import MapNotification from "../map/notification/MapNotification";
import useFeatures from "../common/util/useFeatures";
import MapAccount from "../map/account/MapAccount";

const MainMap = ({
  filteredPositions,
  selectedPosition,
  onEventsClick,
  onAccountClick,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const devices = useSelector((state) => state.devices.items);
  const [totals, setTotals] = useState(null);

  const eventsAvailable = useSelector((state) => !!state.events.items.length);

  const features = useFeatures();

  const onMarkerClick = useCallback(
    (_, deviceId) => {
      dispatch(devicesActions.selectId(deviceId));
    },
    [dispatch]
  );

  const boxStyle = {
    width: 35,
    height: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 2,
    borderStyle: "solid",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    fontSize: 13,
    fontWeight: "semibold",
    color: "white",
  };

  const boxContainer = {
    position: "absolute",
    right: 7,
    top: 264,
    zIndex: 10,
    display: desktop ? "flex" : "none",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
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

    return {
      total,
      online,
      offline,
      unknown,
    };
  };

  useEffect(() => {
    setTotals(getStatuses());
    // console.log(getStatuses());
  }, [devices]);

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes />
        <MapPositions
          positions={filteredPositions}
          onClick={onMarkerClick}
          selectedPosition={selectedPosition}
          showStatus
        />
        <MapDefaultCamera />
        <MapSelectedDevice />
        <PoiMap />
        <div style={boxContainer}>
          <div style={{ ...boxStyle, backgroundColor: "#0096c7", opacity: 0.95 }}>
            {totals?.total || 0}
          </div>
          <div style={{ ...boxStyle, backgroundColor: "#5bb450", opacity: 0.95 }}>
            {totals?.online || 0}
          </div>
          <div style={{ ...boxStyle, backgroundColor: "#ffa652", opacity: 0.95 }}>
            {totals?.unknown || 0}
          </div>
          <div style={{ ...boxStyle, backgroundColor: "#ff2c2c", opacity: 0.95 }}>
            {totals?.offline || 0}
          </div>
        </div>
      </MapView>
      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />
      {!features.disableEvents && (
        <MapNotification enabled={eventsAvailable} onClick={onEventsClick} />
      )}
      {/*     
botões recuperar
  {!features.disableEvents && (
        <MapAccount enabled={true} onClick={onAccountClick} />
      )} */}
      {desktop && (
        <MapPadding
          left={
            parseInt(theme.dimensions.drawerWidthDesktop, 10) +
            parseInt(theme.spacing(1.5), 10)
          }
        />
      )}
    </>
  );
};

export default MainMap;
