/*import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DropzoneArea } from 'react-mui-dropzone';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useAdministrator } from '../common/util/permissions';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper';
import useQuery from '../common/util/useQuery';
import useSettingsStyles from './common/useSettingsStyles';

const DevicePage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const query = useQuery();
  const uniqueId = query.get('uniqueId');

  const [item, setItem] = useState(uniqueId ? { uniqueId } : null);

  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/${item.id}/image`, {
        method: 'POST',
        body: files[0],
      });
      if (response.ok) {
        setItem({ ...item, attributes: { ...item.attributes, deviceImage: await response.text() } });
      } else {
        throw Error(await response.text());
      }
    }
  });

  const validate = () => item && item.name && item.uniqueId;
  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
    >
      {item && (
        <>
        {item?.attributes?.dadosVeiculo && (
          <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('sharedRequired')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <TextField
              value={item?.attributes?.dadosVeiculo?.placa || ''}
              onChange={(event) => setItem({ ...item?.attributes?.dadosVeiculo, placa: event.target.value })}
              label={t('licensePlate')}
            />
          </AccordionDetails>
        </Accordion>
        )}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
              <TextField
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
                helperText={t('deviceIdentifierHelp')}
                disabled={Boolean(uniqueId)}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.groupId}
                onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                endpoint="/api/groups"
                label={t('groupParent')}
              />
              <TextField
                value={item.phone || ''}
                onChange={(event) => setItem({ ...item, phone: event.target.value })}
                label={t('sharedPhone')}
              />
              <TextField
                value={item.model || ''}
                onChange={(event) => setItem({ ...item, model: event.target.value })}
                label={t('deviceModel')}
              />
              <TextField
                value={item.contact || ''}
                onChange={(event) => setItem({ ...item, contact: event.target.value })}
                label={t('deviceContact')}
              />
              <SelectField
                value={item.category || 'default'}
                onChange={(event) => setItem({ ...item, category: event.target.value })}
                data={deviceCategories.map((category) => ({
                  id: category,
                  name: t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`),
                }))}
                label={t('deviceCategory')}
              />
              <SelectField
                value={item.calendarId}
                onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
              />
              <TextField
                label={t('userExpirationTime')}
                type="date"
                value={item.expirationTime ? item.expirationTime.split('T')[0] : '2099-01-01'}
                onChange={(e) => {
                  if (e.target.value) {
                    setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
                  }
                }}
                disabled={!admin}
              />
              <FormControlLabel
                control={<Checkbox checked={item.disabled} onChange={(event) => setItem({ ...item, disabled: event.target.checked })} />}
                label={t('sharedDisabled')}
                disabled={!admin}
              />
            </AccordionDetails>
          </Accordion>
          {item.id && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {t('attributeDeviceImage')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <DropzoneArea
                  dropzoneText={t('sharedDropzoneText')}
                  acceptedFiles={['image/*']}
                  filesLimit={1}
                  onChange={handleFiles}
                  showAlerts={false}
                  maxFileSize={500000}
                />
              </AccordionDetails>
            </Accordion>
          )}
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
          />
        </>
      )}
    </EditItemView>
  );
};

export default DevicePage;*/

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//  import { DropzoneArea } from 'react-mui-dropzone';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useAdministrator } from '../common/util/permissions';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper'; 
import useQuery from '../common/util/useQuery';
import useSettingsStyles from './common/useSettingsStyles';

