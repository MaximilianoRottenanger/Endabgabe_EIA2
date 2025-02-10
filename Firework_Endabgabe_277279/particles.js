export class Particle {
    positionX;
    positionY;
    velocityX;
    velocityY;
    color;
    shape;
    lifetime = 100;
    constructor(positionX, positionY, velocityX, velocityY, color, shape) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.shape = shape;
    }
    update() {
        this.positionX += this.velocityX;
        this.positionY += this.velocityY;
        this.lifetime--;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        switch (this.shape) {
            case "circle":
                ctx.arc(this.positionX, this.positionY, 3, 0, 2 * Math.PI);
                break;
            case "triangle":
                ctx.moveTo(this.positionX, this.positionY);
                ctx.lineTo(this.positionX - 5, this.positionY + 8);
                ctx.lineTo(this.positionX + 5, this.positionY + 8);
                ctx.closePath();
                break;
            case "rectangle":
                ctx.fillRect(this.positionX - 2, this.positionY - 2, 5, 5);
                break;
        }
        ctx.fill();
    }
}
//# sourceMappingURL=particles.js.map