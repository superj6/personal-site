function createChipCircuitDiagram(){
  const nodes = [
    {x: 0.08, y: 0.08, label: 'VCC'},
    {x: 0.30, y: 0.08}, {x: 0.50, y: 0.08}, {x: 0.70, y: 0.08},
    {x: 0.08, y: 0.30, label: 'D'},
    {x: 0.08, y: 0.50, label: 'CLK'},
    {x: 0.25, y: 0.30},
    {x: 0.25, y: 0.45},
    {x: 0.25, y: 0.60},
    {x: 0.40, y: 0.35},
    {x: 0.40, y: 0.55},
    {x: 0.55, y: 0.35},
    {x: 0.55, y: 0.55},
    {x: 0.70, y: 0.40},
    {x: 0.70, y: 0.60},
    {x: 0.85, y: 0.45, label: 'R'},
    {x: 0.92, y: 0.45, label: 'LED'},
    {x: 0.30, y: 0.92}, {x: 0.50, y: 0.92}, {x: 0.70, y: 0.92}, {x: 0.92, y: 0.92},
    {x: 0.08, y: 0.92, label: 'GND'}
  ];

  const wires = [
    [0,1],[1,2],[2,3],
    [4,6],[5,7],[5,8],
    [6,9],[7,9],[7,10],[8,10],
    [9,11],[10,12],
    [11,13],[12,14],[12,10],
    [13,15],[15,16],
    [1,9],[2,11],[3,13],
    [17,18],[18,19],[19,20],
    [10,17],[14,19],[16,20],[21,17]
  ];

  const gates = [
    {center: {x:0.325,y:0.35}, size:9, label: 'U1A'},
    {center: {x:0.325,y:0.55}, size:9, label: 'U1B'},
    {center: {x:0.625,y:0.40}, size:9, label: 'U2A'},
    {center: {x:0.625,y:0.60}, size:9, label: 'U2B'}
  ];

  const signalPaths = [
    {path: [4,6,9,11,13,15,16], label: 'data-to-led'},
    {path: [5,7,10,12,14,19,21], label: 'clock-feedback'}
  ];

  return {
    id: 'chip-circuit',
    duration: 4200,
    nodes,
    render(ctx, util, assigned, stage){
      const points = assigned.map((slot) => ({x: slot.star.x, y: slot.star.y, label: nodes[slot.nodeIndex].label}));
      const alpha = stage.fadeAlpha;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 14;
      ctx.shadowColor = util.neonColor;
      
      const getWireSegments = (a, b) => {
        const ax = points[a].x, ay = points[a].y;
        const bx = points[b].x, by = points[b].y;
        if(Math.abs(ay - by) < 2 || Math.abs(ax - bx) < 2){
          return [{x:ax,y:ay}, {x:bx,y:by}];
        }
        const midX = (ax + bx) / 2;
        return [{x:ax,y:ay}, {x:midX,y:ay}, {x:midX,y:by}, {x:bx,y:by}];
      };

      if(stage.stage !== 'assembling'){
        ctx.lineWidth = 1.0 + 0.4 * stage.lightBoost;
        ctx.strokeStyle = util.rgbaString(util.neonRgb, 0.25 + 0.45 * stage.lightBoost);
        wires.forEach(([a, b]) => {
          const segs = getWireSegments(a, b);
          ctx.beginPath();
          ctx.moveTo(segs[0].x, segs[0].y);
          for(let i = 1; i < segs.length; i++){
            ctx.lineTo(segs[i].x, segs[i].y);
          }
          ctx.stroke();
        });

        ctx.strokeStyle = util.rgbaString(util.neonRgb, 0.35 + 0.5 * stage.lightBoost);
        ctx.lineWidth = 1.2;
        gates.forEach((gate) => {
          const gx = gate.center.x * util.canvasWidth;
          const gy = gate.center.y * util.canvasHeight;
          const s = gate.size;
          ctx.beginPath();
          ctx.rect(gx - s, gy - s, s*2, s*2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(gx + s + 3.5, gy, 3.5, 0, Math.PI * 2);
          ctx.stroke();
        });

        const ledIdx = 16;
        const ledPt = points[ledIdx];
        ctx.strokeStyle = util.rgbaString(util.neonRgb, 0.4 + 0.6 * stage.lightBoost);
        ctx.lineWidth = 1.0;
        const ledSize = 8;
        ctx.beginPath();
        ctx.moveTo(ledPt.x - ledSize, ledPt.y - ledSize);
        ctx.lineTo(ledPt.x + ledSize, ledPt.y);
        ctx.lineTo(ledPt.x - ledSize, ledPt.y + ledSize);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ledPt.x + ledSize, ledPt.y - ledSize);
        ctx.lineTo(ledPt.x + ledSize, ledPt.y + ledSize);
        ctx.stroke();

        const resIdx = 15;
        const resPt = points[resIdx];
        ctx.lineWidth = 1.0;
        const w = 8;
        ctx.beginPath();
        ctx.moveTo(resPt.x - w, resPt.y);
        ctx.lineTo(resPt.x - w*0.6, resPt.y - 4);
        ctx.lineTo(resPt.x - w*0.2, resPt.y + 4);
        ctx.lineTo(resPt.x + w*0.2, resPt.y - 4);
        ctx.lineTo(resPt.x + w*0.6, resPt.y + 4);
        ctx.lineTo(resPt.x + w, resPt.y);
        ctx.stroke();

        // CPU badge in upper-right corner
        const cpuRect = {
          x: util.canvasWidth * 0.78,
          y: util.canvasHeight * 0.08,
          w: util.canvasWidth * 0.12,
          h: util.canvasHeight * 0.08
        };
        ctx.save();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = util.rgbaString(util.neonRgb, 0.45 + 0.4 * stage.lightBoost);
        ctx.shadowBlur = 18;
        ctx.shadowColor = util.neonColor;
        ctx.beginPath();
        ctx.rect(cpuRect.x, cpuRect.y, cpuRect.w, cpuRect.h);
        ctx.stroke();
        // Inner border
        ctx.beginPath();
        ctx.rect(cpuRect.x + 6, cpuRect.y + 6, cpuRect.w - 12, cpuRect.h - 12);
        ctx.stroke();
        // Pins
        const pinCount = 5;
        for(let i=0; i<pinCount; i++){
          const t = i/(pinCount-1);
          const px = cpuRect.x + (cpuRect.w * t);
          const topY = cpuRect.y;
          const bottomY = cpuRect.y + cpuRect.h;
          ctx.beginPath();
          ctx.moveTo(px, topY);
          ctx.lineTo(px, topY - 8);
          ctx.moveTo(px, bottomY);
          ctx.lineTo(px, bottomY + 8);
          ctx.stroke();
        }
        for(let i=0; i<pinCount; i++){
          const t = i/(pinCount-1);
          const py = cpuRect.y + (cpuRect.h * t);
          const leftX = cpuRect.x;
          const rightX = cpuRect.x + cpuRect.w;
          ctx.beginPath();
          ctx.moveTo(leftX, py);
          ctx.lineTo(leftX - 8, py);
          ctx.moveTo(rightX, py);
          ctx.lineTo(rightX + 8, py);
          ctx.stroke();
        }
        ctx.restore();
      }
      
      points.forEach((pt, i) => {
        const node = nodes[i];
        const glow = 0.4 + 0.5 * stage.lightBoost;
        let size = 2.5;
        if(node.label === 'VCC' || node.label === 'GND') size = 4;
        else if(node.label === 'D' || node.label === 'CLK') size = 3.5;
        else if(node.label === 'LED') size = 0;
        else if(node.label === 'R') size = 0;
        
        if(size > 0){
          ctx.fillStyle = util.rgbaString(util.neonRgb, glow);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if(stage.stage === 'holding' || stage.stage === 'fading'){
        signalPaths.forEach((sigPath, pathIndex) => {
          const pathNodes = sigPath.path;
          const hue = sigPath.color * 40;
          const allSegments = [];
          for(let i = 0; i < pathNodes.length - 1; i++){
            const segs = getWireSegments(pathNodes[i], pathNodes[i+1]);
            for(let j = 0; j < segs.length - 1; j++){
              allSegments.push([segs[j], segs[j+1]]);
            }
          }
          const progress = (util.time * 0.0008 + pathIndex * 0.25) % 1;
          const totalSegs = allSegments.length;
          const segIdx = Math.floor(progress * totalSegs);
          const segT = (progress * totalSegs) - segIdx;
          if(segIdx < totalSegs){
            const [a, b] = allSegments[segIdx];
            const head = util.lerpPoint(a, b, segT);
            ctx.beginPath();
            ctx.fillStyle = util.rgbaString(util.neonRgb, 0.95);
            ctx.arc(head.x, head.y, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      ctx.restore();
    }
  };
}
