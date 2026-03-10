// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

class LaunchExperience {
    constructor() {
        this.frameCount = 240;
        this.images = [];
        this.imageSeq = { frame: 0 };
        
        this.nebulaCanvas = document.getElementById('nebula-canvas');
        this.shipCanvas = document.getElementById('ship-canvas');
        this.nebCtx = this.nebulaCanvas.getContext('2d');
        this.shipCtx = this.shipCanvas.getContext('2d');
        
        // HUD Elements
        this.phaseText = document.getElementById('phase-text');
        this.modeText = document.getElementById('mode-text');
        this.telVel = document.getElementById('telemetry-vel');
        this.telAlt = document.getElementById('telemetry-alt');
        this.telFuel = document.getElementById('telemetry-fuel');
        this.telThrust = document.getElementById('telemetry-thrust');
        
        // Timer
        this.timerElem = document.querySelector('.mission-timer');
        
        // Status tracking
        this.imagesLoaded = 0;
        this.allImagesLoaded = false;
        
        this.init();
    }
    
    init() {
        this.setupLenis();
        this.preloadFrames();
        this.setupCanvas();
        this.setupScrollAnimation();
        this.startTimer();
        
        // Resize handling
        window.addEventListener('resize', this.debounce(() => this.setupCanvas(), 250));
    }
    
