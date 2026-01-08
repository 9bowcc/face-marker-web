const fs = require('fs');

function createPngIcons() {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Generate PNG Icons</title>
</head>
<body>
    <canvas id="canvas192" width="192" height="192"></canvas>
    <canvas id="canvas512" width="512" height="512"></canvas>
    
    <script>
        function drawIcon(canvasId, size) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#2196f3';
            ctx.roundRect(0, 0, size, size, size * 0.2);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(size * 0.35, size * 0.4, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(size * 0.65, size * 0.4, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = 'white';
            ctx.lineWidth = size * 0.06;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(size * 0.3, size * 0.65);
            ctx.quadraticCurveTo(size * 0.5, size * 0.8, size * 0.7, size * 0.65);
            ctx.stroke();
        }
        
        drawIcon('canvas192', 192);
        drawIcon('canvas512', 512);
        
        function downloadCanvas(canvasId, filename) {
            const canvas = document.getElementById(canvasId);
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
        }
        
        setTimeout(() => {
            downloadCanvas('canvas192', 'icon-192.png');
            setTimeout(() => {
                downloadCanvas('canvas512', 'icon-512.png');
            }, 500);
        }, 1000);
    </script>
</body>
</html>`;
  
  fs.writeFileSync('/tmp/generate-icons.html', htmlContent);
  console.log('Open /tmp/generate-icons.html in a browser to download PNG icons');
  console.log('Then save them to public/icons/ directory');
}

createPngIcons();