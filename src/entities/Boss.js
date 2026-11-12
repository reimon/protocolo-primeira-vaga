/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Boss.js - "ATS-9000: O Guardião Algorítmico do RH"
 */

export class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.width = 110;
    this.height = 115;
    this.maxHp = 500;
    this.hp = 500;
    this.phase = 1; // 1 ou 2
    this.isDead = false;
    this.hitTimer = 0;

    // Estados: 'idle', 'laser_barrage', 'ground_slam', 'recovering', 'mentor_event'
    this.state = 'idle';
    this.stateTimer = 2.0;
    this.hoverTimer = 0;

    // Intervenção do Mentor
    this.mentorEventTriggered = false;
    this.isCoreExposed = false;

    // Ataque
    this.attackCycle = 0;
    this.slamVy = 0;
    this.isSlamming = false;
  }

  update(dt, player, platforms, projectiles, enemies, soundEngine, particleSystem, screenShake, onMentorIntervention) {
    if (this.isDead) return;

    if (this.hitTimer > 0) this.hitTimer -= dt;
    this.hoverTimer += dt * 2.5;

    // Verifica transição para Fase 2 e intervenção do Mentor em 50% de HP
    if (this.hp <= this.maxHp * 0.5 && !this.mentorEventTriggered) {
      this.mentorEventTriggered = true;
      this.phase = 2;
      this.state = 'mentor_event';
      this.stateTimer = 4.5;
      if (onMentorIntervention) {
        onMentorIntervention();
      }
      return;
    }

    this.stateTimer -= dt;

    // Máquina de Estados do Boss
    switch (this.state) {
      case 'idle':
        this.y = this.baseY + Math.sin(this.hoverTimer) * 12;
        this.isCoreExposed = false;
        if (this.stateTimer <= 0) {
          this.chooseNextAttack(player);
        }
        break;

      case 'laser_barrage':
        this.y = this.baseY + Math.sin(this.hoverTimer) * 6;
        // Dispara lasers periódicos
        if (Math.random() < (this.phase === 2 ? 0.08 : 0.045)) {
          this.fireResumeLaser(projectiles, player, soundEngine);
        }
        if (this.stateTimer <= 0) {
          if (this.phase === 2) {
            this.state = 'recovering';
            this.stateTimer = 3.2;
            this.isCoreExposed = true;
          } else {
            this.state = 'idle';
            this.stateTimer = 1.8;
          }
        }
        break;

      case 'ground_slam':
        if (!this.isSlamming) {
          // Sobe para o alto
          this.y -= 140 * dt;
          if (this.stateTimer <= 1.2) {
            this.isSlamming = true;
            this.slamVy = 850;
          }
        } else {
          // Despenca em direção ao solo
          this.y += this.slamVy * dt;
          if (this.y >= this.baseY) {
            this.y = this.baseY;
            this.isSlamming = false;
            // Impacto no chão: treme a tela e solta ondas de choque
            screenShake.trigger(16, 0.45);
            soundEngine.playNoise(0.25, null, 0.4);
            soundEngine.playHit();
            this.createShockwaves(projectiles);
            if (particleSystem) {
              particleSystem.createExplosion(this.x + this.width / 2, this.y + this.height);
            }
            // Fica vulnerável após o Slam!
            this.state = 'recovering';
            this.stateTimer = 3.5;
            this.isCoreExposed = true;
          }
        }
        break;

      case 'recovering':
        // Núcleo sobrecarregado aberto para dano crítico!
        this.y = this.baseY;
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
          this.stateTimer = 1.5;
          this.isCoreExposed = false;
        }
        break;

      case 'mentor_event':
        // Pausado temporariamente para o Mentor falar
        this.y = this.baseY;
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
        player.takeDamage(24, soundEngine, screenShake);
      }
    }
  }

  chooseNextAttack(player) {
    this.attackCycle++;
    if (this.phase === 2 && this.attackCycle % 2 === 0) {
      // Fase 2 faz Ground Slam com ondas de choque
      this.state = 'ground_slam';
      this.stateTimer = 2.2;
      this.isSlamming = false;
    } else {
      this.state = 'laser_barrage';
      this.stateTimer = this.phase === 2 ? 3.0 : 3.8;
    }
  }

  fireResumeLaser(projectiles, player, soundEngine) {
    // Dispara projétil Filtro de Currículo reto em direção ao Player
    const startY = this.y + 40 + Math.random() * 30;
    projectiles.push({
      type: 'laser',
      x: this.x - 15,
      y: startY,
      vx: -(this.phase === 2 ? 380 : 300),
      vy: 0,
      width: 24,
      height: 10,
      damage: 18,
      isEnemy: true,
      life: 3.5
    });
    soundEngine.playNoise(0.05, null, 0.15);
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
    // Se o núcleo estiver exposto e o jogador estiver com armadura/espada dourada
    if (this.isCoreExposed) {
      finalDamage = isPlayerGold ? amount * 2.5 : amount * 1.5;
      if (particleSystem) {
        particleSystem.createDamageNumber(this.x + 40, this.y + 20, 'CRÍTICO!', '#ffd700');
      }
    } else if (this.phase === 2) {
      // Defesa alta fora da recuperação
      finalDamage = Math.max(5, amount * 0.45);
    }

    this.hp -= finalDamage;
    this.hitTimer = 0.15;
    soundEngine.playHit();
    screenShake.trigger(5, 0.15);

    if (particleSystem) {
      particleSystem.createSparks(this.x + 50, this.y + 60, '#ff1744', 8);
      particleSystem.createDamageNumber(this.x + 40, this.y - 10, Math.floor(finalDamage), '#ffffff');
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      soundEngine.playEnemyDeath();
      screenShake.trigger(20, 1.0);
      if (particleSystem) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            particleSystem.createExplosion(
              this.x + Math.random() * this.width,
              this.y + Math.random() * this.height
            );
          }, i * 200);
        }
      }
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
    if (this.isDead) return;

    let spriteKey = 'boss_ats_idle';
    if (this.hitTimer > 0) {
      spriteKey = 'boss_ats_attack';
    } else if (this.state === 'laser_barrage') {
      spriteKey = 'boss_ats_laser';
    } else if (this.state === 'recovering') {
      spriteKey = 'boss_ats_stunned';
    }

    const sprite = renderer.get(spriteKey) || renderer.get('boss_ats_idle');
    const screenX = this.x - cameraX;
    const screenY = this.y;

    // Sombra projetada do Boss no calçadão
    ctx.save();
    ctx.fillStyle = 'rgba(12, 18, 28, 0.45)';
    ctx.beginPath();
    ctx.ellipse(screenX + this.width / 2, screenY + this.height + 4, 48, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const png = renderer.ext && renderer.ext('boss');
    if (png) {
      const drawH = 190;
      const drawW = Math.round(png.width * (drawH / png.height));
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (this.hitTimer > 0) ctx.filter = 'brightness(2.2)';
      else if (this.isCoreExposed) { ctx.shadowColor = '#ffd600'; ctx.shadowBlur = 24; }
      ctx.drawImage(png, screenX + this.width / 2 - drawW / 2, screenY + this.height - drawH, drawW, drawH);
      ctx.restore();
    } else if (sprite) {
      ctx.drawImage(sprite, screenX, screenY);
    }

    // Indicador visual de núcleo vulnerável
    if (this.isCoreExposed) {
      ctx.fillStyle = '#ffea00';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NÚCLEO EXPOSTO! ATAQUE!', screenX + this.width / 2, screenY - 14);
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
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ATS-9000: O GUARDIÃO ALGORÍTMICO DO RH', screenWidth / 2, barY - 5);

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
