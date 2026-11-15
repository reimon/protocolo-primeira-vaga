/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * ParticleSystem.js - Partículas, Floating Combat Text e Screen Shake
 */

export class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.timer = 0;
  }

  trigger(intensity = 6, duration = 0.2) {
    this.intensity = intensity;
    this.duration = duration;
    this.timer = duration;
  }

  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.intensity = 0;
      }
    }
  }

  getOffset() {
    if (this.timer <= 0) return { x: 0, y: 0 };
    const progress = this.timer / this.duration;
    const currentIntensity = this.intensity * progress;
    return {
      x: (Math.random() * 2 - 1) * currentIntensity,
      y: (Math.random() * 2 - 1) * currentIntensity
    };
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.damageTexts = [];
    this.ghosts = [];
    this.slashLines = [];
    this.flashes = [];
    this.debris = [];
  }

  update(dt, groundY = 560) {
    // Atualiza Flashes de Explosão
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt;
      if (f.life <= 0) {
        this.flashes.splice(i, 1);
      }
    }

    // Atualiza Estilhaços Quicando no Chão (estilo Metal Slug)
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 900 * dt;
      d.rot += d.vRot * dt;
      if (d.y + d.size >= groundY && d.vy > 0) {
        d.y = groundY - d.size;
        d.vy = -d.vy * 0.45;
        d.vx *= 0.72;
      }
      d.life -= dt;
      if (d.life <= 0) {
        this.debris.splice(i, 1);
      }
    }

    // Atualiza Partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Atualiza Textos de Dano Flutuantes
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const t = this.damageTexts[i];
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) {
        this.damageTexts.splice(i, 1);
      }
    }

    // Atualiza Fantasmas de Dash
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i];
      g.life -= dt;
      if (g.life <= 0) {
        this.ghosts.splice(i, 1);
      }
    }

    // Atualiza Cortes Katana Zero (Slash Lines)
    for (let i = this.slashLines.length - 1; i >= 0; i--) {
      const s = this.slashLines[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.slashLines.splice(i, 1);
      }
    }
  }

  createSparks(x, y, color = '#ffd700', count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        gravity: 200
      });
    }
  }

  createDust(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.particles.push({
        x: x + (Math.random() * 14 - 7),
        y: y - 2,
        vx: dir * (25 + Math.random() * 45),
        vy: -18 - Math.random() * 28,
        size: 3 + Math.random() * 2,
        color: '#cfd8dc',
        life: 0.24,
        maxLife: 0.24,
        gravity: 50
      });
    }
  }

  createSmoke(x, y, count = 3, color = '#546e7a') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 10 - 5),
        vx: (Math.random() * 24 - 12),
        vy: -35 - Math.random() * 45,
        size: 5 + Math.random() * 5,
        color,
        life: 0.45 + Math.random() * 0.3,
        maxLife: 0.75,
        gravity: -25
      });
    }
  }

  createDebris(x, y, colors = ['#90a4ae', '#ffd700', '#546e7a'], count = 6) {
    for (let i = 0; i < count; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      this.debris.push({
        x,
        y,
        vx: (Math.random() * 2 - 1) * 190,
        vy: -160 - Math.random() * 220,
        size: 4 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() * 2 - 1) * 12,
        color: col,
        life: 0.9 + Math.random() * 0.4,
        maxLife: 1.3
      });
    }
  }

  createExplosion(x, y, scale = 1) {
    // Camada 1: Flash branco central (estilo Metal Slug)
    this.flashes.push({
      x,
      y,
      radius: 28 * scale,
      life: 0.14,
      maxLife: 0.14
    });

    // Camada 2: Bola de fogo laranja/vermelho/amarelo
    const fireColors = ['#ff1744', '#ff6d00', '#ffd600', '#ffffff'];
    const count = Math.round(24 * scale);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (65 + Math.random() * 210) * scale;
      const col = fireColors[Math.floor(Math.random() * fireColors.length)];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        size: (4 + Math.random() * 5) * Math.min(1.4, scale),
        color: col,
        life: 0.28 + Math.random() * 0.28,
        maxLife: 0.56,
        gravity: 220
      });
    }

    // Camada 3: Fumaça ascendente + estilhaços quicando
    this.createSmoke(x, y - 6, Math.round(6 * scale), '#455a64');
    this.createDebris(x, y, ['#ffd600', '#ff6d00', '#78909c', '#37474f'], Math.round(5 * scale));
  }

  createDamageNumber(x, y, text, color = '#ffffff') {
    this.damageTexts.push({
      x,
      y,
      text: String(text),
      vy: -50,
      color,
      life: 0.65,
      maxLife: 0.65
    });
  }

  createDashGhost(x, y, w, h, facing, color = 'rgba(0, 229, 255, 0.35)') {
    this.ghosts.push({
      x,
      y,
      w,
      h,
      facing,
      color,
      life: 0.18,
      maxLife: 0.18
    });
  }

  createSlashLine(x, y, angle = -0.35, length = 92, color = '#00e5ff') {
    this.slashLines.push({
      x,
      y,
      angle,
      length,
      color,
      life: 0.18,
      maxLife: 0.18
    });
  }

  render(ctx, cameraX) {
    // Renderiza Rastros de Dash
    this.ghosts.forEach(g => {
      const alpha = g.life / g.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha * 0.45;
      ctx.fillStyle = g.color || 'rgba(0, 229, 255, 0.35)';
      ctx.fillRect(g.x - cameraX, g.y, g.w, g.h);
      ctx.restore();
    });
    ctx.globalAlpha = 1.0;

    // Renderiza Cortes Estilo Katana Zero
    this.slashLines.forEach(s => {
      const t = Math.max(0, s.life / s.maxLife);
      const sx = s.x - cameraX;
      const half = (s.length * (1.15 - t * 0.25)) * 0.5;
      const thick = Math.max(1.5, 5.5 * t);
      ctx.save();
      ctx.translate(sx, s.y);
      ctx.rotate(s.angle);
      ctx.globalAlpha = Math.min(1, t * 1.4);
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(-half, 0);
      ctx.lineTo(0, -thick);
      ctx.lineTo(half, 0);
      ctx.lineTo(0, thick);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-half * 0.85, 0);
      ctx.lineTo(0, -thick * 0.45);
      ctx.lineTo(half * 0.85, 0);
      ctx.lineTo(0, thick * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Renderiza Flashes Centrais de Explosão
    this.flashes.forEach(f => {
      const t = Math.max(0, f.life / f.maxLife);
      const r = f.radius * (1.25 - t * 0.45);
      ctx.save();
      ctx.globalAlpha = t * 0.9;
      ctx.fillStyle = t > 0.5 ? '#ffffff' : '#ffd600';
      ctx.beginPath();
      ctx.arc(f.x - cameraX, f.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff6d00';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    });

    // Renderiza Partículas
    this.particles.forEach(p => {
      const alpha = p.maxLife ? Math.max(0, Math.min(1, p.life / p.maxLife)) : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
      ctx.restore();
    });

    // Renderiza Estilhaços Quicando no Chão
    this.debris.forEach(d => {
      const alpha = Math.max(0, Math.min(1, d.life / d.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(d.x - cameraX, d.y);
      ctx.rotate(d.rot);
      ctx.fillStyle = d.color;
      ctx.fillRect(-d.size * 0.5, -d.size * 0.5, d.size, d.size * 0.75);
      ctx.restore();
    });

    // Renderiza Textos Flutuantes
    this.damageTexts.forEach(t => {
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      // Sombra
      ctx.fillText(t.text, t.x - cameraX + 1, t.y + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x - cameraX, t.y);
      ctx.restore();
    });
  }
}
