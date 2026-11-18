/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Enemy.js - Vilões Reais da Jornada pelo Primeiro Emprego Tech + Stomp estilo Mario
 */

export class Enemy {
  constructor(type, x, y) {
    this.type = type; // 'bug', 'ghost', 'golem', 'drone', 'procrastination', 'interviewer'
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
      this.height = 38;
      this.hp = 35;
      this.maxHp = 35;
      this.speed = 105;
      this.damage = 12;
      this.xpValue = 30;
      this.scoreValue = 150;
      this.label = 'BUG EM PROD';
      this.badgeColor = '#ff1744';
      this.hopTimer = 0;
      this.quip = 'Funciona na minha máquina!';
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
      this.taunts = ['"Você só copia código"', '"Todos sabem mais"', '"Vai travar na call!"'];
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
      this.quip = 'Exige 5 anos de IA!';
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
      this.quip = 'Retornamos em breve...';
      if (this.y < 330) this.y = 370;
    } else if (type === 'procrastination') {
      this.width = 42;
      this.height = 48;
      this.hp = 40;
      this.maxHp = 40;
      this.speed = 95;
      this.damage = 13;
      this.xpValue = 35;
      this.scoreValue = 180;
      this.label = 'SCROLL INFINITO';
      this.badgeColor = '#ff2a85';
      this.chargeState = 'patrol';
      this.chargeTimer = 0;
      this.chargeCooldown = 0;
      this.quips = ['Só +1 vídeo curto!', 'Começa na segunda!', 'Olha esse meme dev!'];
      this.quip = this.quips[Math.floor(Math.random() * this.quips.length)];
    } else if (type === 'interviewer') {
      this.width = 46;
      this.height = 54;
      this.hp = 55;
      this.maxHp = 55;
      this.speed = 85;
      this.damage = 14;
      this.xpValue = 65;
      this.scoreValue = 340;
      this.label = 'LIVE CODING';
      this.badgeColor = '#ffd54f';
      this.throwTimer = 1.7;
      this.quips = ['Inverta a árvore!', 'Complexidade O(n)?', 'Sem usar Google!'];
      this.quipIndex = Math.floor(Math.random() * this.quips.length);
      this.quip = this.quips[this.quipIndex];
    } else if (type === 'blonde_glasses') {
      this.width = 38;
      this.height = 52;
      this.hp = 65;
      this.maxHp = 65;
      this.speed = 165;
      this.damage = 18;
      this.xpValue = 65;
      this.scoreValue = 320;
      this.label = 'CHEFE LOUCA';
      this.badgeColor = '#ffd54f';
      this.attackState = 'patrol'; // 'patrol', 'windup', 'whip', 'recover'
      this.attackStateTimer = 0;
      this.jumpCooldown = 0;
      this.dodgeCooldown = 0;
      this.onGround = false;
      this.landingSquashTimer = 0;
      this.attackHitDone = false;
      this.quips = ['Leu os 40 requisitos?!', 'Cadê a hora extra?!', 'Chicotada de feedback!'];
      this.quipIndex = Math.floor(Math.random() * this.quips.length);
      this.quip = this.quips[this.quipIndex];
    } else if (type === 'blonde_tongue') {
      this.width = 38;
      this.height = 52;
      this.hp = 62;
      this.maxHp = 62;
      this.speed = 158;
      this.damage = 18;
      this.xpValue = 65;
      this.scoreValue = 330;
      this.label = 'CHEFE LOUCA';
      this.badgeColor = '#ff4081';
      this.attackState = 'patrol'; // 'patrol', 'windup', 'strike', 'recover'
      this.attackStateTimer = 0;
      this.jumpCooldown = 0;
      this.dodgeCooldown = 0;
      this.onGround = false;
      this.landingSquashTimer = 0;
      this.tongueExtend = 0;
      this.attackHitDone = false;
      this.quips = ['Ouvi falar de layoff!', 'Zero soft skill!', 'Língua afiada de review!'];
      this.quipIndex = Math.floor(Math.random() * this.quips.length);
      this.quip = this.quips[this.quipIndex];
    }

