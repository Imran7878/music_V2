window.AudioVisualizers.my_custom_theme = function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;

    // ব্যাকগ্রাউন্ড ক্লিয়ার করা এবং হালকা গ্লো ইফেক্ট
    ctx.clearRect(0, 0, width, height);
    
    // বার সংখ্যা নিয়ন্ত্রণ (পারফরম্যান্সের জন্য bufferLength এর অর্ধেক ব্যবহার করা ভালো)
    const bars = 150; 
    const barWidth = (2 * Math.PI * radius) / bars;

    for (let i = 0; i < bars; i++) {
        // ফ্রিকোয়েন্সি ডেটা থেকে ভ্যালু নেওয়া এবং সেন্সিটিভিটি অ্যাপ্লাই করা
        const amplitude = dataArray[i * Math.floor(bufferLength / bars)] || 0;
        const barHeight = (amplitude / 255) * radius * (sensitivity || 1.2);

        // বৃত্তাকার কোণ গণনা
        const angle = i * ((Math.PI * 2) / bars);
        
        // বারের শুরুর এবং শেষের পজিশন
        const xStart = centerX + Math.cos(angle) * radius;
        const yStart = centerY + Math.sin(angle) * radius;
        const xEnd = centerX + Math.cos(angle) * (radius + barHeight);
        const yEnd = centerY + Math.sin(angle) * (radius + barHeight);

        // স্টাইলিশ গ্র্যাডিয়েন্ট এবং ড্রয়িং
        ctx.beginPath();
        ctx.strokeStyle = color || '#00d2ff'; // আপনার দেওয়া ডিফল্ট কালার
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // গ্লোয়িং ইফেক্ট যোগ করা
        ctx.shadowBlur = 10;
        ctx.shadowColor = color || '#00d2ff';
        
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.closePath();
    }

    // মাঝখানে একটি পালসটিং ইফেক্ট যোগ করা (মিউজিকের তালে ছোট-বড় হবে)
    const avgAmplitude = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const innerPulse = radius + (avgAmplitude / 255) * 20;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.closePath();
};