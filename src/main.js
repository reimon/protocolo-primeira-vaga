/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * main.js - Loop Principal, Máquina de Estados e Orquestração do Jogo
 */

import { PixelRenderer } from './assets/PixelRenderer.js';
import { SoundEngine } from './audio/SoundEngine.js';
import { ParallaxBackground } from './world/ParallaxBackground.js';
import { ParticleSystem, ScreenShake } from './world/ParticleSystem.js';
import { LoadingScene } from './world/LoadingScene.js';
import { buildLevel1 } from './world/Level1.js';
import { WorldRenderer } from './world/WorldRenderer.js';
import { Player } from './entities/Player.js';
import { Boss } from './entities/Boss.js';
import { InputController } from './input/InputController.js';
import { DialogSystem } from './ui/DialogSystem.js';
import { HudController } from './ui/HudController.js';
import { OverlayScreens } from './ui/OverlayScreens.js';
import { LeaderboardService } from './services/LeaderboardService.js';
import { SelfTest } from './tests/SelfTest.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.width = 1280;
    this.height = 720;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Serviços Core
    this.renderer = new PixelRenderer();
    this.sound = new SoundEngine();
    this.screenShake = new ScreenShake();
    this.screenShakeEnabled = true;
    const origShakeTrigger = this.screenShake.trigger.bind(this.screenShake);
    this.screenShake.trigger = (intensity, duration) => {
      if (this.screenShakeEnabled) origShakeTrigger(intensity, duration);
    };

    this.stateBeforeSettings = null;
    this.settings = HudController.loadSettings({ sfx: 85, music: 65, shake: true, crt: true, touch: false, heroGender: 'male' });
    this.particles = new ParticleSystem();
    this.dialog = new DialogSystem(this.sound);
    this.leaderboard = new LeaderboardService();
    this.parallax = new ParallaxBackground(this.renderer, this.width, this.height);
    this.loadingScene = new LoadingScene(this.width, this.height, this.sound, this.renderer);

    // Estados: 'BOOT', 'LOADING', 'MENU', 'PLAYING', 'MENTOR_DIALOG', 'BOSS_FIGHT', 'SETTINGS', 'VICTORY', 'GAME_OVER', 'LEADERBOARD'
    this.state = 'BOOT';
    this.lastTime = 0;
    this.lastDt = 0.016;
    this.hitstopTimer = 0;

    // Mundo e Câmera
    this.cameraX = 0;
    this.levelWidth = 5200;
    this.player = null;
    this.boss = null;
    this.mentors = [];
    this.enemies = [];
    this.platforms = [];
    this.collectibles = [];
    this.projectiles = [];
    this.checkpoints = [];
    this.hazards = [];
    this.crates = [];
    this.pows = [];
    this.activeCheckpoint = null;
    this.currentZone = 1;
    this.zoneBanner = null;

    this.stats = {
      score: 0,
      enemiesDefeated: 0,
      devsRescued: 0,
      maxCombo: 0,
      timeElapsed: 0,
      activeMentorTip: 'Construa portfólio prático e fale com o Mentor da Carreira!'
    };
    this.combo = { count: 0, timer: 0, maxTimer: 2.6 };

    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      jumpPressed: false,
      dashPressed: false,
      iaidoPressed: false,
      bombPressed: false,
      chronosPressed: false,
      attackPressed: false,
      interactPressed: false
    };

    InputController.bindAll(this);
    this.boot();
  }

  async boot() {
    console.log('%c🚀 Iniciando PROTOCOLO PRIMEIRA VAGA...', 'color: #00e5ff; font-weight: bold; font-size: 14px;');
    SelfTest.runAll();
    this.state = 'LOADING';
    document.getElementById('startScreen')?.classList.add('hidden');

    await this.renderer.loadAllAssets();
    this.loadingScene.targetProgress = 100;
    requestAnimationFrame((t) => this.loop(t));
  }

  finishLoading() {
    this.sound.playSwordSlash();
    this.state = 'MENU';
    document.getElementById('startScreen')?.classList.remove('hidden');
    this.sound.startBgm('stage');
  }

  openLoadingIntro() {
    this.sound.ensureContext();
    this.loadingScene.progress = 100;
    this.loadingScene.targetProgress = 100;
    this.loadingScene.isComplete = true;
    this.state = 'LOADING';

    document.getElementById('startScreen')?.classList.add('hidden');
    document.getElementById('hud')?.classList.add('hidden');
    document.getElementById('touchControls')?.classList.add('hidden');
  }

  openSettings() {
    if (this.state === 'SETTINGS') return;
    this.sound.ensureContext();
    this.stateBeforeSettings = this.state;
    this.state = 'SETTINGS';
    this.input.left = false;
    this.input.right = false;
    this.input.jump = false;
    document.getElementById('settingsModal')?.classList.remove('hidden');
  }

  closeSettings() {
    document.getElementById('settingsModal')?.classList.add('hidden');
    document.getElementById('keyboardKeysHint')?.classList.add('hidden');
    this.state = this.stateBeforeSettings || 'MENU';
    this.stateBeforeSettings = null;
  }

  applySettings() {
    HudController.applySettings(this.settings, this.sound, (shake) => {
      this.screenShakeEnabled = shake;
    });
  }

  saveSettings() {
    HudController.saveSettings(this.settings);
  }

  updateMuteButtonUI(isMuted) {
    HudController.updateMuteButton(isMuted);
  }

  startNewGame() {
    this.sound.ensureContext();
    this.stats = {
      score: 0,
      enemiesDefeated: 0,
      devsRescued: 0,
      maxCombo: 0,
      timeElapsed: 0,
      activeMentorTip: 'Caminhe para a direita e ouça os conselhos do Mentor!'
    };

    this.player = new Player(80, this.height - 220, this.settings.heroGender);
    this.combo = { count: 0, timer: 0, maxTimer: 2.6 };
    this.activeCheckpoint = { x: 80, y: this.height - 220, zone: 1, label: 'Início' };
    this.currentZone = 1;
    this.showZoneBanner('ZONA 1', 'A Vila da Procrastinação');

    this.buildLevel();
    this.cameraX = 0;
    this.state = 'PLAYING';
    this.sound.startBgm('stage');

    document.getElementById('startScreen')?.classList.add('hidden');
    document.getElementById('hud')?.classList.remove('hidden');
    document.getElementById('touchControls')?.classList.remove('hidden');
  }

  buildLevel() {
    const level = buildLevel1(this.levelWidth, this.height);
    this.platforms = level.platforms;
    this.enemies = level.enemies;
    this.mentors = level.mentors;
    this.collectibles = level.collectibles;
    this.checkpoints = level.checkpoints;
    this.hazards = level.hazards;
    this.crates = level.crates || [];
    this.pows = level.pows || [];
    this.boss = level.boss;
    this.projectiles = [];
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (dt > 0.05) dt = 0.05;
    this.lastDt = dt;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.screenShake.update(dt);
      this.render();
      this.resetPerFrameInputs();
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    this.update(dt);
    this.render();
    this.resetPerFrameInputs();
    requestAnimationFrame((t) => this.loop(t));
  }

  resetPerFrameInputs() {
    this.input.jumpPressed = false;
    this.input.dashPressed = false;
    this.input.iaidoPressed = false;
    this.input.bombPressed = false;
    this.input.chronosPressed = false;
    this.input.attackPressed = false;
    this.input.interactPressed = false;
  }

  update(dt) {
    if (this.state === 'LOADING') {
      this.loadingScene.update(dt);
      return;
    }

    this.screenShake.update(dt);
    this.particles.update(dt, this.height - 160);

    if (this.state === 'MENU') {
      this.cameraX += 80 * dt;
      return;
    }

    if (this.state === 'MENTOR_DIALOG') {
      InputController.pollGamepad(this);
      this.dialog.update(dt, this.input);
      return;
    }

    if (this.state !== 'PLAYING' && this.state !== 'BOSS_FIGHT') return;

    InputController.pollGamepad(this);
    this.stats.timeElapsed += dt;
    if (this.combo.timer > 0) {
      this.combo.timer -= dt;
      if (this.combo.timer <= 0) this.combo.count = 0;
    }
    if (this.zoneBanner) {
      this.zoneBanner.timer -= dt;
      if (this.zoneBanner.timer <= 0) this.zoneBanner = null;
    }

    this.player.updateChronos(dt, this.sound);
    const worldDt = this.player.chronosActive ? dt * 0.32 : dt;
    const playerDt = this.player.chronosActive ? dt * 0.85 : dt;

    this.updateMovingPlatforms(worldDt);
    this.player.update(playerDt, this.input, this.platforms, this.sound, this.particles);

    if (this.player.pendingProjectile) {
      this.projectiles.push(this.player.pendingProjectile);
      this.player.pendingProjectile = null;
    }
    if (this.player.pendingGrenade) {
      this.projectiles.push(this.player.pendingGrenade);
      this.player.pendingGrenade = null;
    }

    this.updatePows(worldDt);
    this.updateZoneProgress();
    this.updateCheckpoints();
    this.updateHazards();

    if (this.player.hp <= 0) {
      this.triggerGameOver();
      return;
    }

    const targetCamX = this.player.x - this.width * 0.35;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelWidth - this.width));

    if (this.player.attackHitbox) {
      this.checkPlayerAttackCollisions();
    }

    for (const mentor of this.mentors) {
      mentor.update(worldDt, this.player, this.particles, this.sound, (m) => this.openMentorDialog(m));
    }

    this.updateEnemies(worldDt);
    if (this.updateCollectibles()) return;
    this.updateProjectiles(worldDt);
    this.updateBossFight(worldDt);

    HudController.updateHUD(this.player, this.stats);
  }

  updateEnemies(dt) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.player, this.platforms, this.projectiles, this.sound, this.particles);
      if (e.isDead) {
        this.stats.enemiesDefeated++;
        this.stats.score += e.scoreValue;
        this.player.addXp(e.xpValue, this.sound, this.particles);
        this.player.addChronos(20);
        this.enemies.splice(i, 1);
      }
    }
  }

  updatePows(dt) {
    for (const pow of this.pows) {
      if (pow.rescued && pow.runTimer > 0) {
        pow.runTimer -= dt;
        pow.x += 120 * dt;
      }
    }
  }

  breakCrate(crate) {
    if (crate.destroyed) return;
    crate.destroyed = true;
    this.sound.playHit();
    this.stats.score += 100;
    const cx = crate.x + crate.width / 2;
    const cy = crate.y + crate.height / 2;
    this.particles.createDebris(cx, cy, ['#8d6e63', '#ffd54f', '#5d4037'], 7);
    this.particles.createSparks(cx, cy, '#ffd54f', 8);
    if (crate.drop) {
      this.collectibles.push({ type: crate.drop, x: crate.x + 5, y: crate.y + 8, width: 24, height: 24 });
    }
  }

  rescuePow(pow) {
    if (pow.rescued) return;
    pow.rescued = true;
    pow.runTimer = 1.6;
    this.stats.devsRescued += 1;
    this.stats.score += 500;
    this.sound.playLevelUp();
    const px = pow.x + pow.width / 2;
    const py = pow.y + pow.height / 2;
    this.particles.createSparks(px, py, '#00e676', 14);
    this.particles.createDamageNumber(px, pow.y - 12, 'POW RESGATADO! +500', '#00e676');
    if (pow.drop) {
      this.collectibles.push({ type: pow.drop, x: pow.x + 5, y: pow.y + 14, width: 24, height: 24 });
    }
  }

  explodeGitBomb(bomb) {
    const cx = bomb.x + bomb.width / 2;
    const cy = bomb.y + bomb.height / 2;
    this.particles.createExplosion(cx, cy, 1.25);
    this.screenShake.trigger(10, 0.25);
    this.sound.playEnemyDeath();

    const blastRadius = 90;
    for (const e of this.enemies) {
      if (e.isDead) continue;
      const dist = Math.hypot((e.x + e.width / 2) - cx, (e.y + e.height / 2) - cy);
      if (dist <= blastRadius) {
        if (e.hasFrontShield) e.shatterShield(this.particles, this.sound);
        const dealt = e.takeDamage(bomb.damage, (e.x + e.width / 2) >= cx ? 1 : -1, this.particles, this.sound);
        if (dealt > 0) this.registerComboHit(110);
      }
    }

    if (this.state === 'BOSS_FIGHT' && this.boss && !this.boss.isDead) {
      const bDist = Math.hypot((this.boss.x + this.boss.width / 2) - cx, (this.boss.y + this.boss.height / 2) - cy);
      if (bDist <= blastRadius + 45) {
        const dealt = this.boss.takeDamage(bomb.damage, this.player.armorTier === 'gold', this.particles, this.sound, this.screenShake);
        if (dealt > 0) this.registerComboHit(160);
      }
    }

    for (const c of this.crates) {
      if (!c.destroyed && Math.hypot((c.x + c.width / 2) - cx, (c.y + c.height / 2) - cy) <= blastRadius) {
        this.breakCrate(c);
      }
    }
    for (const pow of this.pows) {
      if (!pow.rescued && Math.hypot((pow.x + pow.width / 2) - cx, (pow.y + pow.height / 2) - cy) <= blastRadius) {
        this.rescuePow(pow);
      }
    }
  }

  updateCollectibles() {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      if (!this.player.checkAABB(this.player, col)) continue;

      this.sound.playItemCollect();
      if (col.type === 'coffee') {
        const healAmt = col.healBonus || 30;
        if (this.player.hp >= this.player.maxHp) {
          this.player.overCaffeineTimer = 6.0;
          this.particles.createDamageNumber(col.x, col.y - 12, 'OVER-CAFFEINE! +VEL', '#ffd600');
        } else {
          this.player.heal(healAmt);
          this.particles.createDamageNumber(col.x, col.y - 10, `+${healAmt} CONFIANÇA`, '#00e676');
        }
      } else if (col.type === 'book') {
        const xpAmt = col.xpBonus || 60;
        this.player.addXp(xpAmt, this.sound, this.particles);
        this.particles.createDamageNumber(col.x, col.y - 10, `+${xpAmt} XP SKILLS`, '#00e5ff');
      } else if (col.type === 'pickup_f') {
        this.player.frameworkAmmo += 10;
        this.particles.createDamageNumber(col.x, col.y - 12, '[F] FRAMEWORK BURST x10!', '#00e5ff');
      } else if (col.type === 'pickup_g') {
        this.player.bombAmmo += 2;
        this.particles.createDamageNumber(col.x, col.y - 12, '[G] GIT BOMB +2!', '#ff9100');
      } else if (col.type === 'offer') {
        this.triggerVictory();
        return true;
      }
      this.collectibles.splice(i, 1);
    }
    return false;
  }

  updateProjectiles(dt) {
    const groundY = this.height - 160;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      p.life -= dt;

      if (p.type === 'git_bomb') {
        const hitFloor = p.y + p.height >= groundY;
        const hitEnemy = this.enemies.some(e => !e.isDead && this.player.checkAABB(p, e));
        const hitBoss = this.state === 'BOSS_FIGHT' && this.boss && !this.boss.isDead && this.player.checkAABB(p, this.boss);
        if (hitFloor || hitEnemy || hitBoss || p.life <= 0) {
          if (hitFloor) p.y = groundY - p.height;
          this.explodeGitBomb(p);
          this.projectiles.splice(i, 1);
        }
        continue;
      }

      if (p.isPlayer) {
        let hit = false;
        for (const c of this.crates) {
          if (!c.destroyed && this.player.checkAABB(p, c)) {
            this.breakCrate(c);
            hit = true;
            break;
          }
        }
        if (!hit) {
          for (const pow of this.pows) {
            if (!pow.rescued && this.player.checkAABB(p, pow)) {
              this.rescuePow(pow);
              hit = true;
              break;
            }
          }
        }
        for (const e of this.enemies) {
          if (!hit && !e.isDead && this.player.checkAABB(p, e)) {
            const dealt = e.takeDamage(p.damage, p.vx >= 0 ? 1 : -1, this.particles, this.sound);
            if (dealt > 0) this.registerComboHit(80);
            hit = true;
            break;
          }
        }
        if (!hit && this.state === 'BOSS_FIGHT' && this.boss && !this.boss.isDead && this.player.checkAABB(p, this.boss)) {
          const dealt = this.boss.takeDamage(p.damage, this.player.armorTier === 'gold', this.particles, this.sound, this.screenShake);
          if (dealt > 0) this.registerComboHit(140);
          hit = true;
        }
        if (hit || p.life <= 0) {
          this.projectiles.splice(i, 1);
        }
        continue;
      }

      if (p.isEnemy && this.player.checkAABB(this.player, p)) {
        const dmg = this.player.takeDamage(p.damage, this.sound, this.screenShake);
        if (dmg > 0) {
          this.combo.count = 0;
          this.combo.timer = 0;
          this.particles.createDamageNumber(this.player.x, this.player.y - 10, dmg, '#ff1744');
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  updateBossFight(dt) {
    if (this.state === 'PLAYING' && this.player.x > 4400) {
      this.state = 'BOSS_FIGHT';
      this.sound.startBgm('boss');
      this.stats.activeMentorTip = 'DERROTE O ATS-9000! Quebre as barreiras algorítmicas!';
    }

    if (this.state !== 'BOSS_FIGHT' || !this.boss) return;

    this.boss.update(
      dt, this.player, this.platforms, this.projectiles, this.enemies,
      this.sound, this.particles, this.screenShake, () => this.triggerBossMentorIntervention()
    );

    if (this.boss.isDead && this.boss.deathFinished && !this.collectibles.some((c) => c.type === 'offer')) {
      this.collectibles.push({
        type: 'offer',
        x: this.boss.x + 35,
        y: this.height - 200,
        width: 32,
        height: 32
      });
      this.stats.activeMentorTip = 'COLETE A CARTA DE OFERTA DOURADA!';
    }
  }

  registerComboHit(baseScore) {
    this.combo.count += 1;
    this.combo.timer = this.combo.maxTimer;
    const mult = 1 + Math.min(3, Math.floor(this.combo.count / 3)) * 0.5;
    this.stats.score += Math.floor(baseScore * mult);
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo.count);
  }

  checkPlayerAttackCollisions() {
    const atk = this.player.attackHitbox;

    for (const c of this.crates) {
      if (!c.destroyed && !this.player.enemiesHitThisAttack.has(c) && this.player.checkAABB(atk, c)) {
        this.player.enemiesHitThisAttack.add(c);
        this.breakCrate(c);
      }
    }

    for (const pow of this.pows) {
      if (!pow.rescued && !this.player.enemiesHitThisAttack.has(pow) && this.player.checkAABB(atk, pow)) {
        this.player.enemiesHitThisAttack.add(pow);
        this.rescuePow(pow);
      }
    }

    for (const e of this.enemies) {
      if (!this.player.enemiesHitThisAttack.has(e) && this.player.checkAABB(atk, e)) {
        this.player.enemiesHitThisAttack.add(e);
        const dealt = e.takeDamage(atk.damage, this.player.facing, this.particles, this.sound);
        if (dealt > 0) {
          this.hitstopTimer = atk.step === 3 ? 0.065 : 0.045;
          this.screenShake.trigger(atk.step === 3 ? 7 : 4, 0.16);
          this.player.addChronos(8);
          this.registerComboHit(50 * atk.step);
          this.particles.createSlashLine(
            e.x + e.width / 2,
            e.y + e.height / 2,
            (Math.random() > 0.5 ? -0.55 : 0.55),
            68,
            atk.attackType === 'iaido_blitz' ? '#ff2a85' : '#00e5ff'
          );
        }
        if (atk.isPogo) {
          this.player.bounceFromPogo(this.sound, this.particles);
        }
      }
    }

    // Deflect estilo Katana Zero: aparar projéteis inimigos devolve o disparo!
    for (const p of this.projectiles) {
      if (p.isEnemy && p.type !== 'shockwave' && !p.undeflectable && this.player.checkAABB(atk, p)) {
        p.isEnemy = false;
        p.isPlayer = true;
        p.deflected = true;
        const speed = Math.max(520, Math.hypot(p.vx, p.vy) * 1.75);
        p.vx = (this.player.facing || 1) * speed;
        p.vy = -p.vy * 0.25;
        p.damage = Math.max(30, (p.damage || 15) * 2);
        p.life = 1.6;

        this.sound.playDeflect();
        this.hitstopTimer = 0.055;
        this.screenShake.trigger(5, 0.14);
        this.player.addChronos(22);
        this.registerComboHit(90);
        this.particles.createSparks(p.x + p.width / 2, p.y + p.height / 2, '#ffffff', 12);
        this.particles.createSlashLine(p.x + p.width / 2, p.y + p.height / 2, -0.7, 72, '#ffffff');
        this.particles.createDamageNumber(p.x, p.y - 12, 'DEFLECT!', '#00e5ff');
      }
    }

    if (this.state === 'BOSS_FIGHT' && this.boss && !this.boss.isDead) {
      if (!this.player.enemiesHitThisAttack.has(this.boss) && this.player.checkAABB(atk, this.boss)) {
        this.player.enemiesHitThisAttack.add(this.boss);
        const isGold = this.player.armorTier === 'gold';
        const dealt = this.boss.takeDamage(atk.damage, isGold, this.particles, this.sound, this.screenShake);
        if (dealt > 0) {
          this.hitstopTimer = atk.step === 3 ? 0.08 : 0.06;
          this.screenShake.trigger(atk.step === 3 ? 10 : 7, 0.22);
          this.registerComboHit(120 * atk.step);
          this.particles.createSlashLine(
            this.boss.x + this.boss.width / 2,
            this.boss.y + this.boss.height * 0.5,
            (Math.random() > 0.5 ? -0.65 : 0.65),
            96,
            '#ffd700'
          );
        }
        if (atk.isPogo) {
          this.player.bounceFromPogo(this.sound, this.particles);
        }
      }
    }

    // Pogo Attack também quica em armadilhas de Burnout!
    if (atk.isPogo) {
      for (const h of this.hazards) {
        if (!this.player.enemiesHitThisAttack.has(h) && this.player.checkAABB(atk, h)) {
          this.player.enemiesHitThisAttack.add(h);
          this.player.bounceFromPogo(this.sound, this.particles);
          break;
        }
      }
    }
  }

  openMentorDialog(mentor) {
    this.state = 'MENTOR_DIALOG';
    this.dialog.open(mentor);
  }

  advanceDialog() {
    try {
      if (this.state === 'MENTOR_DIALOG' && this.dialog.isOpen) {
        const finished = this.dialog.advance({
          player: this.player,
          stats: this.stats,
          particles: this.particles,
          touchEnabled: this.settings.touch
        });
        if (!finished) return;

        if (this.boss && !this.boss.isDead) {
          this.state = 'BOSS_FIGHT';
          this.sound.startBgm('boss');
          this.stats.activeMentorTip = 'PORTFÓLIO LENDÁRIO ATIVO! DERROTE O ATS-9000!';
          if (this.boss.state === 'mentor_event') {
            this.boss.state = 'idle';
            this.boss.stateTimer = 1.0;
          }
        } else {
          this.state = 'PLAYING';
        }
      } else if (this.state === 'VICTORY') {
        const input = document.getElementById('playerInitials');
        this.saveArcadeInitials(input ? input.value : 'DEV');
      }
    } catch (err) {
      console.error('Erro ao avançar diálogo:', err);
      this.dialog.reset();
      this.state = (this.boss && !this.boss.isDead) ? 'BOSS_FIGHT' : 'PLAYING';
    }
  }

  triggerBossMentorIntervention() {
    this.openMentorDialog({
      data: {
        lines: [
          'ATENÇÃO, JOVEM! O ATS-9000 entrou em modo defensivo sobrecarregado!',
          'Filtros automáticos não resistem a projetos reais que geram valor de verdade!',
          'Receba o buff definitivo: O PORTFÓLIO LENDÁRIO!',
          'Quando o núcleo dele abrir após o ataque, desfira seu golpe com a ESPADA DOURADA!'
        ]
      },
      vanish: (part, snd) => {
        this.player.armorTier = 'gold';
        this.player.bonusDamage += 25;
        this.player.heal(50);
        snd.playLevelUp();
        part.createExplosion(this.player.x, this.player.y);
      }
    });
  }

  triggerVictory() {
    this.state = 'VICTORY';
    this.sound.playVictory();

    const finalScore = this.leaderboard.calculateFinalScore({
      enemiesDefeated: this.stats.enemiesDefeated,
      devsRescued: this.stats.devsRescued,
      timeSeconds: this.stats.timeElapsed,
      maxCombo: this.stats.maxCombo,
      remainingHp: this.player.hp,
      bossDefeated: true
    });
    this.stats.score = finalScore;

    OverlayScreens.showVictory({
      stats: this.stats,
      finalScore,
      onSave: (name) => this.saveArcadeInitials(name)
    });
  }

  triggerGameOver() {
    this.state = 'GAME_OVER';
    this.sound.playGameOver();

    OverlayScreens.showGameOver({
      score: this.stats.score,
      activeCheckpoint: this.activeCheckpoint,
      onContinue: () => this.continueFromCheckpoint(),
      onRetry: () => this.startNewGame()
    });
  }

  continueFromCheckpoint() {
    if (!this.player || !this.activeCheckpoint) {
      this.startNewGame();
      return;
    }

    this.player.hp = this.player.maxHp;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.x = this.activeCheckpoint.x;
    this.player.y = this.activeCheckpoint.y;
    this.player.invincibleTimer = 1.8;
    this.player.hurtTimer = 0;
    this.player.isDashing = false;
    this.player.isAttacking = false;
    this.projectiles = [];

    if (this.boss && !this.boss.isDead) {
      this.boss = new Boss(4750, this.height - 160 - 130);
    }

    this.cameraX = Math.max(0, Math.min(this.player.x - this.width * 0.35, this.levelWidth - this.width));
    this.state = 'PLAYING';
    this.sound.startBgm('stage');
    this.stats.activeMentorTip = `Retomando do commit: ${this.activeCheckpoint.label}!`;
    HudController.updateHUD(this.player, this.stats);
  }

  showZoneBanner(title, subtitle) {
    this.zoneBanner = { title, subtitle, timer: 3.4, maxTimer: 3.4 };
  }

  updateZoneProgress() {
    if (!this.player) return;
    if (this.currentZone < 2 && this.player.x >= 1600) {
      this.currentZone = 2;
      this.showZoneBanner('ZONA 2', 'Floresta dos Tutoriais Infinitos');
    } else if (this.currentZone < 3 && this.player.x >= 3400) {
      this.currentZone = 3;
      this.showZoneBanner('ZONA 3', 'Cidadela Corporativa & Arena do RH');
    }
  }

  updateMovingPlatforms(dt) {
    for (const p of this.platforms) {
      if (!p.moving) continue;
      const m = p.moving;
      const prevX = p.x;
      const prevY = p.y;
      m.phase += dt * m.speed;

      if (m.axis === 'x') {
        p.x = m.baseX + Math.sin(m.phase) * m.range;
      } else {
        p.y = m.baseY + Math.sin(m.phase) * m.range;
      }

      m.dx = p.x - prevX;
      m.dy = p.y - prevY;

      if (this.player && this.player.onGround) {
        const feetY = this.player.y + this.player.height;
        const onTop = Math.abs(feetY - prevY) <= 4 &&
          this.player.x + this.player.width > prevX &&
          this.player.x < prevX + p.width;
        if (onTop) {
          this.player.x += m.dx;
          this.player.y += m.dy;
        }
      }
    }
  }

  updateCheckpoints() {
    if (!this.player) return;
    for (const cp of this.checkpoints) {
      if (!cp.activated && this.player.x + this.player.width >= cp.x) {
        cp.activated = true;
        this.activeCheckpoint = { x: cp.x, y: this.height - 220, zone: cp.zone, label: cp.label };
        this.sound.playItemCollect();
        this.particles.createSparks(cp.x + cp.width / 2, cp.y + 16, '#00e676', 14);
        this.particles.createDamageNumber(cp.x, cp.y - 14, 'CHECKPOINT SALVO!', '#00e676');
        this.stats.activeMentorTip = `Commit salvo em: ${cp.label}!`;
      }
    }
  }

  updateHazards() {
    if (!this.player || this.player.invincibleTimer > 0) return;
    for (const h of this.hazards) {
      if (this.player.checkAABB(this.player, h)) {
        const dmg = this.player.takeDamage(15, this.sound, this.screenShake);
        this.player.vy = -340;
        if (dmg > 0) {
          this.particles.createSparks(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#ff6d00', 10);
          this.particles.createDamageNumber(this.player.x, this.player.y - 12, `${h.label} -${dmg}`, '#ff6d00');
        }
        break;
      }
    }
  }

  async saveArcadeInitials(name = 'DEV') {
    await this.leaderboard.saveScore(name, this.stats.score, 'Contratado Jr!');
    this.openLeaderboard();
  }

  async openLeaderboard() {
    this.state = 'LEADERBOARD';
    await OverlayScreens.showLeaderboard(this.leaderboard, () => {
      this.state = 'MENU';
      document.getElementById('startScreen')?.classList.remove('hidden');
    });
  }

  render() {
    if (this.state === 'LOADING') {
      this.loadingScene.render(this.ctx);
      return;
    }

    this.ctx.save();
    const shake = this.screenShake.getOffset();
    this.ctx.translate(shake.x, shake.y);

    this.parallax.render(this.ctx, this.cameraX, this.lastDt || 0.016);
    WorldRenderer.renderPlatforms(this.ctx, this.renderer, this.platforms, this.cameraX, this.height);
    WorldRenderer.renderHazards(this.ctx, this.hazards, this.cameraX, this.width);
    WorldRenderer.renderCheckpoints(this.ctx, this.checkpoints, this.cameraX, this.width);
    WorldRenderer.renderCrates(this.ctx, this.renderer, this.crates, this.cameraX, this.width);
    WorldRenderer.renderPows(this.ctx, this.renderer, this.pows, this.cameraX, this.width);
    WorldRenderer.renderCollectibles(this.ctx, this.renderer, this.collectibles, this.cameraX);

    for (const mentor of this.mentors) {
      mentor.render(this.ctx, this.renderer, this.cameraX);
    }
    for (const enemy of this.enemies) {
      enemy.render(this.ctx, this.renderer, this.cameraX);
    }
    if (this.boss) {
      this.boss.render(this.ctx, this.renderer, this.cameraX);
    }

    WorldRenderer.renderProjectiles(this.ctx, this.renderer, this.projectiles, this.cameraX);
    if (this.player) {
      this.player.render(this.ctx, this.renderer, this.cameraX);
    }
    this.particles.render(this.ctx, this.cameraX);

    if (this.state === 'BOSS_FIGHT' && this.boss) {
      this.boss.renderBossHealthBar(this.ctx, this.width);
    }
    if (this.state === 'PLAYING' || this.state === 'BOSS_FIGHT') {
      if (this.player && this.player.chronosActive) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(18, 34, 88, 0.24)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
        this.ctx.lineWidth = 6;
        this.ctx.strokeRect(3, 3, this.width - 6, this.height - 6);
        this.ctx.restore();
      }
      WorldRenderer.renderGameplayIndicators(this.ctx, this.player, this.combo, this.width);
      WorldRenderer.renderZoneBanner(this.ctx, this.zoneBanner, this.width);
    }
    if (this.state === 'MENTOR_DIALOG') {
      this.dialog.render(this.ctx, this.renderer, this.width, this.height);
    }

    this.ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