const DevicePage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const query = useQuery();
  const uniqueId = query.get('uniqueId');

  // Garante que 'item' sempre tenha 'id', mesmo que seja null, para consistência de dados.
  const [item, setItem] = useState(uniqueId ? { uniqueId, id: null } : null);

  const validate = () => item && item.name && item.uniqueId;

  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
              <TextField
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
                helperText={t('deviceIdentifierHelp')}
                disabled={Boolean(uniqueId)}
              />
            </AccordionDetails>
          </Accordion>

          {/* ACCORDION PARA DADOS DO VEÍCULO */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('vehicleDataTitle')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.attributes?.dadosVeiculo?.placa || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    dadosVeiculo: {
                      ...prevItem.attributes?.dadosVeiculo,
                      placa: event.target.value,
                    },
                  },
                }))}
                label={t('licensePlate')}
              />
              <TextField
                value={item.attributes?.dadosVeiculo?.year || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    dadosVeiculo: {
                      ...prevItem.attributes?.dadosVeiculo,
                      year: event.target.value,
                    },
                  },
                }))}
                label={t('vehicleYear')}
                type="number"
              />
              <TextField
                value={item.attributes?.dadosVeiculo?.brandModel || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    dadosVeiculo: {
                      ...prevItem.attributes?.dadosVeiculo,
                      brandModel: event.target.value,
                    },
                  },
                }))}
                label={t('vehicleBrandModel')}
              />
              <TextField
                value={item.attributes?.dadosVeiculo?.dominantColor || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    dadosVeiculo: {
                      ...prevItem.attributes?.dadosVeiculo,
                      dominantColor: event.target.value,
                    },
                  },
                }))}
                label={t('vehicleDominantColor')}
              />
            </AccordionDetails>
          </Accordion>

          {/* ACCORDION PARA DETALHES DA INSTALAÇÃO */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('installationDetailsTitle')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                label={t('installationDateTime')}
                type="datetime-local"
                value={item.attributes?.installationDetails?.dateTime ?
                  item.attributes.installationDetails.dateTime.substring(0, 16) : ''}
                onChange={(e) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    installationDetails: {
                      ...prevItem.attributes?.installationDetails,
                      dateTime: e.target.value,
                    },
                  },
                }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                value={item.attributes?.installationDetails?.location || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    installationDetails: {
                      ...prevItem.attributes?.installationDetails,
                      location: event.target.value,
                    },
                  },
                }))}
                label={t('installationLocation')}
              />
              <TextField
                value={item.attributes?.installationDetails?.technician || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    installationDetails: {
                      ...prevItem.attributes?.installationDetails,
                      technician: event.target.value,
                    },
                  },
                }))}
                label={t('installationTechnician')}
              />
              
            </AccordionDetails>
          </Accordion>

          {/* ACCORDION PARA DADOS GERAIS/EXTRA */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.groupId}
                onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                endpoint="/api/groups"
                label={t('groupParent')}
              />
              <TextField
                value={item.phone || ''}
                onChange={(event) => setItem({ ...item, phone: event.target.value })}
                label={t('sharedPhone')}
              />
              <TextField
                value={item.model || ''}
                onChange={(event) => setItem({ ...item, model: event.target.value })}
                label={t('deviceModel')}
              />
              <TextField
                value={item.contact || ''}
                onChange={(event) => setItem({ ...item, contact: event.target.value })}
                label={t('deviceContact')}
              />
              <SelectField
                value={item.category || 'default'}
                onChange={(event) => setItem({ ...item, category: event.target.value })}
                data={deviceCategories.map((category) => ({
                  id: category,
                  name: t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`),
                }))}
                label={t('deviceCategory')}
              />
              <SelectField
                value={item.calendarId}
                onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
              />
              <TextField
                label={t('userExpirationTime')}
                type="date"
                value={item.expirationTime ? item.expirationTime.split('T')[0] : '2099-01-01'}
                onChange={(e) => {
                  if (e.target.value) {
                    setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
                  }
                }}
                disabled={!admin}
              />
              <FormControlLabel
                control={<Checkbox checked={item.disabled} onChange={(event) => setItem({ ...item, disabled: event.target.checked })} />}
                label={t('sharedDisabled')}
                disabled={!admin}
              />
            </AccordionDetails>
          </Accordion>

          {/* ACCORDION PARA DADOS DO CHIP */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('chipDataTitle')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.attributes?.chip?.iccid || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    chip: {
                      ...prevItem.attributes?.chip,
                      iccid: event.target.value,
                    },
                  },
                }))}
                label={t('attributeIccid')}
              />
              <TextField
                value={item.attributes?.chip?.lineNumber || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    chip: {
                      ...prevItem.attributes?.chip,
                      lineNumber: event.target.value,
                    },
                  },
                }))}
                label={t('attributeLineNumber')}
              />
              <TextField
                value={item.attributes?.chip?.operator || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    chip: {
                      ...prevItem.attributes?.chip,
                      operator: event.target.value,
                    },
                  },
                }))}
                label={t('attributeOperator')}
              />
              <TextField
                value={item.attributes?.chip?.dataPlanMb || ''}
                onChange={(event) => setItem(prevItem => ({
                  ...prevItem,
                  attributes: {
                    ...prevItem.attributes,
                    chip: {
                      ...prevItem.attributes?.chip,
                      dataPlanMb: Number(event.target.value),
                    },
                  },
                }))}
                label={t('attributeDataPlanMb')}
                type="number"
              />
            </AccordionDetails>
          </Accordion>

          

          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
          />
        </>
      )}
    </EditItemView>
  );
};

export default DevicePage;