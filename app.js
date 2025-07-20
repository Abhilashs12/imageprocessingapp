const imageUpload = document.getElementById('imageUpload');
const originalCanvas = document.getElementById('originalCanvas');
const ctxOriginal = originalCanvas.getContext('2d');

imageUpload.addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    ctxOriginal.drawImage(img, 0, 0);
  };
  img.src = URL.createObjectURL(file);
});

function toGrayscale(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  return imageData;
}

function smoothImage(imageData, kernelSize) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);
  const half = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          let ny = y + dy, nx = x + dx;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            let idx = 4 * (ny * width + nx);
            r += src[idx];
            g += src[idx + 1];
            b += src[idx + 2];
            a += src[idx + 3];
            count++;
          }
        }
      }
      let outIdx = 4 * (y * width + x);
      dst[outIdx] = r / count;
      dst[outIdx + 1] = g / count;
      dst[outIdx + 2] = b / count;
      dst[outIdx + 3] = a / count;
    }
  }
  let outImageData = new ImageData(dst, width, height);
  return outImageData;
}

document.getElementById('smoothBtn').addEventListener('click', () => {
  const kernelSize = parseInt(document.getElementById('kernelSize').value);
  let imgData = ctxOriginal.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

  if (document.getElementById('grayscaleCheckbox').checked) {
    imgData = toGrayscale(imgData);
  }

  const outData = smoothImage(imgData, kernelSize);

  const smoothedCanvas = document.getElementById('smoothedCanvas');
  smoothedCanvas.width = outData.width;
  smoothedCanvas.height = outData.height;
  smoothedCanvas.getContext('2d').putImageData(outData, 0, 0);
});

originalCanvas.addEventListener('mousemove', function(event) {
  const rect = originalCanvas.getBoundingClientRect();
  const x = Math.floor(event.clientX - rect.left);
  const y = Math.floor(event.clientY - rect.top);

  if (x >= 0 && x < originalCanvas.width && y >= 0 && y < originalCanvas.height) {
    const pixel = ctxOriginal.getImageData(x, y, 1, 1).data;
    document.getElementById('pixelInfo').textContent = `R: ${pixel[0]}, G: ${pixel[1]}, B: ${pixel[2]}, A: ${pixel[3]}`;
  } else {
    document.getElementById('pixelInfo').textContent = '';
  }
});