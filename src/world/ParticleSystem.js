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
    this.shockwaves = [];
    this.plumes = [];
    this.scorchMarks = [];
    this.screenFlash = null;
  }

  update(dt, groundY = 560) {
    // Atualiza Flash de Tela
    if (this.screenFlash) {
      this.screenFlash.life -= dt;
      if (this.screenFlash.life <= 0) {
        this.screenFlash = null;
      }
    }

    // Atualiza Flashes de Explosão
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt;
      if (f.life <= 0) {
        this.flashes.splice(i, 1);
      }
    }

    // Atualiza Anéis de Onda de Choque
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Atualiza Nuvens Volumétricas de Fogo/Fumaça
    for (let i = this.plumes.length - 1; i >= 0; i--) {
      const pl = this.plumes[i];
      pl.x += pl.vx * dt;
      pl.y += pl.vy * dt;
      pl.vx *= 0.96;
      pl.life -= dt;
      if (pl.life <= 0) {
        this.plumes.splice(i, 1);
      }
    }

    // Atualiza Marcas de Chamuscado no Chão
    for (let i = this.scorchMarks.length - 1; i >= 0; i--) {
      const sc = this.scorchMarks[i];
      sc.life -= dt;
      if (sc.life <= 0) {
        this.scorchMarks.splice(i, 1);
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

  createShockwaveRing(x, y, maxRadius = 64, color = '#ffd600', duration = 0.26) {
    this.shockwaves.push({
      x,
      y,
      maxRadius,
      color,
      life: duration,
      maxLife: duration
    });
  }

  createScorchMark(x, y = 560, width = 54) {
    if (this.scorchMarks.length >= 28) {
      this.scorchMarks.shift();
    }
    this.scorchMarks.push({
      x,
      y,
      width,
      life: 14,
      maxLife: 14
    });
  }

  triggerScreenFlash(color = '#ffffff', alpha = 0.32, duration = 0.1) {
    this.screenFlash = {
      color,
      alpha,
      life: duration,
      maxLife: duration
    };
  }

  createImpactBurst(x, y, dir = 1, color = '#00e5ff') {
    this.createShockwaveRing(x, y, 28, color, 0.16);
    for (let i = 0; i < 8; i++) {
      const spread = (Math.random() - 0.5) * 1.4;
      const speed = 110 + Math.random() * 170;
      this.particles.push({
        x,
        y,
        vx: Math.cos(spread) * speed * (dir || 1),
        vy: Math.sin(spread) * speed - 30,
        size: 2 + Math.random() * 2.5,
        color: i % 2 === 0 ? '#ffffff' : color,
        life: 0.18 + Math.random() * 0.12,
        maxLife: 0.3,
        gravity: 240
      });
    }
  }

  createExplosion(x, y, scale = 1, groundY = 560) {
    // Camada 1: Flash branco central + Onda de Choque expansiva (estilo Metal Slug)
    this.flashes.push({
      x,
      y,
      radius: 30 * scale,
      life: 0.16,
      maxLife: 0.16
    });
    this.createShockwaveRing(x, y, 62 * scale, scale >= 1.2 ? '#ff9100' : '#ffd600', 0.28);

    // Camada 2: Nuvens volumétricas em camadas (núcleo quente -> fogo -> fumaça escura)
    const plumeCount = Math.max(4, Math.round(7 * scale));
    for (let i = 0; i < plumeCount; i++) {
      const angle = (Math.PI * 2 * i) / plumeCount + (Math.random() * 0.4 - 0.2);
      const dist = (6 + Math.random() * 16) * scale;
      const isHot = i % 2 === 0;
      this.plumes.push({
        x: x + Math.cos(angle) * dist * 0.5,
        y: y + Math.sin(angle) * dist * 0.4,
        vx: Math.cos(angle) * (35 + Math.random() * 55) * scale,
        vy: Math.sin(angle) * (25 + Math.random() * 45) * scale - 42,
        startR: 6 * scale,
        endR: (16 + Math.random() * 10) * scale,
        color: isHot ? '#ff6d00' : '#455a64',
        innerColor: isHot ? '#ffea00' : '#78909c',
        life: isHot ? 0.34 + Math.random() * 0.14 : 0.52 + Math.random() * 0.22,
        maxLife: isHot ? 0.48 : 0.74
      });
    }

    // Camada 3: Faíscas e fragmentos de bola de fogo
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

    // Camada 4: Fumaça ascendente + estilhaços quicando + marca no chão
    this.createSmoke(x, y - 6, Math.round(6 * scale), '#455a64');
    this.createDebris(x, y, ['#ffd600', '#ff6d00', '#78909c', '#37474f'], Math.round(6 * scale));
    if (y >= groundY - 120) {
      this.createScorchMark(x, groundY, Math.round(46 * Math.min(1.8, scale)));
    }
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
    // Renderiza Marcas de Chamuscado / Crateras no Chão
    this.scorchMarks.forEach(sc => {
      const fade = Math.min(1, sc.life / Math.min(3, sc.maxLife));
      ctx.save();
      ctx.globalAlpha = fade * 0.55;
      ctx.fillStyle = '#0d0f14';
      ctx.beginPath();
      ctx.ellipse(sc.x - cameraX, sc.y + 3, sc.width * 0.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = fade * 0.35;
      ctx.fillStyle = '#ff6d00';
      ctx.beginPath();
      ctx.ellipse(sc.x - cameraX, sc.y + 3, sc.width * 0.22, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

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

    // Renderiza Nuvens Volumétricas de Fogo/Fumaça em Camadas
    this.plumes.forEach(pl => {
      const t = Math.max(0, pl.life / pl.maxLife);
      const r = pl.startR + (pl.endR - pl.startR) * (1 - t);
      ctx.save();
      ctx.globalAlpha = Math.min(0.88, t * 1.15);
      ctx.fillStyle = pl.color;
      ctx.beginPath();
      ctx.arc(pl.x - cameraX, pl.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pl.innerColor;
      ctx.beginPath();
      ctx.arc(pl.x - cameraX - r * 0.16, pl.y - r * 0.16, r * 0.52, 0, Math.PI * 2);
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

    // Renderiza Anéis de Onda de Choque
    this.shockwaves.forEach(sw => {
      const t = Math.max(0, sw.life / sw.maxLife);
      const r = Math.max(4, sw.maxRadius * (1 - t * 0.78));
      ctx.save();
      ctx.globalAlpha = t * 0.85;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = Math.max(1.5, 4.5 * t);
      ctx.beginPath();
      ctx.arc(sw.x - cameraX, sw.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, 1.8 * t);
      ctx.beginPath();
      ctx.arc(sw.x - cameraX, sw.y, r * 0.82, 0, Math.PI * 2);
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

    // Renderiza Textos Flutuantes com Pop inicial
    this.damageTexts.forEach(t => {
      const progress = Math.max(0, t.life / t.maxLife);
      const pop = progress > 0.78 ? 1 + (1 - progress) * 1.4 : 1;
      ctx.save();
      ctx.globalAlpha = Math.min(1, progress * 1.25);
      ctx.translate(t.x - cameraX, t.y);
      ctx.scale(pop, pop);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, 1, 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    });
  }

  renderScreenFlash(ctx, width, height) {
    if (!this.screenFlash) return;
    const t = Math.max(0, this.screenFlash.life / this.screenFlash.maxLife);
    ctx.save();
    ctx.globalAlpha = this.screenFlash.alpha * t;
    ctx.fillStyle = this.screenFlash.color;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
