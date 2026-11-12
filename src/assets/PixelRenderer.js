/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * PixelRenderer.js - Motor Hi-Bit 16-Bit com AssetLoader Híbrido
 * Padrão Mustache Protocol / Metal Slug: contornos escuros (#141013),
 * sombreamento de 4 tons e alta densidade de detalhes.
 */

export class PixelRenderer {
  constructor() {
    this.cache = new Map();
    this.externalSprites = new Map();
    this.initPalette();
    this.generateAllHiBitSprites();
  }

  initPalette() {
    this.palette = {
      transparent: 'rgba(0,0,0,0)',
      outline: '#141013',
      outlineSoft: '#2a1e27',

      // Armadura Dourada Hi-Bit (4 Níveis de Sombreamento)
      goldShadow: '#5c310d',
      goldBase: '#b8731f',
      goldLight: '#f1a938',
      goldShine: '#fff1b0',

      // Armadura Prata / Aço
      steelShadow: '#37474f',
      steelBase: '#607d8b',
      steelLight: '#b0bec5',
      steelShine: '#eceff1',

      // Herói - Detalhes
      skinShadow: '#b87247',
      skinBase: '#e8a87c',
      skinLight: '#ffd6b8',
      hairDark: '#12161a',
      hairBase: '#212f3d',
      hairShine: '#34495e',
      rubyAccent: '#c0392b',
      rubyBright: '#e74c3c',

      // Espada de Lógica / Código
      bladeGlow: '#00e5ff',
      bladeCore: '#ffffff',
      bladeEnergy: '#ff0055',

      // Mentor (Mestre dos Magos)
      mentorRobeShadow: '#5c0909',
      mentorRobeBase: '#991515',
      mentorRobeLight: '#d32f2f',
      mentorGoldTrim: '#ffd700',
      mentorBeardShadow: '#90a4ae',
      mentorBeardBase: '#cfd8dc',
      mentorBeardShine: '#ffffff',
      mentorOrb: '#00ffff',

      // Inimigos Hi-Bit
      bugDark: '#0e4a1a',
      bugBase: '#1b8a34',
      bugLight: '#00e676',
      bugLaser: '#ff1744',

      ghostDark: '#38006b',
      ghostBase: '#7b1fa2',
      ghostLight: '#ba68c8',
      ghostCyan: '#18ffff',

      golemDark: '#263238',
      golemBase: '#455a64',
      golemLight: '#78909c',
      golemRune: '#ff9800',

      // Boss ATS-9000
      mechDark: '#171a1d',
      mechBase: '#2c3338',
      mechLight: '#47535b',
      mechRed: '#d50000',
      mechCore: '#ffd600'
    };
  }

  // Carregamento de imagens PNG externas com Promise.all
  async loadAllAssets() {
    const list = [
      { key: 'intro_career', path: 'assets/sprites/intro_career_loading.png' },
      { key: 'hero', path: 'assets/sprites/hero_frames.png' },
      { key: 'mentor_portrait', path: 'assets/sprites/mentor_portrait.png' },
      { key: 'boss', path: 'assets/sprites/boss_ats_trim.png' },
      { key: 'bg_buildings', path: 'assets/sprites/bg_buildings.png' },
      { key: 'fg_promenade', path: 'assets/sprites/fg_promenade_strip.png' }
    ];

    await Promise.all(list.map(item => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.externalSprites.set(item.key, img);
        console.log(`%c✔ Asset externo carregado: ${item.path}`, 'color: #00e676;');
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Asset ${item.path} falhou ao carregar`);
        resolve(null);
      };
      img.src = item.path;
    })));
  }

  ext(key) {
    return this.externalSprites.get(key) || null;
  }

  createCanvas(width, height) {
    if (typeof document === 'undefined') {
      return {
        canvas: { width, height },
        ctx: {
          fillRect: () => {},
          strokeRect: () => {},
          drawImage: () => {},
          fillText: () => {},
          save: () => {},
          restore: () => {},
          beginPath: () => {},
          closePath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          arc: () => {},
          fill: () => {},
          stroke: () => {},
          scale: () => {},
          translate: () => {},
          createRadialGradient: () => ({ addColorStop: () => {} }),
          createLinearGradient: () => ({ addColorStop: () => {} })
        }
      };
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  get(name) {
    return this.cache.get(name);
  }

  set(name, canvas) {
    this.cache.set(name, canvas);
  }

  generateAllHiBitSprites() {
    this.generateHiBitPlayer();
    this.generateHiBitMentor();
    this.generateHiBitEnemies();
    this.generateHiBitBoss();
    this.generateHiBitTiles();
    this.generateHiBitItems();
    this.generateHiBitProjectiles();
    this.generateHiBitPortraits();
  }

  // =========================================================================
  // 1. O PROTAGONISTA: GUERREIRO CHIBI HI-BIT (Padrão Mustache Protocol)
  // =========================================================================
  generateHiBitPlayer() {
    const states = ['idle', 'run1', 'run2', 'run3', 'jump', 'fall', 'attack1', 'attack2', 'attack3', 'dash', 'hurt'];
    const tiers = ['base', 'gold'];

    tiers.forEach(tier => {
      states.forEach(state => {
        const { canvas, ctx } = this.createCanvas(56, 56);
        this.drawHiBitHeroFrame(ctx, state, tier);
        this.set(`player_${tier}_${state}`, canvas);
      });
    });
  }

  drawHiBitHeroFrame(ctx, state, tier) {
    const isGold = tier === 'gold';
    const P = this.palette;

    let ox = 18;
    let oy = 14;
    let legCycle = 0;
    let swordPos = { x: ox + 18, y: oy + 12, angle: 0, isThrust: false };

    if (state === 'run1') { legCycle = 1; oy -= 1; }
    else if (state === 'run2') { legCycle = -1; oy += 1; }
    else if (state === 'run3') { legCycle = 0; }
    else if (state === 'jump') { oy -= 3; legCycle = -1; }
    else if (state === 'fall') { oy += 2; legCycle = 1; }
    else if (state === 'dash') {
      ox += 4;
      // Linhas de velocidade Hi-Bit
      ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.fillRect(ox - 14, oy + 10, 10, 18);
      ctx.fillRect(ox - 22, oy + 14, 12, 10);
    } else if (state === 'attack1') {
      swordPos = { x: ox + 18, y: oy + 10, angle: 90, isThrust: true };
    } else if (state === 'attack2') {
      swordPos = { x: ox + 22, y: oy + 6, angle: 75, isThrust: true };
    } else if (state === 'attack3') {
      swordPos = { x: ox + 16, y: oy - 6, angle: 45, isThrust: true };
    } else if (state === 'hurt') {
      ox -= 3;
    }

    // 1. CAPA ESCARLATE (Atrás do tronco)
    const capeCol = isGold ? '#b71c1c' : '#0d47a1';
    const capeLight = isGold ? '#e53935' : '#1976d2';
    ctx.fillStyle = P.outline;
    ctx.fillRect(ox - 6, oy + 12, 8, 22);
    ctx.fillStyle = capeCol;
    ctx.fillRect(ox - 5, oy + 13, 6, 20);
    ctx.fillStyle = capeLight;
    ctx.fillRect(ox - 5, oy + 13, 2, 18);

    // 2. PERNAS E BOTAS BLINDADAS (4 Tons)
    const legL = legCycle === 1 ? -4 : (legCycle === -1 ? 4 : 0);
    const legR = legCycle === 1 ? 4 : (legCycle === -1 ? -4 : 0);

    // Perna Esquerda
    this.drawHiBitBoot(ctx, ox + 2 + legL, oy + 26, isGold);
    // Perna Direita
    this.drawHiBitBoot(ctx, ox + 12 + legR, oy + 26, isGold);

    // 3. PEITORAL E ARMADURA DOURADA COM SOMBREAMENTO MUSCULAR
    const gShadow = isGold ? '#6e3b14' : P.steelShadow;
    const gBase = isGold ? '#c97b27' : P.steelBase;
    const gLight = isGold ? '#f2b63d' : P.steelLight;
    const gShine = isGold ? '#fff3b0' : P.steelShine;

    // Contorno do tronco
    ctx.fillStyle = P.outline;
    ctx.fillRect(ox + 2, oy + 13, 16, 15);

    // Base da placa peitoral
    ctx.fillStyle = gBase;
    ctx.fillRect(ox + 3, oy + 14, 14, 13);

    // Sombreamento muscular dos gomilhões peitorais
    ctx.fillStyle = gLight;
    ctx.fillRect(ox + 4, oy + 15, 5, 5); // Peitoral E
    ctx.fillRect(ox + 11, oy + 15, 5, 5); // Peitoral D
    ctx.fillStyle = gShine;
    ctx.fillRect(ox + 5, oy + 15, 2, 2);
    ctx.fillRect(ox + 12, oy + 15, 2, 2);

    // Sombra inferior do abdômen
    ctx.fillStyle = gShadow;
    ctx.fillRect(ox + 4, oy + 23, 12, 3);
    // Detalhe carmesim no cinto
    ctx.fillStyle = P.rubyAccent;
    ctx.fillRect(ox + 3, oy + 22, 14, 2);
    ctx.fillStyle = gLight;
    ctx.fillRect(ox + 8, oy + 21, 4, 4); // Fivela de ouro

    // 4. OMBREIRAS ESFÉRICAS BLINDADAS
    // Ombreira Esquerda
    this.drawHiBitPauldron(ctx, ox - 2, oy + 12, isGold);
    // Ombreira Direita
    this.drawHiBitPauldron(ctx, ox + 14, oy + 12, isGold);

    // 5. CABEÇA CHIBI EXPRESSIVA (Cabelo volumoso, bigode e olhos de foco)
    // Contorno da Cabeça
    ctx.fillStyle = P.outline;
    ctx.fillRect(ox + 1, oy - 2, 18, 16);

    // Cabelo Escuro com Topete e Mechas Brilhantes
    ctx.fillStyle = P.hairDark;
    ctx.fillRect(ox + 1, oy - 3, 18, 7);
    ctx.fillRect(ox - 1, oy - 1, 4, 8); // Lateral
    ctx.fillStyle = P.hairBase;
    ctx.fillRect(ox + 4, oy - 4, 12, 4); // Topete
    ctx.fillStyle = P.hairShine;
    ctx.fillRect(ox + 6, oy - 4, 8, 2); // Mecha de luz

    // Rosto e Pele
    ctx.fillStyle = P.skinBase;
    ctx.fillRect(ox + 3, oy + 4, 14, 9);
    ctx.fillStyle = P.skinLight;
    ctx.fillRect(ox + 5, oy + 4, 10, 5); // Bochechas iluminadas

    // Olhos Expressivos (Esclera branca + íris azulada de foco)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 8, oy + 5, 4, 3);
    ctx.fillRect(ox + 13, oy + 5, 4, 3);
    ctx.fillStyle = '#0288d1';
    ctx.fillRect(ox + 9, oy + 5, 2, 3);
    ctx.fillRect(ox + 14, oy + 5, 2, 3);
    ctx.fillStyle = P.outline;
    ctx.fillRect(ox + 7, oy + 4, 5, 1); // Sobrancelha forte E
    ctx.fillRect(ox + 13, oy + 4, 5, 1); // Sobrancelha forte D

    // Bigode Icônico 16-bit (Mustache)
    ctx.fillStyle = P.hairDark;
    ctx.fillRect(ox + 6, oy + 9, 10, 3);
    ctx.fillRect(ox + 4, oy + 10, 3, 3);
    ctx.fillRect(ox + 15, oy + 10, 3, 3);
    ctx.fillStyle = P.hairBase;
    ctx.fillRect(ox + 7, oy + 9, 8, 1);

    // 6. A GRANDE ESPADA DE CÓDIGO (Greatsword com Barramento Lógico e Energia)
    this.drawHiBitSword(ctx, swordPos.x, swordPos.y, swordPos.isThrust, isGold, state);
  }

  drawHiBitBoot(ctx, bx, by, isGold) {
    const P = this.palette;
    const gShadow = isGold ? '#6e3b14' : P.steelShadow;
    const gBase = isGold ? '#c97b27' : P.steelBase;
    const gLight = isGold ? '#f2b63d' : P.steelLight;

    ctx.fillStyle = P.outline;
    ctx.fillRect(bx, by, 7, 10);
    ctx.fillStyle = gBase;
    ctx.fillRect(bx + 1, by + 1, 5, 8);
    ctx.fillStyle = gLight;
    ctx.fillRect(bx + 1, by + 1, 2, 7);
    ctx.fillStyle = gShadow;
    ctx.fillRect(bx + 1, by + 8, 6, 2);
    // Solado escuro
    ctx.fillStyle = '#1c1008';
    ctx.fillRect(bx, by + 9, 7, 2);
  }

  drawHiBitPauldron(ctx, px, py, isGold) {
    const P = this.palette;
    const gBase = isGold ? '#c97b27' : P.steelBase;
    const gLight = isGold ? '#f2b63d' : P.steelLight;
    const gShine = isGold ? '#fff3b0' : P.steelShine;

    ctx.fillStyle = P.outline;
    ctx.fillRect(px, py, 6, 7);
    ctx.fillStyle = gBase;
    ctx.fillRect(px + 1, py + 1, 4, 5);
    ctx.fillStyle = gLight;
    ctx.fillRect(px + 1, py + 1, 3, 2);
    ctx.fillStyle = gShine;
    ctx.fillRect(px + 2, py + 1, 2, 1);
    // Detalhe vermelho na ombreira
    ctx.fillStyle = P.rubyAccent;
    ctx.fillRect(px + 1, py + 4, 4, 2);
  }

  drawHiBitSword(ctx, sx, sy, isHorizontal, isGold, state) {
    const P = this.palette;
    const bladeCol = isGold ? '#ffd600' : P.bladeGlow;
    const coreCol = isGold ? '#ffffff' : P.bladeCore;

    if (isHorizontal) {
      // Espada em Golpe Frontal
      const swW = 28;
      const swH = 8;
      // Contorno
      ctx.fillStyle = P.outline;
      ctx.fillRect(sx, sy, swW, swH);
      // Punho e Guarda
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 3, sy - 2, 3, swH + 4);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(sx - 6, sy + 2, 3, 4);

      // Lâmina Dourada com Barramento
      ctx.fillStyle = bladeCol;
      ctx.fillRect(sx + 1, sy + 1, swW - 2, swH - 2);
      ctx.fillStyle = coreCol;
      ctx.fillRect(sx + 3, sy + 3, swW - 6, 2);

      // Dentes de Código na Lâmina
      ctx.fillStyle = '#784212';
      for (let x = sx + 4; x < sx + swW - 4; x += 4) {
        ctx.fillRect(x, sy + 4, 2, 2);
      }

      // Slash Arc de Energia
      ctx.strokeStyle = isGold ? '#ffea00' : 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx + swW / 2, sy + swH / 2, 20, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
    } else {
      // Espada em Repouso Vertical
      const swW = 6;
      const swH = 24;
      // Contorno
      ctx.fillStyle = P.outline;
      ctx.fillRect(sx, sy, swW, swH);
      // Guarda
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 3, sy + 16, swW + 6, 3);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(sx + 1, sy + 19, 4, 5);

      // Lâmina
      ctx.fillStyle = bladeCol;
      ctx.fillRect(sx + 1, sy + 1, swW - 2, 15);
      ctx.fillStyle = coreCol;
      ctx.fillRect(sx + 2, sy + 2, 2, 13);
    }
  }

  // =========================================================================
  // 2. O MESTRE DOS MAGOS DA CARREIRA (MENTOR) HI-BIT
  // =========================================================================
  generateHiBitMentor() {
    ['idle1', 'idle2', 'float', 'cast'].forEach(state => {
      const { canvas, ctx } = this.createCanvas(56, 72);
      this.drawHiBitMentorFrame(ctx, state);
      this.set(`mentor_${state}`, canvas);
    });
  }

  drawHiBitMentorFrame(ctx, state) {
    const P = this.palette;
    const ox = 16;
    const oy = state === 'float' ? 8 : (state === 'idle2' ? 14 : 12);

    // Aura Mística Dourada Suave
    const aura = ctx.createRadialGradient(ox + 12, oy + 26, 4, ox + 12, oy + 26, 30);
    aura.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
    aura.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, 56, 72);

    // 1. MANTO VERMELHO ESCARLATE (Contorno #141013 e 3 tons de veludo)
    ctx.fillStyle = P.outline;
    ctx.fillRect(ox + 2, oy + 16, 20, 36);

    ctx.fillStyle = P.mentorRobeBase;
    ctx.fillRect(ox + 3, oy + 17, 18, 34);
    ctx.fillStyle = P.mentorRobeLight;
    ctx.fillRect(ox + 4, oy + 18, 5, 30); // Dobra de luz à esquerda
    ctx.fillStyle = P.mentorRobeShadow;
    ctx.fillRect(ox + 15, oy + 20, 6, 30); // Sombra à direita

    // Bordado de Ouro Místico na Borda do Manto
    ctx.fillStyle = P.mentorGoldTrim;
    ctx.fillRect(ox + 3, oy + 48, 18, 3);
    ctx.fillRect(ox + 10, oy + 17, 3, 31); // Faixa vertical dourada central

    // 2. CAPUZ E ROSTO SÁBIO
    ctx.fillStyle = P.outline;
    ctx.fillRect(ox + 3, oy + 2, 18, 18);
    ctx.fillStyle = P.mentorRobeBase;
    ctx.fillRect(ox + 4, oy + 3, 16, 16);
    ctx.fillStyle = P.mentorGoldTrim;
    ctx.fillRect(ox + 4, oy + 3, 16, 2); // Borda dourada do capuz

    // Sombra do capuz cobrindo o rosto
    ctx.fillStyle = '#1a0e10';
    ctx.fillRect(ox + 6, oy + 6, 12, 10);

    // Olhos Místicos Luminescentes (Ciano Brilhante)
    ctx.fillStyle = P.mentorOrb;
    ctx.fillRect(ox + 8, oy + 8, 3, 2);
    ctx.fillRect(ox + 13, oy + 8, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 9, oy + 8, 1, 1);
    ctx.fillRect(ox + 14, oy + 8, 1, 1);

    // 3. BARBA BRANCA LONGA SOMBREADA
    ctx.fillStyle = P.outline;
    ctx.fillRect(ox + 6, oy + 13, 12, 18);
    ctx.fillStyle = P.mentorBeardBase;
    ctx.fillRect(ox + 7, oy + 14, 10, 16);
    ctx.fillStyle = P.mentorBeardShine;
    ctx.fillRect(ox + 8, oy + 14, 4, 14); // Mecha de luz
    ctx.fillStyle = P.mentorBeardShadow;
    ctx.fillRect(ox + 13, oy + 16, 3, 12);
    // Ponta afilada da barba
    ctx.fillStyle = P.mentorBeardBase;
    ctx.fillRect(ox + 10, oy + 30, 4, 4);

    // 4. CAJADO MÁGICO ENTALHADO COM CRISTAL
    const stX = ox - 6;
    const stY = oy + 4;
    ctx.fillStyle = P.outline;
    ctx.fillRect(stX, stY + 12, 5, 46);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(stX + 1, stY + 13, 3, 44);
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(stX + 1, stY + 13, 1, 42);

    // Cabeça do Cajado e Cristal Rúnico
    ctx.fillStyle = P.mentorGoldTrim;
    ctx.fillRect(stX - 2, stY + 6, 9, 7);
    ctx.fillStyle = P.mentorOrb;
    ctx.fillRect(stX - 1, stY + 1, 7, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(stX + 1, stY + 3, 3, 3);
  }

  // =========================================================================
  // 3. INIMIGOS E CHEFE ATS-9000 HI-BIT
  // =========================================================================
  generateHiBitEnemies() {
    const P = this.palette;

    // 1. Bug Rastejante (32x32)
    ['walk1', 'walk2', 'hit'].forEach(s => {
      const { canvas, ctx } = this.createCanvas(36, 36);
      const isHit = s === 'hit';
      const legOff = s === 'walk1' ? 2 : -2;

      // Contorno Preto
      ctx.fillStyle = P.outline;
      ctx.fillRect(6, 10, 24, 16);

      // Carapaça Verde Metálica com Luz Especular
      ctx.fillStyle = isHit ? '#ffffff' : P.bugBase;
      ctx.fillRect(7, 11, 22, 14);
      ctx.fillStyle = isHit ? '#ffffff' : P.bugLight;
      ctx.fillRect(8, 12, 18, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 13, 8, 2); // Brilho especular

      // Scanner Laser / Olho Vermelho
      ctx.fillStyle = P.bugLaser;
      ctx.fillRect(4, 14, 5, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 15, 2, 2);

      // Patas Articuladas Mecânicas
      ctx.fillStyle = '#1c2833';
      ctx.fillRect(7 + legOff, 24, 4, 7);
      ctx.fillRect(16, 24 - legOff, 4, 7);
      ctx.fillRect(25 - legOff, 24, 4, 7);

      this.set(`enemy_bug_${s}`, canvas);
    });

    // 2. Fantasma da Síndrome do Impostor (36x36)
    ['float1', 'float2', 'hit'].forEach(s => {
      const { canvas, ctx } = this.createCanvas(36, 36);
      const isHit = s === 'hit';
      const bob = s === 'float1' ? 0 : 2;

      // Ectoplasma com Dithering e Luz Ciano
      ctx.fillStyle = isHit ? '#ffffff' : P.ghostBase;
      ctx.beginPath();
      ctx.arc(18, 14 + bob, 12, Math.PI, 0);
      ctx.lineTo(30, 28 + bob);
      ctx.lineTo(24, 24 + bob);
      ctx.lineTo(18, 28 + bob);
      ctx.lineTo(12, 24 + bob);
      ctx.lineTo(6, 28 + bob);
      ctx.closePath();
      ctx.fill();

      // Olhos Ocos com Brilho Ciano
      ctx.fillStyle = P.ghostCyan;
      ctx.fillRect(11, 12 + bob, 4, 5);
      ctx.fillRect(21, 12 + bob, 4, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(12, 13 + bob, 2, 2);
      ctx.fillRect(22, 13 + bob, 2, 2);

      this.set(`enemy_ghost_${s}`, canvas);
    });

    // 3. Golem do "Pede-se 5 Anos de Experiência" (54x54)
    ['stand', 'walk', 'hit'].forEach(s => {
      const { canvas, ctx } = this.createCanvas(56, 56);
      const isHit = s === 'hit';
      const bob = s === 'walk' ? 2 : 0;

      // Corpo Maciço de Pedra com Contorno
      ctx.fillStyle = P.outline;
      ctx.fillRect(8, 8 + bob, 28, 38);
      ctx.fillStyle = isHit ? '#ffffff' : P.golemBase;
      ctx.fillRect(9, 9 + bob, 26, 36);
      ctx.fillStyle = P.golemLight;
      ctx.fillRect(10, 10 + bob, 10, 32);

      // Visor Vermelho Feroz
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(14, 14 + bob, 14, 4);

      // O ENORME ESCUDO FRONTAL DOURADO "5+ YRS"
      const shX = 32;
      const shY = 4 + bob;
      ctx.fillStyle = P.outline;
      ctx.fillRect(shX, shY, 18, 44);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(shX + 1, shY + 1, 16, 42);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(shX + 2, shY + 2, 12, 40);

      // Rebites de Aço no Escudo
      ctx.fillStyle = '#37474f';
      ctx.fillRect(shX + 3, shY + 3, 3, 3);
      ctx.fillRect(shX + 12, shY + 3, 3, 3);
      ctx.fillRect(shX + 3, shY + 38, 3, 3);
      ctx.fillRect(shX + 12, shY + 38, 3, 3);

      // Inscrição "5+" em Pixel Art
      ctx.fillStyle = '#000000';
      ctx.fillRect(shX + 5, shY + 14, 6, 2);
      ctx.fillRect(shX + 5, shY + 16, 2, 4);
      ctx.fillRect(shX + 5, shY + 20, 6, 2);
      ctx.fillRect(shX + 9, shY + 22, 2, 4);
      ctx.fillRect(shX + 5, shY + 26, 6, 2);
      // Símbolo +
      ctx.fillRect(shX + 6, shY + 32, 4, 2);
      ctx.fillRect(shX + 7, shY + 30, 2, 6);

      this.set(`enemy_golem_${s}`, canvas);
    });

    // 4. Drone de Ghosting (36x36)
    ['fly1', 'fly2', 'hit'].forEach(s => {
      const { canvas, ctx } = this.createCanvas(36, 36);
      const isHit = s === 'hit';
      const propCycle = s === 'fly1';

      // Hélices com Blur
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(propCycle ? 4 : 6, 4, 24, 2);

      // Chassi do Drone
      ctx.fillStyle = P.outline;
      ctx.fillRect(8, 8, 20, 18);
      ctx.fillStyle = isHit ? '#ffffff' : '#37474f';
      ctx.fillRect(9, 9, 18, 16);

      // Tela com Ícone de E-mail Sem Resposta
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 11, 14, 10);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(13, 12, 3, 3);
      ctx.fillRect(19, 12, 3, 3);
      ctx.fillRect(16, 15, 3, 3);

      this.set(`enemy_drone_${s}`, canvas);
    });
  }

  generateHiBitBoss() {
    ['idle', 'attack', 'laser', 'stunned'].forEach(s => {
      const { canvas, ctx } = this.createCanvas(136, 136);
      this.drawHiBitBossFrame(ctx, s);
      this.set(`boss_ats_${s}`, canvas);
    });
  }

  drawHiBitBossFrame(ctx, state) {
    const P = this.palette;
    const isStunned = state === 'stunned';
    const isLaser = state === 'laser';

    // 1. Chassi e Servidores em Rack (Contorno Hi-Bit)
    ctx.fillStyle = P.outline;
    ctx.fillRect(20, 22, 96, 78);
    ctx.fillStyle = P.mechBase;
    ctx.fillRect(22, 24, 92, 74);
    ctx.fillStyle = P.mechLight;
    ctx.fillRect(24, 26, 12, 70); // Friso de luz metálica

    // LEDs de Servidor Piscantes
    const ledCol = isStunned ? '#616161' : (state === 'attack' ? '#ff1744' : '#00e676');
    for (let y = 30; y < 90; y += 8) {
      ctx.fillStyle = ledCol;
      ctx.fillRect(28, y, 5, 4);
      ctx.fillRect(36, y, 5, 4);
      ctx.fillRect(44, y, 5, 4);
    }

    // 2. MONITOR CENTRAL: O ALGORITMO RECRUTADOR
    ctx.fillStyle = '#0a1017';
    ctx.fillRect(54, 32, 54, 46);
    ctx.strokeStyle = '#455a64';
    ctx.lineWidth = 2;
    ctx.strokeRect(54, 32, 54, 46);

    if (isStunned) {
      // Olhos tontos X X
      ctx.fillStyle = '#ffd600';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('X  X', 66, 60);
    } else if (isLaser) {
      // Abertura do Laser Vermelho Destrutivo
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.arc(81, 55, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(81, 55, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Onda Senoidal Maldita do Algoritmo
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(60, 52, 6, 12);
      ctx.fillRect(68, 44, 6, 24);
      ctx.fillRect(76, 48, 6, 16);
      ctx.fillRect(84, 56, 6, 8);
      ctx.fillRect(92, 50, 6, 14);
    }

    // 3. NÚCLEO EXPOSTO NA PARTE INFERIOR
    if (isStunned) {
      // Núcleo Dourado Aberto
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(52, 82, 36, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(60, 84, 20, 10);
    } else {
      ctx.fillStyle = '#d84315';
      ctx.fillRect(62, 84, 16, 8);
    }

    // 4. Canhões e Propulsores Inferiores
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(30, 100, 76, 24);
    ctx.fillStyle = isStunned ? '#424242' : '#00e5ff';
    ctx.fillRect(38, 122, 18, 8);
    ctx.fillRect(80, 122, 18, 8);
  }

  // =========================================================================
  // 4. RETRATO RPG 64x64 EM ALTA DEFINIÇÃO DO MESTRE DOS MAGOS
  // =========================================================================
  generateHiBitPortraits() {
    const { canvas, ctx } = this.createCanvas(72, 72);
    const P = this.palette;

    // Moldura Dourada Ornamentada de RPG 16-bit
    ctx.fillStyle = '#0e111a';
    ctx.fillRect(0, 0, 72, 72);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 68, 68);
    ctx.fillStyle = '#c97b27';
    ctx.fillRect(3, 3, 6, 6);
    ctx.fillRect(63, 3, 6, 6);
    ctx.fillRect(3, 63, 6, 6);
    ctx.fillRect(63, 63, 6, 6);

    // Manto Escarlate e Capuz Sombreado
    const px = 14;
    const py = 10;
    ctx.fillStyle = P.mentorRobeBase;
    ctx.fillRect(px, py, 44, 52);
    ctx.fillStyle = P.mentorRobeLight;
    ctx.fillRect(px + 4, py + 2, 12, 40);
    ctx.fillStyle = P.mentorRobeShadow;
    ctx.fillRect(px + 28, py + 2, 14, 48);

    // Borda Dourada do Capuz
    ctx.fillStyle = P.mentorGoldTrim;
    ctx.fillRect(px, py, 44, 4);
    ctx.fillRect(px + 20, py, 4, 52);

    // Sombra Misteriosa do Rosto
    ctx.fillStyle = '#1a0e10';
    ctx.fillRect(px + 8, py + 10, 28, 22);

    // Olhos Místicos Azuis Brilhantes
    ctx.fillStyle = P.mentorOrb;
    ctx.fillRect(px + 12, py + 16, 6, 4);
    ctx.fillRect(px + 26, py + 16, 6, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 14, py + 17, 2, 2);
    ctx.fillRect(px + 28, py + 17, 2, 2);

    // Barba Longa Branca com Mechas Sombreadas
    ctx.fillStyle = P.mentorBeardBase;
    ctx.fillRect(px + 10, py + 26, 24, 28);
    ctx.fillStyle = P.mentorBeardShine;
    ctx.fillRect(px + 14, py + 28, 8, 24);
    ctx.fillStyle = P.mentorBeardShadow;
    ctx.fillRect(px + 24, py + 30, 8, 20);

    this.set('portrait_mentor', canvas);
  }

  // =========================================================================
  // 5. TILES, ITENS E PROJÉTEIS HI-BIT
  // =========================================================================
  generateHiBitTiles() {
    // 1. Piso de Cantaria (32x32)
    const { canvas: stone, ctx: sCtx } = this.createCanvas(32, 32);
    sCtx.fillStyle = '#616161';
    sCtx.fillRect(0, 0, 32, 32);
    sCtx.fillStyle = '#9e9e9e';
    sCtx.fillRect(0, 0, 32, 2);
    sCtx.fillRect(0, 0, 2, 32);
    sCtx.fillStyle = '#424242';
    sCtx.fillRect(0, 30, 32, 2);
    sCtx.fillRect(30, 0, 2, 32);
    this.set('tile_stone', stone);

    // 2. Plataforma de Circuito Hi-Bit (64x24)
    const { canvas: plat, ctx: pCtx } = this.createCanvas(64, 24);
    pCtx.fillStyle = '#1c2833';
    pCtx.fillRect(0, 0, 64, 24);
    pCtx.fillStyle = '#2e4053';
    pCtx.fillRect(2, 2, 60, 16);
    pCtx.fillStyle = '#00e5ff';
    pCtx.fillRect(4, 9, 56, 3);
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(10, 10, 4, 1);
    pCtx.fillRect(50, 10, 4, 1);
    this.set('tile_platform', plat);
  }

  generateHiBitItems() {
    // 1. Café 200 OK (24x24)
    const { canvas: coffee, ctx: cCtx } = this.createCanvas(24, 24);
    cCtx.fillStyle = '#ffffff';
    cCtx.fillRect(6, 8, 12, 12);
    cCtx.fillRect(16, 11, 4, 6);
    cCtx.fillStyle = '#4e342e';
    cCtx.fillRect(8, 10, 8, 8);
    cCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    cCtx.fillRect(8, 4, 2, 3);
    cCtx.fillRect(12, 2, 2, 4);
    this.set('item_coffee', coffee);

    // 2. Livro de Algoritmos (24x24)
    const { canvas: book, ctx: bCtx } = this.createCanvas(24, 24);
    bCtx.fillStyle = '#b71c1c';
    bCtx.fillRect(4, 6, 16, 14);
    bCtx.fillStyle = '#ffd700';
    bCtx.fillRect(6, 8, 12, 2);
    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(18, 8, 2, 10);
    this.set('item_book', book);

    // 3. Carta de Oferta Dourada (First Job Offer) (36x36)
    const { canvas: offer, ctx: oCtx } = this.createCanvas(36, 36);
    const grad = oCtx.createRadialGradient(18, 18, 4, 18, 18, 18);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.85)');
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    oCtx.fillStyle = grad;
    oCtx.fillRect(0, 0, 36, 36);

    oCtx.fillStyle = '#fffde7';
    oCtx.fillRect(8, 8, 20, 20);
    oCtx.strokeStyle = '#ffd700';
    oCtx.lineWidth = 2;
    oCtx.strokeRect(8, 8, 20, 20);

    // Selo de Cera Vermelho
    oCtx.fillStyle = '#c0392b';
    oCtx.beginPath();
    oCtx.arc(18, 18, 4, 0, Math.PI * 2);
    oCtx.fill();
    this.set('item_offer', offer);
  }

  generateHiBitProjectiles() {
    // 1. Filtro de Currículo (24x10)
    const { canvas: filter, ctx: fCtx } = this.createCanvas(24, 10);
    fCtx.fillStyle = '#ff1744';
    fCtx.fillRect(0, 2, 24, 6);
    fCtx.fillStyle = '#ffffff';
    fCtx.fillRect(4, 4, 16, 2);
    this.set('proj_filter', filter);

    // 2. E-mail de Ghosting (16x16)
    const { canvas: mail, ctx: mCtx } = this.createCanvas(16, 16);
    mCtx.fillStyle = '#eceff1';
    mCtx.fillRect(2, 4, 12, 8);
    mCtx.fillStyle = '#ff5252';
    mCtx.fillRect(4, 5, 2, 2);
    mCtx.fillRect(10, 5, 2, 2);
    mCtx.fillRect(7, 7, 2, 2);
    this.set('proj_ghosting', mail);

    // 3. Onda de Choque (32x16)
    const { canvas: shock, ctx: sCtx } = this.createCanvas(32, 16);
    sCtx.fillStyle = '#ffd600';
    sCtx.beginPath();
    sCtx.moveTo(0, 16);
    sCtx.lineTo(16, 0);
    sCtx.lineTo(32, 16);
    sCtx.closePath();
    sCtx.fill();
    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(14, 6, 4, 10);
    this.set('proj_shockwave', shock);
  }
}