    this.animTimer = 0;
    this.animFrame = 1;
    this.panicTimer = 0;
  }

  update(dt, player, platforms, projectiles, soundEngine, particleSystem) {
    if (this.isDead) return;

    this.fxTime += dt;
    if (this.hitTimer > 0) this.hitTimer -= dt;
    if (this.squashTimer > 0) this.squashTimer -= dt;
    if (this.panicTimer > 0) this.panicTimer -= dt;
    if (this.type === 'drone' && this.hp <= this.maxHp * 0.5 && particleSystem && Math.random() < 0.25) {
      particleSystem.createSmoke(this.x + this.width / 2, this.y + this.height * 0.4, 1, '#37474f');
    }
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      if (this.type === 'bug' || this.type === 'golem' || this.type === 'procrastination' || this.type === 'interviewer' || this.type === 'blonde_glasses' || this.type === 'blonde_tongue') {
        this.vy += 1200 * dt;
        this.moveAndCollide(dt, platforms);
      }
      return;
    }
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    this.animTimer += dt;
    const frameInterval = (this.type === 'drone' || this.type === 'blonde_glasses' || this.type === 'blonde_tongue') ? 0.075 : 0.11;
    if (this.animTimer > frameInterval) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame % 4) + 1;
    }

    const distToPlayer = (player.x + player.width / 2) - (this.x + this.width / 2);
    const absDist = Math.abs(distToPlayer);
    if ((player.isIaido || player.isDashing) && absDist < 150 && Math.abs(player.y - this.y) < 95) {
      this.panicTimer = Math.max(this.panicTimer, 0.45);
    }

    // --- IA POR TIPO ---
    if (this.type === 'bug') {
      const isLunge = absDist < 230;
      this.isAlert = isLunge;
      const currentSpeed = isLunge ? this.speed * 1.75 : this.speed;
      if (absDist > 12) {
        this.facing = distToPlayer > 0 ? 1 : -1;
      }
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
      if (absDist > 12) {
        this.facing = distToPlayer > 0 ? 1 : -1;
      }
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
    } else if (this.type === 'procrastination') {
      if (this.chargeCooldown > 0) this.chargeCooldown -= dt;
      if (this.chargeState === 'patrol') {
        this.isAlert = absDist < 280;
        if (absDist > 14) {
          this.facing = distToPlayer > 0 ? 1 : -1;
        }
        this.vx = this.facing * this.speed;
        if (absDist < 245 && this.chargeCooldown <= 0) {
          this.chargeState = 'windup';
          this.chargeTimer = 0.42;
          this.vx = 0;
          this.quip = this.quips[Math.floor(Math.random() * this.quips.length)];
        }
      } else if (this.chargeState === 'windup') {
        this.isAlert = true;
        this.vx = 0;
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) {
          this.chargeState = 'dash';
          this.chargeTimer = 0.34;
          if (absDist > 8) this.facing = distToPlayer > 0 ? 1 : -1;
        }
      } else if (this.chargeState === 'dash') {
        this.isAlert = true;
        this.vx = this.facing * this.speed * 2.45;
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) {
          this.chargeState = 'patrol';
          this.chargeCooldown = 1.6;
        }
      }
      this.vy += 1200 * dt;
      this.moveAndCollide(dt, platforms);
    } else if (this.type === 'interviewer') {
      if (absDist > 10) {
        this.facing = distToPlayer > 0 ? 1 : -1;
      }
      if (absDist < 120) {
        this.vx = -this.facing * this.speed * 0.75;
      } else if (absDist > 330 && absDist < 620) {
        this.vx = this.facing * this.speed;
      } else {
        this.vx = 0;
      }

      if (absDist < 480) {
        this.throwTimer -= dt;
      }
      this.isAlert = this.throwTimer < 0.42 && absDist < 480;
      if (this.throwTimer <= 0 && absDist < 480) {
        this.throwTimer = 2.3;
        this.quipIndex = (this.quipIndex + 1) % this.quips.length;
        this.quip = this.quips[this.quipIndex];
        this.throwWhiteboard(projectiles, player, soundEngine);
      }

      this.vy += 1200 * dt;
      this.moveAndCollide(dt, platforms);
    } else if (this.type === 'blonde_glasses' || this.type === 'blonde_tongue') {
      this.updateBlondeAI(dt, player, platforms, soundEngine, particleSystem, distToPlayer, absDist);
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
      this.triggerDeathFX(particleSystem, soundEngine);
    }

    return amount;
  }

  triggerDeathFX(particleSystem, soundEngine) {
    if (soundEngine) soundEngine.playEnemyDeath();
    if (!particleSystem) return;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    particleSystem.createExplosion(cx, cy, this.type === 'golem' ? 1.2 : 0.95);
    const debColors = this.type === 'bug'
      ? ['#ff1744', '#00e5ff', '#263238']
      : this.type === 'ghost'
        ? ['#00e5ff', '#ff2a85', '#7c4dff']
        : this.type === 'golem'
          ? ['#ffd700', '#223047', '#d50000']
          : this.type === 'procrastination'
            ? ['#ff2a85', '#00e5ff', '#1e272e']
            : this.type === 'interviewer'
              ? ['#eceff1', '#ffd54f', '#37474f']
              : this.type === 'blonde_glasses'
                ? ['#fdd835', '#fff59d', '#7b1fa2']
                : this.type === 'blonde_tongue'
                  ? ['#fdd835', '#ff4081', '#c2185b']
                  : ['#00e5ff', '#cfd8dc', '#ff5252'];
    particleSystem.createDebris(cx, cy, debColors, this.type === 'golem' ? 8 : 5);
  }

  updateBlondeAI(dt, player, platforms, soundEngine, particleSystem, distToPlayer, absDist) {
    const isWhipper = this.type === 'blonde_glasses';
    const strikeState = isWhipper ? 'whip' : 'strike';
    const triggerDist = isWhipper ? 175 : 215;

    if (this.jumpCooldown > 0) this.jumpCooldown -= dt;
    if (this.dodgeCooldown > 0) this.dodgeCooldown -= dt;
    if (this.landingSquashTimer > 0) this.landingSquashTimer -= dt;

    let targetVx = 0;
    const prevOnGround = this.onGround;

    if (this.attackState === 'patrol') {
      this.isAlert = absDist < 340;
      this.tongueExtend = 0;
      if (absDist > 12) this.facing = distToPlayer > 0 ? 1 : -1;
      targetVx = absDist < 650 ? this.facing * this.speed : 0;

      // Esquiva reativa se o herói atacar bem perto enquanto está no chão
      if (this.onGround && this.dodgeCooldown <= 0 && (player.isAttacking || player.isDashing) && absDist < 120 && Math.abs(player.y - this.y) < 75) {
        this.vy = -275;
        this.vx = -this.facing * 225;
        this.dodgeCooldown = 1.8;
        this.jumpCooldown = 0.8;
        if (particleSystem) particleSystem.createDust(this.x + this.width / 2, this.y + this.height, 4);
      } else if (this.onGround && this.jumpCooldown <= 0 && absDist < 440) {
        // Saltos ágeis para alcançar plataformas ou fechar distância
        if (player.y + player.height < this.y + 8) {
          this.vy = -400;
          this.jumpCooldown = 1.15;
          if (particleSystem) particleSystem.createDust(this.x + this.width / 2, this.y + this.height, 4);
        } else if (absDist > 220 && absDist < 350) {
          this.vy = -270;
          this.jumpCooldown = 1.45;
          if (particleSystem) particleSystem.createDust(this.x + this.width / 2, this.y + this.height, 3);
        }
      }

      if (absDist < triggerDist && Math.abs(player.y - this.y) < 88) {
        this.attackState = 'windup';
        this.attackStateTimer = 0.28;
        this.attackHitDone = false;
        this.quipIndex = (this.quipIndex + 1) % this.quips.length;
        this.quip = this.quips[this.quipIndex];
      }
    } else if (this.attackState === 'windup') {
      this.isAlert = true;
      this.tongueExtend = 0;
      targetVx = -this.facing * 55;
      this.attackStateTimer -= dt;
      if (this.attackStateTimer <= 0) {
        this.attackState = strikeState;
        this.attackStateTimer = isWhipper ? 0.32 : 0.42;
        if (soundEngine) soundEngine.playNoise(0.08, null, 0.17);
        if (isWhipper && particleSystem) {
          const whipTipX = this.facing === 1 ? this.x + this.width + 95 : this.x - 95;
          particleSystem.createSparks(whipTipX, this.y + 14, '#ffd54f', 10);
        }
      }
    } else if (this.attackState === strikeState) {
      this.isAlert = true;
      this.attackStateTimer -= dt;
      if (isWhipper) {
        // Investida acrobática rápida com rastros dourados durante a chicotada de cabelo
        const lungeProgress = Math.max(0, Math.min(1, this.attackStateTimer / 0.32));
        targetVx = this.facing * (70 + lungeProgress * 220);
        if (particleSystem && lungeProgress > 0.35 && Math.random() < 0.65) {
          particleSystem.createDashGhost(this.x, this.y, this.width, this.height, this.facing, 'rgba(255, 213, 79, 0.42)');
        }
        if (!this.attackHitDone) {
          const whipReach = 132;
          const whipBox = {
            x: this.facing === 1 ? this.x + this.width - 8 : this.x - whipReach + 8,
            y: this.y - 6,
            width: whipReach,
            height: 44
          };
          if (this.checkAABB(whipBox, player)) {
            this.attackHitDone = true;
            const dmg = player.takeDamage(this.damage, soundEngine, { trigger: () => {} });
            if (dmg > 0 && particleSystem) {
              particleSystem.createSparks(player.x + player.width / 2, player.y + 16, '#ffd54f', 10);
              particleSystem.createDamageNumber(player.x + 10, player.y - 10, dmg, '#ff1744');
            }
          }
        }
      } else {
        targetVx = this.attackStateTimer > 0.24 ? this.facing * 140 : 0;
        const progress = Math.max(0, Math.min(1, 1 - this.attackStateTimer / 0.42));
        this.tongueExtend = Math.sin(progress * Math.PI);
        const reach = Math.round(175 * this.tongueExtend);
        if (!this.attackHitDone && reach > 18) {
          const tongueBox = {
            x: this.facing === 1 ? this.x + this.width - 6 : this.x - reach + 6,
            y: this.y + 4,
            width: reach,
            height: 24
          };
          if (this.checkAABB(tongueBox, player)) {
            this.attackHitDone = true;
            const dmg = player.takeDamage(this.damage, soundEngine, { trigger: () => {} });
            if (dmg > 0 && particleSystem) {
              particleSystem.createSparks(player.x + player.width / 2, player.y + 16, '#ff4081', 10);
              particleSystem.createDamageNumber(player.x + 10, player.y - 10, dmg, '#ff1744');
            }
          }
        }
      }

      if (this.attackStateTimer <= 0) {
        this.tongueExtend = 0;
        this.attackState = 'recover';
        this.attackStateTimer = 0.46;
        if (this.onGround) {
          this.vy = -245;
          this.vx = -this.facing * 205;
          if (particleSystem) particleSystem.createDust(this.x + this.width / 2, this.y + this.height, 4);
        }
      }
    } else if (this.attackState === 'recover') {
      this.isAlert = false;
      this.tongueExtend = 0;
      targetVx = this.attackStateTimer > 0.16 ? -this.facing * 195 : 0;
      this.attackStateTimer -= dt;
      if (this.attackStateTimer <= 0) {
        this.attackState = 'patrol';
      }
    }

    // Suaviza aceleração horizontal para movimento fluido
    const accel = Math.min(1, dt * 14);
    this.vx += (targetVx - this.vx) * accel;
    this.vy += 1200 * dt;

    const prevVy = this.vy;
    this.onGround = false;
    this.moveAndCollide(dt, platforms);
    if (this.vy === 0 && prevVy >= 0) {
      this.onGround = true;
    }
    if (!prevOnGround && this.onGround && prevVy > 160) {
      this.landingSquashTimer = 0.11;
      if (particleSystem) {
        particleSystem.createDust(this.x + this.width / 2, this.y + this.height, 5);
      }
    }
  }

  throwWhiteboard(projectiles, player, soundEngine) {
    const dirX = (player.x + player.width / 2) - (this.x + this.width / 2);
    const signX = dirX >= 0 ? 1 : -1;
    projectiles.push({
      type: 'whiteboard',
      x: this.x + (signX > 0 ? this.width : -16),
      y: this.y + 12,
      vx: signX * 265,
      vy: -95,
      gravity: 220,
      width: 20,
      height: 18,
      damage: 15,
      isEnemy: true,
      life: 3.2
    });
    if (soundEngine) soundEngine.playNoise(0.07, null, 0.12);
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

  shatterShield(particleSystem, soundEngine) {
    if (!this.hasFrontShield) return false;
    this.hasFrontShield = false;
    this.stunTimer = 0.45;
    if (soundEngine) soundEngine.playDeflect();
    if (particleSystem) {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      particleSystem.createDebris(cx, cy, ['#ffd700', '#fff59d', '#ff9100'], 10);
      if (particleSystem.createShockwaveRing) {
        particleSystem.createShockwaveRing(cx, cy, 56, '#ffd700', 0.24);
      }
      particleSystem.createDamageNumber(cx, this.y - 18, 'ESCUDO QUEBRADO!', '#ffd700');
    }
    return true;
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
      this.triggerDeathFX(particleSystem, soundEngine);
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
      if (isHit) spriteKey = 'enemy_bug_hit';
      else if (this.isAlert && this.hopTimer > 0.70) spriteKey = 'enemy_bug_lunge';
      else spriteKey = `enemy_bug_walk${this.animFrame}`;
    } else if (this.type === 'ghost') {
      spriteKey = isHit ? 'enemy_ghost_hit' : `enemy_ghost_float${this.animFrame}`;
    } else if (this.type === 'golem') {
      if (isHit) spriteKey = 'enemy_golem_hit';
      else if (!this.hasFrontShield) spriteKey = `enemy_golem_noshield${this.animFrame}`;
      else spriteKey = `enemy_golem_walk${this.animFrame}`;
    } else if (this.type === 'drone') {
      if (isHit) spriteKey = 'enemy_drone_hit';
      else if (this.shootTimer < 0.38) spriteKey = 'enemy_drone_charge';
      else spriteKey = `enemy_drone_fly${this.animFrame}`;
    } else if (this.type === 'procrastination') {
      if (isHit) spriteKey = 'enemy_procrastination_hit';
      else if (this.chargeState === 'windup' || this.chargeState === 'dash') spriteKey = 'enemy_procrastination_charge';
      else spriteKey = `enemy_procrastination_walk${this.animFrame}`;
    } else if (this.type === 'interviewer') {
      if (isHit) spriteKey = 'enemy_interviewer_hit';
      else if (this.throwTimer < 0.42) spriteKey = 'enemy_interviewer_throw';
      else spriteKey = `enemy_interviewer_walk${this.animFrame}`;
    } else if (this.type === 'blonde_glasses') {
      if (isHit) spriteKey = 'enemy_blonde_glasses_hit';
      else if (this.attackState === 'whip') spriteKey = 'enemy_blonde_glasses_attack';
      else spriteKey = `enemy_blonde_glasses_walk${this.animFrame}`;
    } else if (this.type === 'blonde_tongue') {
      if (isHit) spriteKey = 'enemy_blonde_tongue_hit';
      else if (this.attackState === 'strike' || this.attackState === 'windup') spriteKey = 'enemy_blonde_tongue_attack';
      else spriteKey = `enemy_blonde_tongue_walk${this.animFrame}`;
    }

    const sprite = renderer.get(spriteKey);
    if (!sprite) return;

    const screenX = this.x - cameraX;
    const screenY = this.y;
    const centerX = screenX + this.width / 2;
    const footY = screenY + this.height;

    const extKey = (this.type === 'blonde_glasses' || this.type === 'blonde_tongue')
      ? `enemy_${this.type}`
      : null;
    const extSheet = extKey && renderer.ext ? renderer.ext(extKey) : null;
    const extDrawH = 82;
    const visualTopY = extSheet ? footY - extDrawH : screenY;

    // 1. Sombra projetada oval sob o inimigo
    ctx.save();
    ctx.fillStyle = (this.type === 'ghost' || this.type === 'drone') ? 'rgba(12, 18, 28, 0.25)' : 'rgba(12, 18, 28, 0.42)';
    const shadowY = (this.type === 'ghost' || this.type === 'drone') ? 558 : footY - 1;
    ctx.beginPath();
    ctx.ellipse(Math.round(centerX), Math.round(shadowY), this.width * 0.44, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Renderização do Sprite com Escala Hi-Bit, Hit Flash e Telegraph
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (this.type === 'ghost') {
      ctx.globalAlpha = 0.85;
    }
    const isTelegraphing =
      (this.type === 'drone' && this.shootTimer < 0.38) ||
      (this.type === 'bug' && this.isAlert && this.hopTimer > 0.70) ||
      (this.type === 'procrastination' && this.chargeState === 'windup') ||
      (this.type === 'interviewer' && this.throwTimer < 0.42) ||
      ((this.type === 'blonde_glasses' || this.type === 'blonde_tongue') && this.attackState === 'windup');

    if (this.hitTimer > 0.10) {
      ctx.filter = 'brightness(3.0) contrast(0.3)';
    } else if (isTelegraphing) {
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 14;
    }

    ctx.translate(Math.round(centerX), Math.round(footY));

    if (this.squashTimer > 0) {
      ctx.scale(1.35, 0.55);
    }

    if (extSheet) {
      // Spritesheets externos enfrentam a DIREITA por padrão (padrão hero_frames / bg_npc)
      if (this.facing === -1) {
        ctx.scale(-1, 1);
      }
      const isIdle = Math.abs(this.vx) < 12 && this.onGround && this.attackState === 'patrol';
      const isAirborne = !this.onGround && this.attackState !== 'whip' && this.attackState !== 'strike';

      // Squash & stretch e inclinação corporal dinâmica para fluidez arcade
      if (this.landingSquashTimer > 0) {
        ctx.scale(1.14, 0.86);
      } else if (this.attackState === 'windup') {
        ctx.rotate(-0.12);
        ctx.scale(1.08, 0.90);
      } else if (this.attackState === 'whip' || this.attackState === 'strike') {
        ctx.rotate(0.14);
        ctx.scale(1.06, 0.96);
      } else if (this.attackState === 'recover' && !this.onGround) {
        ctx.rotate(-0.14);
      } else if (isAirborne) {
        const airTilt = Math.max(-0.14, Math.min(0.14, this.vy * 0.00028));
        ctx.rotate(airTilt);
        ctx.scale(0.95, 1.07);
      } else if (isIdle) {
        const breath = Math.sin(this.fxTime * 4.5);
        ctx.scale(1 - breath * 0.02, 1 + breath * 0.032);
      } else {
        ctx.rotate(0.05);
      }

      const frameCount = 5;
      const fw = extSheet.width / frameCount;
      const fh = extSheet.height;
      const drawW = Math.round(fw * (extDrawH / fh));
      let frameIdx = (this.animFrame - 1) % 4;
      if (isIdle || isAirborne) {
        frameIdx = 1;
      } else if (this.type === 'blonde_glasses' && this.attackState === 'whip') {
        frameIdx = 4;
      } else if (this.type === 'blonde_tongue') {
        if (this.attackState === 'strike') frameIdx = 4;
        else if (this.attackState === 'windup') frameIdx = 1;
      }
      // Ancora o tronco centrado em centerX para o chicote/língua estender para frente
      const anchorOffset = Math.round(extDrawH * 0.34);
      ctx.drawImage(extSheet, frameIdx * fw, 0, fw, fh, -anchorOffset, -extDrawH, drawW, extDrawH);
    } else {
      if (this.facing === 1) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(sprite, -this.width / 2 - 4, -this.height - 4, this.width + 8, this.height + 6);
    }
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
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#80deea';
        ctx.fillText(this.quip, centerX, screenY - 27);
      }
      if (this.shootTimer < 0.38) {
        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', centerX, screenY - 38);
      }
    } else if (this.type === 'golem' && this.isAlert) {
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe082';
      ctx.fillText(this.quip, centerX, screenY - 27);
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
      ctx.fillText(this.hopTimer > 0.70 ? '! ' + this.quip : this.quip, centerX, screenY - 27);
    } else if (this.type === 'procrastination' && this.isAlert) {
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff80ab';
      ctx.fillText(this.chargeState === 'windup' ? '▶ ' + this.quip : this.quip, centerX, screenY - 27);
    } else if (this.type === 'interviewer' && this.isAlert) {
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe082';
      ctx.fillText('? ' + this.quip, centerX, screenY - 27);
    } else if (this.type === 'blonde_glasses') {
      if (this.attackState === 'whip') {
        // Onda curva de chicote de cabelo dourado estendendo até 132px
        const startOffset = extSheet ? 44 : this.width - 4;
        const originX = this.facing === 1 ? screenX + startOffset : screenX + this.width - startOffset;
        const totalLen = extSheet ? 88 : 128;
        const originY = visualTopY + 22;
        const progress = Math.max(0, Math.min(1, 1 - this.attackStateTimer / 0.32));
        const sweep = Math.sin(progress * Math.PI);
        const segs = 7;

        ctx.save();
        ctx.shadowColor = '#ffea00';
        ctx.shadowBlur = 12;

        const drawWhipCurve = (thickness, color) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = thickness;
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          for (let s = 1; s <= segs; s++) {
            const t = s / segs;
            const px = originX + this.facing * totalLen * t * (0.45 + 0.55 * sweep);
            const py = originY + Math.sin(t * Math.PI * 1.4 - progress * 4) * 10 * t;
            ctx.lineTo(px, py);
          }
          ctx.stroke();
        };

        drawWhipCurve(11, '#141013');
        drawWhipCurve(7, '#fbc02d');
        drawWhipCurve(3, '#fff59d');

        const tipX = originX + this.facing * totalLen * (0.45 + 0.55 * sweep);
        const tipY = originY + Math.sin(Math.PI * 1.4 - progress * 4) * 10;
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (this.isAlert) {
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff59d';
        ctx.fillText(this.attackState === 'windup' ? '! ' + this.quip : this.quip, centerX, visualTopY - 27);
      }
    } else if (this.type === 'blonde_tongue') {
      if (this.attackState === 'strike' && this.tongueExtend > 0.10) {
        // Língua sinuosa e elástica estendendo até 175px saindo da boca
        const reach = Math.round(175 * this.tongueExtend);
        const startOffset = extSheet ? 28 : this.width - 4;
        const originX = this.facing === 1 ? screenX + startOffset : screenX + this.width - startOffset;
        const extLen = Math.max(0, reach - (extSheet ? 14 : 0));
        const originY = visualTopY + 26;
        if (extLen > 4) {
          const segs = 8;
          ctx.save();
          const drawTongueCurve = (thickness, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            for (let s = 1; s <= segs; s++) {
              const t = s / segs;
              const px = originX + this.facing * extLen * t;
              const py = originY + Math.sin(t * Math.PI * 2 + this.fxTime * 16) * 4.5 * t;
              ctx.lineTo(px, py);
            }
            ctx.stroke();
          };
          drawTongueCurve(10, '#141013');
          drawTongueCurve(6.5, '#e91e63');
          drawTongueCurve(2.5, '#ff80ab');

          const tipX = originX + this.facing * extLen;
          const tipY = originY + Math.sin(Math.PI * 2 + this.fxTime * 16) * 4.5;
          ctx.fillStyle = '#141013';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ff4081';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ff80ab';
          ctx.beginPath();
          ctx.arc(tipX - this.facing, tipY - 1, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      if (this.isAlert) {
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff80ab';
        ctx.fillText(this.attackState === 'windup' ? '! ' + this.quip : this.quip, centerX, visualTopY - 27);
      }
    }
    if (this.panicTimer > 0) {
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffea00';
      ctx.fillText('?!', centerX, visualTopY - 40);
    }
    ctx.restore();

    // 4. Tag de Identificação do Vilão (Pílula compacta legível)
    ctx.save();
    ctx.font = 'bold 9px monospace';
    const labelText = this.label;
    const textW = ctx.measureText(labelText).width;
    const pillW = textW + 10;
    const pillX = Math.round(centerX - pillW / 2);
    const pillY = Math.round(visualTopY - 22);

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
      ctx.fillRect(screenX, visualTopY - 7, barW, 5);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(screenX + 1, visualTopY - 6, (barW - 2) * hpPct, 3);
    }
    ctx.restore();
  }
}
