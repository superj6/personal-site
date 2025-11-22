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

  // --- 1. EYES (High Detail Anime Style) ---
  
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
  shapes.push({pts: createStar(0.37, 0.40, 0.11), closed: true, twinkle: true});
  shapes.push({pts: createStar(0.63, 0.40, 0.11), closed: true, twinkle: true});

  // 2. Iris Outlines (Circles around stars)
  const irisL = []; const irisR = [];
  for(let i=0; i<=16; i++){
    const t = i/16; const a = t * Math.PI * 2;
    irisL.push({x: 0.37 + Math.cos(a)*0.13, y: 0.40 + Math.sin(a)*0.13});
    irisR.push({x: 0.63 + Math.cos(a)*0.13, y: 0.40 + Math.sin(a)*0.13});
  }
  shapes.push({pts: irisL, closed: true});
  shapes.push({pts: irisR, closed: true});

  // 3. Thick Upper Lashes (Multiple lines for weight)
  const lashL1 = [{x:0.24, y:0.38}, {x:0.28, y:0.30}, {x:0.37, y:0.26}, {x:0.46, y:0.30}, {x:0.50, y:0.38}];
  const lashL2 = [{x:0.24, y:0.39}, {x:0.28, y:0.31}, {x:0.37, y:0.27}, {x:0.46, y:0.31}, {x:0.50, y:0.39}]; // Thickness
  const lashL3 = [{x:0.23, y:0.37}, {x:0.25, y:0.32}, {x:0.28, y:0.30}]; // Wing tip
  shapes.push({pts: subdivide(lashL1, 6), closed: false});
  shapes.push({pts: subdivide(lashL2, 6), closed: false});
  shapes.push({pts: subdivide(lashL3, 3), closed: false});

  const lashR1 = [{x:0.50, y:0.38}, {x:0.54, y:0.30}, {x:0.63, y:0.26}, {x:0.72, y:0.30}, {x:0.76, y:0.38}];
  const lashR2 = [{x:0.50, y:0.39}, {x:0.54, y:0.31}, {x:0.63, y:0.27}, {x:0.72, y:0.31}, {x:0.76, y:0.39}];
  const lashR3 = [{x:0.77, y:0.37}, {x:0.75, y:0.32}, {x:0.72, y:0.30}]; // Wing tip
  shapes.push({pts: subdivide(lashR1, 6), closed: false});
  shapes.push({pts: subdivide(lashR2, 6), closed: false});
  shapes.push({pts: subdivide(lashR3, 3), closed: false});

  // 4. Double Eyelid Crease
  shapes.push({pts: subdivide([{x:0.26, y:0.28}, {x:0.37, y:0.23}, {x:0.48, y:0.28}], 6), closed: false});
  shapes.push({pts: subdivide([{x:0.52, y:0.28}, {x:0.63, y:0.23}, {x:0.74, y:0.28}], 6), closed: false});

  // 5. Eyebrows (Expressive)
  shapes.push({pts: subdivide([{x:0.26, y:0.24}, {x:0.35, y:0.20}, {x:0.46, y:0.24}], 5), closed: false});
  shapes.push({pts: subdivide([{x:0.54, y:0.24}, {x:0.65, y:0.20}, {x:0.74, y:0.24}], 5), closed: false});


  // --- 2. NOSE & MOUTH ---
  // Small Nose (Dot/Dash style)
  shapes.push({pts: [{x:0.50, y:0.53}, {x:0.49, y:0.55}], closed: false}); 

  // Refined Mouth
  shapes.push({pts: subdivide([{x:0.43, y:0.65}, {x:0.50, y:0.68}, {x:0.57, y:0.65}], 5), closed: false});
  // Lower lip hint
  shapes.push({pts: subdivide([{x:0.48, y:0.70}, {x:0.52, y:0.70}], 2), closed: false});


  // --- 3. FACE CONTOUR ---
  const face = [
    {x: 0.28, y: 0.35}, // Temple
    {x: 0.28, y: 0.55}, // Cheek
    {x: 0.35, y: 0.75}, // Jaw start
    {x: 0.50, y: 0.88}, // Chin
    {x: 0.65, y: 0.75}, 
    {x: 0.72, y: 0.55}, 
    {x: 0.72, y: 0.35}
  ];
  shapes.push({pts: subdivide(face, 6), closed: false});


  // --- 4. HAIR (Flowing Web) ---
  const hairNodes = [];
  
  const addFlowingHair = (startX, startY, endX, endY, count, spread) => {
    for(let i=0; i<count; i++){
      const t = i/count;
      // Main flow path
      const bx = startX + (endX - startX) * t;
      const by = startY + (endY - startY) * t;
      
      // Add jittered points around this path
      const density = 3; 
      for(let j=0; j<density; j++){
        hairNodes.push({
          x: bx + (Math.random()-0.5) * spread,
          y: by + (Math.random()-0.5) * spread
        });
      }
    }
  };

  // Left Side Flow
  addFlowingHair(0.25, 0.15, 0.15, 0.95, 20, 0.08); // Outer
  addFlowingHair(0.30, 0.25, 0.25, 0.90, 18, 0.06); // Mid
  addFlowingHair(0.32, 0.35, 0.30, 0.85, 15, 0.04); // Inner (Face framing)

  // Right Side Flow
  addFlowingHair(0.75, 0.15, 0.85, 0.95, 20, 0.08); // Outer
  addFlowingHair(0.70, 0.25, 0.75, 0.90, 18, 0.06); // Mid
  addFlowingHair(0.68, 0.35, 0.70, 0.85, 15, 0.04); // Inner

  // Bangs (M-Shape Flow)
  // Left
  addFlowingHair(0.25, 0.20, 0.35, 0.38, 10, 0.04);
  addFlowingHair(0.35, 0.10, 0.40, 0.35, 10, 0.04);
  // Center
  addFlowingHair(0.45, 0.15, 0.50, 0.30, 8, 0.03); // Tip
  addFlowingHair(0.55, 0.15, 0.50, 0.30, 8, 0.03);
  // Right
  addFlowingHair(0.65, 0.10, 0.60, 0.35, 10, 0.04);
  addFlowingHair(0.75, 0.20, 0.65, 0.38, 10, 0.04);

  // Top Volume
  addFlowingHair(0.25, 0.15, 0.75, 0.15, 15, 0.08); // Horizontal filler

  shapes.push({pts: hairNodes, type: 'web', closed: false});


  // --- Flatten ---
  const nodes = [];
  const connections = [];
  let offset = 0;
  const twinklingIndices = [];

  shapes.forEach(shape => {
    if(shape.type === 'web'){
      // Web Logic with VERTICAL BIAS
      shape.pts.forEach(p => nodes.push(p));
      const localNodes = shape.pts;
      const threshold = 0.07; 
      
      for(let i=0; i<localNodes.length; i++){
        let connectionsCount = 0;
        for(let j=i+1; j<localNodes.length; j++){
          const dx = Math.abs(localNodes[i].x - localNodes[j].x);
          const dy = Math.abs(localNodes[i].y - localNodes[j].y);
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Prefer vertical connections (dy > dx) for hair flow look
          // Stricter distance for horizontal
          if(dist < threshold){
             if(dy > dx * 0.5 || dist < threshold * 0.6){
                connections.push([offset + i, offset + j]);
                connectionsCount++;
             }
          }
          if(connectionsCount > 3) break; // Limit connections per node
        }
      }
      offset += localNodes.length;
    } else {
      // Standard Path Logic
      shape.pts.forEach((p, i) => {
        nodes.push(p);
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
