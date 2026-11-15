/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Player.js - Entidade do Protagonista (Física, Combate e Estados)
 */

export class Player {
  constructor(x, y, gender = 'male') {
    this.x = x;
    this.y = y;
    this.gender = gender === 'female' ? 'female' : 'male';
    this.width = 32;
    this.standHeight = 42;
    this.crouchHeight = 26;
    this.height = this.standHeight;
    this.isCrouching = false;

    // Física
    this.vx = 0;
    this.vy = 0;
    this.moveSpeed = 290;
    this.gravity = 1350;
    this.jumpForce = -510;
    this.maxFallSpeed = 750;
    this.onGround = false;
    this.facing = 1; // 1: direita, -1: esquerda

    // Game Feel (Coyote Time, Jump/Attack/Dash Buffering)
    this.coyoteTimer = 0;
    this.coyoteMax = 0.12; // 120ms
    this.jumpBufferTimer = 0;
    this.jumpBufferMax = 0.12; // 120ms
    this.attackBufferTimer = 0;
    this.attackBufferMax = 0.10; // 100ms
    this.dashBufferTimer = 0;
    this.dashBufferMax = 0.10; // 100ms

    // Dash & i-frames
    this.canDash = true;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.18;
    this.dashCooldown = 0.65;
    this.dashCooldownTimer = 0;
    this.dashSpeed = 650;
    this.invincibleTimer = 0;

    // Técnicas estilo Katana Zero (Iaido Blitz, Dash-Slash, Up-Slash, Chronos)
    this.isIaido = false;
    this.iaidoTimer = 0;
    this.iaidoDuration = 0.13;
    this.iaidoCooldown = 1.15;
    this.iaidoCooldownTimer = 0;
    this.iaidoSpeed = 840;
    this.iaidoBufferTimer = 0;
    this.iaidoBufferMax = 0.12;
    this.chronosEnergy = 100;
    this.chronosMax = 100;
    this.chronosActive = false;
    this.attackType = 'combo1';
    this.lungeTimer = 0;

    // Upgrades / Mentor Buffs & Arsenais Arcade (estilo Metal Slug)
    this.hasDoubleJump = false;
    this.doubleJumpUsed = false;
    this.armorTier = 'base'; // 'base' ou 'gold'
    this.bonusDamage = 0;
    this.bonusDefense = 0;
    this.frameworkAmmo = 0; // [F] Framework Burst: cargas de Onda de Código em todo golpe
    this.bombAmmo = 2; // [G] Git Reset: granadas parabólicas anti-escudo
    this.overCaffeineTimer = 0; // Status cômico: Café em excesso (+velocidade e vapor)
    this.landingSquashTimer = 0;
    this.pendingGrenade = null;

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
    this.pendingProjectile = null;

    // Animação
    this.state = 'idle';
    this.animTimer = 0;
    this.animFrame = 1;
    this.idleAnimTime = 0;
  }

  update(dt, input, platforms, soundEngine, particleSystem) {
    // Redução de Timers
    this.idleAnimTime += dt;
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
    if (this.iaidoCooldownTimer > 0) this.iaidoCooldownTimer -= dt;
    if (this.lungeTimer > 0) this.lungeTimer -= dt;
    if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.attackBufferTimer > 0) this.attackBufferTimer -= dt;
    if (this.dashBufferTimer > 0) this.dashBufferTimer -= dt;
    if (this.iaidoBufferTimer > 0) this.iaidoBufferTimer -= dt;
    if (this.landingSquashTimer > 0) this.landingSquashTimer -= dt;
    if (this.overCaffeineTimer > 0) {
      this.overCaffeineTimer -= dt;
      if (particleSystem && Math.random() < 0.35) {
        particleSystem.createSmoke(this.x + this.width / 2, this.y, 1, '#fff8e1');
      }
    }

