window.AudioVisualizers.orbits = (function() {
    let angle = 0;
    return function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
        angle += 0.01; // ঘোরার স্পিড
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.save();
        ctx.translate(centerX, centerY);

        // প্রথম কক্ষপথ (ডান দিকে ঘুরবে)
        ctx.rotate(angle);
        ctx.beginPath();
        for(let i = 0; i < 40; i++) {
            let r = 120 + (dataArray[i * 4] || 0) * sensitivity * 0.8;
            let theta = (i * Math.PI * 2) / 40;
            ctx.lineTo(r * Math.cos(theta), r * Math.sin(theta));
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // দ্বিতীয় কক্ষপথ (বিপরীত দিকে এবং একটু ফাস্ট ঘুরবে)
        ctx.rotate(-angle * 2.5); 
        ctx.beginPath();
        for(let i = 0; i < 40; i++) {
            let r = 200 + (dataArray[i * 4 + 20] || 0) * sensitivity * 1.2;
            let theta = (i * Math.PI * 2) / 40;
            ctx.lineTo(r * Math.cos(theta), r * Math.sin(theta));
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5; // একটু হালকা দেখাবে
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    };
})();