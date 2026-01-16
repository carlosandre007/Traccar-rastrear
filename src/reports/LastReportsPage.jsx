import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  calcularTempos,
  analisarPercurso,
  intervals
} from "./common/helpers/functions.js";

import { fallbackImage } from "./common/helpers/fallbackImage";
import { convertToPngBase64 } from "./common/helpers/imageFunctions";

import Logo from "../resources/images/image170.png";

import { pdf } from "@react-pdf/renderer";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  formatDistance,
  formatSpeed,
  formatVolume,
  formatTime,
  formatNumericHours,
} from "../common/util/formatter";
import { useAttributePreference } from "../common/util/preferences";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import usePersistedState from "../common/util/usePersistedState";
import useReportStyles from "./common/useReportStyles";
import AddressValue from "../common/components/AddressValue";

import { useDispatch, useSelector } from "react-redux";
import { devicesActions, reportsActions } from "../store";

import SelectField from "../common/components/SelectField";
import { useRestriction } from "../common/util/permissions";

import dayjs from "dayjs";

import LastReportPDF from "./components/LastReportPDF";
import MapPreview from "./components/MapPreview";

const columnsArray = [
  ["startTime", "reportStartTime"],
  ["startOdometer", "reportStartOdometer"],
  ["startAddress", "reportStartAddress"],
  ["endTime", "reportEndTime"],
  ["endOdometer", "reportEndOdometer"],
  ["endAddress", "reportEndAddress"],
  ["distance", "sharedDistance"],
  ["averageSpeed", "reportAverageSpeed"],
  ["maxSpeed", "reportMaximumSpeed"],
  ["duration", "reportDuration"],
  ["spentFuel", "reportSpentFuel"],
  ["driverName", "sharedDriver"],
];
const columnsMap = new Map(columnsArray);

