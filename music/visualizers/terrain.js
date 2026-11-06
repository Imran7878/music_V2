window.AudioVisualizers.terrain = function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height); // স্ক্রিনের একদম নিচের বাম পাশ থেকে শুরু
    
    let sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] * sensitivity * 2;
        let y = canvas.height - v - 50; // নিচ থেকে উপরের দিকে উঠবে
        
        ctx.lineTo(x, y);
        x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height); // স্ক্রিনের ডান পাশের নিচে শেষ হবে
    
    // পাহাড়ের ভেতরের রঙ (অর্ধেক স্বচ্ছ)
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    
    // পাহাড়ের বর্ডার লাইন
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
};