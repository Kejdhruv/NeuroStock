import { useEffect, useRef } from "react";

function DarkMatterGlobe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const NUM = 260, STREAMS = 18;
    let W, H, CX, CY, R, particles = [], streams = [], time = 0;
    let globalAngle = 0, mouse = { x: 0, y: 0 };
    let animId;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      CX = W / 2; CY = H / 2;
      // Slightly smaller radius to prevent edge clipping
      R = Math.min(W, H) * 0.32; 
      initParticles();
    }

    function spherePoint(u, v) {
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      return { x: Math.sin(phi)*Math.cos(theta), y: Math.sin(phi)*Math.sin(theta), z: Math.cos(phi) };
    }

    function initParticles() {
      particles = Array.from({ length: NUM }, () => {
        const p = spherePoint(Math.random(), Math.random());
        const speed = 0.0006 + Math.random() * 0.0012;
        return { ...p, ox: p.x, oy: p.y, oz: p.z, angle: Math.random()*Math.PI*2,
          speed: Math.random()<0.5 ? speed : -speed, axis: Math.random()<0.5 ? 'y' : 'z',
          size: 0.8+Math.random()*1.5, brightness: 0.4+Math.random()*0.6,
          hue: 35, // Fixed to a sharper Amber hue
          pulse: Math.random()*Math.PI*2,
          pulseSpeed: 0.015+Math.random()*0.03 };
      });
      streams = Array.from({ length: STREAMS }, (_, i) => ({
        angle: (i/STREAMS)*Math.PI*2, radius: R*(0.2+Math.random()*0.6),
        speed: 0.003+Math.random()*0.005, width: 0.8+Math.random()*1.2,
        alpha: 0.05+Math.random()*0.15, offset: Math.random()*Math.PI*2,
        length: 0.25+Math.random()*0.45, ccw: Math.random()<0.5
      }));
    }

    function rotateY(x, z, a) { return { x: x*Math.cos(a)-z*Math.sin(a), z: x*Math.sin(a)+z*Math.cos(a) }; }
    function rotateX(y, z, a) { return { y: y*Math.cos(a)-z*Math.sin(a), z: y*Math.sin(a)+z*Math.cos(a) }; }

    function frame() {
      animId = requestAnimationFrame(frame);
      time++; 
      const breathe = Math.sin(time * 0.01) * 0.5 + 0.5;
      globalAngle += 0.002 + mouse.x * 0.001;
      const tiltAngle = mouse.y * 0.1;
      
      // Pure black clear for that OLED look
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);

      // 1. Globe Ambient Glow (Deep Amber)
      const grd = ctx.createRadialGradient(CX, CY, R*0.1, CX, CY, R*1.4);
      grd.addColorStop(0, 'rgba(47, 128, 237, 0.15)');
      grd.addColorStop(0.5, 'rgba(47, 128, 237, 0.05)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath(); ctx.arc(CX, CY, R*1.4, 0, Math.PI*2);
      ctx.fillStyle = grd; ctx.fill();

      // 2. Data Streams
      for (const s of streams) {
        const a = s.angle + (s.ccw ? -1 : 1) * s.speed * time + s.offset;
        const endA = a + s.length*Math.PI*2*(s.ccw ? -1 : 1);
        ctx.beginPath(); ctx.arc(CX, CY, s.radius, a, endA, s.ccw);
        const sg = ctx.createLinearGradient(
            CX+Math.cos(a)*s.radius, CY+Math.sin(a)*s.radius,
            CX+Math.cos(endA)*s.radius, CY+Math.sin(endA)*s.radius
        );
        sg.addColorStop(0,'rgba(47,128,237,0)'); 
        sg.addColorStop(0.5,`rgba(47,128,237,${s.alpha})`);
        sg.addColorStop(1,'rgba(47,128,237,0)');
        ctx.strokeStyle = sg; ctx.lineWidth = s.width; ctx.stroke();
      }

      // 3. Neural Particles (Depth-Sorted)
      particles.map(p => {
        p.angle += p.speed; p.pulse += p.pulseSpeed;
        let x = p.ox, y = p.oy, z = p.oz;
        if (p.axis === 'y') { const r = rotateY(x, z, p.angle+globalAngle); x=r.x; z=r.z; }
        else { const r = rotateX(y, z, p.angle+globalAngle); y=r.y; z=r.z; }
        const t = rotateX(y, z, tiltAngle); y=t.y; z=t.z;
        return { p, screenX: CX+x*R, screenY: CY+y*R, depth: (z+1)/2, z };
      }).sort((a,b)=>a.z-b.z).forEach(({ p, screenX, screenY, depth }) => {
        const pulse = Math.sin(p.pulse)*0.5+0.5;
        const size = p.size*(0.6+depth*0.8)*(1+pulse*0.3);
        const alpha = (0.15+depth*0.85)*p.brightness*(0.6+pulse*0.4);
        
        ctx.beginPath(); ctx.arc(screenX, screenY, size, 0, Math.PI*2);
        // Using high-saturation gold for depth
        ctx.fillStyle = `hsla(${210 + pulse*10}, 100%, ${55 + depth*25}%, ${alpha})`; 
        ctx.fill();

        // Particle Bloom for closer elements
        if (depth > 0.8) {
          ctx.beginPath(); ctx.arc(screenX, screenY, size*2, 0, Math.PI*2);
          ctx.fillStyle = `rgba(47, 128, 237, ${alpha * 0.2})`;
          ctx.fill();
        }
      });

      // 4. Central Neural Core (High Energy)
      const coreSize = R*0.15*(1+breathe*0.08);
      const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreSize);
      cg.addColorStop(0, `rgba(255, 255, 255, ${0.85+breathe*0.15})`);
      cg.addColorStop(0.2, `rgba(47, 128, 237, 0.7)`);
      cg.addColorStop(0.6, `rgba(47, 128, 237, 0.2)`);
      cg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath(); ctx.arc(CX, CY, coreSize, 0, Math.PI*2);
      ctx.fillStyle = cg; ctx.fill();

      // 5. Outer Edge Vignette (To blend with black background)
      const rg = ctx.createRadialGradient(CX, CY, R*0.7, CX, CY, R*1.2);
      rg.addColorStop(0, 'rgba(5, 5, 5, 0)'); 
      rg.addColorStop(1, 'rgba(5, 5, 5, 1)'); // Blends perfectly into #050505
      ctx.beginPath(); ctx.arc(CX, CY, R*1.3, 0, Math.PI*2);
      ctx.fillStyle = rg; ctx.fill();
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
        filter: "contrast(1.1) brightness(1.1)" // Slight post-processing for "pop"
      }} 
    />
  );
}

export default DarkMatterGlobe;