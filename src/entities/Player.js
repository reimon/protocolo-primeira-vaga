/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Player.js - Entidade do Protagonista (Física, Combate e Estados)
 */

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 42;

    // Física
    this.vx = 0;
    this.vy = 0;
    this.moveSpeed = 290;
    this.gravity = 1350;
    this.jumpForce = -510;
    this.maxFallSpeed = 750;
    this.onGround = false;
    this.facing = 1; // 1: direita, -1: esquerda

    // Game Feel (Coyote Time & Jump Buffering)
    this.coyoteTimer = 0;
    this.coyoteMax = 0.12; // 120ms
    this.jumpBufferTimer = 0;
    this.jumpBufferMax = 0.12; // 120ms

    // Dash & i-frames
    this.canDash = true;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.18;
    this.dashCooldown = 0.65;
    this.dashCooldownTimer = 0;
    this.dashSpeed = 650;
    this.invincibleTimer = 0;

    // Upgrades / Mentor Buffs
    this.hasDoubleJump = false;
    this.doubleJumpUsed = false;
    this.armorTier = 'base'; // 'base' ou 'gold'
    this.bonusDamage = 0;
    this.bonusDefense = 0;

    // Combate
    this.hp = 100;
    this.maxHp = 100;
    this.xp = 0;
    this.nextXp = 100;
    this.level = 1;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.attackTimer = 0;
    this.isAttacking = false;
    this.hurtTimer = 0;

    // Hitbox de ataque atual (relativa ou absoluta)
    this.attackHitbox = null;
    this.enemiesHitThisAttack = new Set();

    // Animação
    this.state = 'idle';
    this.animTimer = 0;
    this.animFrame = 1;
  }

  update(dt, input, platforms, soundEngine, particleSystem) {
    // Redução de Timers
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
    if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboStep = 0;
      }
    }

    // Processamento do Dash
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.dashSpeed;
      this.vy = 0;
      if (particleSystem) {
        particleSystem.createDashGhost(this.x, this.y, this.width, this.height, this.facing);
      }
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx = 0;
      }
    } else {
      // Movimentação Horizontal
      let dir = 0;
      if (input.left) dir -= 1;
      if (input.right) dir += 1;

      if (dir !== 0 && !this.isAttacking) {
        this.vx = dir * this.moveSpeed;
        this.facing = dir;
        if (this.onGround && Math.random() < 0.25 && particleSystem) {
          particleSystem.createDust(this.x + this.width / 2, this.y + this.height);
        }
      } else {
        this.vx = 0;
      }

      // Input de Pulo
      if (input.jumpPressed) {
        this.jumpBufferTimer = this.jumpBufferMax;
      }

      // Executa pulo se buffeado e no chão (ou coyote time)
      if (this.jumpBufferTimer > 0 && (this.onGround || this.coyoteTimer > 0)) {
        this.vy = this.jumpForce;
        this.onGround = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.doubleJumpUsed = false;
        soundEngine.playJump();
        if (particleSystem) {
          particleSystem.createDust(this.x + this.width / 2, this.y + this.height);
        }
      } else if (this.jumpBufferTimer > 0 && !this.onGround && this.hasDoubleJump && !this.doubleJumpUsed) {
        // Pulo Duplo
        this.vy = this.jumpForce * 0.9;
        this.doubleJumpUsed = true;
        this.jumpBufferTimer = 0;
        soundEngine.playJump();
        if (particleSystem) {
          particleSystem.createSparks(this.x + this.width / 2, this.y + this.height, '#00e5ff', 8);
        }
      }

      // Pulo variável: soltou botão no ar enquanto sobe corta a velocidade vertical
      if (!input.jump && this.vy < -150) {
        this.vy *= 0.55;
      }

      // Dash Trigger
      if (input.dashPressed && this.dashCooldownTimer <= 0) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldownTimer = this.dashCooldown;
        this.invincibleTimer = this.dashDuration + 0.08;
        soundEngine.playDash();
      }

      // Gravidade
      this.vy += this.gravity * dt;
      if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;
    }

    // Ataque
    if (input.attackPressed && !this.isAttacking && !this.isDashing) {
      this.triggerAttack(soundEngine);
    }

    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.attackHitbox = null;
      }
    }

    // Atualiza Posição e Colisões
    this.x += this.vx * dt;
    this.resolveHorizontalCollisions(platforms);

    const prevOnGround = this.onGround;
    this.y += this.vy * dt;
    this.onGround = false;
    this.resolveVerticalCollisions(platforms);

    // Ajusta Coyote Time
    if (prevOnGround && !this.onGround && this.vy >= 0) {
      this.coyoteTimer = this.coyoteMax;
    }

    // Determina Estado e Animação
    this.updateStateAndAnimation(dt);
  }

  triggerAttack(soundEngine) {
    this.isAttacking = true;
    this.comboTimer = 0.55;
    this.comboStep = (this.comboStep % 3) + 1;
    this.attackTimer = 0.22;
    this.enemiesHitThisAttack.clear();

    soundEngine.playSwordSlash();

    // Hitbox de ataque à frente do Player
    const hitW = 44 + (this.comboStep === 3 ? 12 : 0);
    const hitH = 38;
    const hitX = this.facing === 1 ? this.x + this.width : this.x - hitW;
    const hitY = this.y + 4;

    this.attackHitbox = {
      x: hitX,
      y: hitY,
      width: hitW,
      height: hitH,
      damage: (18 + this.comboStep * 8 + this.bonusDamage),
      step: this.comboStep
    };
  }

  takeDamage(amount, soundEngine, screenShake) {
    if (this.invincibleTimer > 0 || this.isDashing) return 0;

    const finalDamage = Math.max(5, amount - this.bonusDefense);
    this.hp -= finalDamage;
    this.invincibleTimer = 0.8;
    this.hurtTimer = 0.3;

    soundEngine.playHit();
    screenShake.trigger(7, 0.25);

    if (this.hp < 0) this.hp = 0;
    return finalDamage;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addXp(amount, soundEngine) {
    this.xp += amount;
    if (this.xp >= this.nextXp) {
      this.xp -= this.nextXp;
      this.level += 1;
      this.nextXp = Math.floor(this.nextXp * 1.5);
      this.maxHp += 15;
      this.hp = this.maxHp;
      this.bonusDamage += 4;
      soundEngine.playLevelUp();
    }
  }

  resolveHorizontalCollisions(platforms) {
    for (const p of platforms) {
      if (this.checkAABB(this, p)) {
        if (this.vx > 0) {
          this.x = p.x - this.width;
        } else if (this.vx < 0) {
          this.x = p.x + p.width;
        }
      }
    }
  }

  resolveVerticalCollisions(platforms) {
    for (const p of platforms) {
      if (this.checkAABB(this, p)) {
        if (this.vy > 0) {
          // Aterrissou no topo da plataforma
          this.y = p.y - this.height;
          this.vy = 0;
          this.onGround = true;
          this.doubleJumpUsed = false;
        } else if (this.vy < 0) {
          // Bateu a cabeça por baixo
          this.y = p.y + p.height;
          this.vy = 0;
        }
      }
    }
  }

  checkAABB(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  updateStateAndAnimation(dt) {
    if (this.hurtTimer > 0) {
      this.state = 'hurt';
    } else if (this.isDashing) {
      this.state = 'dash';
    } else if (this.isAttacking) {
      this.state = `attack${this.comboStep}`;
    } else if (!this.onGround) {
      this.state = this.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.vx) > 10) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }

    // Alternância de frames
    this.animTimer += dt;
    if (this.state === 'run') {
      if (this.animTimer > 0.1) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame % 3) + 1;
      }
    } else {
      this.animFrame = 1;
    }
  }

  render(ctx, renderer, cameraX) {
    // Se invencível piscando
    if (this.invincibleTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      return;
    }

    const footX = this.x + this.width / 2 - cameraX;
    const footY = this.y + this.height;

    // Sombra projetada oval semitransparente sob os pés
    ctx.save();
    ctx.fillStyle = 'rgba(12, 18, 28, 0.42)';
    ctx.beginPath();
    ctx.ellipse(Math.round(footX), Math.round(footY - 1), 24, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Sprite sheet PNG Hi-Bit (4 frames: corrida1, corrida2, preparo, golpe)
    const sheet = renderer.ext && renderer.ext('hero');
    if (sheet) {
      const fw = sheet.width / 4;
      const fh = sheet.height;
      let frame = 0;
      if (this.isAttacking) {
        frame = this.attackTimer > 0.12 ? 2 : 3;
      } else if (this.state === 'run') {
        frame = (this.animFrame % 2 === 0) ? 1 : 0;
      } else if (this.state === 'jump' || this.state === 'fall' || this.state === 'dash') {
        frame = 1;
      } else {
        frame = 0; // idle
      }

      const drawH = 82;
      const drawW = Math.round(fw * (drawH / fh));

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (this.armorTier === 'gold') {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 14;
      }
      ctx.translate(Math.round(footX), Math.round(footY));
      if (this.facing === -1) {
        ctx.scale(-1, 1);
      }
      // Âncora centralizada na base
      ctx.drawImage(sheet, frame * fw, 0, fw, fh, -drawW / 2, -drawH, drawW, drawH);
      ctx.restore();
      return;
    }

    let spriteKey = `player_${this.armorTier}_${this.state}`;
    if (this.state === 'run') {
      spriteKey = `player_${this.armorTier}_run${this.animFrame}`;
    }

    const sprite = renderer.get(spriteKey) || renderer.get(`player_${this.armorTier}_idle`);
    if (!sprite) return;

    const screenX = this.x - cameraX;
    const screenY = this.y - 12; // Ajuste fino visual para sprite 56x56 Hi-Bit

    ctx.save();
    if (this.facing === -1) {
      ctx.translate(screenX + this.width / 2, screenY);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, -28, 0);
    } else {
      ctx.drawImage(sprite, screenX - 12, screenY);
    }
    ctx.restore();
  }
}
