/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Enemy.js - Vilões Reais da Jornada pelo Primeiro Emprego Tech + Stomp estilo Mario
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
    this.squashTimer = 0;
    this.stunTimer = 0;
    this.attackCooldown = 0;
    this.isAlert = false;
    this.fxTime = Math.random() * 10;

    // Configuração por Tipo (Vilões Reais do Mercado Tech)
    if (type === 'bug') {
      this.width = 46;
      this.height = 34;
      this.hp = 35;
      this.maxHp = 35;
      this.speed = 105;
      this.damage = 12;
      this.xpValue = 30;
      this.scoreValue = 150;
      this.label = 'BUG NA SEXTA';
      this.badgeColor = '#ff1744';
      this.hopTimer = 0;
    } else if (type === 'ghost') {
      this.width = 46;
      this.height = 50;
      this.hp = 45;
      this.maxHp = 45;
      this.speed = 90;
      this.damage = 15;
      this.xpValue = 45;
      this.scoreValue = 250;
      this.label = 'SÍNDROME IMPOSTOR';
      this.badgeColor = '#ba68c8';
      this.floatTimer = Math.random() * Math.PI * 2;
      this.taunts = ['"Você não sabe nada"', '"Todos são melhores"', '"Vai reprovar!"'];
      this.tauntIndex = Math.floor(Math.random() * this.taunts.length);
      this.tauntTimer = 0;
    } else if (type === 'golem') {
      this.width = 66;
      this.height = 72;
      this.hp = 95;
      this.maxHp = 95;
      this.speed = 60;
      this.damage = 22;
      this.xpValue = 90;
      this.scoreValue = 450;
      this.hasFrontShield = true;
      this.label = 'VAGA JR: 5 ANOS EXP';
      this.badgeColor = '#ffd700';
    } else if (type === 'drone') {
      this.width = 50;
      this.height = 42;
      this.hp = 40;
      this.maxHp = 40;
      this.speed = 115;
      this.damage = 14;
      this.xpValue = 55;
      this.scoreValue = 300;
      this.shootTimer = 1.8;
      this.label = 'GHOSTING DO RH';
      this.badgeColor = '#00e5ff';
      if (this.y < 330) this.y = 370;
    }

    this.animTimer = 0;
    this.animFrame = 1;
  }

  update(dt, player, platforms, projectiles, soundEngine, particleSystem) {
    if (this.isDead) return;

    this.fxTime += dt;
    if (this.hitTimer > 0) this.hitTimer -= dt;
    if (this.squashTimer > 0) this.squashTimer -= dt;
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      if (this.type === 'bug' || this.type === 'golem') {
        this.vy += 1200 * dt;
        this.moveAndCollide(dt, platforms);
      }
      return;
    }
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    this.animTimer += dt;
    if (this.animTimer > 0.14) {
      this.animTimer = 0;
      this.animFrame = this.animFrame === 1 ? 2 : 1;
    }

    const distToPlayer = (player.x + player.width / 2) - (this.x + this.width / 2);
    const absDist = Math.abs(distToPlayer);

    // --- IA POR TIPO ---
    if (this.type === 'bug') {
      const isLunge = absDist < 230;
      this.isAlert = isLunge;
      const currentSpeed = isLunge ? this.speed * 1.75 : this.speed;
      this.facing = distToPlayer > 0 ? 1 : -1;
      this.vx = this.facing * currentSpeed;
      this.vy += 1200 * dt;

      if (isLunge && this.vy === 0) {
        this.hopTimer += dt;
        if (this.hopTimer > 1.05) {
          this.hopTimer = 0;
          this.vy = -250;
        }
      }

      this.moveAndCollide(dt, platforms);
    } else if (this.type === 'ghost') {
      this.floatTimer += dt * 3.2;
      this.tauntTimer += dt;
      if (this.tauntTimer > 3.0) {
        this.tauntTimer = 0;
        this.tauntIndex = (this.tauntIndex + 1) % this.taunts.length;
      }

      this.isAlert = absDist < 260;
      this.facing = distToPlayer > 0 ? 1 : -1;
      this.x += (distToPlayer > 0 ? 1 : -1) * this.speed * dt;
      this.y += Math.sin(this.floatTimer) * 55 * dt;

      if (player.y - 15 > this.y) this.y += 42 * dt;
      else if (player.y - 15 < this.y) this.y -= 42 * dt;

      if (Math.random() < 0.08 && particleSystem) {
        particleSystem.createSparks(this.x + this.width / 2, this.y + this.height / 2, '#ba68c8', 1);
      }
    } else if (this.type === 'golem') {
      this.isAlert = absDist < 260;
      this.facing = distToPlayer > 0 ? 1 : -1;
      this.vx = this.facing * this.speed;
      this.vy += 1200 * dt;
      this.moveAndCollide(dt, platforms);
    } else if (this.type === 'drone') {
      if (absDist > 260) {
        this.facing = distToPlayer > 0 ? 1 : -1;
      }
      this.x += this.facing * this.speed * dt;

      const targetY = 380 + Math.sin(this.fxTime * 2.5 + this.x * 0.01) * 28;
      this.y += (targetY - this.y) * 2.5 * dt;

      this.shootTimer -= dt;
      this.isAlert = this.shootTimer < 0.5 && absDist < 480;
      if (this.shootTimer <= 0 && absDist < 480) {
        this.shootTimer = 2.2;
        this.shootEmail(projectiles, player, soundEngine);
      }
    }

    // --- COLISÃO COM O PLAYER (INCLUI STOMP ESTILO MARIO) ---
    if (this.checkAABB(this, player)) {
      const playerBottom = player.y + player.height;
      const enemyTopZone = this.y + this.height * 0.58;
      const isStomping = player.vy > 0 && playerBottom <= enemyTopZone + 18;

      if (isStomping) {
        const stompDmg = 35 + Math.floor((player.bonusDamage || 0) * 0.5);
        this.takeStompDamage(stompDmg, player, soundEngine, particleSystem);
        return;
      }

      if (this.attackCooldown <= 0) {
        const dmg = player.takeDamage(this.damage, soundEngine, { trigger: () => {} });
        if (dmg > 0 && particleSystem) {
          particleSystem.createDamageNumber(player.x + 10, player.y - 10, dmg, '#ff1744');
        }
        this.attackCooldown = 1.0;
      }
    }
  }

  takeStompDamage(amount, player, soundEngine, particleSystem) {
    if (this.isDead) return 0;

    this.hp -= amount;
    this.hitTimer = 0.2;
    this.squashTimer = 0.22;
    this.stunTimer = 0.25;

    player.y = this.y - player.height - 2;
    player.vy = -420;
    player.doubleJumpUsed = false;
    player.canDash = true;
    player.invincibleTimer = Math.max(player.invincibleTimer, 0.18);

    if (soundEngine) {
      soundEngine.playJump();
      soundEngine.playHit();
    }

    if (particleSystem) {
      particleSystem.createSparks(
        this.x + this.width / 2,
        this.y + 6,
        '#00e5ff',
        14
      );
      particleSystem.createDamageNumber(this.x + this.width / 2 - 12, this.y - 16, `STOMP -${amount}`, '#ffd700');
    }

    if (this.hp <= 0) {
      this.isDead = true;
      if (soundEngine) soundEngine.playEnemyDeath();
      if (particleSystem) {
        particleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2);
      }
    }

    return amount;
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
      vx: (dirX / len) * 235,
      vy: (dirY / len) * 235,
      width: 18,
      height: 18,
      damage: 16,
      isEnemy: true,
      life: 4.0
    });
    if (soundEngine) soundEngine.playNoise(0.08, null, 0.12);
  }

  takeDamage(amount, attackFacing, particleSystem, soundEngine) {
    if (this.isDead) return 0;

    if (this.type === 'golem' && this.hasFrontShield) {
      const attackingFromFront = (attackFacing === 1 && this.facing === -1) ||
                                 (attackFacing === -1 && this.facing === 1);
      if (attackingFromFront) {
        if (soundEngine) soundEngine.playHit();
        if (particleSystem) {
          particleSystem.createSparks(
            this.facing === 1 ? this.x + this.width : this.x,
            this.y + this.height / 2,
            '#ffd700',
            12
          );
          particleSystem.createDamageNumber(this.x - 10, this.y - 12, 'EXIGE 5 ANOS!', '#ffd700');
        }
        return 0;
      }
    }

    this.hp -= amount;
    this.hitTimer = 0.18;
    this.x += (attackFacing || 1) * 10;
    if (soundEngine) soundEngine.playHit();

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
      if (soundEngine) soundEngine.playEnemyDeath();
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
    const centerX = screenX + this.width / 2;
    const footY = screenY + this.height;

    // 1. Sombra projetada oval sob o inimigo
    ctx.save();
    ctx.fillStyle = (this.type === 'ghost' || this.type === 'drone') ? 'rgba(12, 18, 28, 0.25)' : 'rgba(12, 18, 28, 0.42)';
    const shadowY = (this.type === 'ghost' || this.type === 'drone') ? 558 : footY - 1;
    ctx.beginPath();
    ctx.ellipse(Math.round(centerX), Math.round(shadowY), this.width * 0.44, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Renderização do Sprite com Escala Hi-Bit e Squash & Stretch
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (this.type === 'ghost') {
      ctx.globalAlpha = 0.85;
    }

    ctx.translate(Math.round(centerX), Math.round(footY));

    if (this.squashTimer > 0) {
      ctx.scale(1.35, 0.55);
    }

    if (this.facing === 1) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(sprite, -this.width / 2 - 4, -this.height - 4, this.width + 8, this.height + 6);
    ctx.restore();

    // 3. Detalhes Temáticos Animados por Vilão do Primeiro Emprego
    ctx.save();
    if (this.type === 'golem' && this.hasFrontShield) {
      const shieldX = this.facing === 1 ? screenX + this.width + 2 : screenX - 10;
      const pulse = 0.65 + Math.sin(this.fxTime * 6) * 0.25;
      ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.fillRect(shieldX, screenY + 4, 8, this.height - 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(shieldX + 2, screenY + 10, 3, this.height - 20);
    } else if (this.type === 'drone') {
      // Hélice giratória + LED "VISTO" piscando
      const rotW = Math.abs(Math.sin(this.fxTime * 22)) * 28 + 4;
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(centerX - rotW / 2, screenY - 4, rotW, 3);
      if (this.isAlert) {
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(centerX - 3, screenY + 6, 6, 6);
      }
    } else if (this.type === 'ghost' && this.isAlert) {
      // Sussurro da Síndrome do Impostor flutuando
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e1bee7';
      ctx.fillText(this.taunts[this.tauntIndex], centerX, screenY - 26);
    } else if (this.type === 'bug' && this.isAlert) {
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff5252';
      ctx.fillText('ERR_500!', centerX, screenY - 25);
    }
    ctx.restore();

    // 4. Tag de Identificação do Vilão (Pílula compacta legível)
    ctx.save();
    ctx.font = 'bold 9px monospace';
    const labelText = this.label;
    const textW = ctx.measureText(labelText).width;
    const pillW = textW + 10;
    const pillX = Math.round(centerX - pillW / 2);
    const pillY = Math.round(screenY - 22);

    ctx.fillStyle = 'rgba(10, 14, 24, 0.85)';
    ctx.fillRect(pillX, pillY, pillW, 13);
    ctx.strokeStyle = this.badgeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(pillX, pillY, pillW, 13);

    ctx.fillStyle = this.badgeColor;
    ctx.textAlign = 'center';
    ctx.fillText(labelText, centerX, pillY + 10);

    // 5. Barra de HP quando ferido
    if (this.hp < this.maxHp) {
      const barW = this.width;
      const hpPct = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(screenX, screenY - 7, barW, 5);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(screenX + 1, screenY - 6, (barW - 2) * hpPct, 3);
    }
    ctx.restore();
  }
}
