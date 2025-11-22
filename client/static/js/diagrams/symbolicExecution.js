function createSymbolicExecutionDiagram(){
  const nodes = [
    {x: 0.50, y: 0.08, type: 'start'},
    {x: 0.35, y: 0.22, type: 'state'},
    {x: 0.65, y: 0.22, type: 'state'},
    {x: 0.20, y: 0.36, type: 'state'},
    {x: 0.45, y: 0.36, type: 'state'},
    {x: 0.55, y: 0.36, type: 'state'},
    {x: 0.80, y: 0.36, type: 'state'},
    {x: 0.12, y: 0.50, type: 'state'},
    {x: 0.28, y: 0.50, type: 'state'},
    {x: 0.38, y: 0.50, type: 'state'},
    {x: 0.52, y: 0.50, type: 'state'},
    {x: 0.62, y: 0.50, type: 'state'},
    {x: 0.72, y: 0.50, type: 'state'},
    {x: 0.88, y: 0.50, type: 'state'},
    {x: 0.08, y: 0.64, type: 'leaf'},
    {x: 0.16, y: 0.64, type: 'bug'},
    {x: 0.24, y: 0.64, type: 'leaf'},
    {x: 0.32, y: 0.64, type: 'leaf'},
    {x: 0.40, y: 0.64, type: 'leaf'},
    {x: 0.48, y: 0.64, type: 'bug'},
    {x: 0.56, y: 0.64, type: 'leaf'},
    {x: 0.64, y: 0.64, type: 'leaf'},
    {x: 0.72, y: 0.64, type: 'leaf'},
    {x: 0.80, y: 0.64, type: 'leaf'},
    {x: 0.88, y: 0.64, type: 'bug'},
    {x: 0.15, y: 0.78, type: 'solver'},
    {x: 0.50, y: 0.78, type: 'solver'},
    {x: 0.85, y: 0.78, type: 'solver'}
  ];

  const edges = [
    [0,1], [0,2],
    [1,3], [1,4], [2,5], [2,6],
    [3,7], [3,8], [4,9], [4,10], [5,11], [5,12], [6,13],
    [7,14], [7,15], [8,16], [8,17], [9,18], [10,19], [11,20], [11,21], [12,22], [12,23], [13,24],
    [15,25], [19,26], [24,27]
  ];

  const explorationPaths = [
    [0,1,3,7,14],
    [0,1,3,7,15,25],
    [0,1,4,10,19,26],
    [0,2,5,11,20],
    [0,2,6,13,24,27]
  ];

  return {
    id: 'symbolic-exec',
    duration: 5000,
    nodes,
    render(ctx, util, assigned, stage){
      const points = assigned.map((slot) => ({x: slot.star.x, y: slot.star.y, type: nodes[slot.nodeIndex].type}));
      const alpha = stage.fadeAlpha;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 14;
      ctx.shadowColor = util.neonColor;

      const lineAlpha = 0.25 + 0.4 * stage.lightBoost;
      ctx.strokeStyle = util.rgbaString(util.neonRgb, lineAlpha);
      ctx.lineWidth = 0.8 + 0.3 * stage.lightBoost;
      
      edges.forEach(([a, b]) => {
        const pa = points[a];
        const pb = points[b];
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      points.forEach((pt) => {
        const glow = 0.4 + 0.5 * stage.lightBoost;
        let size = 2.5;
        let shape = 'circle';
        
        if(pt.type === 'start'){
          size = 5;
        }else if(pt.type === 'bug'){
          size = 4;
          shape = 'x';
        }else if(pt.type === 'solver'){
          size = 3.5;
          shape = 'square';
        }else if(pt.type === 'leaf'){
          size = 3;
        }

        ctx.fillStyle = util.rgbaString(util.neonRgb, glow);
        
        if(shape === 'circle'){
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          ctx.fill();
        }else if(shape === 'square'){
          ctx.fillRect(pt.x - size, pt.y - size, size*2, size*2);
        }else if(shape === 'x'){
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = util.rgbaString(util.neonRgb, glow);
          ctx.beginPath();
          ctx.moveTo(pt.x - size, pt.y - size);
          ctx.lineTo(pt.x + size, pt.y + size);
          ctx.moveTo(pt.x + size, pt.y - size);
          ctx.lineTo(pt.x - size, pt.y + size);
          ctx.stroke();
        }
      });

      if(stage.stage === 'holding' || stage.stage === 'fading'){
        const numPaths = explorationPaths.length;
        const cycleDuration = 6000;
        const pathDuration = cycleDuration / numPaths;
        const currentPathIdx = Math.floor((util.time % cycleDuration) / pathDuration);
        const pathProgress = ((util.time % cycleDuration) % pathDuration) / pathDuration;
        
        const currentPath = explorationPaths[currentPathIdx];
        const totalNodes = currentPath.length;
        const currentNodeIdx = Math.min(totalNodes - 1, Math.floor(pathProgress * totalNodes));
        
        for(let i = 0; i <= currentNodeIdx; i++){
          const nodeIdx = currentPath[i];
          const pt = points[nodeIdx];
          const pulseGlow = i === currentNodeIdx ? 0.95 : 0.7;
          ctx.fillStyle = util.rgbaString(util.neonRgb, pulseGlow);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, i === currentNodeIdx ? 4 : 3, 0, Math.PI * 2);
          ctx.fill();
        }

        if(currentNodeIdx < totalNodes - 1){
          const startIdx = currentPath[currentNodeIdx];
          const endIdx = currentPath[currentNodeIdx + 1];
          const segT = (pathProgress * totalNodes) - currentNodeIdx;
          const start = points[startIdx];
          const end = points[endIdx];
          const head = util.lerpPoint(start, end, segT);
          
          ctx.fillStyle = util.rgbaString(util.neonRgb, 0.95);
          ctx.beginPath();
          ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  };
}
