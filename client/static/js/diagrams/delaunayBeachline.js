function createDelaunayBeachlineDiagram(){
  const nodes = [];
  const connections = [];
  const siteIndices = [];

  const addSite = (x, y) => {
    const index = nodes.length;
    nodes.push({x, y});
    siteIndices.push(index);
    return index;
  };

  const addEdge = (a, b) => {
    connections.push([a, b]);
  };

  // Generate parabolic arc for LEFT-TO-RIGHT sweep
  const createArc = (focus, directrixX, topBound, bottomBound, steps = 24) => {
    const points = [];
    const p = Math.abs(focus.x - directrixX) / 2;
    if(p < 0.001) return points;
    
    const vertexX = (focus.x + directrixX) / 2;
    for(let i = 0; i <= steps; i++){
      const t = i / steps;
      const y = topBound + (bottomBound - topBound) * t;
      const dy = y - focus.y;
      const x = vertexX + (dy * dy) / (4 * p);
      
      if(x >= directrixX && x <= 1.0){
        points.push({x, y});
      }
    }
    return points;
  };

  // --- Sites (spread but planar-friendly) ---
  const s0 = addSite(0.05, 0.12);
  const s1 = addSite(0.12, 0.45);
  const s2 = addSite(0.10, 0.90);
  const s3 = addSite(0.32, 0.06);
  const s4 = addSite(0.36, 0.50);
  const s5 = addSite(0.30, 0.96);
  const s6 = addSite(0.60, 0.16);
  const s7 = addSite(0.62, 0.82);
  const s8 = addSite(0.84, 0.08);
  const s9 = addSite(0.87, 0.46);
  const s10 = addSite(0.92, 0.92);

  // --- Delaunay Triangulation (planar mesh) ---
  const delaunayEdges = [
    [s0, s1], [s1, s2], [s0, s3], [s1, s3],
    [s1, s4], [s2, s4], [s2, s5],
    [s3, s4], [s4, s5],
    [s3, s6], [s4, s6], [s4, s7], [s5, s7],
    [s6, s7],
    [s6, s8], [s6, s9], [s7, s9], [s7, s10],
    [s8, s9], [s9, s10]
  ];
  delaunayEdges.forEach(([a, b]) => addEdge(a, b));

  return {
    id: 'delaunay-beachline',
    duration: 5800,
    nodes,
    render(ctx, util, assigned, stage){
      const points = assigned.map((slot) => ({x: slot.star.x, y: slot.star.y}));
      const alpha = stage.fadeAlpha;
      const time = util.time || 0;
      
      // Animated sweep line position (LEFT TO RIGHT)
      const sweepCycle = (time * 0.00008) % 1;
      const sweepX = 0.10 + sweepCycle * 0.80;

      ctx.save();
      ctx.globalAlpha = alpha;

      // --- 1. Draw Delaunay triangulation (subdued) ---
      const connectionBlend = stage.stage === 'assembling'
        ? 0
        : stage.stage === 'connecting'
          ? stage.stageProgress
          : stage.stage === 'holding'
            ? 1
            : stage.stage === 'fading'
              ? Math.max(0, 1 - stage.stageProgress)
              : 1;
      const nodeBlend = stage.stage === 'assembling'
        ? stage.stageProgress
        : stage.stage === 'connecting' || stage.stage === 'holding'
          ? 1
          : stage.stage === 'fading'
            ? Math.max(0, 1 - stage.stageProgress)
            : 1;
      const edgeAppear = Math.max(0.0001, connectionBlend);
      const lineAlpha = (0.22 + 0.25 * stage.lightBoost) * edgeAppear;
      ctx.shadowBlur = 8;
      ctx.shadowColor = util.neonColor;
      ctx.strokeStyle = util.rgbaString(util.neonRgb, lineAlpha);
      ctx.lineWidth = (0.8 + 0.4 * stage.lightBoost) * edgeAppear;
      
      connections.forEach(([a, b]) => {
        const pA = points[a];
        const pB = points[b];
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      });

      // --- 2. Draw animated sweep line (VERTICAL line moving left-to-right) ---
      const sweepXPx = sweepX * util.canvasWidth;
      const gradient = ctx.createLinearGradient(sweepXPx - 20, 0, sweepXPx + 20, 0);
      gradient.addColorStop(0, util.rgbaString(util.neonRgb, 0));
      gradient.addColorStop(0.5, util.rgbaString(util.neonRgb, 0.7 * edgeAppear));
      gradient.addColorStop(1, util.rgbaString(util.neonRgb, 0));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 18;
      ctx.shadowColor = util.neonColor;
      ctx.beginPath();
      ctx.moveTo(sweepXPx, 0);
      ctx.lineTo(sweepXPx, util.canvasHeight);
      ctx.stroke();

      // --- 3. Draw beachline arcs (only for sites left of sweep) ---
      ctx.shadowBlur = 16 * edgeAppear;
      ctx.shadowColor = util.neonColor;
      
      siteIndices.forEach((siteIdx, i) => {
        const site = nodes[siteIdx];
        if(site.x < sweepX){
          if(edgeAppear < 0.01) return;
          // Determine arc bounds (top to bottom span)
          const topBound = Math.max(0.05, site.y - 0.35);
          const bottomBound = Math.min(0.95, site.y + 0.35);
          
          const arcPoints = createArc(site, sweepX, topBound, bottomBound, 28);
          if(arcPoints.length < 2) return;
          
          // Map to canvas
          const canvasPoints = arcPoints.map(p => ({
            x: p.x * util.canvasWidth,
            y: p.y * util.canvasHeight
          }));
          
          // Draw arc with highlight effect
          ctx.strokeStyle = util.rgbaString(util.neonRgb, (0.5 + 0.4 * stage.lightBoost) * edgeAppear);
          ctx.lineWidth = 2.2 * edgeAppear;
          ctx.beginPath();
          ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
          for(let j = 1; j < canvasPoints.length; j++){
            ctx.lineTo(canvasPoints[j].x, canvasPoints[j].y);
          }
          ctx.stroke();
          
          // Traveling pulse on arc
          const pulsePos = ((time * 0.0004) + i * 0.4) % 1;
          const pulseIdx = Math.floor(pulsePos * (canvasPoints.length - 1));
          const pulsePoint = canvasPoints[pulseIdx];
          ctx.fillStyle = util.rgbaString(util.neonRgb, 0.9 * edgeAppear);
          ctx.shadowBlur = 20 * edgeAppear;
          ctx.beginPath();
          ctx.arc(pulsePoint.x, pulsePoint.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- 4. Draw site points ---
      points.forEach((pt, index) => {
        const isSite = siteIndices.includes(index);
        if(!isSite) return;
        
        const site = nodes[index];
        const isActive = site.x < sweepX;
        
        const size = isActive ? 3.2 : 2.4;
        const baseAlpha = isActive ? 0.85 : 0.45;
        const pulse = Math.sin(time * 0.003 + index) * 0.2 + 0.8;
        
        ctx.shadowBlur = size * 2.2 * nodeBlend;
        ctx.shadowColor = util.neonColor;
        ctx.fillStyle = isActive 
          ? util.rgbaString(util.neonRgb, (baseAlpha + 0.2) * pulse * nodeBlend)
          : util.rgbaString(util.neonRgb, baseAlpha * nodeBlend);
        
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  };
}
