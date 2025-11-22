(function(){
  const DIAGRAM_LIBRARY = [];

  function initDiagrams(){
    if(typeof createChipCircuitDiagram === 'function'){
      DIAGRAM_LIBRARY.push(createChipCircuitDiagram());
    }
    if(typeof createNeuralNetworkDiagram === 'function'){
      DIAGRAM_LIBRARY.push(createNeuralNetworkDiagram());
    }
    if(typeof createSymbolicExecutionDiagram === 'function'){
      DIAGRAM_LIBRARY.push(createSymbolicExecutionDiagram());
    }
  }

  class HomeFx{
    constructor(canvas){
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = window.devicePixelRatio || 1;
      this.width = canvas.clientWidth;
      this.height = canvas.clientHeight;
      this.neonColor = getCssVariable('--home-neon') || '#ff8c32';
      this.neonRgb = hexToRgb(this.neonColor);
      this.starConfig = {
        backgroundCount: 32,
        diagramPoolSize: 65,
        speedFactor: 0.006,
        flashChance: 0.0008,
        flashFade: 0.0008
      };
      this.diagramTimings = {
        assemble: 1200,
        connect: 900,
        hold: 3200,
        fade: 1200,
        minDelay: 22000,
        maxDelay: 38000,
        delayIncrement: 12000,
        maxTotalDelay: 140000
      };
      this.stars = createStarsEngine(this.starConfig);
      this.activeDiagram = null;
      this.diagramIndex = 0;
      this.diagramIterations = 0;
      this.nextDiagramAt = performance.now() + randomRange(this.diagramTimings.minDelay, this.diagramTimings.maxDelay);
      this.lastTime = null;
      this.startTime = null;
      this.nameAnimationDelay = 4600;
      this.ticker = this.ticker.bind(this);
      this.handleResize = this.resizeCanvas.bind(this);
      window.addEventListener('resize', this.handleResize);
      this.resizeCanvas();
      this.seedStars();
    }

    seedStars(){
      this.stars.init(this.width, this.height, this.neonColor, this.neonRgb);
      this.stars.seed();
    }

    resizeCanvas(){
      const {canvas} = this;
      const prevWidth = this.width || canvas.clientWidth;
      const prevHeight = this.height || canvas.clientHeight;
      this.width = canvas.clientWidth;
      this.height = canvas.clientHeight;
      const targetWidth = this.width * this.dpr;
      const targetHeight = this.height * this.dpr;

      if(canvas.width !== targetWidth || canvas.height !== targetHeight){
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        if(typeof this.ctx.resetTransform === 'function'){
          this.ctx.resetTransform();
        }
        this.ctx.scale(this.dpr, this.dpr);
      }

      this.stars.resize(this.width, this.height);
    }

    toCanvasCoords(normalized){
      return {
        x: normalized.x * this.width,
        y: normalized.y * this.height
      };
    }

    start(){
      requestAnimationFrame(this.ticker);
    }

    ticker(time){
      if(!this.canvas.isConnected){
        window.removeEventListener('resize', this.handleResize);
        return;
      }

      if(!this.startTime){
        this.startTime = time;
      }

      if(!this.lastTime){
        this.lastTime = time;
      }

      const delta = time - this.lastTime;
      this.lastTime = time;
      this.update(delta, time);
      requestAnimationFrame(this.ticker);
    }

    update(delta, time){
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.updateBackgroundStars(delta, time);
      this.drawBackgroundStars();
      this.advanceDiagramState(time);
      if(!this.activeDiagram && time > this.nextDiagramAt){
        this.startDiagram(time);
      }
      if(this.activeDiagram){
        this.drawActiveDiagram(time);
      }
    }

    updateBackgroundStars(delta, time){
      this.stars.updateBackground(delta, time);

      if(this.activeDiagram){
        this.activeDiagram.stars.forEach((slot) => {
          this.updateDiagramStar(slot.star, this.activeDiagram, time);
        });
      }
    }

    updateDiagramStar(star, diagram, time){
      this.stars.updateDiagramStar(star, diagram, time);
    }

    drawBackgroundStars(){
      this.stars.drawBackground(this.ctx, this.startTime, this.nameAnimationDelay, !!this.activeDiagram);
    }

    startDiagram(time){
      const def = DIAGRAM_LIBRARY[this.diagramIndex % DIAGRAM_LIBRARY.length];
      const assignments = this.stars.allocateForDiagram(def.nodes, this.toCanvasCoords.bind(this));
      if(!assignments){
        this.nextDiagramAt = time + 6000;
        return;
      }

      this.activeDiagram = {
        def,
        stars: assignments,
        diagramStart: time,
        stage: 'assembling',
        assembleDuration: this.diagramTimings.assemble,
        connectDuration: this.diagramTimings.connect,
        holdDuration: this.diagramTimings.hold,
        fadeDuration: this.diagramTimings.fade,
        stageStartedAt: time
      };
      this.diagramIndex += 1;
      this.diagramIterations += 1;
      const extraDelay = Math.min(
        this.diagramIterations * this.diagramTimings.delayIncrement,
        this.diagramTimings.maxTotalDelay
      );
      const baseDelay = randomRange(this.diagramTimings.minDelay, this.diagramTimings.maxDelay);
      this.nextDiagramAt = time + baseDelay + extraDelay;
    }

    advanceDiagramState(time){
      if(!this.activeDiagram){
        return;
      }

      const diagram = this.activeDiagram;
      const {stage} = diagram;
      if(stage === 'assembling'){
        if(time - diagram.stageStartedAt >= diagram.assembleDuration){
          diagram.stage = 'connecting';
          diagram.stageStartedAt = time;
        }
      }else if(stage === 'connecting'){
        if(time - diagram.stageStartedAt >= diagram.connectDuration){
          diagram.stage = 'holding';
          diagram.stageStartedAt = time;
        }
      }else if(stage === 'holding'){
        if(time - diagram.stageStartedAt >= diagram.holdDuration){
          diagram.stage = 'fading';
          diagram.stageStartedAt = time;
        }
      }else if(stage === 'fading'){
        if(time - diagram.stageStartedAt >= diagram.fadeDuration){
          this.stars.releaseDiagramStars(diagram.stars);
          this.activeDiagram = null;
        }
      }
    }

    drawActiveDiagram(time){
      const diagram = this.activeDiagram;
      const elapsed = time - diagram.stageStartedAt;
      const stageDuration = diagram.stage === 'assembling'
        ? diagram.assembleDuration
        : diagram.stage === 'connecting'
          ? diagram.connectDuration
          : diagram.stage === 'holding'
            ? diagram.holdDuration
            : diagram.fadeDuration;
      const stageProgress = clamp(elapsed / stageDuration, 0, 1);
      const lightBoost = diagram.stage === 'holding'
        ? 1
        : diagram.stage === 'connecting'
          ? stageProgress
          : diagram.stage === 'assembling'
            ? 0
            : 1 - stageProgress;
      const fadeAlpha = diagram.stage === 'fading' ? 1 - stageProgress : 1;

      const stageInfo = {
        stage: diagram.stage,
        stageProgress,
        lightBoost,
        fadeAlpha,
        overallProgress: clamp(
          (time - diagram.diagramStart) /
            (diagram.assembleDuration + diagram.holdDuration + diagram.fadeDuration),
          0,
          1
        )
      };

      const util = {
        neonColor: this.neonColor,
        neonRgb: this.neonRgb,
        time,
        canvasWidth: this.width,
        canvasHeight: this.height,
        rgbaString,
        lerp,
        lerpPoint
      };

      diagram.def.render(this.ctx, util, diagram.stars, stageInfo);
    }
  }


  function initHomeFx(){
    const canvas = document.getElementById('homeFxCanvas');
    if(!canvas){
      return;
    }
    initDiagrams();
    const fx = new HomeFx(canvas);
    fx.start();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initHomeFx);
  }else{
    initHomeFx();
  }

  function getCssVariable(variable){
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }

  function hexToRgb(hex){
    const normalized = hex && hex.startsWith('#') ? hex.slice(1) : hex;
    if(!normalized || normalized.length < 6){
      return {r: 255, g: 140, b: 50};
    }
    const int = parseInt(normalized.slice(0, 6), 16);
    return {r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255};
  }

  function rgbaString(rgb, alpha){
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  function randomRange(min, max){
    return Math.random() * (max - min) + min;
  }

  function randomPosition(){
    return {x: Math.random(), y: Math.random()};
  }

  function takeRandom(array, count){
    const clone = array.slice();
    for(let i = clone.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone.slice(0, count);
  }

  function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, t){
    return start + (end - start) * t;
  }

  function lerpPoint(a, b, t){
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t)
    };
  }

  function easeInOutCubic(t){
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutCubic(t){
    return 1 - Math.pow(1 - t, 3);
  }
})();
