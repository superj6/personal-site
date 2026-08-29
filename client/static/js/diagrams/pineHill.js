function createPineHillDiagram(){
  // A hill with pine trees under a sun. Node positions are normalized to the
  // canvas, but the canvas is a full-viewport rectangle, so anything that must
  // keep its shape (the sun, tree proportions) is laid out against the live
  // aspect ratio and memoized per canvas size.
  const SUN_CENTER = {x: 0.80, y: 0.21};
  const RAY_COUNT = 8;
  const TREES = [
    {cx: 0.20, h: 0.27, tiers: 3},
    {cx: 0.39, h: 0.38, tiers: 4},
    {cx: 0.54, h: 0.24, tiers: 3},
    {cx: 0.70, h: 0.13, tiers: 2}
  ];
  const HILL_SAMPLES = 11;

  const hillY = (x) => 0.90 - 0.22 * Math.cos((x - 0.42) * Math.PI / 1.15);

  function measure(){
    const canvas = document.getElementById('homeFxCanvas');
    const w = (canvas && canvas.clientWidth) || window.innerWidth || 1;
    const h = (canvas && canvas.clientHeight) || window.innerHeight || 1;
    return {w, h};
  }

  let cached = null;
  function layout(){
    const {w, h} = measure();
    const key = `${w}x${h}`;
    if(cached && cached.key === key) return cached;

    const aspect = w / h;
    const nodes = [];
    const add = (x, y) => { nodes.push({x, y}); return nodes.length - 1; };

    // --- Hill: sampled ridge line from left edge to right edge ---
    const hill = [];
    for(let i = 0; i < HILL_SAMPLES; i++){
      const x = 0.03 + (0.94 * i) / (HILL_SAMPLES - 1);
      hill.push(add(x, hillY(x)));
    }

    // --- Pine trees: closed zig-zag outline with a short trunk ---
    // Portrait screens are narrow, so trees shrink to keep their spacing along the hill.
    const heightScale = Math.min(1, Math.max(0.55, aspect / 1.6));
    const trees = TREES.map((tree) => {
      const baseY = hillY(tree.cx);
      const treeH = tree.h * heightScale;
      const apexY = baseY - treeH;
      // Half-width in x units, sized relative to height so trees stay tall on any screen.
      const halfWidth = Math.min((treeH * 0.27) / aspect, 0.09);
      const trunkHalf = halfWidth * 0.14;
      const trunkTopY = baseY - treeH * 0.12;

      const apex = add(tree.cx, apexY);
      const left = [];
      const right = [];
      for(let t = 0; t < tree.tiers; t++){
        const f = (t + 1) / tree.tiers;              // 0..1 down the canopy
        const y = apexY + (trunkTopY - apexY) * f;
        const hw = halfWidth * (0.35 + 0.65 * f);    // widen toward the bottom
        left.push(add(tree.cx - hw, y));
        right.push(add(tree.cx + hw, y));
        if(t < tree.tiers - 1){
          // Notch: outline tucks back in before the next tier flares out.
          const ny = y + (trunkTopY - apexY) * 0.05;
          left.push(add(tree.cx - hw * 0.45, ny));
          right.push(add(tree.cx + hw * 0.45, ny));
        }
      }
      const trunk = [
        add(tree.cx - trunkHalf, trunkTopY),
        add(tree.cx - trunkHalf, baseY),
        add(tree.cx + trunkHalf, baseY),
        add(tree.cx + trunkHalf, trunkTopY)
      ];
      // Outline order: apex, down the left side, across the trunk, up the right side.
      const outline = [apex, ...left, ...trunk, ...right.slice().reverse()];
      return {outline, apex, base: baseY};
    });

    // --- Sun: center star plus a ring of ray tips, circular in pixel space ---
    const sunRadiusPx = Math.min(h * 0.075, w * 0.06);
    const rayTipPx = sunRadiusPx * 1.85;
    const sunCenter = add(SUN_CENTER.x, SUN_CENTER.y);
    const rays = [];
    for(let i = 0; i < RAY_COUNT; i++){
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / RAY_COUNT + Math.PI / RAY_COUNT;
      rays.push(add(
        SUN_CENTER.x + (Math.cos(angle) * rayTipPx) / w,
        SUN_CENTER.y + (Math.sin(angle) * rayTipPx) / h
      ));
    }

    cached = {key, nodes, hill, trees, sunCenter, rays, sunRadiusPx};
    return cached;
  }

  function stageBlends(stage){
    const s = stage.stage;
    const p = stage.stageProgress;
    const connection = s === 'assembling' ? 0 : s === 'connecting' ? p : s === 'fading' ? Math.max(0, 1 - p) : 1;
    const node = s === 'assembling' ? p : s === 'fading' ? Math.max(0, 1 - p) : 1;
    return {connection, node};
  }

  function tracePolyline(ctx, pts, closed){
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for(let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    if(closed) ctx.closePath();
  }

  // Smooth curve through points using midpoint quadratic segments.
  function traceSmooth(ctx, pts){
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for(let i = 1; i < pts.length - 1; i++){
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  return {
    id: 'pine-hill',
    duration: 5400,
    get nodes(){ return layout().nodes; },
    render(ctx, util, assigned, stage){
      const geo = layout();
      const points = assigned.map((slot) => ({x: slot.star.x, y: slot.star.y}));
      const time = util.time || 0;
      const {connection, node} = stageBlends(stage);
      const edge = Math.max(0.0001, connection);
      const glow = stage.lightBoost;
      const neon = util.neonRgb;

      ctx.save();
      ctx.globalAlpha = stage.fadeAlpha;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = util.neonColor;

      // --- Hill ridge with a faint body beneath it ---
      const hillPts = geo.hill.map((i) => points[i]);
      if(edge > 0.01){
        const groundY = util.canvasHeight + 4;
        const fill = ctx.createLinearGradient(0, hillPts[0].y - util.canvasHeight * 0.25, 0, groundY);
        fill.addColorStop(0, util.rgbaString(neon, 0.11 * edge));
        fill.addColorStop(1, util.rgbaString(neon, 0));
        traceSmooth(ctx, hillPts);
        ctx.lineTo(hillPts[hillPts.length - 1].x, groundY);
        ctx.lineTo(hillPts[0].x, groundY);
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.strokeStyle = util.rgbaString(neon, (0.40 + 0.30 * glow) * edge);
        ctx.lineWidth = (1.4 + 0.5 * glow) * edge;
        traceSmooth(ctx, hillPts);
        ctx.stroke();
      }

      // --- Pine trees ---
      if(edge > 0.01){
        geo.trees.forEach((tree, treeIndex) => {
          const outline = tree.outline.map((i) => points[i]);
          // Each tree's outline draws in with a slight stagger during 'connecting'.
          const local = Math.min(1, Math.max(0, (connection - treeIndex * 0.08) / 0.76));
          if(local <= 0) return;
          const visibleCount = Math.max(2, Math.round(outline.length * local));
          const visible = outline.slice(0, visibleCount);

          ctx.shadowBlur = 12;
          ctx.strokeStyle = util.rgbaString(neon, (0.45 + 0.35 * glow) * edge);
          ctx.lineWidth = (1.3 + 0.5 * glow) * edge;
          tracePolyline(ctx, visible, local >= 1);
          ctx.stroke();

          if(local >= 1){
            ctx.shadowBlur = 0;
            ctx.fillStyle = util.rgbaString(neon, 0.06 * edge);
            tracePolyline(ctx, outline, true);
            ctx.fill();
          }
        });
      }

      // --- Sun ---
      const sunCenter = points[geo.sunCenter];
      const r = geo.sunRadiusPx;
      if(edge > 0.01){
        const breathe = 1 + 0.05 * Math.sin(time * 0.0016);

        // Warm core glow.
        const core = ctx.createRadialGradient(sunCenter.x, sunCenter.y, 0, sunCenter.x, sunCenter.y, r * 1.6);
        core.addColorStop(0, util.rgbaString(neon, 0.28 * edge));
        core.addColorStop(0.55, util.rgbaString(neon, 0.08 * edge));
        core.addColorStop(1, util.rgbaString(neon, 0));
        ctx.shadowBlur = 0;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(sunCenter.x, sunCenter.y, r * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Disc.
        ctx.shadowBlur = 18;
        ctx.strokeStyle = util.rgbaString(neon, (0.55 + 0.35 * glow) * edge);
        ctx.lineWidth = (1.8 + 0.6 * glow) * edge;
        ctx.beginPath();
        ctx.arc(sunCenter.x, sunCenter.y, r * breathe, 0, Math.PI * 2);
        ctx.stroke();

        // Rays from just outside the disc to each tip star, with pulses running outward.
        geo.rays.forEach((tipIndex, i) => {
          const tip = points[tipIndex];
          const dx = tip.x - sunCenter.x;
          const dy = tip.y - sunCenter.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const start = {x: sunCenter.x + ux * r * 1.22 * breathe, y: sunCenter.y + uy * r * 1.22 * breathe};

          ctx.shadowBlur = 12;
          ctx.strokeStyle = util.rgbaString(neon, (0.35 + 0.35 * glow) * edge);
          ctx.lineWidth = (1.2 + 0.4 * glow) * edge;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(tip.x, tip.y);
          ctx.stroke();

          const pulseT = ((time * 0.00045) + i / RAY_COUNT) % 1;
          const pulse = util.lerpPoint(start, tip, pulseT);
          ctx.fillStyle = util.rgbaString(neon, 0.85 * edge * (1 - pulseT * 0.5));
          ctx.shadowBlur = 16 * edge;
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, 2.6, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // --- Node stars ---
      points.forEach((pt, index) => {
        const isSun = index === geo.sunCenter;
        const isApex = geo.trees.some((t) => t.apex === index);
        const twinkle = 0.85 + 0.15 * Math.sin(time * 0.003 + index * 1.7);
        const size = isSun ? 4.4 : isApex ? 3.2 : 2.6;
        const alpha = (isSun ? 0.95 : 0.55 + 0.3 * glow) * twinkle * node;
        ctx.shadowBlur = size * 2.4 * node;
        ctx.fillStyle = util.rgbaString(neon, alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  };
}
