window.AudioVisualizers.symmetric = function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const barWidth = (canvas.width / bufferLength) * 1.5;
    
    for (let i = 0; i < bufferLength; i++) {
        let barHeight = dataArray[i] * 1.5 * sensitivity;
        ctx.fillStyle = color;
        ctx.fillRect(centerX + (i * (barWidth + 1)), centerY - barHeight / 2, barWidth, barHeight);
        ctx.fillRect(centerX - (i * (barWidth + 1)), centerY - barHeight / 2, barWidth, barHeight);
    }
};