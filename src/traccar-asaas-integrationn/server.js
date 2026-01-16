// server.js
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const express = require('express');
const axios = require('axios');
const app = express();

// --- Variáveis de Ambiente ---
const TRACCAR_API_URL = process.env.TRACCAR_API_URL;
const TRACCAR_USERNAME = process.env.TRACCAR_USERNAME;
const TRACCAR_PASSWORD = process.env.TRACCAR_PASSWORD;

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const PORT = process.env.PORT || 3000;

// --- Configuração do Express ---
app.use(express.json()); // Permite que o Express leia JSON no corpo das requisições

// --- Mapeamento Simples: Cliente Asaas ID para Usuário Traccar ID ---
// EM UM AMBIENTE REAL, ISSO VIRIA DE UM BANCO DE DADOS!
const asaasToTraccarUserMap = {
    'cus_00000000000000': 1, // Exemplo: ID do cliente Asaas -> ID do usuário Traccar
    'cus_yyyyyyyyyyyyyyyy': 2,
    // Adicione mais mapeamentos conforme necessário
};

// --- Funções de Ajuda para Interagir com Traccar ---

// Base64 encode para autenticação Basic Auth no Traccar
const traccarAuth = Buffer.from(`${TRACCAR_USERNAME}:${TRACCAR_PASSWORD}`).toString('base64');

async function updateTraccarUserStatus(traccarUserId, disabledStatus) {
    try {
        const response = await axios.put(
            `${TRACCAR_API_URL}/users/${traccarUserId}`,
            { disabled: disabledStatus },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${traccarAuth}`
                }
            }
        );
        console.log(`Status do usuário Traccar ${traccarUserId} atualizado para 'disabled': ${disabledStatus}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar usuário Traccar ${traccarUserId}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

// --- Endpoint para Webhooks do Asaas ---
app.post('/webhook/asaas', async (req, res) => {
    const event = req.body;
    console.log(`Webhook Asaas recebido: ${event.event} para cobrança ID: ${event.payment ? event.payment.id : 'N/A'}`);

    // --- IMPORTANTE: Validação do Webhook (para produção) ---
    // Em produção, você DEVE validar a assinatura do webhook do Asaas
    // para garantir que a requisição é legítima.
    // O Asaas envia um header 'asaas-access-token' ou uma assinatura no corpo.
    // Consulte a documentação do Asaas sobre validação de webhook.
    // Por simplicidade, este exemplo não implementa a validação completa.

    const payment = event.payment;

    if (!payment) {
        console.log('Webhook sem informações de pagamento. Ignorando.');
        return res.sendStatus(200);
    }

    const customerIdAsaas = payment.customer; // ID do cliente Asaas
    const traccarUserId = asaasToTraccarUserMap[customerIdAsaas];

    if (!traccarUserId) {
        console.log(`Cliente Asaas ID ${customerIdAsaas} não mapeado para usuário Traccar. Ignorando.`);
        return res.sendStatus(200); // Não é um erro, apenas não há mapeamento
    }

    try {
        switch (event.event) {
            case 'PAYMENT_OVERDUE':
                console.log(`Cobrança ${payment.id} do cliente ${customerIdAsaas} VENCIDA. Desabilitando usuário Traccar ${traccarUserId}.`);
                await updateTraccarUserStatus(traccarUserId, true); // Desabilita o usuário
                break;
            case 'PAYMENT_RECEIVED':
            case 'PAYMENT_RESTORED':
                console.log(`Cobrança ${payment.id} do cliente ${customerIdAsaas} PAGA/RESTAURADA. Habilitando usuário Traccar ${traccarUserId}.`);
                await updateTraccarUserStatus(traccarUserId, false); // Habilita o usuário
                break;
            default:
                console.log(`Evento ${event.event} não tratado. Ignorando.`);
                break;
        }
        res.sendStatus(200); // Responde ao Asaas com sucesso
    } catch (error) {
        console.error(`Erro ao processar webhook do Asaas:`, error);
        res.sendStatus(500); // Responde com erro, para que o Asaas possa tentar novamente
    }
});

// --- Iniciar o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Endpoint de webhook Asaas: http://localhost:${PORT}/webhook/asaas`);
});