import { Particle } from "./particles.js";
export class Firework {
    positionX;
    positionY;
    particles;
    radius;
    shape;
    color;
    particleCount = 50;
    constructor(positionX, positionY, radius, shape, color) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.radius = radius;
        this.shape = shape;
        this.color = color;
        this.particles = [];
        this.explode();
    }
    explode() {
        for (let i = 0; i < this.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (this.radius / 10) + 2;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            this.particles.push(new Particle(this.positionX, this.positionY, velocityX, velocityY, this.color, this.shape));
        }
    }
    update(ctx) {
        this.particles.forEach((particle, index) => {
            particle.update();
            particle.draw(ctx);
            if (particle.lifetime <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    isDone() {
        return this.particles.length === 0;
    }
}
//# sourceMappingURL=firework.js.map