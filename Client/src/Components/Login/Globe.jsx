import { useEffect, useRef } from "react";

function ArcTransactionGlobe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const NUM_POINTS = 130; 
    const MAX_DISTANCE = 120; 
    const MAX_TRANSACTIONS = 15; 
    
    let W, H, CX, CY, R, points = [], transactions = [];
    let globalAngleX = 0, globalAngleY = 0, mouse = { x: 0, y: 0 };
    let animId;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      CX = W / 2; CY = H / 2;
      R = Math.min(W, H) * 0.35; 
      initPoints();
    }

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
          id: i
        });
      }
      transactions = [];
    }

    function createTransaction() {
      if (transactions.length < MAX_TRANSACTIONS) {
        const sIdx = Math.floor(Math.random() * NUM_POINTS);
        const targets = points.filter((p, idx) => {
          const d = Math.sqrt(Math.pow(points[sIdx].ox-p.ox,2)+Math.pow(points[sIdx].oy-p.oy,2)+Math.pow(points[sIdx].oz-p.oz,2))*R;
          return idx !== sIdx && d < MAX_DISTANCE && d > 30;
        });

        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)];
          transactions.push({
            from: sIdx, to: target.id, progress: 0,
            speed: 0.015 + Math.random() * 0.025,
            arcHeight: 1.2 + Math.random() * 0.4 
          });
        }
      }
    }

    function rotateY(p, a) {
      const c = Math.cos(a), s = Math.sin(a);
      return { x: p.ox * c - p.oz * s, y: p.oy, z: p.ox * s + p.oz * c };
    }

    function rotateX(p, a) {
      const c = Math.cos(a), s = Math.sin(a);
      return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
    }

    function frame() {
      animId = requestAnimationFrame(frame);
      if (Math.random() > 0.88) createTransaction();

      globalAngleY += 0.0015 + mouse.x * 0.005;
      globalAngleX = mouse.y * 0.2; 
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      const projected = points.map(p => {
        let r = rotateY(p, globalAngleY);
        r = rotateX(r, globalAngleX);
        return { sx: CX + r.x * R, sy: CY + r.y * R, depth: (r.z + 1) / 2, z: r.z, rx: r.x, ry: r.y, rz: r.z };
      });

      // 1. Visible Connected Mesh (Strengthened visibility)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < NUM_POINTS; i++) {
        for (let j = i + 1; j < NUM_POINTS; j++) {
          const p1 = projected[i], p2 = projected[j];
          const dist = Math.sqrt(Math.pow(p1.sx-p2.sx,2)+Math.pow(p1.sy-p2.sy,2));
          if (dist < MAX_DISTANCE) {
            // Increased base alpha from 0.03 to 0.15 for better connection visibility
            const alpha = (0.12 + (p1.depth * 0.35)) * (1 - dist / MAX_DISTANCE);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath(); 
            ctx.moveTo(p1.sx, p1.sy); 
            ctx.lineTo(p2.sx, p2.sy); 
            ctx.stroke();
          }
        }
      }

      // 2. Arc Transactions
      transactions = transactions.filter(t => t.progress < 1);
      transactions.forEach(t => {
        const p1 = projected[t.from], p2 = projected[t.to];
        t.progress += t.speed;

        const midX = (p1.rx + p2.rx) * 0.5 * t.arcHeight;
        const midY = (p1.ry + p2.ry) * 0.5 * t.arcHeight;
        const midZ = (p1.rz + p2.rz) * 0.5 * t.arcHeight;
        
        const scx = CX + midX * R, scy = CY + midY * R; 
        const alpha = Math.sin(t.progress * Math.PI);

        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.quadraticCurveTo(scx, scy, p2.sx, p2.sy);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`; // Slightly brighter arcs
        ctx.lineWidth = 1.2;
        ctx.stroke();

        const q1x = p1.sx + (scx - p1.sx) * t.progress;
        const q1y = p1.sy + (scy - p1.sy) * t.progress;
        const q2x = scx + (p2.sx - scx) * t.progress;
        const q2y = scy + (p2.sy - scy) * t.progress;
        const dotX = q1x + (q2x - q1x) * t.progress;
        const dotY = q1y + (q2y - q1y) * t.progress;

        ctx.beginPath();
        ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = "white";
        ctx.beginPath();
        ctx.arc(dotX, dotY, 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; 
      });

      // 3. Shiny Base Dots (Slightly larger for visibility)
      projected.forEach(p => {
        const size = 0.8 + p.depth * 1.2;
        const alpha = 0.3 + p.depth * 0.6;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
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

export default ArcTransactionGlobe;