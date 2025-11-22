function createNeuralNetworkDiagram(){
  const layerCounts = [3, 5, 5, 4, 2];
  const nodes = [];
  const layers = [];
  const marginX = 0.04;
  const marginY = 0.06;
  const width = 0.92;
  const height = 0.88;
  let runningIndex = 0;
  const maxLayerCount = Math.max(...layerCounts);
  const baseSpacing = maxLayerCount > 1 ? height / (maxLayerCount - 1) : height;

  layerCounts.forEach((count, layerIndex) => {
    const layerNodes = [];
    const x = marginX + (width / (layerCounts.length - 1)) * layerIndex;
    let yPositions;
    if(count === 1){
      yPositions = [marginY + height / 2];
    } else {
      const span = baseSpacing * (count - 1);
      const topOffset = (height - span) / 2;
      yPositions = Array.from({length: count}, (_, i) => marginY + topOffset + baseSpacing * i);
    }
    yPositions.forEach((y) => {
      nodes.push({x, y});
      layerNodes.push(runningIndex++);
    });
    layers.push(layerNodes);
  });

  const edges = [];
  layers.forEach((layer, index) => {
    if(index === layers.length - 1){
      return;
    }

    const nextLayer = layers[index + 1];
    layer.forEach((source) => {
      nextLayer.forEach((target) => {
        const edge = {source, target, layerIndex: index, index: edges.length};
        edges.push(edge);
      });
    });
  });

  const forwardSequence = [];
  for(let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++){
    forwardSequence.push(edges.filter((edge) => edge.layerIndex === layerIndex));
  }

  const backwardSequence = [...forwardSequence].reverse();

  return {
    id: 'neural-net',
    duration: 4600,
    nodes,
    render(ctx, util, assigned, stage){
      const points = assigned.map((slot) => ({x: slot.star.x, y: slot.star.y}));
      const lineAlpha = stage.lightBoost * stage.fadeAlpha;
      const nodeAlpha = stage.fadeAlpha;
      const nodeGlowLevels = new Array(nodes.length).fill(0);
      let activeEdges = [];
      let activeEdgeIds = new Set();

      ctx.save();
      ctx.globalAlpha = nodeAlpha;
      ctx.shadowBlur = 16;
      ctx.shadowColor = util.neonColor;

      if(stage.stage === 'holding' || stage.stage === 'fading'){
        const halfSplit = 0.55;
        const isForward = stage.stageProgress < halfSplit;
        const normalizedProgress = isForward
          ? stage.stageProgress / halfSplit
          : (stage.stageProgress - halfSplit) / (1 - halfSplit);
        const sequence = isForward ? forwardSequence : backwardSequence;
        const totalLayers = sequence.length || 1;
        const clampedProgress = Math.min(Math.max(normalizedProgress, 0), 0.999);
        const layerProgress = clampedProgress * totalLayers;
        const activeLayer = Math.min(totalLayers - 1, Math.floor(layerProgress));
        activeEdges = sequence[activeLayer] || [];
        const layerEdges = activeEdges;
        const localT = layerProgress - activeLayer;
        const directionT = isForward ? localT : (1 - localT);
        const pulsePosition = Math.min(Math.max(directionT, 0), 1);

        layerEdges.forEach((edge) => {
          nodeGlowLevels[edge.source] = 1;
          nodeGlowLevels[edge.target] = 1;
          const a = points[edge.source];
          const b = points[edge.target];
          const head = util.lerpPoint(a, b, pulsePosition);
          ctx.beginPath();
          ctx.fillStyle = util.rgbaString(util.neonRgb, 0.9);
          ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        activeEdgeIds = new Set(activeEdges.map((edge) => edge.index));
      }

      if(stage.stage !== 'assembling' && lineAlpha > 0){
        edges.forEach((edge) => {
          const a = points[edge.source];
          const b = points[edge.target];
          const isActive = activeEdgeIds.has(edge.index);
          const strokeAlpha = 0.2 + 0.35 * lineAlpha + (isActive ? 0.25 : 0);
          ctx.lineWidth = 1.1 + 0.5 * lineAlpha + (isActive ? 0.6 : 0);
          ctx.strokeStyle = util.rgbaString(util.neonRgb, strokeAlpha);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
      }

      points.forEach((pt, index) => {
        const baseGlow = stage.stage === 'assembling' ? 0.5 : 0.3;
        const glowBoost = nodeGlowLevels[index] ? 0.5 : 0;
        ctx.fillStyle = util.rgbaString(util.neonRgb, baseGlow + 0.4 * stage.lightBoost + glowBoost);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, nodeGlowLevels[index] ? 4.2 : 3.4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  };
}
