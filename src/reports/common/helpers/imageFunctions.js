export const convertToPngBase64 = async (blob) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const pngBase64 = canvas.toDataURL("image/png");
      URL.revokeObjectURL(url);
      resolve(pngBase64);
    };
    img.onerror = reject;
    img.src = url;
  });
};
