export const headerPDFDefinition = (
  dados,
  device,
  from,
  to,
  logoBase64,
  vehicleBase64
) => {
  return function (currentPage, pageCount) {
    return {
      margin: [30, 10, 30, 0],
      table: {
        widths: ["auto", "*", "auto"],
        body: [
          [
            {
              image: vehicleBase64,
              width: 60,
              rowSpan: 3,
              margin: [0, 0, 10, 0],
            },
            {
              text: "Histórico",
              alignment: "center",
              bold: true,
              fontSize: 16,
              margin: [0, 5, 0, 0],
            },
            {
              image: logoBase64,
              width: 60,
              rowSpan: 3,
              alignment: "right",
              margin: [10, 0, 0, 0],
            },
          ],
          [
            {},
            {
              text: `${dados?.empresa?.nome || "Empresa Exemplo"}\n${dados?.empresa?.endereco || "Endereço"}`,
              fontSize: 8,
              alignment: "center",
            },
            {},
          ],
          [
            {},
            {
              text: `Veículo: ${device?.name || "Desconhecido"}\nDe: ${from} Até: ${to}`,
              fontSize: 8,
              alignment: "center",
            },
            {},
          ],
        ],
      },
      layout: "noBorders",
    };
  };
};
