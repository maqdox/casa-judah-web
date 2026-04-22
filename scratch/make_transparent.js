const sharp = require('sharp');
const path = require('path');

async function makeTransparent(filename, targetColor, tolerance = 40) {
  const inputPath = path.join(__dirname, '..', 'public', filename);
  const outputPath = path.join(__dirname, '..', 'public', 'temp_' + filename);

  console.log(`Processing ${filename}...`);

  await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const { width, height, channels } = info;
      for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff = Math.sqrt(
          Math.pow(r - targetColor[0], 2) +
          Math.pow(g - targetColor[1], 2) +
          Math.pow(b - targetColor[2], 2)
        );

        if (diff < tolerance) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      return sharp(data, { raw: { width, height, channels } })
        .png()
        .toFile(outputPath);
    });

  const fs = require('fs');
  fs.renameSync(outputPath, inputPath);
  console.log(`${filename} processed successfully.`);
}

async function run() {
  try {
    // logo_dark.png: Background #D6BE9B (214, 190, 155)
    await makeTransparent('logo_dark.png', [214, 190, 155], 50);
    // logo_light.png: Background #5A4334 (90, 67, 52)
    await makeTransparent('logo_light.png', [90, 67, 52], 50);
  } catch (err) {
    console.error(err);
  }
}

run();
