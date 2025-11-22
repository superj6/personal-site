window.createAiFaceDiagram = function(){
  const shapes = [];
  
  // Helper: Smooth subdivision
  const subdivide = (pts, count) => {
    const out = [];
    for(let i=0; i<pts.length-1; i++){
      const p1 = pts[i];
      const p2 = pts[i+1];
      for(let j=0; j<count; j++){
        const t = j/count;
        out.push({
          x: p1.x + (p2.x - p1.x)*t,
          y: p1.y + (p2.y - p1.y)*t
        });
      }
    }
    out.push(pts[pts.length-1]);
    return out;
  };

  // --- 1. EYES (Simple with Star Pupils) ---
  
  // Helper: Create Star Pupil
  const createStar = (cx, cy, r) => {
    const pts = [];
    for(let i=0; i<12; i++){
      const a = (i * Math.PI * 2) / 12 - Math.PI/2;
      const currentR = (i % 2 === 0) ? r : r * 0.4;
      pts.push({
        x: cx + Math.cos(a) * currentR * 0.7,
        y: cy + Math.sin(a) * currentR
      });
    }
    return pts;
  };
  
  // 1. Pupils (The Stars) - Focal point
  shapes.push({pts: createStar(0.38, 0.42, 0.09), closed: true, twinkle: true});
  shapes.push({pts: createStar(0.62, 0.42, 0.09), closed: true, twinkle: true});

  // 2. Simple Eye Outlines
  shapes.push({pts: subdivide([{x:0.28, y:0.42}, {x:0.33, y:0.38}, {x:0.38, y:0.36}, {x:0.43, y:0.38}, {x:0.48, y:0.42}], 5), closed: false});
  shapes.push({pts: subdivide([{x:0.28, y:0.42}, {x:0.33, y:0.44}, {x:0.38, y:0.45}, {x:0.43, y:0.44}, {x:0.48, y:0.42}], 5), closed: false});
  
  shapes.push({pts: subdivide([{x:0.52, y:0.42}, {x:0.57, y:0.38}, {x:0.62, y:0.36}, {x:0.67, y:0.38}, {x:0.72, y:0.42}], 5), closed: false});
  shapes.push({pts: subdivide([{x:0.52, y:0.42}, {x:0.57, y:0.44}, {x:0.62, y:0.45}, {x:0.67, y:0.44}, {x:0.72, y:0.42}], 5), closed: false});

  // 3. Eyebrows (Thicker, masculine)
  shapes.push({pts: subdivide([{x:0.28, y:0.30}, {x:0.35, y:0.27}, {x:0.45, y:0.30}], 5), closed: false});
  shapes.push({pts: subdivide([{x:0.28, y:0.31}, {x:0.35, y:0.28}, {x:0.45, y:0.31}], 3), closed: false});
  
  shapes.push({pts: subdivide([{x:0.55, y:0.30}, {x:0.65, y:0.27}, {x:0.72, y:0.30}], 5), closed: false});
  shapes.push({pts: subdivide([{x:0.55, y:0.31}, {x:0.65, y:0.28}, {x:0.72, y:0.31}], 3), closed: false});


  // --- 2. NOSE & MOUTH ---
  // Simple Nose
  shapes.push({pts: [{x:0.50, y:0.55}, {x:0.48, y:0.58}, {x:0.52, y:0.58}], closed: false}); 

  // Mouth (subtle)
  shapes.push({pts: subdivide([{x:0.43, y:0.68}, {x:0.50, y:0.70}, {x:0.57, y:0.68}], 5), closed: false});


  // --- 3. FACE CONTOUR (Narrower) ---
  const face = [
    {x: 0.30, y: 0.32}, // Temple
    {x: 0.30, y: 0.55}, // Cheek
    {x: 0.35, y: 0.72}, // Jaw angle
    {x: 0.43, y: 0.85}, // Jaw to chin
    {x: 0.50, y: 0.90}, // Chin
    {x: 0.57, y: 0.85}, 
    {x: 0.65, y: 0.72}, // Jaw angle
    {x: 0.70, y: 0.55}, 
    {x: 0.70, y: 0.32}
  ];
  shapes.push({pts: subdivide(face, 6), closed: false});


  // --- 4. HAIR (Messy Left Sweep) ---
  const hairNodes = [];
  
  const addFlowingHair = (startX, startY, endX, endY, count, spread) => {
    for(let i=0; i<count; i++){
      const t = i/count;
      const bx = startX + (endX - startX) * t;
      const by = startY + (endY - startY) * t;
      
      const density = 3; 
      for(let j=0; j<density; j++){
        hairNodes.push({
          x: bx + (Math.random()-0.5) * spread,
          y: by + (Math.random()-0.5) * spread
        });
      }
    }
  };

  // Right to left sweep (main volume)
  addFlowingHair(0.70, 0.15, 0.25, 0.25, 22, 0.06);
  addFlowingHair(0.68, 0.18, 0.28, 0.28, 20, 0.05);
  addFlowingHair(0.66, 0.20, 0.30, 0.30, 18, 0.05);
  addFlowingHair(0.64, 0.23, 0.32, 0.32, 16, 0.04);
  addFlowingHair(0.62, 0.26, 0.34, 0.34, 14, 0.04);

  // Top-front sweep
  addFlowingHair(0.60, 0.22, 0.35, 0.30, 16, 0.05);
  addFlowingHair(0.58, 0.25, 0.38, 0.32, 14, 0.04);
  addFlowingHair(0.56, 0.28, 0.40, 0.34, 12, 0.03);

  // Right side (behind part)
  addFlowingHair(0.72, 0.20, 0.72, 0.50, 16, 0.04);
  addFlowingHair(0.70, 0.25, 0.70, 0.52, 14, 0.03);
  
  // Left side (destination)
  addFlowingHair(0.28, 0.25, 0.28, 0.55, 16, 0.05);
  addFlowingHair(0.26, 0.23, 0.26, 0.52, 14, 0.04);
  addFlowingHair(0.30, 0.28, 0.30, 0.56, 12, 0.03);

  shapes.push({pts: hairNodes, type: 'web', closed: false});


  const centerY = 0.5;
  const scaleY = 1.12;
  const remapY = (y) => {
    const stretched = centerY + (y - centerY) * scaleY;
    return Math.min(0.97, Math.max(0.03, stretched));
  };

  // --- Flatten ---
  const nodes = [];
  const connections = [];
  let offset = 0;
  const twinklingIndices = [];

  shapes.forEach(shape => {
    if(shape.type === 'web'){
      // Chaotic web mesh with horizontal bias for left sweep
      const localNodes = shape.pts.map(p => ({x: p.x, y: remapY(p.y)}));
      localNodes.forEach(p => nodes.push(p));
      const threshold = 0.07; 
      
      for(let i=0; i<localNodes.length; i++){
        let connectionsCount = 0;
        for(let j=i+1; j<localNodes.length; j++){
          const dx = Math.abs(localNodes[i].x - localNodes[j].x);
          const dy = Math.abs(localNodes[i].y - localNodes[j].y);
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Prefer horizontal connections (dx > dy) for left-swept look
          if(dist < threshold){
             if(dx > dy * 0.4 || dist < threshold * 0.65){
                connections.push([offset + i, offset + j]);
                connectionsCount++;
             }
          }
          if(connectionsCount > 3) break;
        }
      }
      offset += localNodes.length;
    } else {
      // Standard Path Logic
      shape.pts.forEach((p, i) => {
        nodes.push({x: p.x, y: remapY(p.y)});
        if(shape.twinkle) twinklingIndices.push(offset + i);
      });
      for(let i=0; i<shape.pts.length-1; i++){
        connections.push([offset + i, offset + i + 1]);
      }
      if(shape.closed){
        connections.push([offset + shape.pts.length - 1, offset]);
      }
      offset += shape.pts.length;
    }
  });

  return {
    id: 'ai-face',
    duration: 15000,
    nodes,
    render(ctx, util, assigned, stage){
      const points = assigned.map(slot => ({x: slot.star.x, y: slot.star.y}));
      const alpha = stage.fadeAlpha;

      ctx.save();
      ctx.globalAlpha = alpha;
      
      if(stage.stage !== 'assembling'){
        ctx.shadowBlur = 12;
        ctx.shadowColor = util.neonColor;
        ctx.strokeStyle = util.rgbaString(util.neonRgb, 0.5 + 0.3 * stage.lightBoost);
        ctx.lineWidth = 1.5;
        
        connections.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(points[a].x, points[a].y);
          ctx.lineTo(points[b].x, points[b].y);
          ctx.stroke();
        });
      }

      points.forEach((pt, idx) => {
        let size = 2.0;
        let color = util.rgbaString(util.neonRgb, 0.6);
        ctx.shadowBlur = 8;
        ctx.shadowColor = util.neonColor;

        if(twinklingIndices.includes(idx)){
           const pulse = Math.sin(Date.now() * 0.005 + idx) * 0.5 + 0.5;
           size = 4.5 + 2.5 * pulse;
           color = `rgba(255, 60, 255, ${0.8 + 0.2 * pulse})`;
           ctx.shadowBlur = 30;
           ctx.shadowColor = '#ff40ff';
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  };
};
