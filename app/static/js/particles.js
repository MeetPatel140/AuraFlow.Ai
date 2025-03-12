// Enhanced particles for auth page
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
});

function initParticles() {
    const background = document.querySelector('.auth-background');
    if (!background) return;
    
    // Clear existing particles
    background.innerHTML = '';
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
            // Increase size up to 2x (original was Math.random() * 8 + 2)
            this.size = Math.random() * 16 + 4; // Doubled size range (4px to 20px)
        }
        
        reset() {
            const container = background.getBoundingClientRect();
            this.x = Math.random() * container.width;
            this.y = Math.random() * container.height;
            this.vx = Math.random() * 0.5 - 0.25;
            this.vy = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.3; // Higher base opacity
        }
        
        update() {
            const container = background.getBoundingClientRect();
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > container.width || 
                this.y < 0 || this.y > container.height) {
                this.reset();
            }
        }
        
        draw() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${this.x}px`;
            particle.style.top = `${this.y}px`;
            particle.style.width = `${this.size}px`;
            particle.style.height = `${this.size}px`;
            particle.style.opacity = this.opacity;
            return particle;
        }
    }
    
    // Create 75 particles (50% more than original 50)
    const particles = Array.from({ length: 75 }, () => new Particle());
    
    // Animate particles
    function animateParticles() {
        background.innerHTML = '';
        
        particles.forEach(particle => {
            particle.update();
            background.appendChild(particle.draw());
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
} 