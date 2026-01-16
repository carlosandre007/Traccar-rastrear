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
import { analyzeDeviceBehavior, generateDashboardInsights } from '../services/aiAnalyzer';
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
            case 'warning': return <WarningIcon className={classes.statusAttention} />;
            case 'critical': return <ErrorIcon className={classes.statusCritical} />;
            default: return <PsychologyIcon />;
        }
    };

    const deviceList = Object.values(devices);
    const dashboardInsights = generateDashboardInsights(deviceList, Object.values(positions));
    const attentionDevices = deviceList.filter(d => analyzeDeviceBehavior(d, Object.values(positions)).severity !== 'normal');

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
                                Frota Saudável: {dashboardInsights.fleetHealth}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Veículos em Estado Crítico: {dashboardInsights.criticals.length}
                            </Typography>
                            <Box mt={2}>
                                {dashboardInsights.globalInsights.map((insight, index) => (
                                    <Chip
                                        key={index}
                                        label={insight}
                                        color="error"
                                        variant="outlined"
                                        sx={{ mb: 1, width: '100%', justifyContent: 'flex-start' }}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Anomalias e Insights por Veículo</Typography>
                            <Divider />
                            <List>
                                {deviceList.slice(0, 15).map((device) => {
                                    const analysis = analyzeDeviceBehavior(device, Object.values(positions));
                                    const status = analysis.severity;

                                    return (
                                        <ListItem key={device.id}>
                                            <ListItemIcon>
                                                {getStatusIcon(status)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={device.name}
                                                secondary={analysis.summary}
                                            />
                                            <Chip
                                                size="small"
                                                label={status.toUpperCase()}
                                                color={status === 'normal' ? 'success' : status === 'warning' ? 'warning' : 'error'}
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
