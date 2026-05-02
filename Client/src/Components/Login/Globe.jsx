import { useEffect, useRef } from "react";

function ConnectedPlexusGlobe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Adjusted parameters for the Plexus look
    const NUM_POINTS = 160; 
    const MAX_DISTANCE = 110; // Max connection distance in pixels
    
    let W, H, CX, CY, R, points = [], time = 0;
    let globalAngleX = 0, globalAngleY = 0, mouse = { x: 0, y: 0 };
    let animId;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      CX = W / 2; CY = H / 2;
      R = Math.min(W, H) * 0.38; 
      initPoints();
    }

    // Fibonacci Lattice for even point distribution on a sphere
    function initPoints() {
      points = [];
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      for (let i = 0; i < NUM_POINTS; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / NUM_POINTS);
        points.push({
          ox: Math.cos(theta) * Math.sin(phi),
          oy: Math.sin(theta) * Math.sin(phi),
          oz: Math.cos(phi),
        });
      }
    }

    function rotateY(p, a) {
      const cosA = Math.cos(a), sinA = Math.sin(a);
      return { x: p.ox * cosA - p.oz * sinA, y: p.oy, z: p.ox * sinA + p.oz * cosA };
    }

    function rotateX(p, a) {
      const cosA = Math.cos(a), sinA = Math.sin(a);
      return { x: p.x, y: p.y * cosA - p.z * sinA, z: p.y * sinA + p.z * cosA };
    }

    function frame() {
      animId = requestAnimationFrame(frame);
      time++; 

      globalAngleY += 0.0015 + mouse.x * 0.01;
      globalAngleX = mouse.y * 0.3; 
      
      // Pure black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      // Project 3D points to 2D
      const projected = points.map(p => {
        let r = rotateY(p, globalAngleY);
        r = rotateX(r, globalAngleX);
        return {
          sx: CX + r.x * R,
          sy: CY + r.y * R,
          depth: (r.z + 1) / 2, // 0 = back, 1 = front
          z: r.z
        };
      });

      // 1. Draw Connections (Lines)
      ctx.lineCap = "round";
      for (let i = 0; i < NUM_POINTS; i++) {
        for (let j = i + 1; j < NUM_POINTS; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          
          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const dist = Math.sqrt(dx*dx + dy*dy);

          // Only connect if visually close to mimic a mesh
          if (dist < MAX_DISTANCE) {
            const avgDepth = (p1.depth + p2.depth) / 2;
            const alpha = (0.1 + avgDepth * 0.5) * (1 - dist / MAX_DISTANCE);
            
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5 + avgDepth * 0.8;
            ctx.stroke();
          }
        }
      }

      // 2. Draw Nodes (Shiny Dots)
      projected.sort((a, b) => a.z - b.z).forEach(p => {
        const size = 1.2 + p.depth * 2.5;
        const alpha = 0.3 + p.depth * 0.7;

        // Core dot
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Bloom/Glow for "Shiny" effect
        if (p.depth > 0.6) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.15})`;
          ctx.fill();
        }
      });
    }

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left - CX) / R;
      mouse.y = (e.clientY - rect.top - CY) / R;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resize);
    resize();
    frame();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: "absolute", 
        inset: 0, 
        width: "100%", 
        height: "100%",
        background: "#000" 
      }} 
    />
  );
}

export default ConnectedPlexusGlobe;