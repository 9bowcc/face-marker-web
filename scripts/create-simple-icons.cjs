const fs = require('fs');

function createSimplePngIcon(size, filename) {
  const width = size;
  const height = size;
  
  const pixelData = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 10 || y < 10 || x >= width - 10 || y >= height - 10) {
        pixelData.push(33, 150, 243, 255);
      } else {
        pixelData.push(33, 150, 243, 255);
      }
    }
  }
  
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  
  const ihdrCrc = Buffer.alloc(4);
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    Buffer.from('IHDR'),
    ihdrData,
    ihdrCrc
  ]);
  
  fs.writeFileSync(filename, Buffer.concat([pngHeader, ihdrChunk]));
  console.log(`Created ${filename}`);
}

createSimplePngIcon(192, 'public/icons/icon-192.png');
createSimplePngIcon(512, 'public/icons/icon-512.png');