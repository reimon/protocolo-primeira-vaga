/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Enemy.js - 4 Tipos de Inimigos com IA Distinta
 */

export class Enemy {
  constructor(type, x, y) {
    this.type = type; // 'bug', 'ghost', 'golem', 'drone'
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
    this.isDead = false;
    this.hitTimer = 0;
    this.attackCooldown = 0;

    // Configuração por Tipo
    if (type === 'bug') {
      this.width = 28;
      this.height = 20;
      this.hp = 35;
      this.maxHp = 35;
      this.speed = 100;
      this.damage = 12;
      this.xpValue = 30;
      this.scoreValue = 150;
    } else if (type === 'ghost') {
      this.width = 26;
      this.height = 28;
      this.hp = 45;
      this.maxHp = 45;
      this.speed = 85;
      this.damage = 15;
      this.xpValue = 45;
      this.scoreValue = 250;
      this.floatTimer = Math.random() * Math.PI * 2;
    } else if (type === 'golem') {
      this.width = 40;
      this.height = 44;
      this.hp = 90;
      this.maxHp = 90;
      this.speed = 55;
      this.damage = 22;
      this.xpValue = 90;
      this.scoreValue = 450;
      this.hasFrontShield = true;
    } else if (type === 'drone') {
      this.width = 28;
      this.height = 24;
      this.hp = 40;
      this.maxHp = 40;
      this.speed = 110;
      this.damage = 14;
      this.xpValue = 55;
      this.scoreValue = 300;
      this.shootTimer = 1.8;
    }

    this.animTimer = 0;
    this.animFrame = 1;
  }

  update(dt, player, platforms, projectiles, soundEngine, particleSystem) {
    if (this.isDead) return;

    if (this.hitTimer > 0) this.hitTimer -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    this.animTimer += dt;
    if (this.animTimer > 0.15) {
      this.animTimer = 0;
      this.animFrame = this.animFrame === 1 ? 2 : 1;
    }

    const distToPlayer = player.x - this.x;
    const absDist = Math.abs(distToPlayer);

    // --- IA POR TIPO ---
    if (this.type === 'bug') {
      // Patrulha e corre em bote quando o player se aproxima
      const isLunge = absDist < 180;
      const currentSpeed = isLunge ? this.speed * 1.7 : this.speed;
      this.facing = distToPlayer > 0 ? 1 : -1;
      this.vx = this.facing * currentSpeed;
      this.vy += 1200 * dt;

      this.moveAndCollide(dt, platforms);
    } else if (this.type === 'ghost') {
      // Flutua ignorando plataformas e persegue o player
      this.floatTimer += dt * 3;
      this.facing = distToPlayer > 0 ? 1 : -1;
      this.x += (distToPlayer > 0 ? 1 : -1) * this.speed * dt;
      this.y += Math.sin(this.floatTimer) * 50 * dt;
      // Persegue verticalmente
      if (player.y > this.y) this.y += 35 * dt;
      else if (player.y < this.y) this.y -= 35 * dt;
    } else if (this.type === 'golem') {
      // Anda pesado em direção ao player
      this.facing = distToPlayer > 0 ? 1 : -1;
      this.vx = this.facing * this.speed;
      this.vy += 1200 * dt;
      this.moveAndCollide(dt, platforms);
    } else if (this.type === 'drone') {
      // Voa no ar e dispara emails de ghosting
      if (absDist > 300) {
        this.facing = distToPlayer > 0 ? 1 : -1;
      }
      this.x += this.facing * this.speed * dt;
      // Mantém altura no topo
      if (this.y > 280) this.y -= 40 * dt;
      else if (this.y < 220) this.y += 40 * dt;

      this.shootTimer -= dt;
      if (this.shootTimer <= 0 && absDist < 450) {
        this.shootTimer = 2.4;
        this.shootEmail(projectiles, player, soundEngine);
      }
    }

    // Colisão com o Player
    if (this.checkAABB(this, player) && this.attackCooldown <= 0) {
      const dmg = player.takeDamage(this.damage, soundEngine, { trigger: () => {} });
      if (dmg > 0 && particleSystem) {
        particleSystem.createDamageNumber(player.x + 10, player.y - 10, dmg, '#ff1744');
      }
      this.attackCooldown = 1.0;
    }
  }

