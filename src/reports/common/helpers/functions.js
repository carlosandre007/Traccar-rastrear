export function intervals(devicesData) {
  const agora = new Date();

  const contagem = {
    menosDe1Hora: 0,
    maisDe1Hora: 0,
    maisDe3Horas: 0,
    maisDe6Horas: 0,
    maisDe12Horas: 0,
    maisDe24Horas: 0,
    maisDe48Horas: 0,
    maisDe7Dias: 0,
  };

  Object.values(devicesData).forEach((device) => {
    const lastUpdateStr = device.lastUpdate;
    if (!lastUpdateStr) return; // ignorar se nunca reportou

    const lastUpdate = new Date(lastUpdateStr);
    const diffMs = agora.getTime() - lastUpdate.getTime();
    const diffHoras = diffMs / (1000 * 60 * 60);
    const diffDias = diffHoras / 24;

    if (diffDias >= 7) contagem.maisDe7Dias++;
    else if (diffHoras >= 48) contagem.maisDe48Horas++;
    else if (diffHoras >= 24) contagem.maisDe24Horas++;
    else if (diffHoras >= 12) contagem.maisDe12Horas++;
    else if (diffHoras >= 6) contagem.maisDe6Horas++;
    else if (diffHoras >= 3) contagem.maisDe3Horas++;
    else if (diffHoras >= 1) contagem.maisDe1Hora++;
    else if (diffHoras < 1) contagem.menosDe1Hora++;
  });

  return contagem;
}

export function calcularTempos(data) {
  let totalLigado = 0;
  let totalLigadoParado = 0;
  let totalLigadoMovimento = 0;
  let totalDesligado = 0;

  for (let i = 1; i < data.length; i++) {
    const anterior = data[i - 1];
    const atual = data[i];

    const tempoDelta =
      new Date(atual.deviceTime) - new Date(anterior.deviceTime);
    const ignicaoLigada = anterior.attributes?.ignition === true;
    const emMovimento = anterior.speed > 7; // ou um threshold, tipo > 5 km/h

    if (ignicaoLigada) {
      totalLigado += tempoDelta;

      if (emMovimento) {
        totalLigadoMovimento += tempoDelta;
      } else {
        totalLigadoParado += tempoDelta;
      }
    } else {
      totalDesligado += tempoDelta;
    }
  }

  return {
    totalLigado: millisParaHorasMinutos(totalLigado),
    totalLigadoParado: millisParaHorasMinutos(totalLigadoParado),
    totalLigadoMovimento: millisParaHorasMinutos(totalLigadoMovimento),
    totalDesligado: millisParaHorasMinutos(totalDesligado),
  };
}

export function analisarPercurso(data, precoLitro = 6.0) {
  let maxVel = 0;
  let somaVel = 0;
  let contadorVel = 0;
  let tempoExcesso = 0;
  let distanciaTotal = 0;

  let primeiraData = null;
  let ultimaData = null;

  for (let i = 1; i < data.length; i++) {
    const anterior = data[i - 1];
    const atual = data[i];

    if (!anterior.valid || !atual.valid) continue;

    const ignicaoLigada = atual.attributes?.ignition === true;

    // Datas
    if (!primeiraData) primeiraData = new Date(anterior.deviceTime);
    ultimaData = new Date(atual.deviceTime);

    // Velocidade
    const speedKmh = atual.speed * 1.852;
    if (speedKmh > maxVel) maxVel = speedKmh;

    if (ignicaoLigada) {
      somaVel += speedKmh;
      contadorVel++;

      const tempoDelta =
        new Date(atual.deviceTime) - new Date(anterior.deviceTime);
      if (speedKmh > 100) tempoExcesso += tempoDelta;

      // Distância real entre coordenadas
      const dist = haversine(
        anterior.latitude,
        anterior.longitude,
        atual.latitude,
        atual.longitude
      );
      distanciaTotal += dist;
    }
  }

  // Consumo e custo
  const litros = distanciaTotal / 10;
  const custo = litros * precoLitro;
  const mediaConsumo =
    distanciaTotal > 0 && litros > 0 ? distanciaTotal / litros : 0;

  const diasPercorridos =
    primeiraData && ultimaData
      ? Math.max(
          1,
          Math.ceil((ultimaData - primeiraData) / (1000 * 60 * 60 * 24))
        )
      : 1;

  const mediaKmPorDia = distanciaTotal / diasPercorridos;

  return {
    velocidadeMaxima_kmh: maxVel.toFixed(1),
    velocidadeMedia_kmh:
      contadorVel > 0 ? (somaVel / contadorVel).toFixed(1) : "0.0",
    tempoExcessoVelocidade: millisParaHorasMinutos(tempoExcesso),
    distanciaKm: distanciaTotal.toFixed(2),
    consumoEstimadoLitros: litros.toFixed(2),
    custoEstimadoCombustivel: `${custo.toFixed(2)}`,
    mediaKmPorLitro: mediaConsumo.toFixed(2),
    mediaKmPorDia: mediaKmPorDia.toFixed(2),
  };
}

export function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function millisParaHorasMinutos(ms) {
  const totalMin = Math.floor(ms / 60000);
  const horas = Math.floor(totalMin / 60);
  const minutos = totalMin % 60;
  return `${horas}h ${minutos}min`;
}
