function createMathEquationsDiagram(){
  const shapes = [];

  // Helper: Linear interpolation
  const lerp = (a, b, t) => a + (b - a) * t;

  // --- Symbol 1: ∞ (Infinity) ---
  // Reduced steps from 40 to 24
  const posInf = {x: 0.78, y: 0.22, s: 0.10};
  const infinityNodes = [];
  const infSteps = 24;
  for(let i=0; i<infSteps; i++){
    const t = (i / infSteps) * 2 * Math.PI;
    const den = 1 + Math.sin(t)*Math.sin(t);
    const lx = (Math.cos(t)) / den;
    const ly = (Math.sin(t)*Math.cos(t)) / den;
    infinityNodes.push({
      x: posInf.x + lx * posInf.s,
      y: posInf.y - ly * posInf.s 
    });
  }
  shapes.push({pts: infinityNodes, closed: true});


  // --- Symbol 2: ∇ (Nabla) ---
  // Reduced subdivision from 6 to 4 (total 12 pts)
  const posNabla = {x: 0.5, y: 0.82, s: 0.07};
  const nablaBase = [
    {x: posNabla.x - posNabla.s*0.866, y: posNabla.y - posNabla.s*0.5},
    {x: posNabla.x + posNabla.s*0.866, y: posNabla.y - posNabla.s*0.5},
    {x: posNabla.x, y: posNabla.y + posNabla.s},
    {x: posNabla.x - posNabla.s*0.866, y: posNabla.y - posNabla.s*0.5}
  ];
  const subdivide = (pts, count) => {
    const out = [];
    for(let i=0; i<pts.length-1; i++){
      const p1 = pts[i];
      const p2 = pts[i+1];
      for(let j=0; j<count; j++){
        const t = j/count;
        out.push({
          x: lerp(p1.x, p2.x, t),
          y: lerp(p1.y, p2.y, t)
        });
      }
    }
    out.push(pts[pts.length-1]);
    return out;
  };
  shapes.push({pts: subdivide(nablaBase, 4), closed: false});


  // --- Symbol 3: ∫ (Integral) ---
  // Reduced steps from 24 to 16
  const posInt = {x: 0.15, y: 0.5, sX: 0.06, sY: 0.12}; 
  const integralNodes = [];
  const intSteps = 16;
  for(let i=0; i<=intSteps; i++){
    const t = i/intSteps;
    const omt = 1-t;
    const p0 = {x: 0.4, y: -0.9};
    const p1 = {x: -0.6, y: -0.9};
    const p2 = {x: 0.6, y: 0.9};
    const p3 = {x: -0.4, y: 0.9};
    
    const bx = omt*omt*omt*p0.x + 3*omt*omt*t*p1.x + 3*omt*t*t*p2.x + t*t*t*p3.x;
    const by = omt*omt*omt*p0.y + 3*omt*omt*t*p1.y + 3*omt*t*t*p2.y + t*t*t*p3.y;
    
    integralNodes.push({
      x: posInt.x + bx * posInt.sX,
      y: posInt.y + by * posInt.sY
    });
  }
  shapes.push({pts: integralNodes, closed: false});


  // --- Symbol 4: ∂ (Partial Derivative) ---
  // Parametric approx
  const posPart = {x: 0.22, y: 0.22, s: 0.08};
  const partialNodes = [];
  const partSteps = 18;
  for(let i=0; i<=partSteps; i++){
    const t = i/partSteps; // 0 to 1
    // Use a composite bezier or simpler parametric
    // Let's trace a '6' shape rotated.
    // x = sin(t) + 0.5sin(2t), y = cos(t) ...
    // Let's use manual keypoints + subdivision like Nabla
    // Keypoints for '∂': Top-right curve start, loop left-down, big belly right, curve up-left
  }
  // Actually, let's use the keypoint subdivision method for ∂ as well
  const partialKeys = [
    {x: 0.3, y: -0.8}, {x: -0.1, y: -0.9}, {x: -0.5, y: -0.5}, // Top hook
    {x: -0.2, y: 0.2}, {x: 0.4, y: 0.5}, {x: 0.2, y: 0.9},     // Bottom belly
    {x: -0.4, y: 0.6}, {x: -0.2, y: 0.2}                       // Loop back
  ];
  // Scale and place
  const mappedPartial = partialKeys.map(p => ({
    x: posPart.x + p.x * posPart.s,
    y: posPart.y + p.y * posPart.s
  }));
  // Subdivide carefully - 3 steps per segment
  const smoothPartial = [];
  // We need smooth curves, so subdivision needs to be Catmull-Rom or Quadratic
  // For simplicity in wireframe, linear subdivision of many points works OK if points are close
  // Let's just use the subdivision function on these keypoints
  shapes.push({pts: subdivide(mappedPartial, 3), closed: false});


  // --- Symbol 5: ∑ (Sigma) ---
  const posSig = {x: 0.82, y: 0.65, s: 0.08};
  const sigmaKeys = [
    {x: 0.6, y: -0.8}, {x: -0.6, y: -0.8}, // Top bar
    {x: 0.2, y: 0.0},                      // Middle point
    {x: -0.6, y: 0.8}, {x: 0.6, y: 0.8}    // Bottom bar
  ];
  const mappedSigma = sigmaKeys.map(p => ({
    x: posSig.x + p.x * posSig.s,
    y: posSig.y + p.y * posSig.s
  }));
  shapes.push({pts: subdivide(mappedSigma, 4), closed: false});


  // --- Symbol 6: ⊕ (Direct Sum) ---
  const posOplus = {x: 0.5, y: 0.45, s: 0.06};
  const oplusNodes = [];
  const circleSteps = 16;
  // Circle
  for(let i=0; i<circleSteps; i++){
    const a = (i/circleSteps) * Math.PI * 2;
    oplusNodes.push({
      x: posOplus.x + Math.cos(a) * posOplus.s,
      y: posOplus.y + Math.sin(a) * posOplus.s
    });
  }
  // Cross inside (Horizontal then Vertical)
  // To make it one connected path is hard without backtracking.
  // We can just add them as separate lines if we allow disjoint shapes.
  // The render logic connects sequentially. We need "jump" or just add them as separate shape entries.
  // Let's push the circle first.
  shapes.push({pts: oplusNodes, closed: true});
  
  // Cross lines as separate shapes (2 points each, subdivided)
  const crossH = [
    {x: posOplus.x - posOplus.s, y: posOplus.y},
    {x: posOplus.x + posOplus.s, y: posOplus.y}
  ];
  const crossV = [
    {x: posOplus.x, y: posOplus.y - posOplus.s},
    {x: posOplus.x, y: posOplus.y + posOplus.s}
  ];
  shapes.push({pts: subdivide(crossH, 3), closed: false});
  shapes.push({pts: subdivide(crossV, 3), closed: false});


  // --- Flatten nodes and connections ---
  const nodes = [];
  const connections = [];
  let offset = 0;

  shapes.forEach(shape => {
    shape.pts.forEach(p => nodes.push(p));
    for(let i=0; i<shape.pts.length-1; i++){
      connections.push([offset + i, offset + i + 1]);
    }
    if(shape.closed){
      connections.push([offset + shape.pts.length - 1, offset]);
    }
    offset += shape.pts.length;
  });

  return {
    id: 'math-equations',
    duration: 4800,
    nodes,
    render(ctx, util, assigned, stage){
      const points = assigned.map((slot) => ({x: slot.star.x, y: slot.star.y}));
      const alpha = stage.fadeAlpha;
      const time = util.time || 0;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 14;
      ctx.shadowColor = util.neonColor;

      if(stage.stage !== 'assembling'){
        const lineColor = util.rgbaString(util.neonRgb, 0.4 + 0.5 * stage.lightBoost);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.0;
        
        connections.forEach(([a, b], idx) => {
          const ax = points[a].x;
          const ay = points[a].y;
          const bx = points[b].x;
          const by = points[b].y;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();

          // Traveling neon highlight along the segment
          const progress = ((time * 0.00025) + idx * 0.18) % 1;
          const length = 0.25; // portion of the segment
          const drawHighlight = (startT) => {
            const endT = Math.min(startT + length, 1);
            const hx1 = ax + (bx - ax) * startT;
            const hy1 = ay + (by - ay) * startT;
            const hx2 = ax + (bx - ax) * endT;
            const hy2 = ay + (by - ay) * endT;
            ctx.save();
            ctx.strokeStyle = util.rgbaString(util.neonRgb, 0.65 + 0.35 * stage.lightBoost);
            ctx.lineWidth = 3;
            ctx.shadowBlur = 28;
            ctx.shadowColor = util.neonColor;
            ctx.beginPath();
            ctx.moveTo(hx1, hy1);
            ctx.lineTo(hx2, hy2);
            ctx.stroke();
            ctx.restore();
            return endT;
          };

          const endT = drawHighlight(progress);
          if(progress + length > 1){
            drawHighlight(0);
          }
        });
      }

      points.forEach((pt, idx) => {
        const pulse = Math.sin(time * 0.004 + idx * 0.8) * 0.5 + 0.5;
        const size = 2.0 + pulse * 1.8;
        const glow = 0.45 + 0.55 * Math.max(stage.lightBoost, pulse);
        ctx.fillStyle = util.rgbaString(util.neonRgb, glow);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  };
}
