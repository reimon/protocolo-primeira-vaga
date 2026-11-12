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
  }

  update(dt) {
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

  createDust(x, y) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() * 12 - 6),
        y,
        vx: (Math.random() * 40 - 20),
        vy: -20 - Math.random() * 25,
        size: 3,
        color: '#b0bec5',
        life: 0.2,
        maxLife: 0.2,
        gravity: 40
      });
    }
  }

  createExplosion(x, y) {
    const colors = ['#ff1744', '#ff9100', '#ffd600', '#ffffff'];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 220;
      const col = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: col,
        life: 0.35 + Math.random() * 0.3,
        maxLife: 0.65,
        gravity: 300
      });
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

  createDashGhost(x, y, w, h, facing) {
    this.ghosts.push({
      x,
      y,
      w,
      h,
      facing,
      life: 0.16,
      maxLife: 0.16
    });
  }

  render(ctx, cameraX) {
    // Renderiza Rastros de Dash
    ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
    this.ghosts.forEach(g => {
      const alpha = g.life / g.maxLife;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillRect(g.x - cameraX, g.y, g.w, g.h);
    });
    ctx.globalAlpha = 1.0;

    // Renderiza Partículas
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cameraX, p.y, p.size, p.size);
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
