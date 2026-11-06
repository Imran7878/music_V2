window.AudioVisualizers.polygon = function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const sides = 6; // ৬ কোণা বিশিষ্ট হেক্সাগন
    const baseRadius = 120;
    let bass = dataArray[5] * sensitivity;

    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
        let angle = (i * 2 * Math.PI) / sides;
        // বাহুগুলোকে সাউন্ড অনুযায়ী ভাইব্রেট করানো
        let dataIndex = Math.floor((i / sides) * (bufferLength / 4)); 
        let offset = dataArray[dataIndex] * sensitivity * 0.5;
        let r = baseRadius + offset + (bass * 0.4);

        let x = centerX + r * Math.cos(angle);
        let y = centerY + r * Math.sin(angle);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    // বাইরের বর্ডার
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();

    // ভেতরের গ্লোয়িং ফিল ইফেক্ট
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 1.0; // আলফা রিসেট
};