    setupLenis() {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        })

        lenis.on('scroll', (e) => {})

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)
    }
    
    preloadFrames() {
        // Preload images or fallback to procedural generative rocket launch if images are missing.
        for (let i = 0; i < this.frameCount; i++) {
            const img = new Image();
            const id = (i + 1).toString().padStart(3, '0');
            const path = `images/frames/launch-frame-${id}.jpg`;
            
            img.src = path;
            
            img.onload = () => {
                this.imagesLoaded++;
                if (this.imagesLoaded === this.frameCount) {
                    this.allImagesLoaded = true;
                    this.renderFrame(0);
                }
            };
            
            img.onerror = () => {
                img.isFailed = true;
            };
            
            this.images.push(img);
        }
        
        requestAnimationFrame(() => this.renderFrame(0));
    }
    
    setupCanvas() {
        const cw = window.innerWidth;
        const ch = window.innerHeight;
        
        this.nebulaCanvas.width = cw;
        this.nebulaCanvas.height = ch;
        this.shipCanvas.width = cw;
        this.shipCanvas.height = ch;
        
        this.renderFrame(Math.floor(this.imageSeq.frame));
    }
    
    setupScrollAnimation() {
        gsap.to(this.imageSeq, {
            frame: this.frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: ".launch-engine",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
                onUpdate: (self) => {
                    this.updateHUD(self.progress);
                    requestAnimationFrame(() => this.renderFrame(Math.floor(this.imageSeq.frame)));
                }
            }
        });
    }

    /*
     * LAUNCH TIMELINE
     * Phase 1: Launch Pad Idle
     * Phase 2: Ignition
     * Phase 3: Engine Ramp
     * Phase 4: Lift Off
     * Phase 5: Atmospheric Ascent
     * Phase 6: Orbital Entry
     * Phase 7: Deep Space
    */
    updateHUD(progress) {
        // Velocity
        const v = Math.pow(progress, 2.5) * 28000;
        this.telVel.innerText = (v/3600).toFixed(2); // km/s
        
        // Altitude
        const a = Math.pow(progress, 2) * 400;
        this.telAlt.innerText = a.toFixed(1);
        
        // Fuel
        const f = 100 - (progress * 80);
        this.telFuel.innerText = Math.max(20, Math.floor(f));
        
        // Thrust
        let thrust = 0;
        if (progress > 0.05 && progress < 0.8) thrust = 100;
        else if (progress >= 0.8) thrust = 10;
        
        this.telThrust.style.width = thrust + "%";

        // Phases
        let phase = "IDLE";
        let navMode = "STANDBY";
        
        if (progress < 0.05) { phase = "LAUNCH PAD IDLE"; }
        else if (progress < 0.15) { phase = "IGNITION"; navMode = "LAUNCH MODE"; }
        else if (progress < 0.30) { phase = "ENGINE RAMP"; navMode = "LAUNCH MODE"; }
        else if (progress < 0.50) { phase = "LIFT OFF"; navMode = "LAUNCH MODE"; }
        else if (progress < 0.70) { phase = "ATMOSPHERIC ASCENT"; navMode = "ASCENT TRAJECTORY"; }
        else if (progress < 0.85) { phase = "ORBITAL ENTRY"; navMode = "ORBITAL INSERTION"; }
        else { phase = "DEEP SPACE"; navMode = "NAVIGATION MODE"; }
        
        this.phaseText.innerText = phase;
        this.modeText.innerText = navMode;
    }
    
    renderFrame(index) {
        if(index < 0) index = 0;
        if(index >= this.frameCount) index = this.frameCount - 1;

        const cw = this.shipCanvas.width;
        const ch = this.shipCanvas.height;
        
        this.nebCtx.clearRect(0,0,cw,ch);
        this.shipCtx.clearRect(0,0,cw,ch);
        
        const img = this.images[index];
        
        if (img && img.complete && !img.isFailed && img.naturalWidth > 0) {
            this.drawExact(this.nebCtx, img, cw, ch);
            this.drawExact(this.shipCtx, img, cw, ch);
        } else {
            // Generative fallback in case the images are missing
            this.drawGenerativeFrame(index, cw, ch);
        }
    }
    
    drawExact(ctx, img, cw, ch) {
        ctx.drawImage(img, 0, 0, cw, ch);
    }
    
    drawGenerativeFrame(index, cw, ch) {
        const progress = index / this.frameCount;
        
        // Colors
        let r = 5, g = 5, b = 10;
        if (progress > 0.5) {
            const fade = Math.max(0, 1 - (progress - 0.5) * 3);
            r = Math.floor(11 * fade);
            g = Math.floor(19 * fade);
            b = Math.floor(43 * fade);
        }
        
        this.nebCtx.fillStyle = `rgb(${r},${g},${b})`;
        this.nebCtx.fillRect(0,0,cw,ch);
        this.shipCtx.fillStyle = `rgb(${r},${g},${b})`;
        this.shipCtx.fillRect(0,0,cw,ch);
        
        // Stars
        if (progress > 0.6) {
            this.shipCtx.fillStyle = 'white';
            const seed = 42;
            for(let i=0; i<300; i++) {
                const x = ((seed * i * 3.14) % 1) * cw;
                const y = ((seed * i * i * 1.5) % 1) * ch;
                const moveY = (y + (progress * ch * 0.5)) % ch;
                const size = (i % 3 === 0) ? 2 : 1;
                this.shipCtx.fillRect(x, moveY, size, size);
            }
        }

        const rocketW = Math.min(cw * 0.1, 80);
        const rocketH = rocketW * 4;
        const centerX = cw / 2;
        let rocketY = ch * 0.7;

        let shakeX = 0, shakeY = 0;

        if (progress > 0.1) {
            const easeY = Math.pow((progress - 0.1)*1.2, 3);
            rocketY -= easeY * ch * 2;
            
            if (progress < 0.6) {
                shakeX = (Math.random() - 0.5) * 6;
                shakeY = (Math.random() - 0.5) * 6;
            }
        }
        if (rocketY < -rocketH) return;

        // Ground
        if (progress < 0.4) {
            this.shipCtx.fillStyle = '#111';
            let groundY = ch * 0.7 + rocketH;
            groundY += (Math.pow(progress, 3) * ch * 1.5);
            this.shipCtx.fillRect(0, groundY, cw, ch);
            this.nebCtx.fillRect(0, groundY, cw, ch);
        }

        const rx = centerX - rocketW/2 + shakeX;
        const ry = rocketY + shakeY;

        // Thrust
        if (progress > 0.05 && progress < 0.9) {
            const thrustH = rocketH * (0.5 + Math.random());
            const grad = this.shipCtx.createLinearGradient(rx, ry + rocketH, rx, ry + rocketH + thrustH);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, '#00f0ff');
            grad.addColorStop(0.6, '#ff5a2c');
            grad.addColorStop(1, 'transparent');
            
            this.shipCtx.fillStyle = grad;
            this.shipCtx.beginPath();
            this.shipCtx.moveTo(rx + rocketW*0.2, ry + rocketH);
            this.shipCtx.lineTo(rx + rocketW*0.8, ry + rocketH);
            this.shipCtx.lineTo(rx + rocketW*0.5, ry + rocketH + thrustH);
            this.shipCtx.fill();
            
            this.nebCtx.fillStyle = grad;
            this.nebCtx.beginPath();
            this.nebCtx.moveTo(rx + rocketW*0.2, ry + rocketH);
            this.nebCtx.lineTo(rx + rocketW*0.8, ry + rocketH);
            this.nebCtx.lineTo(rx + rocketW*0.5, ry + rocketH + thrustH);
            this.nebCtx.fill();
        }

        // Smoke
        if (progress > 0.1 && progress < 0.5) {
            this.shipCtx.fillStyle = `rgba(200, 200, 200, ${0.5 - progress})`;
            for(let i=0; i<40; i++) {
                const sx = centerX + (Math.random()-0.5)*cw*progress*4;
                const sy = (ry + rocketH) + Math.random()*ch*0.5;
                const r = 30 + Math.random()*200*progress;
                this.shipCtx.beginPath();
                this.shipCtx.arc(sx, sy, r, 0, Math.PI*2);
                this.shipCtx.fill();
            }
        }

        // Rocket Body
        this.shipCtx.fillStyle = '#e0e0e0';
        this.shipCtx.fillRect(rx, ry, rocketW, rocketH);
        
        this.shipCtx.beginPath();
        this.shipCtx.moveTo(rx, ry);
        this.shipCtx.lineTo(rx + rocketW, ry);
        this.shipCtx.lineTo(rx + rocketW/2, ry - rocketH*0.4);
        this.shipCtx.fill();
        
        this.shipCtx.fillStyle = '#ff5a2c';
        this.shipCtx.fillRect(rx, ry+rocketH*0.2, rocketW, rocketH*0.1);
        
        this.shipCtx.fillStyle = '#00f0ff';
        this.shipCtx.fillRect(rx+rocketW*0.4, ry+rocketH*0.5, rocketW*0.2, rocketH*0.2);
    }
    
    startTimer() {
        let seconds = 0;
        setInterval(() => {
            seconds++;
            const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            this.timerElem.innerText = `T-PLUS ${h}:${m}:${s}`;
        }, 1000);
    }
    
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LaunchExperience();
});
