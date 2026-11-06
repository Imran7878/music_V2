window.AudioVisualizers.particles = (function() {
    let particlesArray =[];
    class Particle {
        constructor(x, y, bass, color) {
            this.x = x; this.y = y;
            this.size = Math.random() * 5 + 2;
            this.speedX = (Math.random() - 0.5) * (bass / 10);
            this.speedY = (Math.random() - 0.5) * (bass / 10);
            this.color = color;
            this.life = 100;
        }
        update() { this.x += this.speedX; this.y += this.speedY; this.life -= 2; }
        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return function(ctx, canvas, dataArray, bufferLength, color, sensitivity) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let bass = dataArray[5] * sensitivity; 
        
        if (bass > 200) particlesArray.push(new Particle(centerX, centerY, bass, color));
        
        particlesArray.forEach((p, index) => {
            p.update();
            p.draw(ctx);
            if (p.life <= 0) particlesArray.splice(index, 1);
        });
    };
})();