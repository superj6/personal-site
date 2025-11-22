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

  // --- Sites (fill entire canvas) ---
  const s0 = addSite(0.08, 0.20);
  const s1 = addSite(0.15, 0.70);
  const s2 = addSite(0.25, 0.35);
  const s3 = addSite(0.30, 0.88);
  const s4 = addSite(0.42, 0.08);
  const s5 = addSite(0.50, 0.55);
  const s6 = addSite(0.58, 0.92);
  const s7 = addSite(0.68, 0.28);
  const s8 = addSite(0.75, 0.72);
  const s9 = addSite(0.85, 0.15);
  const s10 = addSite(0.92, 0.50);
  const s11 = addSite(0.88, 0.90);

  // --- Delaunay Triangulation ---
  const delaunayEdges = [
    // Layer 0-1
    [s0, s1], [s0, s2], [s1, s2],
    // Layer 1-2
    [s2, s4], [s1, s3], [s2, s3],
    [s2, s5], [s4, s5], [s4, s7],
    // Layer 2-3
    [s3, s6], [s5, s6], [s5, s7],
    [s7, s9], [s5, s8], [s7, s8],
    // Cross connections
    [s1, s5], [s6, s8], [s8, s10],
    [s9, s10], [s8, s11], [s10, s11],
    [s7, s10]
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
      if(stage.stage !== 'assembling'){
        ctx.shadowBlur = 8;
        ctx.shadowColor = util.neonColor;
        ctx.strokeStyle = util.rgbaString(util.neonRgb, 0.22 + 0.25 * stage.lightBoost);
        ctx.lineWidth = 1.0;
        
        connections.forEach(([a, b]) => {
          const pA = points[a];
          const pB = points[b];
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
        });
      }

      // --- 2. Draw animated sweep line (VERTICAL line moving left-to-right) ---
      const sweepXPx = sweepX * util.canvasWidth;
      const gradient = ctx.createLinearGradient(sweepXPx - 20, 0, sweepXPx + 20, 0);
      gradient.addColorStop(0, util.rgbaString(util.neonRgb, 0));
      gradient.addColorStop(0.5, util.rgbaString(util.neonRgb, 0.7));
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
      ctx.shadowBlur = 16;
      ctx.shadowColor = util.neonColor;
      
      siteIndices.forEach((siteIdx, i) => {
        const site = nodes[siteIdx];
        if(site.x < sweepX){
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
          ctx.strokeStyle = util.rgbaString(util.neonRgb, 0.5 + 0.4 * stage.lightBoost);
          ctx.lineWidth = 2.2;
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
          ctx.fillStyle = util.rgbaString(util.neonRgb, 0.9);
          ctx.shadowBlur = 20;
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
        
        const size = isActive ? 5.0 : 3.5;
        const baseAlpha = isActive ? 0.95 : 0.55;
        const pulse = Math.sin(time * 0.003 + index) * 0.2 + 0.8;
        
        ctx.shadowBlur = size * 3;
        ctx.shadowColor = util.neonColor;
        ctx.fillStyle = isActive 
          ? util.rgbaString(util.neonRgb, (baseAlpha + 0.2) * pulse)
          : util.rgbaString(util.neonRgb, baseAlpha);
        
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  };
}