const LastReportsPage = ({
  children,
  showOnly,
  ignoreDevice,
  multiDevice,
  includeGroups,
}) => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const filterItem = {
    width: "100%",
    minWidth: "25%",
  };

  const distanceUnit = useAttributePreference("distanceUnit");
  const speedUnit = useAttributePreference("speedUnit");
  const volumeUnit = useAttributePreference("volumeUnit");

  const [columns, setColumns] = usePersistedState("tripColumns", [
    "startTime",
    "endTime",
    "distance",
    "averageSpeed",
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [route, setRoute] = useState(null);
  const [button, setButton] = useState("json");

  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [processedItems, setProcessedItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [mapImage, setMapImage] = useState(null);
  const [dadosTempo, setDadosTempo] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [listSize, setListSize] = useState(50);

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const [dados, setDados] = useState({
    logoUrl: "https://via.placeholder.com/60",
    empresa: {
      nome: "Empresa Exemplo Ltda",
      endereco: "Rua das Flores, 123 - SP",
      email: "contato@empresa.com.br",
      telefone: "(11) 99999-9999",
    },
    titulo: "Relatório de Produção",
  });

  const dispatch = useDispatch();

  const readonly = useRestriction("readonly");

  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  const deviceId = useSelector((state) => state.devices.selectedId);
  const deviceIds = useSelector((state) => state.devices.selectedIds);
  const groupIds = useSelector((state) => state.reports.groupIds);
  const period = useSelector((state) => state.reports.period);
  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);

  const scheduleDisabled =
    button === "schedule" && (!description || !calendarId);
  const disabled =
    (!ignoreDevice && !deviceId && !deviceIds.length && !groupIds.length) ||
    scheduleDisabled ||
    loading;

  const createMarkers = () => [
    {
      latitude: selectedItem.startLat,
      longitude: selectedItem.startLon,
      image: "start-success",
    },
    {
      latitude: selectedItem.endLat,
      longitude: selectedItem.endLon,
      image: "finish-error",
    },
  ];

  const mapRef = useRef(null);

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case "startTime":
      case "endTime":
        return formatTime(value, "minutes");
      case "startOdometer":
      case "endOdometer":
      case "distance":
        return formatDistance(value, distanceUnit, t);
      case "averageSpeed":
      case "maxSpeed":
        return value > 0 ? formatSpeed(value, speedUnit, t) : null;
      case "duration":
        return formatNumericHours(value, t);
      case "spentFuel":
        return value > 0 ? formatVolume(value, volumeUnit, t) : null;
      case "startAddress":
        return (
          <AddressValue
            latitude={item.startLat}
            longitude={item.startLon}
            originalAddress={value}
          />
        );
      case "endAddress":
        return (
          <AddressValue
            latitude={item.endLat}
            longitude={item.endLon}
            originalAddress={value}
          />
        );
      default:
        return value;
    }
  };

  const memoizedMap = useMemo(() => {
    return (
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "300px",
          minWidth: "1200px",
          overflowX: "auto",
          marginTop: "15px",
        }}
      >
        <MapPreview
          positions={items}
          mapImage={mapImage}
          setMapImage={setMapImage}
        />
      </div>
    );
  }, [items]);

  useEffect(() => {
    let selectedFrom;
    let selectedTo;

    switch (period) {
      case "today":
        selectedFrom = dayjs().startOf("day");
        selectedTo = dayjs().endOf("day");
        break;
      case "yesterday":
        selectedFrom = dayjs().subtract(1, "day").startOf("day");
        selectedTo = dayjs().subtract(1, "day").endOf("day");
        break;
      case "thisWeek":
        selectedFrom = dayjs().startOf("week");
        selectedTo = dayjs().endOf("week");
        break;
      case "previousWeek":
        selectedFrom = dayjs().subtract(1, "week").startOf("week");
        selectedTo = dayjs().subtract(1, "week").endOf("week");
        break;
      case "thisMonth":
        selectedFrom = dayjs().startOf("month");
        selectedTo = dayjs().endOf("month");
        break;
      case "previousMonth":
        selectedFrom = dayjs().subtract(1, "month").startOf("month");
        selectedTo = dayjs().subtract(1, "month").endOf("month");
        break;
      default:
        selectedFrom = dayjs(from, "YYYY-MM-DDTHH:mm");
        selectedTo = dayjs(to, "YYYY-MM-DDTHH:mm");
        break;
    }

    dispatch(reportsActions.updateFrom(selectedFrom.toISOString()));
    dispatch(reportsActions.updateTo(selectedTo.toISOString()));
  }, [period]);

  useEffect(() => {
    setDadosTempo(calcularTempos(items));
    setGastos(analisarPercurso(items));
  }, [items]);

  const useWhatChanged = (dependencies) => {
    const previous = useRef({});

    useEffect(() => {
      const changed = Object.entries(dependencies).reduce(
        (acc, [key, value]) => {
          const prev = previous.current[key];
          if (prev !== value) {
            acc.push({
              key,
              before: prev,
              after: value,
            });
          }
          return acc;
        },
        []
      );

      if (changed.length > 0) {
        changed.forEach(({ key, before, after }) => {});
      }

      previous.current = dependencies;
    });
  };

  /*

  useEffect(() => {
    
  }, [items]);

 useWhatChanged({
    items,
    dados,
    deviceId,
    mapImage,
    from,
    to,
    period,
  }); */

  const chunkSize = 50;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const processarEmChunks = async (items) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      // Aqui você pode aplicar qualquer processamento extra
      chunks.push(chunk);
      await delay(50); // Simula async / alivia o navegador
      setProgress(
        Math.round(((chunks.length * chunkSize) / items.length) * 100)
      );
    }
    return chunks.flat(); // Junta tudo no final
  };

  const [vehicleImage, setVehicleImage] = useState(null);

  useEffect(() => {
    const fetchAndConvertImage = async () => {
      const imageUrl = devices[deviceId]?.attributes?.deviceImage
        ? `/api/media/${devices[deviceId]?.uniqueId}/${devices[deviceId]?.attributes?.deviceImage}`
        : null;

      if (!imageUrl) {
        setVehicleImage(fallbackImage);
        return;
      }

      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          setVehicleImage(fallbackImage);
          return;
        }

        const blob = await response.blob();
        const base64 = await convertToPngBase64(blob);
        setVehicleImage(base64);
      } catch (err) {
        setVehicleImage(fallbackImage);
      }
    };

    fetchAndConvertImage();
  }, [deviceId]);

  useEffect(() => {
    
    const gerarPdfUnico = async () => {
      setProgress(0);
      // const processedItems = await processarEmChunks(items, setProgress);

      const blob = await pdf(
        <LastReportPDF
          dados={dados}
          items={items.slice(0, listSize)}
          device={devices[deviceId]}
          mapImage={mapImage}
          from={from}
          to={to}
          period={period}
          dadosTempo={dadosTempo}
          gastos={gastos}
          logo={Logo}
          vehicleImage={vehicleImage}
          devices={devices}
          intervals={intervals(devices)}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      /*       setItems([]); // limpa os dados processados
      setMapImage(null); // limpa a imagem do mapa
      setPdfUrl(null); // opcional: limpa a URL do blob
      setProgress(0); // reinicia progresso
      dispatch(devicesActions.selectId(null)); */
    };

    if (items?.length > 0 && mapImage) {
      gerarPdfUnico(); // Só gera quando tudo estiver pronto
    }
  }, [items, mapImage]);

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportTrips"]}
    >
      <div className={classes.container}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: desktop ? "flex-start" : "flex-start",
              justifyContent: desktop ? "flex-start" : "flex-start",
              flexDirection: desktop ? "row" : "column",
              gap: "10px",
            }}
          >
            {!ignoreDevice && (
              <SelectField
                label={t(multiDevice ? "deviceTitle" : "reportDevice")}
                data={Object.values(devices).sort((a, b) =>
                  a.name.localeCompare(b.name)
                )}
                value={multiDevice ? deviceIds : deviceId}
                onChange={(e) =>
                  dispatch(
                    multiDevice
                      ? devicesActions.selectIds(e.target.value)
                      : devicesActions.selectId(e.target.value)
                  )
                }
                multiple={multiDevice}
                fullWidth
              />
            )}
            {includeGroups && (
              <SelectField
                label={t("settingsGroups")}
                data={Object.values(groups).sort((a, b) =>
                  a.name.localeCompare(b.name)
                )}
                value={groupIds}
                onChange={(e) =>
                  dispatch(reportsActions.updateGroupIds(e.target.value))
                }
                multiple
                fullWidth
              />
            )}
            <FormControl fullWidth>
              <InputLabel>{t("reportPeriod")}</InputLabel>
              <Select
                label={t("reportPeriod")}
                value={period}
                onChange={(e) => {
                  dispatch(reportsActions.updatePeriod(e.target.value));
                }}
              >
                <MenuItem value="today">{t("reportToday")}</MenuItem>
                <MenuItem value="yesterday">{t("reportYesterday")}</MenuItem>
                <MenuItem value="thisWeek">{t("reportThisWeek")}</MenuItem>
                <MenuItem value="previousWeek">
                  {t("reportPreviousWeek")}
                </MenuItem>
                <MenuItem value="thisMonth">{t("reportThisMonth")}</MenuItem>
                <MenuItem value="previousMonth">
                  {t("reportPreviousMonth")}
                </MenuItem>
                <MenuItem value="custom">{t("reportCustom")}</MenuItem>
              </Select>
            </FormControl>
            {period === "custom" && (
              <TextField
                label={t("reportFrom")}
                type="datetime-local"
                value={from}
                onChange={(e) => {
                  dispatch(reportsActions.updateFrom(e.target.value));
                }}
                fullWidth
              />
            )}
            {period === "custom" && (
              <TextField
                label={t("reportTo")}
                type="datetime-local"
                value={to}
                onChange={(e) =>
                  dispatch(reportsActions.updateTo(e.target.value))
                }
                fullWidth
              />
            )}
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <TextField
                style={{ minWidth: "80px" }}
                type="number"
                label="Num Ítens"
                value={listSize}
                onChange={(e) => setListSize(e.target.value)}
              />
              <Button
                variant="outlined"
                color="secondary"
                style={{ minWidth: "170px" }}
                disabled={loading || !deviceId}
                onClick={() => {
                  const fromISO = dayjs(from).toISOString();
                  const toISO = dayjs(to).toISOString();
                  setLoading(true);

                  fetch(
                    `/api/reports/route?from=${fromISO}&to=${toISO}&deviceId=${deviceId}`,
                    {
                      headers: {
                        Accept: "application/json",
                      },
                    }
                  )
                    .then(async (response) => {
                      if (response.ok) {
                        const route = await response.json();
                        setItems(route);
                      } else {
                        throw new Error(await response.text());
                      }
                      setLoading(false);
                    })
                    .catch((err) => {});
                }}
              >
                Gerar Relatório
              </Button>
            </div>
          </div>

          {!loading && deviceId && items.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              {memoizedMap}
              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  download={`Relatorio_${deviceId}.pdf`}
                  /* onClick={() => {
                    setTimeout(() => {
                      setItems([]);
                      setMapImage(null);
                      setPdfUrl(null);
                    }, 10000); // tempo suficiente pro download iniciar
                  }} */
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    style={{ minWidth: "170px" }}
                    disabled={loading || !deviceId}
                  >
                    {" "}
                    Baixar Relatório{" "}
                  </Button>
                </a>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  style={{ minWidth: "170px" }}
                  disabled
                >
                  {" "}
                  Gerando documento{" "}
                </Button>
              )}
              {/*  {mapImage && ( */}
              {/* <PDFDownloadLink
                document={
                  <LastReportPDF
                    dados={dados}
                    items={items.slice(0, 10)}
                    device={devices[deviceId]}
                    mapImage={mapImage}
                    from={from}
                    to={to}
                    period={period}
                  />
                }
                fileName={`${devices[deviceId]?.name}_${dayjs(from).format(
                  "DD/MM/YYYY HH:mm"
                )}_${dayjs(to).format("DD/MM/YYYY HH:mm")}.pdf`}
              >
                {({ _loading }) => (_loading ? "Gerando PDF..." : "Baixar PDF")}
              </PDFDownloadLink> */}
              {/*   )} */}
            </div>
          )}

          {/*           {!loading && deviceId && items.length > 0 && (
            <MapPreview positions={items} />
          )} */}

          {/* <LogoImage color="white" /> */}
        </div>

        {/*         {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {route && (
                <>
                  <MapRoutePath positions={route} />
                  <MapMarkers markers={createMarkers()} />
                  <MapCamera positions={route} />
                </>
              )}
            </MapView>
            <MapScale />
          </div>
        )} */}
        {/*         <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} loading={loading}>
              <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
            </ReportFilter>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                {columns.map((key) => (<TableCell key={key}>{t(columnsMap.get(key))}</TableCell>))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.map((item) => (
                <TableRow key={item.startPositionId}>
                  <TableCell className={classes.columnAction} padding="none">
                    {selectedItem === item ? (
                      <IconButton size="small" onClick={() => setSelectedItem(null)}>
                        <GpsFixedIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton size="small" onClick={() => setSelectedItem(item)}>
                        <LocationSearchingIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                  {columns.map((key) => (
                    <TableCell key={key}>
                      {formatValue(item, key)}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (<TableShimmer columns={columns.length + 1} startAction />)}
            </TableBody>
          </Table>
        </div> */}
      </div>
    </PageLayout>
  );
};

export default LastReportsPage;
