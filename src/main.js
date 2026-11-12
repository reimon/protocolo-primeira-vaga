/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * main.js - Loop Principal, Máquina de Estados e Gestão de Jogo
 */

import { PixelRenderer } from './assets/PixelRenderer.js';
import { SoundEngine } from './audio/SoundEngine.js';
import { ParallaxBackground } from './world/ParallaxBackground.js';
import { ParticleSystem, ScreenShake } from './world/ParticleSystem.js';
import { LoadingScene } from './world/LoadingScene.js';
import { Player } from './entities/Player.js';
import { Mentor } from './entities/Mentor.js';
import { Enemy } from './entities/Enemy.js';
import { Boss } from './entities/Boss.js';
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
    this.settings = { sfx: 85, music: 65, shake: true, crt: true, touch: false };
    this.particles = new ParticleSystem();
    this.leaderboard = new LeaderboardService();
    this.parallax = new ParallaxBackground(this.renderer, this.width, this.height);
    this.loadingScene = new LoadingScene(this.width, this.height, this.sound, this.renderer);

    // Estados do Jogo: 'BOOT', 'LOADING', 'MENU', 'INTRO_CUTSCENE', 'PLAYING', 'MENTOR_DIALOG', 'BOSS_FIGHT', 'VICTORY', 'GAME_OVER', 'LEADERBOARD'
    this.state = 'BOOT';

    // Gestão de Tempo e Hitstop (Freeze Frame)
    this.lastTime = 0;
    this.hitstopTimer = 0;

    // Câmera
    this.cameraX = 0;
    this.levelWidth = 5200;

    // Entidades do Mundo
    this.player = null;
    this.boss = null;
    this.mentors = [];
    this.enemies = [];
    this.platforms = [];
    this.collectibles = [];
    this.projectiles = [];

    // Estatísticas da Partida
    this.stats = {
      score: 0,
      enemiesDefeated: 0,
      maxCombo: 0,
      timeElapsed: 0,
      activeMentorTip: 'Construa portfólio prático e fale com o Mentor da Carreira!'
    };

    // Diálogos RPG do Mentor
    this.activeDialog = null;
    this.dialogTextIndex = 0;
    this.dialogTimer = 0;
    this.typewriterDelay = 0.025;
    this.dialogChoices = null;

    // Input Controller
    this.input = {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
      dashPressed: false,
      attackPressed: false,
      interactPressed: false
    };

    // Letra do Arcade Leaderboard Input
    this.initials = ['D', 'E', 'V'];
    this.initialIndex = 0;

    this.initInputs();
    this.initUI();
    this.boot();
  }

  async boot() {
    console.log('%c🚀 Iniciando PROTOCOLO PRIMEIRA VAGA...', 'color: #00e5ff; font-weight: bold; font-size: 14px;');
    // Executa testes automatizados
    SelfTest.runAll();
    this.state = 'LOADING';
    const menuEl = document.getElementById('startScreen');
    if (menuEl) menuEl.classList.add('hidden');

    // Carrega todos os assets PNG Hi-Bit antes de iniciar a exibição
    await this.renderer.loadAllAssets();
    this.loadingScene.targetProgress = 100;

    requestAnimationFrame((t) => this.loop(t));
  }

  finishLoading() {
    this.sound.playSwordSlash();
    this.state = 'MENU';
    const menuEl = document.getElementById('startScreen');
    if (menuEl) menuEl.classList.remove('hidden');
    this.sound.startBgm('stage');
  }

  openLoadingIntro() {
    this.sound.ensureContext();
    this.loadingScene.progress = 100;
    this.loadingScene.targetProgress = 100;
    this.loadingScene.isComplete = true;
    this.state = 'LOADING';

    const menuEl = document.getElementById('startScreen');
    if (menuEl) menuEl.classList.add('hidden');
    const hudEl = document.getElementById('hud');
    if (hudEl) hudEl.classList.add('hidden');
    const touchEl = document.getElementById('touchControls');
    if (touchEl) touchEl.classList.add('hidden');
  }

  initInputs() {
    const handleKeyDown = (e) => {
      // Ativa áudio no primeiro clique/tecla (requisito de navegadores modernos)
      this.sound.ensureContext();

      if (e.repeat) return;
      const key = e.code;

      // Durante tela de carregamento e abertura épica
      if (this.state === 'LOADING') {
        if (this.loadingScene.isComplete || key === 'Enter' || key === 'Space' || key === 'Escape') {
          this.finishLoading();
        } else {
          // Acelera carregamento com qualquer tecla
          this.loadingScene.targetProgress = 100;
        }
        return;
      }

      // Durante diálogo do Mentor, qualquer tecla de ação ou avanço avança a conversa
      if (this.state === 'MENTOR_DIALOG') {
        if (
          key === 'Enter' ||
          key === 'Space' ||
          key === 'KeyE' ||
          key === 'KeyZ' ||
          key === 'KeyX' ||
          key === 'KeyC' ||
          key === 'KeyJ' ||
          key === 'KeyK'
        ) {
          e.preventDefault();
          this.advanceDialog();
          return;
        }

        // Navegação de opções se houver escolhas
        if (this.activeDialog && this.activeDialog.choices) {
          if (key === 'ArrowUp' || key === 'ArrowLeft' || key === 'KeyW' || key === 'KeyA') {
            this.activeDialog.selectedChoice = 0;
            this.sound.playTypewriterBeep();
          } else if (key === 'ArrowDown' || key === 'ArrowRight' || key === 'KeyS' || key === 'KeyD') {
            this.activeDialog.selectedChoice = 1;
            this.sound.playTypewriterBeep();
          }
        }
        return;
      }

      if (key === 'ArrowLeft' || key === 'KeyA') this.input.left = true;
      if (key === 'ArrowRight' || key === 'KeyD') this.input.right = true;

      if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW' || key === 'KeyZ') {
        this.input.jump = true;
        this.input.jumpPressed = true;
      }
      if (key === 'KeyX' || key === 'KeyJ') {
        this.input.attackPressed = true;
      }
      if (key === 'KeyC' || key === 'KeyK' || key === 'ShiftLeft' || key === 'ShiftRight') {
        this.input.dashPressed = true;
      }
      if (key === 'Enter' || key === 'KeyE') {
        this.input.interactPressed = true;
        this.advanceDialog();
      }
      if (this.state === 'SETTINGS') {
        if (key === 'Escape' || key === 'KeyP') {
          e.preventDefault();
          this.closeSettings();
        }
        return;
      }

      if ((key === 'Escape' || key === 'KeyP') && (this.state === 'PLAYING' || this.state === 'BOSS_FIGHT' || this.state === 'MENU')) {
        e.preventDefault();
        this.openSettings();
        return;
      }

      if (key === 'KeyM') {
        const isMuted = this.sound.toggleMute();
        this.updateMuteButtonUI(isMuted);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.code;
      if (key === 'ArrowLeft' || key === 'KeyA') this.input.left = false;
      if (key === 'ArrowRight' || key === 'KeyD') this.input.right = false;
      if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW' || key === 'KeyZ') this.input.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Permite avançar no carregamento ou diálogo clicando ou tocando em qualquer lugar da tela
    const handleScreenClick = (e) => {
      this.sound.ensureContext();
      if (this.state === 'LOADING') {
        if (this.loadingScene.isComplete) {
          this.finishLoading();
        } else {
          this.loadingScene.targetProgress = 100;
        }
        return;
      }
      if (this.state === 'MENTOR_DIALOG') {
        if (e) e.preventDefault();
        this.advanceDialog();
      }
    };

    window.addEventListener('pointerdown', handleScreenClick);
    window.addEventListener('click', handleScreenClick);
    this.canvas.addEventListener('pointerdown', handleScreenClick);
  }

  initUI() {
    // Controles virtuais na tela para Touch/Mouse
    const bindBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); }, { passive: false });
      if (onUp) {
        el.addEventListener('mouseup', (e) => { e.preventDefault(); onUp(); });
        el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
        el.addEventListener('mouseleave', (e) => { e.preventDefault(); onUp(); });
      }
    };

    bindBtn('btnLeft', () => {
      if (this.state === 'MENTOR_DIALOG' && this.activeDialog?.choices) {
        this.activeDialog.selectedChoice = 0;
        this.sound.playTypewriterBeep();
        return;
      }
      this.input.left = true;
    }, () => { this.input.left = false; });

    bindBtn('btnRight', () => {
      if (this.state === 'MENTOR_DIALOG' && this.activeDialog?.choices) {
        this.activeDialog.selectedChoice = 1;
        this.sound.playTypewriterBeep();
        return;
      }
      this.input.right = true;
    }, () => { this.input.right = false; });

    bindBtn('btnJump', () => {
      if (this.state === 'LOADING') {
        this.finishLoading();
        return;
      }
      if (this.state === 'MENTOR_DIALOG') {
        this.advanceDialog();
        return;
      }
      this.input.jump = true;
      this.input.jumpPressed = true;
    }, () => { this.input.jump = false; });

    bindBtn('btnAttack', () => {
      if (this.state === 'LOADING') {
        this.finishLoading();
        return;
      }
      if (this.state === 'MENTOR_DIALOG') {
        this.advanceDialog();
        return;
      }
      this.input.attackPressed = true;
    });

    bindBtn('btnDash', () => {
      if (this.state === 'LOADING') {
        this.finishLoading();
        return;
      }
      if (this.state === 'MENTOR_DIALOG') {
        this.advanceDialog();
        return;
      }
      this.input.dashPressed = true;
    });

    // Botões de Menu e HUD
    const playBtn = document.getElementById('btnPlayGame');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.sound.ensureContext();
        this.startNewGame();
      });
    }

    const introBtn = document.getElementById('btnIntro');
    if (introBtn) {
      introBtn.addEventListener('click', () => {
        this.openLoadingIntro();
      });
    }

    const toggleTouchBtn = document.getElementById('btnToggleTouch');
    if (toggleTouchBtn) {
      toggleTouchBtn.addEventListener('click', () => {
        this.settings.touch = !this.settings.touch;
        this.applySettings();
        this.saveSettings();
      });
    }

    const muteBtn = document.getElementById('btnMute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.sound.toggleMute();
        this.updateMuteButtonUI(isMuted);
      });
    }

    const lbBtn = document.getElementById('btnLeaderboard');
    if (lbBtn) {
      lbBtn.addEventListener('click', () => {
        this.sound.ensureContext();
        this.openLeaderboard();
      });
    }

    this.initSettingsUI();
  }

  initSettingsUI() {
    try {
      const saved = localStorage.getItem('ppv_settings_v1');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (_) {}
    this.applySettings();

    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    bindClick('btnSettings', () => this.openSettings());
    bindClick('btnHudSettings', () => this.openSettings());
    bindClick('btnSettingsBack', () => this.closeSettings());

    const sliderSfx = document.getElementById('sliderSfx');
    if (sliderSfx) {
      sliderSfx.addEventListener('input', (e) => {
        this.settings.sfx = Number(e.target.value);
        this.sound.setSfxVolume(this.settings.sfx / 100);
        this.saveSettings();
      });
    }

    const sliderMusic = document.getElementById('sliderMusic');
    if (sliderMusic) {
      sliderMusic.addEventListener('input', (e) => {
        this.settings.music = Number(e.target.value);
        this.sound.setBgmVolume(this.settings.music / 100);
        this.saveSettings();
      });
    }

    bindClick('btnToggleShake', () => {
      this.settings.shake = !this.settings.shake;
      this.applySettings();
      this.saveSettings();
    });

    bindClick('btnToggleCrt', () => {
      this.settings.crt = !this.settings.crt;
      this.applySettings();
      this.saveSettings();
    });

    bindClick('btnKeyboardKeys', () => {
      const hint = document.getElementById('keyboardKeysHint');
      if (hint) hint.classList.toggle('hidden');
    });

    bindClick('btnGamepadTouch', () => {
      this.settings.touch = !this.settings.touch;
      this.applySettings();
      this.saveSettings();
    });
  }

  openSettings() {
    if (this.state === 'SETTINGS') return;
    this.sound.ensureContext();
    this.stateBeforeSettings = this.state;
    this.state = 'SETTINGS';
    this.input.left = false;
    this.input.right = false;
    this.input.jump = false;
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('hidden');
    const hint = document.getElementById('keyboardKeysHint');
    if (hint) hint.classList.add('hidden');
    this.state = this.stateBeforeSettings || 'MENU';
    this.stateBeforeSettings = null;
  }

  applySettings() {
    this.sound.setSfxVolume(this.settings.sfx / 100);
    this.sound.setBgmVolume(this.settings.music / 100);
    this.screenShakeEnabled = !!this.settings.shake;

    const crtOverlay = document.querySelector('.crt-scanlines');
    if (crtOverlay) crtOverlay.classList.toggle('hidden', !this.settings.crt);

    document.body.classList.toggle('touch-enabled', !!this.settings.touch);

    const sliderSfx = document.getElementById('sliderSfx');
    if (sliderSfx) sliderSfx.value = String(this.settings.sfx);

    const sliderMusic = document.getElementById('sliderMusic');
    if (sliderMusic) sliderMusic.value = String(this.settings.music);

    const shakeBtn = document.getElementById('btnToggleShake');
    if (shakeBtn) {
      shakeBtn.textContent = this.settings.shake ? 'On' : 'Off';
      shakeBtn.classList.toggle('is-off', !this.settings.shake);
    }

    const crtBtn = document.getElementById('btnToggleCrt');
    if (crtBtn) {
      crtBtn.textContent = this.settings.crt ? 'On' : 'Off';
      crtBtn.classList.toggle('is-off', !this.settings.crt);
    }

    const touchBtn = document.getElementById('btnToggleTouch');
    if (touchBtn) {
      touchBtn.textContent = this.settings.touch ? '🎮 TOUCH: ON' : '🎮 TOUCH: OFF';
    }

    const gpBtn = document.getElementById('btnGamepadTouch');
    if (gpBtn) {
      gpBtn.classList.toggle('is-off', !this.settings.touch);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('ppv_settings_v1', JSON.stringify(this.settings));
    } catch (_) {}
  }

  updateMuteButtonUI(isMuted) {
    const muteBtn = document.getElementById('btnMute');
    if (muteBtn) {
      muteBtn.textContent = isMuted ? '🔇 ÁUDIO: OFF' : '🔊 ÁUDIO: ON';
    }
  }

  startNewGame() {
    this.sound.ensureContext();
    this.stats = {
      score: 0,
      enemiesDefeated: 0,
      maxCombo: 0,
      timeElapsed: 0,
      activeMentorTip: 'Caminhe para a direita e ouça os conselhos do Mentor!'
    };

    // Cria o Protagonista
    this.player = new Player(80, this.height - 220);

    // Constrói o Nível (Plataformas, Inimigos, Mentores e Colecionáveis)
    this.buildLevel();

    this.cameraX = 0;
    this.state = 'PLAYING';
    this.sound.startBgm('stage');

    // Oculta tela de menu
    const menuEl = document.getElementById('startScreen');
    if (menuEl) menuEl.classList.add('hidden');
    const hudEl = document.getElementById('hud');
    if (hudEl) hudEl.classList.remove('hidden');
    const touchEl = document.getElementById('touchControls');
    if (touchEl) touchEl.classList.remove('hidden');
  }

  buildLevel() {
    this.platforms = [];
    this.enemies = [];
    this.mentors = [];
    this.collectibles = [];
    this.projectiles = [];

    const groundY = this.height - 160;

    // --- CHÃO CONTÍNUO (Calçadão de Pedra) ---
    this.platforms.push({ x: 0, y: groundY, width: this.levelWidth, height: 160 });

    // Parede no início
    this.platforms.push({ x: -30, y: 0, width: 30, height: this.height });
    // Parede no fim
    this.platforms.push({ x: this.levelWidth, y: 0, width: 30, height: this.height });

    // --- ZONA 1: A VILA DA PROCRASTINAÇÃO (0 - 1600) ---
    // Plataformas elevadas
    this.platforms.push({ x: 300, y: groundY - 65, width: 120, height: 20 });
    this.platforms.push({ x: 480, y: groundY - 125, width: 140, height: 20 });
    this.platforms.push({ x: 700, y: groundY - 75, width: 160, height: 20 });
    this.platforms.push({ x: 1000, y: groundY - 80, width: 140, height: 20 });

    // Itens Zona 1
    this.collectibles.push({ type: 'coffee', x: 340, y: groundY - 100, width: 24, height: 24 });
    this.collectibles.push({ type: 'book', x: 540, y: groundY - 160, width: 24, height: 24 });
    this.collectibles.push({ type: 'coffee', x: 1050, y: groundY - 120, width: 24, height: 24 });

    // Inimigos Zona 1 (Bugs Rastejantes)
    this.enemies.push(new Enemy('bug', 450, groundY - 30));
    this.enemies.push(new Enemy('bug', 850, groundY - 30));
    this.enemies.push(new Enemy('bug', 1200, groundY - 30));

    // Mentor 1 (Apresentação e Escolha de Rumo de Aprendizado)
    this.mentors.push(new Mentor(600, groundY - 56, 'mentor_1', {
      lines: [
        "Bem-vindo, jovem aprendiz! Vejo a centelha do código em seus olhos.",
        "A jornada até sua primeira vaga é cheia de armadilhas como a Procrastinação e o Medo.",
        "Para avançar, você deve escolher onde focar sua energia inicial:"
      ],
      choices: [
        { label: "1. Focar em Fundamentos e Lógica (+20% Defesa)", buff: "defense" },
        { label: "2. Construir Projetos Práticos (+20% Ataque)", buff: "attack" }
      ]
    }));

    // --- ZONA 2: FLORESTA DOS TUTORIAIS INFINITOS (1600 - 3400) ---
    this.platforms.push({ x: 1750, y: groundY - 80, width: 140, height: 20 });
    this.platforms.push({ x: 1980, y: groundY - 140, width: 140, height: 20 });
    this.platforms.push({ x: 2200, y: groundY - 85, width: 180, height: 20 });
    this.platforms.push({ x: 2550, y: groundY - 130, width: 150, height: 20 });
    this.platforms.push({ x: 2850, y: groundY - 70, width: 160, height: 20 });

    // Inimigos Zona 2 (Fantasmas de Síndrome do Impostor & Golems de 5 Anos de Experiência)
    this.enemies.push(new Enemy('ghost', 1800, 280));
    this.enemies.push(new Enemy('golem', 2250, groundY - 50));
    this.enemies.push(new Enemy('ghost', 2600, 260));
    this.enemies.push(new Enemy('golem', 3000, groundY - 50));

    // Itens Zona 2
    this.collectibles.push({ type: 'book', x: 2030, y: groundY - 175, width: 24, height: 24 });
    this.collectibles.push({ type: 'coffee', x: 2600, y: groundY - 165, width: 24, height: 24 });
    this.collectibles.push({ type: 'book', x: 3100, y: groundY - 50, width: 24, height: 24 });

    // Mentor 2 (Bênção do Pulo Duplo e Revelação da Fraqueza do Golem)
    this.mentors.push(new Mentor(2400, groundY - 56, 'mentor_2', {
      lines: [
        "Impressionante! Você superou o ciclo dos tutoriais sem fim!",
        "Atenção aos Golems de '5 Anos de Experiência': o escudo frontal deles é pura intimidação!",
        "Use o seu DASH (tecla C ou Shift) para passar pelas costas deles e atacar o ponto cego!",
        "Tome esta bênção mística: o lendário PULO DUPLO!"
      ],
      grantDoubleJump: true
    }));

    // --- ZONA 3: A CIDADELA CORPORATIVA & ARENA DO RH (3400 - 5200) ---
    this.platforms.push({ x: 3600, y: groundY - 90, width: 160, height: 20 });
    this.platforms.push({ x: 3880, y: groundY - 140, width: 160, height: 20 });
    this.platforms.push({ x: 4180, y: groundY - 75, width: 180, height: 20 });

    // Drones de Ghosting
    this.enemies.push(new Enemy('drone', 3700, 240));
    this.enemies.push(new Enemy('drone', 4000, 240));
    this.enemies.push(new Enemy('golem', 3950, groundY - 50));

    // Itens Zona 3
    this.collectibles.push({ type: 'coffee', x: 3650, y: groundY - 130, width: 24, height: 24 });
    this.collectibles.push({ type: 'book', x: 4230, y: groundY - 110, width: 24, height: 24 });

    // Arena do Chefe Final (X = 4600)
    this.boss = new Boss(4750, groundY - 130);
  }

  // --- GAME LOOP COM DELTA TIME E HITSTOP ---
  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Clamp para evitar teleporte em quedas de framerate
    if (dt > 0.1) dt = 0.1;
    this.lastDt = dt;

    // Hitstop (Freeze Frame ao acertar golpes)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      // Atualiza apenas tela e partículas estáticas durante freeze
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
    this.input.attackPressed = false;
    this.input.interactPressed = false;
  }

  // --- UPDATE PRINCIPAL ---
  update(dt) {
    if (this.state === 'LOADING') {
      this.loadingScene.update(dt);
      return;
    }

    this.screenShake.update(dt);
    this.particles.update(dt);

    if (this.state === 'MENU') {
      // Modo demonstração animado no fundo
      this.cameraX += 80 * dt;
      return;
    }

    if (this.state === 'MENTOR_DIALOG') {
      this.updateMentorDialog(dt);
      return;
    }

    if (this.state === 'PLAYING' || this.state === 'BOSS_FIGHT') {
      this.stats.timeElapsed += dt;

      // Atualiza Player
      this.player.update(dt, this.input, this.platforms, this.sound, this.particles);

      // Morte do Jogador
      if (this.player.hp <= 0) {
        this.triggerGameOver();
        return;
      }

      // Atualiza Câmera Suave (Deadzone)
      const targetCamX = this.player.x - this.width * 0.35;
      this.cameraX += (targetCamX - this.cameraX) * 0.12;
      this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelWidth - this.width));

      // Combate: Ataque do Player contra Inimigos
      if (this.player.attackHitbox) {
        this.checkPlayerAttackCollisions();
      }

      // Atualiza Mentores
      for (const mentor of this.mentors) {
        mentor.update(dt, this.player, this.particles, this.sound, (m) => this.openMentorDialog(m));
      }

      // Atualiza Inimigos
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        e.update(dt, this.player, this.platforms, this.projectiles, this.sound, this.particles);
        if (e.isDead) {
          this.stats.enemiesDefeated++;
          this.stats.score += e.scoreValue;
          this.player.addXp(e.xpValue, this.sound);
          this.enemies.splice(i, 1);
        }
      }

      // Atualiza Colecionáveis
      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const col = this.collectibles[i];
        if (this.player.checkAABB(this.player, col)) {
          this.sound.playItemCollect();
          if (col.type === 'coffee') {
            this.player.heal(30);
            this.particles.createDamageNumber(col.x, col.y - 10, '+30 CONFIANÇA', '#00e676');
          } else if (col.type === 'book') {
            this.player.addXp(60, this.sound);
            this.particles.createDamageNumber(col.x, col.y - 10, '+60 XP SKILLS', '#00e5ff');
          } else if (col.type === 'offer') {
            // Vitória final!
            this.triggerVictory();
            return;
          }
          this.collectibles.splice(i, 1);
        }
      }

      // Atualiza Projéteis
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        // Colisão com o Player
        if (p.isEnemy && this.player.checkAABB(this.player, p)) {
          const dmg = this.player.takeDamage(p.damage, this.sound, this.screenShake);
          if (dmg > 0) {
            this.particles.createDamageNumber(this.player.x, this.player.y - 10, dmg, '#ff1744');
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        if (p.life <= 0) {
          this.projectiles.splice(i, 1);
        }
      }

      // Gatilho de Batalha do Boss
      if (this.state === 'PLAYING' && this.player.x > 4400) {
        this.state = 'BOSS_FIGHT';
        this.sound.startBgm('boss');
        this.stats.activeMentorTip = 'DERROTE O ATS-9000! Quebre as barreiras algorítmicas!';
      }

      // Atualiza Boss ATS-9000
      if (this.state === 'BOSS_FIGHT' && this.boss) {
        this.boss.update(
          dt,
          this.player,
          this.platforms,
          this.projectiles,
          this.enemies,
          this.sound,
          this.particles,
          this.screenShake,
          () => this.triggerBossMentorIntervention()
        );

        // Se o Boss foi derrotado
        if (this.boss.isDead && !this.collectibles.some(c => c.type === 'offer')) {
          // Dropa a Carta de Oferta Dourada
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

      this.updateHUD();
    }
  }

  // --- COLISÕES DE COMBATE E HITSTOP ---
  checkPlayerAttackCollisions() {
    const atk = this.player.attackHitbox;

    // Acerta Inimigos comuns
    for (const e of this.enemies) {
      if (!this.player.enemiesHitThisAttack.has(e) && this.player.checkAABB(atk, e)) {
        this.player.enemiesHitThisAttack.add(e);
        const dealt = e.takeDamage(atk.damage, this.player.facing, this.particles, this.sound);
        if (dealt > 0) {
          // Aciona Hitstop (45ms) e tremor leve
          this.hitstopTimer = 0.045;
          this.screenShake.trigger(4, 0.15);
          this.stats.score += 50 * atk.step;
          this.stats.maxCombo = Math.max(this.stats.maxCombo, atk.step);
        }
      }
    }

    // Acerta Boss ATS-9000
    if (this.state === 'BOSS_FIGHT' && this.boss && !this.boss.isDead) {
      if (!this.player.enemiesHitThisAttack.has(this.boss) && this.player.checkAABB(atk, this.boss)) {
        this.player.enemiesHitThisAttack.add(this.boss);
        const isGold = this.player.armorTier === 'gold';
        const dealt = this.boss.takeDamage(atk.damage, isGold, this.particles, this.sound, this.screenShake);
        if (dealt > 0) {
          this.hitstopTimer = 0.06;
          this.screenShake.trigger(7, 0.2);
          this.stats.score += 120 * atk.step;
        }
      }
    }
  }

  // --- DIÁLOGOS RPG DO MENTOR ---
  openMentorDialog(mentor) {
    this.state = 'MENTOR_DIALOG';
    this.activeMentorInstance = mentor;
    this.activeDialog = {
      lines: mentor.data.lines,
      currentLineIndex: 0,
      displayedChars: 0,
      charTimer: 0,
      choices: mentor.data.choices || null,
      selectedChoice: 0,
      grantDoubleJump: mentor.data.grantDoubleJump || false
    };
    this.sound.playMentorTeleport();

    // Oculta completamente controles de ação da tela para nunca sobrepor o diálogo
    const touchEl = document.getElementById('touchControls');
    if (touchEl) touchEl.classList.add('hidden');
  }

  updateMentorDialog(dt) {
    if (!this.activeDialog) return;

    const currentLine = this.activeDialog.lines[this.activeDialog.currentLineIndex];
    if (this.activeDialog.displayedChars < currentLine.length) {
      this.activeDialog.charTimer += dt;
      if (this.activeDialog.charTimer >= this.typewriterDelay) {
        this.activeDialog.charTimer = 0;
        this.activeDialog.displayedChars++;
        if (this.activeDialog.displayedChars % 3 === 0) {
          this.sound.playTypewriterBeep();
        }
      }
    }

    // Navega escolhas se houver
    if (this.activeDialog.choices && this.activeDialog.displayedChars >= currentLine.length) {
      if (this.input.jumpPressed || this.input.left) {
        this.activeDialog.selectedChoice = 0;
      }
      if (this.input.dashPressed || this.input.right) {
        this.activeDialog.selectedChoice = 1;
      }
    }
  }

  advanceDialog() {
    try {
      if (this.state === 'MENTOR_DIALOG' && this.activeDialog) {
        const currentLine = this.activeDialog.lines[this.activeDialog.currentLineIndex];

        // Se o texto ainda está sendo digitado, completa a linha imediatamente
        if (this.activeDialog.displayedChars < currentLine.length) {
          this.activeDialog.displayedChars = currentLine.length;
          this.sound.playTypewriterBeep();
          return;
        }

        // Se ainda há mais linhas de diálogo, avança para a próxima
        if (this.activeDialog.currentLineIndex < this.activeDialog.lines.length - 1) {
          this.activeDialog.currentLineIndex++;
          this.activeDialog.displayedChars = 0;
          this.activeDialog.charTimer = 0;
          this.sound.playTypewriterBeep();
          return;
        }

        // Fim do diálogo: aplica escolhas e bênçãos
        if (this.activeDialog.choices) {
          const choice = this.activeDialog.choices[this.activeDialog.selectedChoice];
          if (choice && choice.buff === 'defense') {
            this.player.bonusDefense += 6;
            this.stats.activeMentorTip = 'Buff Ativo: Fundamentos Sólidos (+Defesa)';
          } else if (choice && choice.buff === 'attack') {
            this.player.bonusDamage += 10;
            this.stats.activeMentorTip = 'Buff Ativo: Portfólio Prático (+Ataque)';
          }
          this.sound.playLevelUp();
        }

        if (this.activeDialog.grantDoubleJump) {
          this.player.hasDoubleJump = true;
          this.stats.activeMentorTip = 'Habilidade Adquirida: Pulo Duplo Desbloqueado!';
          this.sound.playLevelUp();
        }

        // O Mentor se despede em partículas ou executa callback (ex: transformação de boss)
        if (this.activeMentorInstance && typeof this.activeMentorInstance.vanish === 'function') {
          this.activeMentorInstance.vanish(this.particles, this.sound);
        }

        this.activeDialog = null;

        // Restaura controles touch apenas se habilitado
        if (this.touchEnabled) {
          const touchEl = document.getElementById('touchControls');
          if (touchEl) touchEl.classList.remove('hidden');
        }

        // Se estiver enfrentando o Boss ATS-9000, retoma BOSS_FIGHT
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
      } else if (this.state === 'VICTORY' || this.state === 'GAME_OVER') {
        // Registra no Placar
        this.saveArcadeInitials();
      }
    } catch (err) {
      console.error('Erro ao avançar diálogo:', err);
      this.activeDialog = null;
      this.state = (this.boss && !this.boss.isDead) ? 'BOSS_FIGHT' : 'PLAYING';
    }
  }

  handleEnterKey() {
    this.advanceDialog();
  }

  // Intervenção do Mentor no meio da luta do Boss
  triggerBossMentorIntervention() {
    this.openMentorDialog({
      data: {
        lines: [
          "ATENÇÃO, JOVEM! O ATS-9000 entrou em modo defensivo sobrecarregado!",
          "Filtros automáticos não resistem a projetos reais que geram valor de verdade!",
          "Receba o buff definitivo: O PORTFÓLIO LENDÁRIO!",
          "Quando o núcleo dele abrir após o ataque, desfira seu golpe com a ESPADA DOURADA!"
        ]
      },
      vanish: (part, snd) => {
        // Converte o Player para armadura/espada dourada e dá crítico
        this.player.armorTier = 'gold';
        this.player.bonusDamage += 25;
        this.player.heal(50);
        snd.playLevelUp();
        part.createExplosion(this.player.x, this.player.y);
      }
    });
  }

  // --- HUD E UI OVERLAY ---
  updateHUD() {
    const hpBar = document.getElementById('hpFill');
    const xpBar = document.getElementById('xpFill');
    const scoreVal = document.getElementById('hudScore');
    const tipText = document.getElementById('hudTip');

    if (hpBar) {
      const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
      hpBar.style.width = `${hpPct}%`;
    }
    if (xpBar) {
      const xpPct = Math.max(0, (this.player.xp / this.player.nextXp) * 100);
      xpBar.style.width = `${xpPct}%`;
    }
    if (scoreVal) {
      scoreVal.textContent = String(this.stats.score).padStart(6, '0');
    }
    if (tipText) {
      tipText.textContent = this.stats.activeMentorTip;
    }
  }

  triggerVictory() {
    this.state = 'VICTORY';
    this.sound.playVictory();

    const finalScore = this.leaderboard.calculateFinalScore({
      enemiesDefeated: this.stats.enemiesDefeated,
      timeSeconds: this.stats.timeElapsed,
      maxCombo: this.stats.maxCombo,
      remainingHp: this.player.hp,
      bossDefeated: true
    });
    this.stats.score = finalScore;

    const overlay = document.getElementById('gameOverlay');
    if (overlay) {
      overlay.innerHTML = `
        <div class="pixel-modal victory-modal">
          <h1 class="glow-gold">CONTRATADO!</h1>
          <h2>PRIMEIRA VAGA CONQUISTADA COM SUCESSO!</h2>
          <p class="flavor-text">Você superou a Procrastinação, os Tutoriais Infinitos e o Guardião do RH.</p>
          <div class="score-summary">
            <div>Pontuação Final: <span class="score-highlight">${finalScore}</span></div>
            <div>Inimigos Superados: ${this.stats.enemiesDefeated}</div>
            <div>Tempo: ${Math.floor(this.stats.timeElapsed)}s</div>
          </div>
          <div class="initials-entry">
            <p>DIGITE SEU NOME / INICIAIS:</p>
            <input type="text" id="playerInitials" maxlength="8" value="DEV" autofocus />
            <button id="btnSaveScore" class="btn-arcade">REGISTRAR NO PLACAR</button>
          </div>
        </div>
      `;
      overlay.classList.remove('hidden');

      document.getElementById('btnSaveScore').addEventListener('click', () => {
        this.saveArcadeInitials();
      });
    }
  }

  triggerGameOver() {
    this.state = 'GAME_OVER';
    this.sound.playGameOver();

    const overlay = document.getElementById('gameOverlay');
    if (overlay) {
      overlay.innerHTML = `
        <div class="pixel-modal gameover-modal">
          <h1 class="glow-red">BARRA DE CONFIANÇA ESGOTADA</h1>
          <p class="flavor-text">Todo desenvolvedor experiente já enfrentou dezenas de "nãos".</p>
          <p class="flavor-text">Aprenda com cada feedback, revise seus fundamentos e tente novamente!</p>
          <div class="score-summary">
            <div>Pontuação Conquistada: ${this.stats.score}</div>
          </div>
          <button id="btnRetry" class="btn-arcade">TENTAR NOVAMENTE</button>
        </div>
      `;
      overlay.classList.remove('hidden');

      document.getElementById('btnRetry').addEventListener('click', () => {
        overlay.classList.add('hidden');
        this.startNewGame();
      });
    }
  }

  async saveArcadeInitials() {
    const input = document.getElementById('playerInitials');
    const name = input ? input.value : 'DEV';
    await this.leaderboard.saveScore(name, this.stats.score, 'Contratado Jr!');
    this.openLeaderboard();
  }

  async openLeaderboard() {
    this.state = 'LEADERBOARD';
    const scores = await this.leaderboard.getScores();

    const overlay = document.getElementById('gameOverlay');
    if (overlay) {
      let rows = scores.map((s, idx) => `
        <tr class="${idx === 0 ? 'top-rank' : ''}">
          <td>#${idx + 1}</td>
          <td>${s.name}</td>
          <td>${s.role}</td>
          <td class="score-col">${s.score}</td>
        </tr>
      `).join('');

      overlay.innerHTML = `
        <div class="pixel-modal leaderboard-modal">
          <h1 class="glow-cyan">HALL DA FAMA DOS CONTRATADOS</h1>
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>POS</th>
                <th>DEV</th>
                <th>CARGO CONQUISTADO</th>
                <th>PONTOS</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <button id="btnCloseLeaderboard" class="btn-arcade">VOLTAR AO MENU</button>
        </div>
      `;
      overlay.classList.remove('hidden');

      document.getElementById('btnCloseLeaderboard').addEventListener('click', () => {
        overlay.classList.add('hidden');
        this.state = 'MENU';
        const menuEl = document.getElementById('startScreen');
        if (menuEl) menuEl.classList.remove('hidden');
      });
    }
  }

  // --- RENDERIZAÇÃO COMPLETA (PIXEL PERFECT) ---
  render() {
    if (this.state === 'LOADING') {
      this.loadingScene.render(this.ctx);
      return;
    }

    this.ctx.save();

    // Aplica Screen Shake
    const shake = this.screenShake.getOffset();
    this.ctx.translate(shake.x, shake.y);

    // 1. Fundo Parallax (Camadas + Mundo Vivo)
    this.parallax.render(this.ctx, this.cameraX, this.lastDt || 0.016);

    // 2. Plataformas do Calçadão
    this.renderPlatforms();

    // 3. Colecionáveis (Café, Livro, Oferta Dourada)
    this.renderCollectibles();

    // 4. Mentores Místicos
    for (const mentor of this.mentors) {
      mentor.render(this.ctx, this.renderer, this.cameraX);
    }

    // 5. Inimigos
    for (const enemy of this.enemies) {
      enemy.render(this.ctx, this.renderer, this.cameraX);
    }

    // 6. Chefe ATS-9000
    if (this.boss) {
      this.boss.render(this.ctx, this.renderer, this.cameraX);
    }

    // 7. Projéteis
    this.renderProjectiles();

    // 8. Protagonista
    if (this.player) {
      this.player.render(this.ctx, this.renderer, this.cameraX);
    }

    // 9. Partículas, Efeitos e Dano Flutuante
    this.particles.render(this.ctx, this.cameraX);

    // 10. Barra de Vida do Boss (se na arena)
    if (this.state === 'BOSS_FIGHT' && this.boss) {
      this.boss.renderBossHealthBar(this.ctx, this.width);
    }

    // 11. Caixa de Diálogo RPG do Mentor
    if (this.state === 'MENTOR_DIALOG') {
      this.renderMentorDialogBox();
    }

    this.ctx.restore();
  }

  renderPlatforms() {
    const tileStone = this.renderer.get('tile_stone');
    const tilePlat = this.renderer.get('tile_platform');

    for (const p of this.platforms) {
      // Ignora paredes invisíveis dos extremos
      if (p.width <= 30) continue;

      if (p.y >= this.height - 160) {
        // Calçadão principal (já desenhado pelo PNG Hi-Bit, se disponível)
        if (this.renderer.ext('fg_promenade')) continue;
        // Calçadão principal
        if (tileStone) {
          for (let x = p.x; x < p.x + p.width; x += 32) {
            this.ctx.drawImage(tileStone, x - this.cameraX, p.y);
          }
        }
      } else {
        // Plataformas flutuantes de circuito
        if (tilePlat) {
          for (let x = p.x; x < p.x + p.width; x += 64) {
            this.ctx.drawImage(tilePlat, x - this.cameraX, p.y);
          }
        } else {
          this.ctx.fillStyle = '#00e5ff';
          this.ctx.fillRect(p.x - this.cameraX, p.y, p.width, p.height);
        }
      }
    }
  }

  renderCollectibles() {
    for (const c of this.collectibles) {
      let spriteKey = 'item_coffee';
      if (c.type === 'book') spriteKey = 'item_book';
      if (c.type === 'offer') spriteKey = 'item_offer';

      const sprite = this.renderer.get(spriteKey);
      if (sprite) {
        // Leve flutuação senoidal
        const floatY = c.y + Math.sin(Date.now() * 0.005 + c.x) * 4;
        this.ctx.drawImage(sprite, c.x - this.cameraX, floatY);
      }
    }
  }

  renderProjectiles() {
    for (const p of this.projectiles) {
      let spriteKey = 'proj_filter';
      if (p.type === 'ghosting') spriteKey = 'proj_ghosting';
      if (p.type === 'shockwave') spriteKey = 'proj_shockwave';

      const sprite = this.renderer.get(spriteKey);
      if (sprite) {
        this.ctx.drawImage(sprite, p.x - this.cameraX, p.y);
      } else {
        this.ctx.fillStyle = '#ff1744';
        this.ctx.fillRect(p.x - this.cameraX, p.y, p.width, p.height);
      }
    }
  }

  renderMentorDialogBox() {
    if (!this.activeDialog) return;

    // Posicionamento elevado para NUNCA ser coberto pelos botões virtuais de touch
    const boxW = Math.min(1060, this.width - 120);
    const boxX = (this.width - boxW) / 2;
    const boxY = this.height - 310;
    const boxH = 190;

    // Fundo da Caixa de Diálogo estilizada em degradê escuro
    this.ctx.fillStyle = 'rgba(8, 10, 22, 0.96)';
    this.ctx.fillRect(boxX, boxY, boxW, boxH);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Retrato do Mentor
    const portrait = this.renderer.ext('mentor_portrait') || this.renderer.get('portrait_mentor');
    if (portrait) {
      this.ctx.drawImage(portrait, boxX + 16, boxY + 20, 76, 76);
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(boxX + 16, boxY + 20, 76, 76);
    }

    // Nome do Personagem
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 15px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('MESTRE DOS MAGOS DA CARREIRA', boxX + 108, boxY + 36);

    // Texto Datilografado com suporte a múltiplas linhas se necessário
    const currentLine = this.activeDialog.lines[this.activeDialog.currentLineIndex];
    const textToShow = currentLine.slice(0, this.activeDialog.displayedChars);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px monospace';

    // Quebra automática de linha a cada ~58 caracteres
    const maxCharsPerLine = 58;
    if (textToShow.length > maxCharsPerLine) {
      const line1 = textToShow.slice(0, maxCharsPerLine);
      const line2 = textToShow.slice(maxCharsPerLine);
      this.ctx.fillText(line1, boxX + 108, boxY + 68);
      this.ctx.fillText(line2, boxX + 108, boxY + 92);
    } else {
      this.ctx.fillText(textToShow, boxX + 108, boxY + 68);
    }

    // Opções de Escolha (se houver na linha final)
    if (this.activeDialog.choices && this.activeDialog.displayedChars >= currentLine.length) {
      this.activeDialog.choices.forEach((choice, idx) => {
        const isSelected = this.activeDialog.selectedChoice === idx;
        const cy = boxY + 115 + idx * 26;
        this.ctx.fillStyle = isSelected ? '#00e5ff' : '#90a4ae';
        this.ctx.font = isSelected ? 'bold 14px monospace' : '13px monospace';
        const prefix = isSelected ? '▶ ' : '  ';
        this.ctx.fillText(`${prefix}${choice.label}`, boxX + 108, cy);
      });
    }

    // Indicador Pulsante de Avançar
    const pulse = Math.floor(Date.now() / 350) % 2 === 0;
    this.ctx.fillStyle = pulse ? '#ffd700' : '#ffffff';
    this.ctx.font = 'bold 11px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('[TOQUE NA TELA / QUALQUER BOTÃO / ESPAÇO PARA AVANÇAR ▶]', boxX + boxW - 16, boxY + boxH - 14);
  }
}

// Inicialização automática quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
