(function(){
  function createStarsEngine(config){
    const cfg = Object.assign({
      backgroundCount: 32,
      diagramPoolSize: 65,
      flashChance: 0.0008,
      flashFade: 0.0012
    }, config || {});

    const engine = {
      config: cfg,
      backgroundStars: [],
      diagramStars: [],
      width: 0,
      height: 0,
      neonColor: '#ffffff',
      neonRgb: {r:255,g:255,b:255},

      init(width, height, neonColor, neonRgb){
        this.width = width;
        this.height = height;
        this.neonColor = neonColor;
        this.neonRgb = neonRgb;
      },

      seed(){
        this.backgroundStars = Array.from({length: this.config.backgroundCount}).map(() => this.createStar());
        this.diagramStars = Array.from({length: this.config.diagramPoolSize}).map(() => this.createStar());
      },

      createStar(){
        const star = {
          x: 0,
          y: 0,
          radius: rr(0.9, 2.1),
          flash: 0,
          flashCooldown: rr(2500, 6000),
          fadeIn: 0,
          fadeInDuration: 800,
          state: 'idle',
          hasFlashed: false
        };
        this.scatterStar(star);
        return star;
      },

      scatterStar(star){
        star.x = Math.random() * this.width;
        star.y = Math.random() * this.height;
        star.fadeIn = 0;
        star.flash = 0;
        star.hasFlashed = false;
        star.flashCooldown = rr(2500, 6000);
      },

      resize(width, height){
        const prevW = this.width || width;
        const prevH = this.height || height;
        this.width = width;
        this.height = height;
        const sx = prevW ? width / prevW : 1;
        const sy = prevH ? height / prevH : 1;
        const all = this.backgroundStars.concat(this.diagramStars);
        all.forEach((star) => {
          star.x *= sx;
          star.y *= sy;
          if(star.diagramTargetNorm){
            star.diagramTarget = {x: star.diagramTargetNorm.x * this.width, y: star.diagramTargetNorm.y * this.height};
          }
        });
      },

      updateBackground(delta, time){
        this.backgroundStars.forEach((star) => {
          star.fadeIn = Math.min(star.fadeIn + delta, star.fadeInDuration);
          star.flashCooldown -= delta;

          if(star.flashCooldown <= 0 && !star.hasFlashed){
            star.flash = 1;
            star.hasFlashed = true;
          }

          if(star.flash > 0){
            star.flash = Math.max(0, star.flash - this.config.flashFade * delta);
            if(star.flash <= 0.02){
              this.scatterStar(star);
            }
          }
        });
      },

      drawBackground(ctx, startTime, nameDelay, hasActiveDiagram){
        const elapsedSinceStart = performance.now() - (startTime || 0);
        const showStars = elapsedSinceStart > nameDelay;
        if(!showStars || hasActiveDiagram){
          return;
        }
        this.backgroundStars.forEach((star) => {
          if(star.flash <= 0.02){
            return;
          }
          const fadeInProgress = clamp(star.fadeIn / star.fadeInDuration, 0, 1);
          const fadeInAlpha = easeOutCubic(fadeInProgress);
          const alpha = clamp(star.flash * fadeInAlpha, 0, 1);
          if(alpha < 0.05){
            return;
          }
          ctx.save();
          ctx.shadowBlur = 18 * (0.7 + alpha);
          ctx.shadowColor = this.neonColor;
          ctx.fillStyle = `rgba(${this.neonRgb.r}, ${this.neonRgb.g}, ${this.neonRgb.b}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * (1 + star.flash * 0.5), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      },

      updateDiagramStar(star, diagram, time){
        const stage = diagram.stage;
        if(stage === 'assembling'){
          const t = clamp((time - diagram.stageStartedAt) / diagram.assembleDuration, 0, 1);
          const eased = easeInOutCubic(t);
          star.x = lerp(star.origin.x, star.diagramTarget.x, eased);
          star.y = lerp(star.origin.y, star.diagramTarget.y, eased);
        }else{
          star.x = star.diagramTarget.x;
          star.y = star.diagramTarget.y;
        }
      },

      allocateForDiagram(nodes, toCanvasCoords){
        const idle = this.diagramStars.filter((s) => s.state === 'idle');
        if(idle.length < nodes.length){
          return null;
        }
        const selected = takeRandom(idle, nodes.length);
        return nodes.map((node, index) => {
          const star = selected[index];
          star.state = 'diagram';
          star.origin = {x: star.x, y: star.y};
          star.diagramTargetNorm = node;
          star.diagramTarget = toCanvasCoords(node);
          return {star, nodeIndex: index};
        });
      },

      releaseDiagramStars(assignments){
        assignments.forEach((slot) => {
          slot.star.state = 'idle';
          slot.star.origin = null;
          slot.star.diagramTarget = null;
          slot.star.diagramTargetNorm = null;
          this.scatterStar(slot.star);
        });
      }
    };

    function rr(min, max){ return Math.random() * (max - min) + min; }
    function clamp(value, min, max){ return Math.min(Math.max(value, min), max); }
    function lerp(start, end, t){ return start + (end - start) * t; }
    function easeInOutCubic(t){ return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
    function takeRandom(array, count){ const clone = array.slice(); for(let i = clone.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [clone[i], clone[j]] = [clone[j], clone[i]]; } return clone.slice(0, count); }

    return engine;
  }

  window.createStarsEngine = createStarsEngine;
})();