    if (input.attackPressed) {
      this.attackBufferTimer = this.attackBufferMax;
    }
    if (input.dashPressed) {
      this.dashBufferTimer = this.dashBufferMax;
    }
    if (input.iaidoPressed) {
      this.iaidoBufferTimer = this.iaidoBufferMax;
    }
    if (input.chronosPressed) {
      this.toggleChronos(soundEngine);
    }
    if (input.bombPressed) {
      this.throwGitBomb(soundEngine, particleSystem);
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboStep = 0;
      }
    }

    // Iaido Blitz (Corte Relâmpago Katana Zero)
    if (this.iaidoBufferTimer > 0 && !this.isIaido && this.iaidoCooldownTimer <= 0) {
      this.triggerIaidoBlitz(soundEngine, particleSystem);
    }

    // Processamento do Iaido Blitz ou Dash
    if (this.isIaido) {
      this.iaidoTimer -= dt;
      this.vx = this.facing * this.iaidoSpeed;
      this.vy = 0;
      this.updateIaidoHitbox();
      if (particleSystem) {
        particleSystem.createDashGhost(this.x, this.y, this.width, this.height, this.facing, 'rgba(255, 0, 128, 0.45)');
      }
      if (this.iaidoTimer <= 0) {
        this.isIaido = false;
        this.vx = this.facing * 120;
      }
    } else if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.dashSpeed;
      this.vy = 0;
      if (particleSystem) {
        particleSystem.createDashGhost(this.x, this.y, this.width, this.height, this.facing);
      }
      // Dash-Slash: atacar durante o Dash executa corte horizontal veloz
      if (this.attackBufferTimer > 0 && !this.isAttacking) {
        this.attackBufferTimer = 0;
        this.triggerAttack(soundEngine, { mode: 'dash_slash', particleSystem });
      }
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx = 0;
      }
    } else {
      // Agachar funcional no chão (reduz hitbox para desviar de lasers estilo Metal Slug)
      const wantsCrouch = this.onGround && input.down && !this.isDashing && !this.isIaido;
      if (wantsCrouch && !this.isCrouching) {
        this.y += (this.standHeight - this.crouchHeight);
        this.height = this.crouchHeight;
        this.isCrouching = true;
      } else if (!wantsCrouch && this.isCrouching) {
        this.y -= (this.standHeight - this.height);
        this.height = this.standHeight;
        this.isCrouching = false;
      }

      // Movimentação Horizontal (Over-Caffeine dá +25% de velocidade!)
      let activeMoveSpeed = this.overCaffeineTimer > 0 ? this.moveSpeed * 1.25 : this.moveSpeed;
      if (this.isCrouching) activeMoveSpeed *= 0.38;
      let dir = 0;
      if (input.left) dir -= 1;
      if (input.right) dir += 1;

      // Permite manter momentum no ar durante o ataque ou micro-avanço do corte
      if (dir !== 0 && (!this.isAttacking || !this.onGround)) {
        this.vx = dir * activeMoveSpeed;
        if (!this.isAttacking) this.facing = dir;
        if (this.onGround && Math.random() < 0.25 && particleSystem) {
          particleSystem.createDust(this.x + this.width / 2, this.y + this.height);
        }
      } else if (this.lungeTimer > 0) {
        this.vx = this.facing * 170;
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

      // Dash Trigger (com Input Buffer e Dash Cancel de ataque)
      if (this.dashBufferTimer > 0 && this.canDash && this.dashCooldownTimer <= 0) {
        this.dashBufferTimer = 0;
        if (this.isAttacking) {
          this.isAttacking = false;
          this.attackHitbox = null;
        }
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

    // Ataque (com Input Buffer, Pogo Attack, Up-Slash e Combo direcional)
    if (this.attackBufferTimer > 0 && !this.isAttacking && !this.isDashing && !this.isIaido) {
      this.attackBufferTimer = 0;
      let mode = 'combo';
      if (!this.onGround && input.down) mode = 'pogo';
      else if (input.up) mode = 'upslash';
      this.triggerAttack(soundEngine, { mode, particleSystem });
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
    const prevVy = this.vy;
    this.y += this.vy * dt;
    this.onGround = false;
    this.resolveVerticalCollisions(platforms);

    // Poeira e squash tátil ao aterrissar de uma queda
    if (!prevOnGround && this.onGround && prevVy > 160) {
      this.landingSquashTimer = 0.11;
      if (particleSystem) {
        particleSystem.createDust(this.x + this.width / 2, this.y + this.height, 6);
      }
    }

    // Ajusta Coyote Time
    if (prevOnGround && !this.onGround && this.vy >= 0) {
      this.coyoteTimer = this.coyoteMax;
    }

    // Determina Estado e Animação
    this.updateStateAndAnimation(dt);
  }

  throwGitBomb(soundEngine, particleSystem = null) {
    if (this.bombAmmo <= 0) return false;
    this.bombAmmo -= 1;
    this.pendingGrenade = {
      type: 'git_bomb',
      x: this.x + this.width / 2 - 8,
      y: this.y + 6,
      vx: this.facing * 350,
      vy: -390,
      gravity: 980,
      width: 16,
      height: 16,
      damage: 48 + this.bonusDamage,
      isPlayer: true,
      life: 2.2
    };
    if (soundEngine) soundEngine.playDash();
    if (particleSystem) {
      particleSystem.createSparks(this.x + this.width / 2, this.y + 10, '#ff9100', 5);
    }
    return true;
  }

  toggleChronos(soundEngine) {
    if (this.chronosActive) {
      this.chronosActive = false;
      if (soundEngine && soundEngine.playChronos) soundEngine.playChronos(false);
      return false;
    }
    if (this.chronosEnergy >= 18) {
      this.chronosActive = true;
      if (soundEngine && soundEngine.playChronos) soundEngine.playChronos(true);
      return true;
    }
    return false;
  }

  addChronos(amount) {
    this.chronosEnergy = Math.min(this.chronosMax, this.chronosEnergy + amount);
  }

  updateChronos(realDt, soundEngine) {
    if (this.chronosActive) {
      this.chronosEnergy -= 36 * realDt;
      if (this.chronosEnergy <= 0) {
        this.chronosEnergy = 0;
        this.chronosActive = false;
        if (soundEngine && soundEngine.playChronos) soundEngine.playChronos(false);
      }
    } else if (this.chronosEnergy < this.chronosMax) {
      this.chronosEnergy = Math.min(this.chronosMax, this.chronosEnergy + 15 * realDt);
    }
  }

  updateIaidoHitbox() {
    if (!this.attackHitbox || this.attackType !== 'iaido_blitz') return;
    const hitW = 86;
    const hitH = 44;
    this.attackHitbox.x = this.facing === 1 ? this.x + this.width - 14 : this.x - hitW + 14;
    this.attackHitbox.y = this.y;
  }

  triggerIaidoBlitz(soundEngine, particleSystem = null) {
    this.iaidoBufferTimer = 0;
    this.isDashing = false;
    this.isIaido = true;
    this.iaidoTimer = this.iaidoDuration;
    this.iaidoCooldownTimer = this.iaidoCooldown;
    this.invincibleTimer = Math.max(this.invincibleTimer, 0.22);

    this.isAttacking = true;
    this.attackType = 'iaido_blitz';
    this.comboStep = 3;
    this.comboTimer = 0.6;
    this.attackTimer = 0.22;
    this.enemiesHitThisAttack.clear();

    if (soundEngine && soundEngine.playIaidoSlash) soundEngine.playIaidoSlash();
    else if (soundEngine) soundEngine.playSwordSlash();

    const hitW = 86;
    const hitH = 44;
    this.attackHitbox = {
      x: this.facing === 1 ? this.x + this.width - 14 : this.x - hitW + 14,
      y: this.y,
      width: hitW,
      height: hitH,
      damage: 38 + this.bonusDamage,
      step: 3,
      isPogo: false,
      attackType: 'iaido_blitz'
    };

    if (particleSystem && particleSystem.createSlashLine) {
      particleSystem.createSlashLine(
        this.x + this.width / 2 + this.facing * 42,
        this.y + this.height * 0.45,
        this.facing * -0.08,
        130,
        '#ff2a85'
      );
    }
  }

  triggerAttack(soundEngine, arg = false) {
    const opts = typeof arg === 'object' && arg !== null
      ? arg
      : { mode: arg ? 'pogo' : 'combo', particleSystem: null };
    const mode = opts.mode || 'combo';
    const particleSystem = opts.particleSystem || null;

    this.isAttacking = true;
    this.comboTimer = 0.55;
    this.enemiesHitThisAttack.clear();

    if (mode === 'pogo') {
      this.comboStep = 1;
      this.attackType = 'pogo';
      this.attackTimer = 0.22;
      soundEngine.playSwordSlash();
      this.attackHitbox = {
        x: this.x - 4,
        y: this.y + this.height - 4,
        width: this.width + 8,
        height: 34,
        damage: 22 + this.bonusDamage,
        step: 1,
        isPogo: true,
        attackType: 'pogo'
      };
      return;
    }

    if (mode === 'upslash') {
      this.comboStep = 2;
      this.attackType = 'upslash';
      this.attackTimer = 0.21;
      soundEngine.playSwordSlash();
      this.attackHitbox = {
        x: this.x - 10,
        y: this.y - 36,
        width: this.width + 28,
        height: 52,
        damage: 24 + this.bonusDamage,
        step: 2,
        isPogo: false,
        attackType: 'upslash'
      };
      if (particleSystem && particleSystem.createSlashLine) {
        particleSystem.createSlashLine(this.x + this.width / 2, this.y - 8, -1.25 * this.facing, 86, '#00e5ff');
      }
      return;
    }

    if (mode === 'dash_slash') {
      this.comboStep = 3;
      this.attackType = 'dash_slash';
      this.attackTimer = 0.20;
      if (soundEngine && soundEngine.playIaidoSlash) soundEngine.playIaidoSlash();
      else soundEngine.playSwordSlash();

      const hitW = 78;
      const hitH = 40;
      this.attackHitbox = {
        x: this.facing === 1 ? this.x + this.width - 8 : this.x - hitW + 8,
        y: this.y + 2,
        width: hitW,
        height: hitH,
        damage: 34 + this.bonusDamage,
        step: 3,
        isPogo: false,
        attackType: 'dash_slash'
      };
      if (particleSystem && particleSystem.createSlashLine) {
        particleSystem.createSlashLine(
          this.x + this.width / 2 + this.facing * 36,
          this.y + this.height * 0.45,
          0.06 * this.facing,
          115,
          '#00e5ff'
        );
      }
      return;
    }

    // Combo de 3 golpes estilo Katana Zero
    this.comboStep = (this.comboStep % 3) + 1;
    this.attackType = `combo${this.comboStep}`;
    this.attackTimer = this.comboStep === 3 ? 0.25 : 0.21;
    if (this.onGround) this.lungeTimer = 0.08;
    soundEngine.playSwordSlash();

    const hitW = 48 + (this.comboStep === 3 ? 16 : 0);
    const hitH = 42;
    const hitX = this.facing === 1 ? this.x + this.width - 4 : this.x - hitW + 4;
    const hitY = this.y + 2;

    this.attackHitbox = {
      x: hitX,
      y: hitY,
      width: hitW,
      height: hitH,
      damage: (18 + this.comboStep * 8 + this.bonusDamage),
      step: this.comboStep,
      isPogo: false,
      attackType: this.attackType
    };

    if (particleSystem && particleSystem.createSlashLine) {
      const cx = this.x + this.width / 2 + this.facing * 30;
      const cy = this.y + this.height * 0.48;
      const angle = this.comboStep === 1 ? -0.48 * this.facing : (this.comboStep === 2 ? 0.48 * this.facing : 0);
      const col = this.comboStep === 2 ? '#ff2a85' : (this.comboStep === 3 ? '#ffd700' : '#00e5ff');
      particleSystem.createSlashLine(cx, cy, angle, this.comboStep === 3 ? 105 : 84, col);
      if (this.comboStep === 3) {
        particleSystem.createSlashLine(cx, cy, 0.55 * this.facing, 96, '#00e5ff');
      }
    }

    // No 3º golpe do combo (Lv 2+ ou Armadura Dourada) OU com [F] Framework Burst ativo, dispara Onda de Código!
    const hasFramework = this.frameworkAmmo > 0;
    const isCombo3Wave = this.comboStep === 3 && (this.level >= 2 || this.armorTier === 'gold');
    if (hasFramework || isCombo3Wave) {
      if (hasFramework) this.frameworkAmmo -= 1;
      this.pendingProjectile = {
        type: 'code_wave',
        x: this.facing === 1 ? this.x + this.width : this.x - 24,
        y: this.y + 8,
        vx: this.facing * (hasFramework ? 540 : 480),
        vy: 0,
        width: 24,
        height: 24,
        damage: (hasFramework ? 24 : 20) + this.bonusDamage,
        isPlayer: true,
        life: 0.9
      };
    }
  }

  bounceFromPogo(soundEngine, particleSystem) {
    this.vy = -440;
    this.doubleJumpUsed = false;
    this.canDash = true;
    this.dashCooldownTimer = 0;
    if (soundEngine) soundEngine.playJump();
    if (particleSystem) {
      particleSystem.createSparks(this.x + this.width / 2, this.y + this.height + 8, '#00e5ff', 10);
    }
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

  addXp(amount, soundEngine, particleSystem = null) {
    this.xp += amount;
    while (this.xp >= this.nextXp) {
      this.xp -= this.nextXp;
      this.level += 1;
      this.nextXp = Math.floor(this.nextXp * 1.5);
      this.maxHp += 15;
      this.hp = this.maxHp;
      this.bonusDamage += 4;
      soundEngine.playLevelUp();

      if (particleSystem) {
        particleSystem.createSparks(this.x + this.width / 2, this.y + this.height / 2, '#ffd700', 18);
        const msg = this.level === 2
          ? 'LV 2! ONDA DE CÓDIGO!'
          : `LEVEL ${this.level}! +ATK +HP`;
        particleSystem.createDamageNumber(this.x - 10, this.y - 20, msg, '#ffd700');
      }
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
    } else if (this.isDashing || this.isIaido) {
      this.state = 'dash';
    } else if (this.isAttacking) {
      this.state = `attack${this.comboStep}`;
    } else if (!this.onGround) {
      this.state = this.vy < 0 ? 'jump' : 'fall';
    } else if (this.isCrouching) {
      this.state = 'crouch';
    } else if (Math.abs(this.vx) > 10) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }

    // Alternância de frames (ciclo de 4 batidas estilo Metal Slug)
    this.animTimer += dt;
    if (this.state === 'run') {
      if (this.animTimer > 0.075) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame % 4) + 1;
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

    // Sprite sheets PNG Hi-Bit: base (run1, run2, guard, slash) + actions (jump, fall/dash, crouch, hurt)
    const sheetKey = this.gender === 'female' ? 'hero_female' : 'hero';
    const actionsKey = this.gender === 'female' ? 'hero_female_actions' : 'hero_actions';
    const baseSheet = renderer.ext && (renderer.ext(sheetKey) || renderer.ext('hero'));
    const actionSheet = renderer.ext && (renderer.ext(actionsKey) || renderer.ext('hero_actions'));

    if (baseSheet) {
      let activeSheet = baseSheet;
      let frame = 2;

      if (this.state === 'hurt' && actionSheet) {
        activeSheet = actionSheet;
        frame = 3;
      } else if (this.isAttacking) {
        frame = this.attackTimer > 0.12 ? 2 : 3;
      } else if (this.state === 'crouch' && actionSheet) {
        activeSheet = actionSheet;
        frame = 2;
      } else if (this.state === 'jump' && actionSheet) {
        activeSheet = actionSheet;
        frame = 0;
      } else if ((this.state === 'fall' || this.state === 'dash') && actionSheet) {
        activeSheet = actionSheet;
        frame = 1;
      } else if (this.state === 'run') {
        if (this.animFrame === 2 && actionSheet) {
          activeSheet = actionSheet;
          frame = 1;
        } else {
          frame = this.animFrame === 3 ? 1 : 0;
        }
      } else {
        frame = 2;
      }

      const fw = activeSheet.width / 4;
      const fh = activeSheet.height;
      const drawH = 82;
      const drawW = Math.round(fw * (drawH / fh));

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (this.isAttacking && this.comboStep === 3) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 18;
      } else if (this.armorTier === 'gold') {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 14;
      } else if (this.state === 'idle') {
        ctx.shadowColor = 'rgba(0, 229, 255, 0.55)';
        ctx.shadowBlur = 5 + Math.sin(this.idleAnimTime * 4.5) * 3;
      }

      ctx.translate(Math.round(footX), Math.round(footY));
      if (this.facing === -1) {
        ctx.scale(-1, 1);
      }

      if (this.overCaffeineTimer > 0) {
        ctx.translate((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 1.5);
      }

      if (this.landingSquashTimer > 0) {
        ctx.scale(1.14, 0.86);
      } else if (this.state === 'hurt' && !actionSheet) {
        ctx.rotate(-0.18);
        ctx.filter = 'brightness(1.8) saturate(1.8)';
      } else if (this.state === 'hurt') {
        ctx.filter = 'brightness(1.4) saturate(1.4)';
      } else if (this.state === 'dash') {
        ctx.scale(1.06, 0.95);
      } else if (this.state === 'idle') {
        const breath = Math.sin(this.idleAnimTime * 4.5);
        const sway = Math.sin(this.idleAnimTime * 2.25) * 0.025;
        ctx.rotate(sway);
        ctx.scale(1 - breath * 0.025, 1 + breath * 0.038);
      }

      // Âncora centralizada na base
      ctx.drawImage(activeSheet, frame * fw, 0, fw, fh, -drawW / 2, -drawH, drawW, drawH);
      ctx.restore();

      if (this.overCaffeineTimer > 0) {
        ctx.save();
        ctx.fillStyle = '#ffd600';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('☕ TURBO!', Math.round(footX), Math.round(footY - drawH - 4));
        ctx.restore();
      }

      // Arcos de corte estilo Katana Zero
      if (this.isAttacking) {
        this.renderKatanaSlashArc(ctx, footX, footY);
      }
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

  renderKatanaSlashArc(ctx, footX, footY) {
    const progress = Math.max(0, Math.min(1, this.attackTimer / 0.24));
    const cx = Math.round(footX);
    const cy = Math.round(footY - this.height * 0.55);

    ctx.save();
    if (this.attackType === 'pogo') {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 4.5;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, Math.round(footY + 6), 25, 0.12 * Math.PI, 0.88 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (this.attackType === 'upslash') {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx + this.facing * 8, cy - 16, 34, 1.15 * Math.PI, 1.92 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.translate(cx, cy);
    if (this.facing === -1) ctx.scale(-1, 1);

    if (this.attackType === 'iaido_blitz' || this.attackType === 'dash_slash') {
      const col = this.attackType === 'iaido_blitz' ? '#ff2a85' : '#00e5ff';
      ctx.shadowColor = col;
      ctx.shadowBlur = 16;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-24, -4);
      ctx.quadraticCurveTo(36, -18, 76, 0);
      ctx.quadraticCurveTo(36, 12, -24, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-12, -1);
      ctx.quadraticCurveTo(36, -8, 70, 0);
      ctx.quadraticCurveTo(36, 5, -12, 1);
      ctx.closePath();
      ctx.fill();
    } else {
      const tilt = this.attackType === 'combo1' ? -0.38 : (this.attackType === 'combo2' ? 0.38 : 0);
      const col = this.attackType === 'combo2' ? '#ff2a85' : (this.attackType === 'combo3' ? '#ffd700' : '#00e5ff');
      ctx.rotate(tilt);
      ctx.globalAlpha = 0.45 + 0.55 * progress;
      ctx.strokeStyle = col;
      ctx.lineWidth = this.attackType === 'combo3' ? 6.5 : 5;
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(10, 0, this.attackType === 'combo3' ? 44 : 36, -0.52 * Math.PI, 0.45 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(12, 0, this.attackType === 'combo3' ? 42 : 34, -0.44 * Math.PI, 0.38 * Math.PI);
      ctx.stroke();

      if (this.attackType === 'combo3') {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(10, 0, 38, -0.35 * Math.PI, 0.52 * Math.PI);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
