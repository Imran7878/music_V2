window.AudioVisualizers.sunburst = function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.lineWidth = 3;

    for (let i = 0; i < bufferLength; i += 2) { // একটু ফাঁকা রাখার জন্য 2 করে বাড়ানো হয়েছে
        let angle = (i * Math.PI * 2) / bufferLength;
        let lineLength = dataArray[i] * 1.5 * sensitivity;

        // রশ্মিগুলো কেন্দ্র থেকে একটু দূর থেকে শুরু হবে (Radius 80)
        let x1 = centerX + Math.cos(angle) * 80; 
        let y1 = centerY + Math.sin(angle) * 80;
        
        let x2 = centerX + Math.cos(angle) * (80 + lineLength);
        let y2 = centerY + Math.sin(angle) * (80 + lineLength);

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
};