  moveAndCollide(dt, platforms) {
    this.x += this.vx * dt;
    for (const p of platforms) {
      if (this.checkAABB(this, p)) {
        if (this.vx > 0) {
          this.x = p.x - this.width;
          this.facing = -1;
        } else if (this.vx < 0) {
          this.x = p.x + p.width;
          this.facing = 1;
        }
      }
    }

    this.y += this.vy * dt;
    for (const p of platforms) {
      if (this.checkAABB(this, p)) {
        if (this.vy > 0) {
          this.y = p.y - this.height;
          this.vy = 0;
        } else if (this.vy < 0) {
          this.y = p.y + p.height;
          this.vy = 0;
        }
      }
    }
  }

  shootEmail(projectiles, player, soundEngine) {
    const dirX = player.x + player.width / 2 - (this.x + this.width / 2);
    const dirY = player.y + player.height / 2 - (this.y + this.height);
    const len = Math.hypot(dirX, dirY) || 1;

    projectiles.push({
      type: 'ghosting',
      x: this.x + this.width / 2,
      y: this.y + this.height,
      vx: (dirX / len) * 230,
      vy: (dirY / len) * 230,
      width: 16,
      height: 16,
      damage: 16,
      isEnemy: true,
      life: 4.0
    });
    soundEngine.playNoise(0.08, null, 0.12);
  }

  takeDamage(amount, attackFacing, particleSystem, soundEngine) {
    if (this.isDead) return 0;

    // Mecânica do Golem: Escudo frontal bloqueia!
    if (this.type === 'golem' && this.hasFrontShield) {
      // Se o ataque vem de frente para onde o golem está olhando
      const attackingFromFront = (attackFacing === 1 && this.facing === -1) ||
                                 (attackFacing === -1 && this.facing === 1);
      if (attackingFromFront) {
        soundEngine.playHit();
        if (particleSystem) {
          particleSystem.createSparks(
            this.facing === 1 ? this.x + this.width : this.x,
            this.y + this.height / 2,
            '#ffd700',
            12
          );
          particleSystem.createDamageNumber(this.x + 10, this.y - 12, 'BLOQUEADO!', '#ffd700');
        }
        return 0; // Bloqueio total!
      }
    }

    this.hp -= amount;
    this.hitTimer = 0.18;
    soundEngine.playHit();

    if (particleSystem) {
      particleSystem.createSparks(
        this.x + this.width / 2,
        this.y + this.height / 2,
        '#ff1744',
        10
      );
      particleSystem.createDamageNumber(this.x + 8, this.y - 10, amount, '#ffffff');
    }

    if (this.hp <= 0) {
      this.isDead = true;
      soundEngine.playEnemyDeath();
      if (particleSystem) {
        particleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
      }
    }

    return amount;
  }

  checkAABB(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  render(ctx, renderer, cameraX) {
    if (this.isDead) return;

    let spriteKey = '';
    const isHit = this.hitTimer > 0;

    if (this.type === 'bug') {
      spriteKey = isHit ? 'enemy_bug_hit' : `enemy_bug_walk${this.animFrame}`;
    } else if (this.type === 'ghost') {
      spriteKey = isHit ? 'enemy_ghost_hit' : `enemy_ghost_float${this.animFrame}`;
    } else if (this.type === 'golem') {
      spriteKey = isHit ? 'enemy_golem_hit' : (this.animFrame === 1 ? 'enemy_golem_stand' : 'enemy_golem_walk');
    } else if (this.type === 'drone') {
      spriteKey = isHit ? 'enemy_drone_hit' : `enemy_drone_fly${this.animFrame}`;
    }

    const sprite = renderer.get(spriteKey);
    if (!sprite) return;

    const screenX = this.x - cameraX;
    const screenY = this.y;

    ctx.save();
    if (this.facing === 1) {
      ctx.translate(screenX + this.width / 2, screenY);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, -this.width / 2 - 4, -4);
    } else {
      ctx.drawImage(sprite, screenX - 4, screenY - 4);
    }

    // Mini barra de HP acima do inimigo
    if (this.hp < this.maxHp) {
      const barW = this.width;
      const hpPct = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(screenX, screenY - 8, barW, 4);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(screenX, screenY - 8, barW * hpPct, 4);
    }

    ctx.restore();
  }
}
