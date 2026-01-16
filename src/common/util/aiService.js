/**
 * AI Service for Traccar Data Analysis
 * Focus: Anomaly Detection, Operational Status, and Smart Summaries.
 */

export const calculateDeviceAIStatus = (device, positions) => {
    const position = positions[device.id];

    if (device.status === 'unknown') return 'unknown';

    const lastUpdate = new Date(device.lastUpdate).getTime();
    const now = Date.now();
    const offlineDuration = now - lastUpdate;

    // Crítico: Offline por mais de 48 horas ou bateria crítica
    if (offlineDuration > 48 * 60 * 60 * 1000) {
        return 'critical';
    }

    if (position && position.attributes.batteryLevel < 15) {
        return 'critical';
    }

    // Atenção: Offline por mais de 12 horas ou parado muito tempo
    if (offlineDuration > 12 * 60 * 60 * 1000) {
        return 'attention';
    }

    return device.status === 'online' ? 'normal' : 'attention';
};

export const generateAIInsight = (device, position) => {
    if (!position && device.status === 'unknown') return "Dispositivo nunca comunicou.";

    let insights = [];

    if (device.status === 'offline') {
        const hours = Math.floor((Date.now() - new Date(device.lastUpdate).getTime()) / (1000 * 60 * 60));
        insights.push(`Offline há ${hours}h.`);
    }

    if (position) {
        if (position.attributes.batteryLevel < 20) {
            insights.push("Bateria do rastreador baixa.");
        }
        if (position.attributes.ignition === false && position.speed > 0) {
            insights.push("Possível reboque detectado (ignição desligada com movimento).");
        }
    }

    return insights.length > 0 ? insights.join(" | ") : "Operação dento dos padrões.";
};
