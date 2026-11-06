window.AudioVisualizers.wave = function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
    const centerY = canvas.height / 2;
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.beginPath();
    
    let sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let adjustedV = 1 + (v - 1) * sensitivity; 
        let y = adjustedV * centerY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
    }
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
};