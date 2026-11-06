window.AudioVisualizers.galaxy = (function() {
    let angle = 0;
    return function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
        angle += 0.005; // গ্যালাক্সির ঘোরার গতি
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let bass = dataArray[5] * sensitivity;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        for (let i = 0; i < bufferLength; i += 4) { // সব ডাটা না নিয়ে ফাঁকা ফাঁকা ডট তৈরির জন্য
            let r = (dataArray[i] * sensitivity * 1.5) + bass;
            let theta = (i * Math.PI * 2) / bufferLength;
            // স্পাইরাল ইফেক্ট
            let x = r * Math.cos(theta * 8); 
            let y = r * Math.sin(theta * 8);

            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.restore();
    };
})();