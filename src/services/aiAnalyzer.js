/**
 * AI Analyzer Service
 * Responsible for interpreting Traccar data and providing insights.
 */

export const analyzeDeviceBehavior = (device, positions = []) => {
    const status = device.status;
    const lastUpdate = new Date(device.lastUpdate);
    const now = new Date();

    let insights = [];
    let severity = 'normal'; // normal, warning, critical

    // 1. Status Analysis
    if (status === 'offline') {
        const diffMs = now - lastUpdate;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours >= 48) {
            insights.push(`Veículo offline há mais de ${diffHours} horas. Recomenda-se verificação física.`);
            severity = 'critical';
        } else if (diffHours >= 12) {
            insights.push(`Veículo offline há ${diffHours} horas.`);
            severity = 'warning';
        }
    }

    // 2. Anomaly Detection (using positions)
    const currentPosition = positions.find(p => p.deviceId === device.id);
    if (currentPosition) {
        // Battery Check
        const battery = currentPosition.attributes.batteryLevel;
        if (battery !== undefined && battery < 15) {
            insights.push(`Bateria crítica: ${battery}%. O rastreador pode desligar em breve.`);
            severity = 'critical';
        }

        // Ignition vs Speed Anomaly (Towing detection)
        const ignition = currentPosition.attributes.ignition;
        const speed = currentPosition.speed; // knots usually in Traccar
        if (ignition === false && speed > 5) {
            insights.push(`ALERTA: Movimento detectado com ignição desligada. Possível reboque.`);
            severity = 'critical';
        }

        // Long period stationary (potential tracker fault or abandoned vehicle)
        // This would ideally check history, but for now we look at current state
    } else if (status === 'unknown') {
        insights.push("Sem sinal recente. Verifique a cobertura da operadora ou instalação.");
        severity = 'warning';
    }

    return {
        deviceId: device.id,
        deviceName: device.name,
        severity,
        insights,
        summary: insights.length > 0 ? insights.join(' | ') : 'Operação dentro dos padrões.'
    };
};

/**
 * Generate a global summary for the dashboard
 */
export const generateDashboardInsights = (devices, positions) => {
    const total = devices.length;
    const offline = devices.filter(d => d.status === 'offline').length;
    const unknown = devices.filter(d => d.status === 'unknown').length;

    let globalInsights = [];

    if (offline / total > 0.3) {
        globalInsights.push("Alerta: Mais de 30% da frota está offline.");
    }

    const analyzed = devices.map(d => analyzeDeviceBehavior(d, positions));
    const criticals = analyzed.filter(a => a.severity === 'critical');

    if (criticals.length > 0) {
        globalInsights.push(`${criticals.length} veículo(s) em estado CRÍTICO.`);
    }

    return {
        fleetHealth: ((total - (offline + unknown)) / total * 100).toFixed(1) + '%',
        globalInsights,
        criticals
    };
};
