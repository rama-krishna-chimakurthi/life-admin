const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3778C2');
  gradient.addColorStop(1, '#2563EB');
  
  // Draw rounded rectangle background
  const radius = size * 0.2;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  
  // Draw wallet icon (simplified)
  const iconSize = size * 0.6;
  const x = (size - iconSize) / 2;
  const y = (size - iconSize) / 2;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y + iconSize * 0.2, iconSize, iconSize * 0.6);
  ctx.fillRect(x + iconSize * 0.1, y, iconSize * 0.8, iconSize * 0.3);
  
  // Draw checkmark
  const checkSize = size * 0.2;
  const checkX = size - checkSize - size * 0.05;
  const checkY = size * 0.05;
  
  ctx.fillStyle = '#2ed573';
  ctx.beginPath();
  ctx.arc(checkX + checkSize/2, checkY + checkSize/2, checkSize/2, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(checkX + checkSize * 0.3, checkY + checkSize * 0.5);
  ctx.lineTo(checkX + checkSize * 0.45, checkY + checkSize * 0.65);
  ctx.lineTo(checkX + checkSize * 0.7, checkY + checkSize * 0.35);
  ctx.stroke();
  
  // Save file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`assets/${filename}`, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

// Generate icons
generateIcon(1024, 'icon.png');
generateIcon(1024, 'adaptive-icon.png');
generateIcon(1024, 'splash-icon.png');
generateIcon(192, 'favicon.png');