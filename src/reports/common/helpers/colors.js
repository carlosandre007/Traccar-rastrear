const turboPolynomials = {
  r: [
    0.13572138, 4.6153926, -42.66032258, 132.13108234, -152.94239396,
    59.28637943,
  ],
  g: [0.09140261, 2.19418839, 4.84296658, -14.18503333, 4.27729857, 2.82956604],
  b: [
    0.1066733, 12.64194608, -60.58204836, 110.36276771, -89.90310912,
    27.34824973,
  ],
};

const interpolateChannel = (v, coeffs) => {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result += coeffs[i] * v ** i;
  }
  return Math.max(0, Math.min(1, result));
};

const interpolateTurbo = (v) => {
  v = Math.max(0, Math.min(1, v));
  return [
    Math.round(255 * interpolateChannel(v, turboPolynomials.r)),
    Math.round(255 * interpolateChannel(v, turboPolynomials.g)),
    Math.round(255 * interpolateChannel(v, turboPolynomials.b)),
  ];
};

const getAgeColor = (value, min = 0, max = 168) => {
  let norm = (value - min) / (max - min);
  norm = Math.max(0, Math.min(1, norm));
  const turboVal = 0.25 + norm * 0.5;
  const [r, g, b] = interpolateTurbo(turboVal);
  return `rgb(${r}, ${g}, ${b})`;
};
