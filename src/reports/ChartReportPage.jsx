import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Paper, Typography,
} from '@mui/material';
import {
  AreaChart, Area, Brush, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine,
} from 'recharts';
import ReportFilter from './components/ReportFilter';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch } from '../reactHelper';
import { useAttributePreference } from '../common/util/preferences';
import {
  altitudeFromMeters, distanceFromMeters, speedFromKnots, volumeFromLiters,
} from '../common/util/converter';
import useReportStyles from './common/useReportStyles';

const CustomTooltip = ({ active, payload, label, positionAttributes, t }) => {
  if (active && payload && payload.length) {
    const pointData = payload[0].payload;
    const primaryDataKey = payload[0].dataKey;
    const attributeName = positionAttributes[primaryDataKey]?.name || primaryDataKey;
    const unit = positionAttributes[primaryDataKey]?.unit || '';

    return (
      <Paper elevation={3} sx={{ padding: '12px', minWidth: '180px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          {formatTime(label, 'seconds')}
        </Typography>
        <Typography variant="body2" style={{ color: '#8884d8' }}>
          {`${attributeName}: ${payload[0].value} ${unit}`}
        </Typography>
        {pointData.ignition !== undefined && (
          <Typography variant="caption" display="block" color="text.secondary">
            {t('positionIgnition')}: {pointData.ignition ? t('sharedOn') : t('sharedOff')}
          </Typography>
        )}
      </Paper>
    );
  }
  return null;
};

const ChartReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const positionAttributes = usePositionAttributes(t);

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');

  const [items, setItems] = useState([]);
  const [types, setTypes] = useState(['speed']);
  const [type, setType] = useState('speed');
  const [timeType, setTimeType] = useState('fixTime');

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/reports/route?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const positions = await response.json();
      const keySet = new Set();
      const keyList = [];
      const formattedPositions = positions.map((position) => {
        const data = { ...position, ...position.attributes };
        const formatted = {};
        formatted.fixTime = dayjs(position.fixTime).valueOf();
        formatted.deviceTime = dayjs(position.deviceTime).valueOf();
        formatted.serverTime = dayjs(position.serverTime).valueOf();
        Object.keys(data).filter((key) => !['id', 'deviceId'].includes(key)).forEach((key) => {
          const value = data[key];
          if (typeof value === 'number') {
            keySet.add(key);
            const definition = positionAttributes[key] || {};
            switch (definition.dataType) {
              case 'speed':
                // CORREÇÃO: Removido '?' da atribuição
                formatted[key] = Number(speedFromKnots(value, speedUnit).toFixed(2));
                break;
              case 'altitude':
                // CORREÇÃO: Removido '?' da atribuição
                formatted[key] = Number(altitudeFromMeters(value, altitudeUnit).toFixed(2));
                break;
              case 'distance':
                // CORREÇÃO: Removido '?' da atribuição
                formatted[key] = Number(distanceFromMeters(value, distanceUnit).toFixed(2));
                break;
              case 'volume':
                // CORREÇÃO: Removido '?' da atribuição
                formatted[key] = Number(volumeFromLiters(value, volumeUnit).toFixed(2));
                break;
              case 'hours':
                // CORREÇÃO: Removido '?' da atribuição
                formatted[key] = Number((value / 1000).toFixed(2));
                break;
              default:
                // CORREÇÃO: Removido '?' da atribuição
                formatted[key] = value;
                break;
            }
          } else if (key === 'ignition') {
            // CORREÇÃO: Removido '?' da atribuição
            formatted[key] = value;
          }
        });
        return formatted;
      });
      Object.keys(positionAttributes).forEach((key) => {
        if (keySet.has(key)) {
          keyList.push(key);
          keySet.delete(key);
        }
      });
      setTypes([...keyList, ...keySet]);
      setItems(formattedPositions);
    } else {
      throw Error(await response.text());
    }
  });

  const values = items.map((it) => it[type]).filter((v) => typeof v === 'number');
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;
  const averageValue = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const valueRange = maxValue - minValue;

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportChart']}>
      <ReportFilter handleSubmit={handleSubmit} showOnly>
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('reportChartType')}</InputLabel>
            <Select
              label={t('reportChartType')}
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!items.length}
            >
              {types.map((key) => (
                <MenuItem key={key} value={key}>{positionAttributes[key]?.name || key}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('reportTimeType')}</InputLabel>
            <Select
              label={t('reportTimeType')}
              value={timeType}
              onChange={(e) => setTimeType(e.target.value)}
              disabled={!items.length}
            >
              <MenuItem value="fixTime">{t('positionFixTime')}</MenuItem>
              <MenuItem value="deviceTime">{t('positionDeviceTime')}</MenuItem>
              <MenuItem value="serverTime">{t('positionServerTime')}</MenuItem>
            </Select>
          </FormControl>
        </div>
      </ReportFilter>
      {items.length > 0 && (
        <div className={classes.chart}>
          <ResponsiveContainer>
            <AreaChart
              data={items}
              margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey={timeType} type="number" tickFormatter={(value) => formatTime(value, 'time')} domain={['dataMin', 'dataMax']} scale="time" />
              <YAxis type="number" tickFormatter={(value) => value.toFixed(1)} domain={values.length > 1 ? [minValue - valueRange / 5, maxValue + valueRange / 5] : [minValue - 10, maxValue + 10]} allowDataOverflow />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip positionAttributes={positionAttributes} t={t} />} />
              <Area type="monotone" dataKey={type} stroke="#8884d8" strokeWidth={2} fill="url(#chartGradient)" activeDot={{ r: 6 }} dot={false} />
              <ReferenceLine y={maxValue} label={{ value: `Máx: ${maxValue.toFixed(1)}`, position: 'right', fill: 'red' }} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={averageValue} label={{ value: `Média: ${averageValue.toFixed(1)}`, position: 'right', fill: 'green' }} stroke="green" strokeDasharray="3 3" />
              <Brush dataKey={timeType} height={30} stroke="#8884d8" tickFormatter={(value) => formatTime(value, 'time')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageLayout>
  );
};

export default ChartReportPage;