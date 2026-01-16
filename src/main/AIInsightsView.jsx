import React from 'react';
import { useSelector } from 'react-redux';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Box,
    Divider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { calculateDeviceAIStatus, generateAIInsight } from '../common/util/aiService';
import { useTranslation } from '../common/components/LocalizationProvider';

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(3),
    },
    header: {
        marginBottom: theme.spacing(4),
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
    card: {
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
            transform: 'scale(1.02)',
        },
    },
    statusNormal: {
        color: theme.palette.success.main,
    },
    statusAttention: {
        color: theme.palette.warning.main,
    },
    statusCritical: {
        color: theme.palette.error.main,
    },
}));

const AIInsightsView = () => {
    const classes = useStyles();
    const t = useTranslation();
    const devices = useSelector((state) => state.devices.items);
    const positions = useSelector((state) => state.session.positions || {}); // Assuming positions are here

    const getStatusIcon = (status) => {
        switch (status) {
            case 'normal': return <CheckCircleIcon className={classes.statusNormal} />;
            case 'attention': return <WarningIcon className={classes.statusAttention} />;
            case 'critical': return <ErrorIcon className={classes.statusCritical} />;
            default: return <PsychologyIcon />;
        }
    };

    const deviceList = Object.values(devices);
    const attentionDevices = deviceList.filter(d => calculateDeviceAIStatus(d, positions) !== 'normal');

    return (
        <Container maxWidth="lg" className={classes.container}>
            <Box className={classes.header}>
                <PsychologyIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h4">Monitoramento Inteligente (IA)</Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Resumo Operacional</Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total de Veículos Analisados: {deviceList.length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Veículos com Atenção/Crítico: {attentionDevices.length}
                            </Typography>
                            <Box mt={2}>
                                <Chip
                                    label={`${Math.round((1 - attentionDevices.length / deviceList.length) * 100)}% de Eficiência`}
                                    color="primary"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Anomalias e Insights Recentes</Typography>
                            <Divider />
                            <List>
                                {deviceList.slice(0, 10).map((device) => {
                                    const status = calculateDeviceAIStatus(device, positions);
                                    const insight = generateAIInsight(device, positions[device.id]);

                                    return (
                                        <ListItem key={device.id}>
                                            <ListItemIcon>
                                                {getStatusIcon(status)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={device.name}
                                                secondary={insight}
                                            />
                                            <Chip
                                                size="small"
                                                label={status.toUpperCase()}
                                                color={status === 'normal' ? 'success' : status === 'attention' ? 'warning' : 'error'}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AIInsightsView;
