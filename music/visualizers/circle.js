window.AudioVisualizers.circle = function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let radius = (dataArray[10] * sensitivity) || 50; 
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 100, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let i = 0; i < bufferLength; i++) {
        let angle = (i * Math.PI * 2) / bufferLength;
        let barHeight = dataArray[i] * sensitivity;
        let x1 = centerX + Math.cos(angle) * (radius + 100);
        let y1 = centerY + Math.sin(angle) * (radius + 100);
        let x2 = centerX + Math.cos(angle) * (radius + 100 + barHeight);
        let y2 = centerY + Math.sin(angle) * (radius + 100 + barHeight);

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
};