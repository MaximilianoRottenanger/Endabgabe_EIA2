export class Particle {
    positionX: number;
    positionY: number;
    velocityX: number;
    velocityY: number;
    color: string;
    shape: string;
    lifetime: number = 100; 

    constructor(positionX: number, positionY: number, velocityX: number, velocityY: number, color: string, shape: string) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.shape = shape;
    }

    update(): void {
        this.positionX += this.velocityX; 
        this.positionY += this.velocityY; 
        this.lifetime--; 
    }

    draw(ctx: CanvasRenderingContext2D): void {
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
