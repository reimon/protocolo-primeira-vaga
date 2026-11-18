/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Boss.js - "ATS-9000: O Guardião Algorítmico do RH"
 */

import { Enemy } from './Enemy.js';

export class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.homeX = x;
    this.baseY = y;
    this.width = 110;
    this.height = 115;
    this.arenaMinX = Math.max(40, x - 520);
    this.arenaMaxX = x + 160;
    this.facing = -1; // -1: esquerda, 1: direita
    this.vx = 0;

    this.maxHp = 1400;
    this.hp = 1400;
    this.phase = 1; // 1 ou 2
    this.isDead = false;
    this.deathFinished = false;
    this.deathTimer = 0;
    this.deathSinkY = 0;
    this.hitTimer = 0;

    // Estados: 'idle', 'laser_barrage', 'vulcan_burst', 'mortar_barrage', 'missile_salvo', 'ground_slam', 'email_storm', 'mega_beam', 'charge_rush', 'recovering', 'mentor_event'
    this.state = 'idle';
    this.stateTimer = 0.85;
    this.hoverTimer = 0;
    this.lastAttack = null;

    // Intervenção do Mentor & Módulos Destrutíveis
    this.mentorEventTriggered = false;
    this.isCoreExposed = false;
    this.moduleBroken = false;

    // Controle de Ataques Estilo Metal Slug
    this.attackCycle = 0;
    this.slamVy = 0;
    this.isSlamming = false;
    this.slamTargetX = x;
    this.laserTimer = 0.45;
    this.stormFired = false;

    this.vulcanShotsLeft = 0;
    this.vulcanTimer = 0;
    this.aimAngle = Math.PI;
    this.mortarShotsLeft = 0;
    this.mortarTimer = 0;
    this.missileFired = false;
    this.beamActive = false;
    this.beamY = y + 44;
    this.beamDamageCooldown = 0;
    this.chargePhase = 'windup';
    this.chargeDir = -1;

    this.deathExplosionCount = 0;
    this.deathExplosionTimer = 0;
  }

  update(dt, player, platforms, projectiles, enemies, soundEngine, particleSystem, screenShake, onMentorIntervention) {
    if (this.isDead) {
      if (!this.deathFinished) {
        this.deathTimer -= dt;
        this.deathSinkY += 18 * dt;
        this.deathExplosionTimer -= dt;
        if (this.deathExplosionTimer <= 0 && particleSystem) {
          this.deathExplosionTimer = 0.22;
          particleSystem.createExplosion(
            this.x + Math.random() * this.width,
            this.y + this.deathSinkY + Math.random() * this.height,
            1.15
          );
          if (screenShake) screenShake.trigger(9, 0.16);
          if (soundEngine) soundEngine.playNoise(0.12, null, 0.25);
        }
        if (this.deathTimer <= 0) {
          this.deathFinished = true;
          if (particleSystem) {
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            particleSystem.createExplosion(cx, cy, 1.85);
            particleSystem.createDebris(cx, cy, ['#ffd700', '#ff6d00', '#cfd8dc', '#37474f'], 16);
            if (particleSystem.createShockwaveRing) {
              particleSystem.createShockwaveRing(cx, cy, 150, '#ffd600', 0.42);
            }
            if (particleSystem.triggerScreenFlash) {
              particleSystem.triggerScreenFlash('#ffffff', 0.5, 0.18);
            }
            particleSystem.createDamageNumber(cx, this.y - 16, 'ATS-9000 DESTRUÍDO!', '#ffd700');
          }
          if (screenShake) screenShake.trigger(22, 0.8);
          if (soundEngine) soundEngine.playEnemyDeath();
        }
      }
      return;
    }

    if (this.hitTimer > 0) this.hitTimer -= dt;
    if (this.beamDamageCooldown > 0) this.beamDamageCooldown -= dt;
    this.hoverTimer += dt * 2.5;

    const playerCx = player.x + player.width / 2;
    const bossCx = this.x + this.width / 2;
    if (this.state !== 'charge_rush' && this.state !== 'mega_beam') {
      if (Math.abs(playerCx - bossCx) > 24) {
        this.facing = playerCx < bossCx ? -1 : 1;
      }
    }

    // Fumaça contínua quando o módulo de Filtro de Palavra-Chave é quebrado
    if (this.moduleBroken && particleSystem && Math.random() < 0.22) {
      particleSystem.createSmoke(this.x + 24, this.y + 32, 1, '#455a64');
    }

    // Verifica transição para Fase 2 e intervenção do Mentor em 50% de HP
    if (this.hp <= this.maxHp * 0.5 && !this.mentorEventTriggered) {
      this.mentorEventTriggered = true;
      this.phase = 2;
      this.beamActive = false;
      this.state = 'mentor_event';
      this.stateTimer = 4.5;
      if (onMentorIntervention) {
        onMentorIntervention();
      }
      return;
    }

    this.stateTimer -= dt;

    // Máquina de Estados do Boss (Estilo Metal Slug)
    switch (this.state) {
      case 'idle': {
        this.y = this.baseY + Math.sin(this.hoverTimer) * 12;
        this.isCoreExposed = false;
        this.beamActive = false;
        // Patrulha aérea tática mantendo distância média do player
        const desiredDist = 330;
        const idealX = playerCx < bossCx ? playerCx + desiredDist : playerCx - desiredDist - this.width;
        const clampedIdeal = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, idealX));
        const dx = clampedIdeal - this.x;
        this.vx = Math.max(-130, Math.min(130, dx * 2.2));
        this.x = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, this.x + this.vx * dt));
        if (this.stateTimer <= 0) {
          this.chooseNextAttack(player);
        }
        break;
      }

      case 'laser_barrage':
        this.y = this.baseY + Math.sin(this.hoverTimer) * 8;
        this.laserTimer -= dt;
        if (this.laserTimer <= 0) {
          this.laserTimer = this.phase === 2 ? 0.24 : 0.36;
          this.fireResumeLaser(projectiles, player, soundEngine);
        }
        if (this.stateTimer <= 0) {
          if (this.phase === 2) {
            this.enterRecovering(2.0);
          } else {
            this.state = 'idle';
            this.stateTimer = 0.65;
          }
        }
        break;

      case 'vulcan_burst': {
        this.y = this.baseY + Math.sin(this.hoverTimer) * 6;
        // Windup inicial trava a mira no Player antes da rajada
        if (this.stateTimer > 1.35) {
          const targetAngle = Math.atan2(
            (player.y + player.height * 0.5) - (this.y + 52),
            playerCx - bossCx
          );
          this.aimAngle = targetAngle;
        } else if (this.vulcanShotsLeft > 0) {
          this.vulcanTimer -= dt;
          if (this.vulcanTimer <= 0) {
            this.vulcanTimer = this.phase === 2 ? 0.08 : 0.10;
            this.vulcanShotsLeft--;
            this.fireVulcanRound(projectiles, soundEngine, particleSystem);
          }
        }
        if (this.stateTimer <= 0) {
          if (this.phase === 2 && this.attackCycle % 2 === 0) {
            this.enterRecovering(1.9);
          } else {
            this.state = 'idle';
            this.stateTimer = 0.60;
          }
        }
        break;
      }

      case 'mortar_barrage':
        this.y = this.baseY + Math.sin(this.hoverTimer * 1.4) * 8;
        if (this.stateTimer <= 1.55 && this.mortarShotsLeft > 0) {
          this.mortarTimer -= dt;
          if (this.mortarTimer <= 0) {
            this.mortarTimer = this.phase === 2 ? 0.19 : 0.25;
            this.mortarShotsLeft--;
            this.fireMortarShell(projectiles, player, soundEngine, particleSystem);
          }
        }
        if (this.stateTimer <= 0) {
          if (this.phase === 2) {
            this.enterRecovering(2.0);
          } else {
            this.state = 'idle';
            this.stateTimer = 0.65;
          }
        }
        break;

      case 'missile_salvo':
        this.y = this.baseY + Math.sin(this.hoverTimer) * 8;
        if (!this.missileFired && this.stateTimer <= 1.15) {
          this.missileFired = true;
          this.fireMissileSalvo(projectiles, player, soundEngine, particleSystem);
        }
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.stateTimer = 0.65;
        }
        break;

      case 'ground_slam':
        if (!this.isSlamming) {
          this.y -= 170 * dt;
          // Persegue horizontalmente o Player enquanto sobe
          const targetX = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, playerCx - this.width / 2));
          this.x += (targetX - this.x) * Math.min(1, dt * 3.5);
          if (this.stateTimer <= 1.1) {
            this.isSlamming = true;
            this.slamVy = this.phase === 2 ? 980 : 880;
          }
        } else {
          this.y += this.slamVy * dt;
          if (this.y >= this.baseY) {
            this.y = this.baseY;
            this.isSlamming = false;
            if (screenShake) screenShake.trigger(18, 0.5);
            if (soundEngine) {
              soundEngine.playNoise(0.25, null, 0.4);
              soundEngine.playHit();
            }
            this.createShockwaves(projectiles);
            if (particleSystem) {
              const cx = this.x + this.width / 2;
              const cy = this.y + this.height;
              particleSystem.createExplosion(cx, cy, 1.25, this.baseY + this.height);
              particleSystem.createDust(cx, cy, 12);
              if (particleSystem.createShockwaveRing) {
                particleSystem.createShockwaveRing(cx, cy - 6, 120, '#ff1744', 0.36);
              }
            }
            this.enterRecovering(this.phase === 2 ? 2.1 : 1.9);
          }
        }
        break;

      case 'email_storm':
        this.y = this.baseY + Math.sin(this.hoverTimer * 2) * 8;
        if (!this.stormFired && this.stateTimer <= 1.25) {
          this.stormFired = true;
          this.fireEmailStorm(projectiles, enemies, soundEngine, particleSystem);
        }
        if (this.stateTimer <= 0) {
          this.enterRecovering(2.0);
        }
        break;

      case 'mega_beam': {
        this.y = this.baseY - 12;
        this.beamY = this.y + 44;
        if (this.stateTimer > 1.25) {
          // Carregamento com faíscas no núcleo
          this.beamActive = false;
          if (particleSystem && Math.random() < 0.55) {
            const muzzleX = this.facing === -1 ? this.x + 8 : this.x + this.width - 8;
            particleSystem.createSparks(muzzleX, this.beamY + 14, '#ffea00', 3);
          }
        } else {
          if (!this.beamActive && soundEngine) {
            soundEngine.playNoise(0.32, null, 0.4);
            if (screenShake) screenShake.trigger(12, 0.4);
          }
          this.beamActive = true;
          const beamRect = this.getMegaBeamHitbox();
          if (beamRect && this.beamDamageCooldown <= 0 && this.checkAABB(beamRect, player)) {
            const dmg = player.takeDamage(28, soundEngine, screenShake);
            if (dmg > 0 && particleSystem) {
              particleSystem.createDamageNumber(player.x, player.y - 12, dmg, '#ff1744');
            }
            this.beamDamageCooldown = 0.40;
          }
        }
        if (this.stateTimer <= 0) {
          this.beamActive = false;
          this.enterRecovering(2.1);
        }
        break;
      }

      case 'charge_rush':
        if (this.chargePhase === 'windup') {
          this.y = this.baseY + 8;
          if (this.stateTimer <= 0.75) {
            this.chargePhase = 'dash';
            if (soundEngine) soundEngine.playNoise(0.2, null, 0.3);
            if (screenShake) screenShake.trigger(8, 0.25);
          }
        } else {
          this.y = this.baseY + 4;
          const rushSpeed = this.phase === 2 ? 620 : 500;
          this.x += this.chargeDir * rushSpeed * dt;
          if (particleSystem && Math.random() < 0.7) {
            const tailX = this.chargeDir === -1 ? this.x + this.width : this.x;
            particleSystem.createSmoke(tailX, this.y + this.height - 20, 1, '#ff6d00');
          }
          const hitArenaWall =
            (this.chargeDir === -1 && this.x <= this.arenaMinX) ||
            (this.chargeDir === 1 && this.x >= this.arenaMaxX);
          if (hitArenaWall || this.stateTimer <= 0) {
            this.x = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, this.x));
            this.enterRecovering(1.9);
          }
        }
        break;

      case 'recovering':
        // Núcleo sobrecarregado aberto para dano crítico!
        this.y = this.baseY;
        this.beamActive = false;
        this.isCoreExposed = true;
        if (Math.random() < 0.25 && particleSystem) {
          particleSystem.createSparks(
            this.x + this.width / 2 + (Math.random() * 20 - 10),
            this.y + 70,
            '#ffd600',
            3
          );
        }
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.stateTimer = this.phase === 2 ? 0.45 : 0.65;
          this.isCoreExposed = false;
        }
        break;

      case 'mentor_event':
        // Pausado temporariamente para o Mentor falar
        this.y = this.baseY;
        this.beamActive = false;
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.stateTimer = 1.0;
        }
        break;
    }

    // Colisão do corpo do Boss com o Player (Suporta Stomp estilo Mario!)
    if (this.checkAABB(this, player)) {
      const playerBottom = player.y + player.height;
      const isStomping = player.vy > 0 && playerBottom <= this.y + this.height * 0.45;

      if (isStomping) {
        const stompDmg = player.armorTier === 'gold' ? 45 : 22;
        this.takeDamage(stompDmg, player.armorTier === 'gold', particleSystem, soundEngine, screenShake);
        player.y = this.y - player.height - 4;
        player.vy = -460;
        player.doubleJumpUsed = false;
        player.canDash = true;
        player.invincibleTimer = Math.max(player.invincibleTimer, 0.25);
        if (soundEngine) soundEngine.playJump();
        if (particleSystem) {
          particleSystem.createDamageNumber(player.x + 10, this.y - 16, `STOMP -${stompDmg}`, '#00e5ff');
        }
      } else {
        const contactDmg = this.state === 'charge_rush' ? 32 : (this.phase === 2 ? 30 : 26);
        player.takeDamage(contactDmg, soundEngine, screenShake);
      }
    }
  }

  enterRecovering(duration = 2.8) {
    this.state = 'recovering';
    this.stateTimer = duration;
    this.isCoreExposed = true;
    this.beamActive = false;
  }

  getMegaBeamHitbox() {
    if (!this.beamActive) return null;
    const beamLen = 780;
    const x = this.facing === -1 ? this.x - beamLen + 12 : this.x + this.width - 12;
    return { x, y: this.beamY, width: beamLen, height: 30 };
  }

  chooseNextAttack(player) {
    this.attackCycle++;
    const playerCx = player.x + player.width / 2;
    const bossCx = this.x + this.width / 2;
    const dist = Math.abs(playerCx - bossCx);
    const playerIsHigh = (player.y + player.height) < (this.baseY + 28);

    let pool;
    if (this.phase === 2) {
      if (playerIsHigh) {
        pool = ['email_storm', 'missile_salvo', 'vulcan_burst', 'mega_beam'];
      } else if (dist < 220) {
        pool = ['charge_rush', 'ground_slam', 'email_storm', 'mortar_barrage'];
      } else {
        pool = ['mega_beam', 'vulcan_burst', 'mortar_barrage', 'missile_salvo', 'laser_barrage', 'charge_rush'];
      }
    } else {
      if (playerIsHigh) {
        pool = ['email_storm', 'missile_salvo', 'vulcan_burst'];
      } else if (dist < 210) {
        pool = ['ground_slam', 'charge_rush', 'mortar_barrage'];
      } else {
        pool = ['vulcan_burst', 'mortar_barrage', 'laser_barrage', 'missile_salvo', 'ground_slam'];
      }
    }

    const filtered = pool.filter(a => a !== this.lastAttack);
    const choices = filtered.length > 0 ? filtered : pool;
    const picked = choices[Math.floor(Math.random() * choices.length)];
    this.lastAttack = picked;
    this.startAttackState(picked, player);
  }

  startAttackState(attackName, player) {
    this.state = attackName;
    this.beamActive = false;
    const playerCx = player.x + player.width / 2;
    const bossCx = this.x + this.width / 2;
    this.facing = playerCx < bossCx ? -1 : 1;

    switch (attackName) {
      case 'vulcan_burst':
        this.stateTimer = 1.75;
        this.vulcanShotsLeft = this.phase === 2 ? 12 : 7;
        this.vulcanTimer = 0.03;
        this.aimAngle = Math.atan2((player.y + player.height * 0.5) - (this.y + 52), playerCx - bossCx);
        break;
      case 'mortar_barrage':
        this.stateTimer = 1.95;
        this.mortarShotsLeft = this.phase === 2 ? 6 : 4;
        this.mortarTimer = 0.04;
        break;
      case 'missile_salvo':
        this.stateTimer = 1.55;
        this.missileFired = false;
        break;
      case 'ground_slam':
        this.stateTimer = 1.95;
        this.isSlamming = false;
        break;
      case 'email_storm':
        this.stateTimer = 1.85;
        this.stormFired = false;
        break;
      case 'mega_beam':
        this.stateTimer = 2.25;
        this.beamY = this.baseY + 32;
        break;
      case 'charge_rush':
        this.stateTimer = 1.25;
        this.chargePhase = 'windup';
        this.chargeDir = this.facing;
        break;
      default:
        this.state = 'laser_barrage';
        this.stateTimer = this.phase === 2 ? 2.5 : 2.8;
        this.laserTimer = 0.25;
        break;
    }
  }

  fireVulcanRound(projectiles, soundEngine, particleSystem) {
    const muzzleX = this.facing === -1 ? this.x + 8 : this.x + this.width - 8;
    const muzzleY = this.y + 52;
    const spread = (Math.random() - 0.5) * 0.16;
    const ang = this.aimAngle + spread;
    const speed = this.phase === 2 ? 530 : 460;

    projectiles.push({
      type: 'vulcan',
      x: muzzleX - 8,
      y: muzzleY - 4,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      width: 16,
      height: 8,
      damage: this.phase === 2 ? 20 : 17,
      isEnemy: true,
      life: 3.0
    });
    if (soundEngine) soundEngine.playNoise(0.04, null, 0.14);
    if (particleSystem) {
      particleSystem.createSparks(muzzleX, muzzleY, '#ffea00', 4);
    }
  }

  fireMortarShell(projectiles, player, soundEngine, particleSystem) {
    const launchX = this.x + this.width / 2;
    const launchY = this.y + 10;
    const targetX = player.x + player.width / 2 + (Math.random() - 0.5) * 200;
    const flightTime = 0.95 + Math.random() * 0.2;
    const gravity = 720;
    const vx = (targetX - launchX) / flightTime;
    const targetY = this.baseY + this.height - 18;
    const vy = ((targetY - launchY) - 0.5 * gravity * flightTime * flightTime) / flightTime;

    projectiles.push({
      type: 'boss_mortar',
      x: launchX - 9,
      y: launchY,
      vx,
      vy,
      gravity,
      width: 18,
      height: 18,
      damage: this.phase === 2 ? 25 : 22,
      isEnemy: true,
      undeflectable: true,
      life: 2.8
    });
    if (soundEngine) soundEngine.playNoise(0.09, null, 0.18);
    if (particleSystem) {
      particleSystem.createSmoke(launchX, launchY, 2, '#90a4ae');
    }
  }

  fireMissileSalvo(projectiles, player, soundEngine, particleSystem) {
    const count = this.phase === 2 ? 4 : 3;
    const launchX = this.x + this.width / 2;
    const launchY = this.y + 18;
    for (let i = 0; i < count; i++) {
      const spreadX = (i - (count - 1) / 2) * 75;
      projectiles.push({
        type: 'boss_missile',
        x: launchX + spreadX * 0.25,
        y: launchY,
        vx: this.facing * 195 + spreadX * 0.4,
        vy: -230 - i * 32,
        width: 20,
        height: 12,
        damage: this.phase === 2 ? 22 : 19,
        isEnemy: true,
        homingTime: 2.35,
        life: 4.2
      });
    }
    if (soundEngine) soundEngine.playNoise(0.14, null, 0.22);
    if (particleSystem) {
      particleSystem.createSmoke(launchX, launchY, 4, '#cfd8dc');
    }
  }

  fireEmailStorm(projectiles, enemies, soundEngine, particleSystem) {
    // Dispara leque amplo de emails automáticos na direção do Player + invoca drones de RH
    const angles = this.phase === 2
      ? [-0.52, -0.34, -0.16, 0.0, 0.16, 0.34, 0.52]
      : [-0.42, -0.20, 0.0, 0.20, 0.40];
    const originX = this.facing === -1 ? this.x + 12 : this.x + this.width - 12;
    for (const ang of angles) {
      projectiles.push({
        type: 'ghosting',
        x: originX,
        y: this.y + 42,
        vx: this.facing * Math.cos(ang) * (this.phase === 2 ? 355 : 320),
        vy: Math.sin(ang) * 260,
        width: 18,
        height: 18,
        damage: this.phase === 2 ? 20 : 17,
        isEnemy: true,
        life: 3.5
      });
    }
    const maxDrones = this.phase === 2 ? 2 : 1;
    if (enemies && enemies.filter(e => !e.isDead && e.type === 'drone').length < maxDrones) {
      const drone = new Enemy('drone', this.x + this.facing * 50, this.baseY - 70);
      drone.hp = 35;
      drone.maxHp = 35;
      enemies.push(drone);
    }
    if (soundEngine) soundEngine.playNoise(0.14, null, 0.2);
    if (particleSystem) {
      particleSystem.createSparks(originX, this.y + 42, '#00e5ff', 10);
    }
  }

  fireResumeLaser(projectiles, player, soundEngine) {
    // Dispara projéteis Filtro de Currículo em leque mirando no Player
    const startX = this.facing === -1 ? this.x - 15 : this.x + this.width;
    const startY = this.y + 38 + Math.random() * 34;
    const speed = this.phase === 2 ? 440 : 360;
    const dy = (player.y + player.height * 0.5) - startY;
    const aimVy = Math.max(-150, Math.min(150, dy * 0.48));

    projectiles.push({
      type: 'laser',
      x: startX,
      y: startY,
      vx: this.facing * speed,
      vy: aimVy,
      width: 24,
      height: 10,
      damage: this.phase === 2 ? 22 : 19,
      isEnemy: true,
      life: 3.5
    });
    projectiles.push({
      type: 'laser',
      x: startX,
      y: startY,
      vx: this.facing * (speed - 30),
      vy: aimVy - 90,
      width: 24,
      height: 10,
      damage: 18,
      isEnemy: true,
      life: 3.5
    });
    if (this.phase === 2) {
      projectiles.push({
        type: 'laser',
        x: startX,
        y: startY,
        vx: this.facing * (speed - 30),
        vy: aimVy + 90,
        width: 24,
        height: 10,
        damage: 18,
        isEnemy: true,
        life: 3.5
      });
    }
    if (soundEngine) soundEngine.playNoise(0.05, null, 0.15);
  }

  createShockwaves(projectiles) {
    // Onda de choque para a esquerda
    projectiles.push({
      type: 'shockwave',
      x: this.x - 20,
      y: this.y + this.height - 16,
      vx: -260,
      vy: 0,
      width: 28,
      height: 16,
      damage: 22,
      isEnemy: true,
      life: 3.0
    });
    // Onda de choque para a direita
    projectiles.push({
      type: 'shockwave',
      x: this.x + this.width + 10,
      y: this.y + this.height - 16,
      vx: 260,
      vy: 0,
      width: 28,
      height: 16,
      damage: 22,
      isEnemy: true,
      life: 3.0
    });
  }

  takeDamage(amount, isPlayerGold, particleSystem, soundEngine, screenShake) {
    if (this.isDead) return 0;

    let finalDamage = amount;
    // Blindagem algorítmica reduz dano fora da janela de núcleo exposto
    if (this.isCoreExposed) {
      finalDamage = isPlayerGold ? amount * 2.5 : amount * 1.5;
      if (particleSystem) {
        particleSystem.createDamageNumber(this.x + 40, this.y + 20, 'CRÍTICO!', '#ffd700');
      }
    } else if (this.phase === 2) {
      finalDamage = Math.max(6, amount * 0.35);
    } else {
      finalDamage = Math.max(8, amount * 0.75);
    }

    this.hp -= finalDamage;
    this.hitTimer = 0.15;
    soundEngine.playHit();
    screenShake.trigger(5, 0.15);

    if (!this.moduleBroken && this.hp <= this.maxHp * 0.7 && this.hp > 0) {
      this.moduleBroken = true;
      if (particleSystem) {
        particleSystem.createExplosion(this.x + 28, this.y + 38, 0.9);
        if (particleSystem.createShockwaveRing) {
          particleSystem.createShockwaveRing(this.x + 28, this.y + 38, 72, '#ff9100', 0.3);
        }
        if (particleSystem.triggerScreenFlash) {
          particleSystem.triggerScreenFlash('#ff9100', 0.25, 0.1);
        }
        particleSystem.createDamageNumber(this.x + 40, this.y - 26, 'FILTRO QUEBRADO!', '#ff9100');
      }
      screenShake.trigger(12, 0.35);
    }

    if (particleSystem) {
      particleSystem.createSparks(this.x + 50, this.y + 60, '#ff1744', 8);
      particleSystem.createDamageNumber(this.x + 40, this.y - 10, Math.floor(finalDamage), '#ffffff');
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.deathFinished = false;
      this.deathTimer = 1.9;
      this.deathSinkY = 0;
      this.deathExplosionCount = 6;
      this.deathExplosionTimer = 0;
      soundEngine.playEnemyDeath();
      screenShake.trigger(18, 0.8);
    }

    return finalDamage;
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
    if (this.isDead && this.deathFinished) return;

    let spriteKey = 'boss_ats_idle';
    if (this.hitTimer > 0) {
      spriteKey = 'boss_ats_attack';
    } else if (this.state === 'laser_barrage' || this.state === 'email_storm' || this.state === 'vulcan_burst' || this.state === 'mega_beam') {
      spriteKey = 'boss_ats_laser';
    } else if (this.state === 'recovering' || this.isDead) {
      spriteKey = 'boss_ats_stunned';
    }

    const sprite = renderer.get(spriteKey) || renderer.get('boss_ats_idle');
    const dyingShake = this.isDead ? (Math.random() - 0.5) * 10 : 0;
    const screenX = this.x - cameraX + dyingShake;
    const screenY = this.y + (this.isDead ? this.deathSinkY : 0);

    // Telegraphs estilo Metal Slug por ataque
    if (!this.isDead && this.state === 'ground_slam' && !this.isSlamming) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.02);
      ctx.save();
      ctx.fillStyle = `rgba(255, 23, 68, ${0.25 + 0.35 * pulse})`;
      ctx.fillRect(screenX - 20, this.baseY + this.height - 6, this.width + 40, 10);
      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', screenX + this.width / 2, screenY - 12);
      ctx.restore();
    } else if (!this.isDead && this.state === 'email_storm' && !this.stormFired) {
      ctx.save();
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 11px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('! SPAM AUTOMÁTICO !', screenX + this.width / 2, screenY - 16);
      ctx.restore();
    } else if (!this.isDead && this.state === 'vulcan_burst' && this.stateTimer > 1.35) {
      const muzzleX = screenX + (this.facing === -1 ? 8 : this.width - 8);
      const muzzleY = screenY + 52;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 23, 68, 0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(muzzleX, muzzleY);
      ctx.lineTo(muzzleX + Math.cos(this.aimAngle) * 520, muzzleY + Math.sin(this.aimAngle) * 520);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffea00';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('! TRAVANDO MIRA !', screenX + this.width / 2, screenY - 16);
      ctx.restore();
    } else if (!this.isDead && this.state === 'mortar_barrage' && this.stateTimer > 1.55) {
      ctx.save();
      ctx.fillStyle = '#ff9100';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('! BOMBARDEIO DE TESTES !', screenX + this.width / 2, screenY - 16);
      ctx.restore();
    } else if (!this.isDead && this.state === 'missile_salvo' && !this.missileFired) {
      ctx.save();
      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('! MÍSSEIS DE REJEIÇÃO !', screenX + this.width / 2, screenY - 16);
      ctx.restore();
    } else if (!this.isDead && this.state === 'charge_rush' && this.chargePhase === 'windup') {
      ctx.save();
      ctx.fillStyle = '#ffea00';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('! INVESTIDA TURBO !', screenX + this.width / 2, screenY - 16);
      ctx.restore();
    } else if (!this.isDead && this.state === 'mega_beam' && !this.beamActive) {
      const muzzleX = screenX + (this.facing === -1 ? 8 : this.width - 8);
      const beamCenterY = this.beamY + 15;
      const endX = this.facing === -1 ? muzzleX - 780 : muzzleX + 780;
      const pulse = 0.4 + 0.6 * Math.sin(Date.now() * 0.03);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 23, 68, ${pulse.toFixed(2)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(muzzleX, beamCenterY);
      ctx.lineTo(endX, beamCenterY);
      ctx.stroke();
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(muzzleX, beamCenterY, 12 + pulse * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('! FIREWALL LASER !', screenX + this.width / 2, screenY - 18);
      ctx.restore();
    }

    // Sombra projetada do Boss no calçadão
    ctx.save();
    ctx.fillStyle = 'rgba(12, 18, 28, 0.45)';
    ctx.beginPath();
    ctx.ellipse(screenX + this.width / 2, this.baseY + this.height + 4, 48, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const png = renderer.ext && renderer.ext('boss');
    if (png) {
      const drawH = 190;
      const drawW = Math.round(png.width * (drawH / png.height));
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (this.isDead) {
        ctx.globalAlpha = Math.max(0.25, this.deathTimer / 1.9);
        if (Math.floor(Date.now() / 60) % 2 === 0) ctx.filter = 'brightness(2.8) contrast(0.4)';
      } else if (this.hitTimer > 0.07) ctx.filter = 'brightness(3.2) contrast(0.3)';
      else if (this.isCoreExposed) { ctx.shadowColor = '#ffd600'; ctx.shadowBlur = 24; }
      else if (this.phase === 2) { ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 18; }
      ctx.translate(screenX + this.width / 2, screenY + this.height);
      if (this.facing === 1) ctx.scale(-1, 1);
      ctx.drawImage(png, -drawW / 2, -drawH, drawW, drawH);
      ctx.restore();
    } else if (sprite) {
      ctx.save();
      if (this.isDead && Math.floor(Date.now() / 60) % 2 === 0) ctx.filter = 'brightness(2.8) contrast(0.4)';
      else if (this.hitTimer > 0.07) ctx.filter = 'brightness(3.2) contrast(0.3)';
      ctx.translate(screenX + this.width / 2, screenY);
      if (this.facing === 1) ctx.scale(-1, 1);
      ctx.drawImage(sprite, -this.width / 2, 0);
      ctx.restore();
    }

    if (this.isDead) return;

    // Feixe ativo do Hyper-Laser estilo Metal Slug
    if (this.beamActive) {
      const rect = this.getMegaBeamHitbox();
      if (rect) {
        const bx = rect.x - cameraX;
        const flicker = Math.sin(Date.now() * 0.05) * 4;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 23, 68, 0.45)';
        ctx.fillRect(bx, rect.y - 8 - flicker * 0.4, rect.width, rect.height + 16 + flicker * 0.8);
        ctx.fillStyle = '#ff5252';
        ctx.fillRect(bx, rect.y, rect.width, rect.height);
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(bx, rect.y + 6, rect.width, rect.height - 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx, rect.y + 11, rect.width, rect.height - 22);
        ctx.restore();
      }
    }

    // Indicador visual de núcleo vulnerável (alvo pulsante + texto)
    if (this.isCoreExposed) {
      const pulseR = 22 + Math.sin(Date.now() * 0.015) * 4;
      ctx.save();
      ctx.strokeStyle = '#ffea00';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(screenX + this.width / 2, screenY + this.height * 0.55, pulseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffea00';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NÚCLEO EXPOSTO! ATAQUE!', screenX + this.width / 2, screenY - 14);
      ctx.restore();
    } else if (this.state === 'laser_barrage' || this.state === 'vulcan_burst') {
      ctx.save();
      ctx.fillStyle = '#ff8a80';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      const bossQuip = this.phase === 2 ? '"Faltam 10 anos de React!"' : '"PDF sem palavra-chave!"';
      ctx.fillText(bossQuip, screenX + this.width / 2, screenY - 14);
      ctx.restore();
    }
  }

  renderBossHealthBar(ctx, screenWidth) {
    if (this.isDead) return;

    const barW = 540;
    const barH = 16;
    const barX = (screenWidth - barW) / 2;
    const barY = 38;

    // Fundo da Moldura
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(barX - 4, barY - 18, barW + 8, barH + 26);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 4, barY - 18, barW + 8, barH + 26);

    // Título do Boss
    ctx.fillStyle = this.phase === 2 ? '#ff8a80' : '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    const title = this.phase === 2
      ? 'ATS-9000 [MODO OVERCLOCK]: GUARDIÃO DO RH'
      : 'ATS-9000: O GUARDIÃO ALGORÍTMICO DO RH';
    ctx.fillText(title, screenWidth / 2, barY - 5);

    // Barra de Vida
    const hpPct = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = '#212121';
    ctx.fillRect(barX, barY, barW, barH);

    // Gradiente de HP (Vermelho para Amarelo)
    const hpGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    hpGrad.addColorStop(0, '#d50000');
    hpGrad.addColorStop(1, '#ff6d00');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(barX, barY, barW * hpPct, barH);

    // Brilho do Núcleo
    if (this.isCoreExposed) {
      ctx.fillStyle = '#ffd600';
      ctx.strokeRect(barX, barY, barW * hpPct, barH);
    }
  }
}
