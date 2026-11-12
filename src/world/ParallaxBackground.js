/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * ParallaxBackground.js - Vila Costeira 16-Bit Hi-Bit (Padrão Mustache Protocol / Metal Slug)
 */

export class ParallaxBackground {
  constructor(renderer, canvasWidth, canvasHeight) {
    this.renderer = renderer;
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.waterTime = 0;
    this.worldTime = 0;
    this.smokeParticles = [];

    this.initLivingWorld();
    this.createStaticLayers();
  }

  initLivingWorld() {
    // 1. Nuvens em movimento lento pelo céu
    this.clouds = Array.from({ length: 7 }, (_, i) => ({
      x: i * 240 + Math.random() * 100,
      y: 30 + (i % 3) * 38,
      w: 90 + (i % 3) * 35,
      speed: 10 + (i % 3) * 6
    }));

    // 2. Gaivotas e pássaros batendo asas no céu
    this.birds = Array.from({ length: 9 }, (_, i) => ({
      x: i * 190 + Math.random() * 80,
      y: 55 + (i % 4) * 32,
      speed: 35 + (i % 3) * 18,
      dir: i % 2 === 0 ? 1 : -1,
      phase: Math.random() * Math.PI * 2
    }));

    // 3. Barcos a vela navegando no mar ao fundo
    this.boats = [
      { x: 350, y: 632, speed: 18, dir: 1, sailColor: '#ffffff', hullColor: '#8d6e63' },
      { x: 1850, y: 642, speed: 14, dir: -1, sailColor: '#ffd54f', hullColor: '#5d4037' },
      { x: 3400, y: 636, speed: 22, dir: 1, sailColor: '#80deea', hullColor: '#455a64' }
    ];

    // 4. Peixes / Golfinhos saltando na água
    this.jumpingFish = [
      { x: 520, timer: 0, interval: 4.2, active: false, t: 0 },
      { x: 1900, timer: 2.0, interval: 5.0, active: false, t: 0 },
      { x: 3600, timer: 1.0, interval: 4.5, active: false, t: 0 }
    ];

    // 5. Pessoas, Devs, Cachorro e Ciclista andando pelo calçadão (Mundo Vivo!)
    this.walkers = [
      { type: 'dev_coffee', x: 260, dir: 1, speed: 34, shirt: '#1976d2', hair: '#212121', minX: 120, maxX: 900, phase: 0 },
      { type: 'dog_walker', x: 760, dir: -1, speed: 40, shirt: '#e64a19', hair: '#4e342e', minX: 400, maxX: 1350, phase: 1.2 },
      { type: 'cyclist', x: 1100, dir: 1, speed: 115, shirt: '#00acc1', hair: '#111', minX: 50, maxX: 4900, phase: 0 },
      { type: 'dev_laptop', x: 1480, dir: 1, speed: 30, shirt: '#7b1fa2', hair: '#fdd835', minX: 1100, maxX: 2100, phase: 2.1 },
      { type: 'cat', x: 1750, dir: -1, speed: 22, color: '#ff9800', minX: 1550, maxX: 2200, phase: 0.7 },
      { type: 'office_worker', x: 2350, dir: -1, speed: 38, shirt: '#37474f', hair: '#1a1a1a', minX: 1900, maxX: 2900, phase: 3.0 },
      { type: 'dog_walker', x: 2950, dir: 1, speed: 36, shirt: '#2e7d32', hair: '#5d4037', minX: 2500, maxX: 3500, phase: 0.4 },
      { type: 'dev_coffee', x: 3550, dir: -1, speed: 32, shirt: '#c62828', hair: '#212121', minX: 3100, maxX: 4100, phase: 1.8 },
      { type: 'cat', x: 4050, dir: 1, speed: 24, color: '#eceff1', minX: 3800, maxX: 4400, phase: 2.5 },
      { type: 'pigeon_flock', x: 640, dir: 1, speed: 12, minX: 500, maxX: 900, phase: 0 }
    ];

    // 6. Fumaça animada das chaminés
    this.smokeParticles = [];
    this.smokeTimer = 0;
  }

  updateLivingWorld(dt) {
    this.worldTime += dt;

    // Atualiza Nuvens
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > this.width + 200) c.x = -c.w - 60;
    }

    // Atualiza Pássaros
    for (const b of this.birds) {
      b.x += b.dir * b.speed * dt;
      b.phase += dt * 10;
      if (b.dir === 1 && b.x > this.width + 80) b.x = -60;
      if (b.dir === -1 && b.x < -80) b.x = this.width + 60;
    }

    // Atualiza Barcos
    for (const boat of this.boats) {
      boat.x += boat.dir * boat.speed * dt;
      if (boat.dir === 1 && boat.x > 5200) boat.x = -100;
      if (boat.dir === -1 && boat.x < -100) boat.x = 5200;
    }

    // Atualiza Peixes saltando
    for (const f of this.jumpingFish) {
      if (!f.active) {
        f.timer += dt;
        if (f.timer >= f.interval) {
          f.timer = 0;
          f.active = true;
          f.t = 0;
        }
      } else {
        f.t += dt * 1.6;
        if (f.t >= 1) f.active = false;
      }
    }

    // Atualiza Pedestres, Animais e Ciclista
    for (const w of this.walkers) {
      w.x += w.dir * w.speed * dt;
      w.phase += dt * (w.speed * 0.22);
      if (w.x >= w.maxX) {
        w.x = w.maxX;
        w.dir = -1;
      } else if (w.x <= w.minX) {
        w.x = w.minX;
        w.dir = 1;
      }
    }

    // Emite fumaça de chaminé
    this.smokeTimer += dt;
    if (this.smokeTimer > 0.45) {
      this.smokeTimer = 0;
      this.smokeParticles.push({
        x: 240 + Math.random() * 900,
        y: 195 + Math.random() * 35,
        vy: -18 - Math.random() * 10,
        vx: 8 + Math.random() * 6,
        size: 6,
        life: 2.2,
        maxLife: 2.2
      });
    }
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const s = this.smokeParticles[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.size += dt * 4;
      s.life -= dt;
      if (s.life <= 0) this.smokeParticles.splice(i, 1);
    }
  }

  createStaticLayers() {
    // 1. Camada de Fundo (Céu Dourado com Dithering + Fortaleza Medieval / Tech Citadel)
    this.bgLayer = document.createElement('canvas');
    this.bgLayer.width = 1600;
    this.bgLayer.height = this.height;
    const bgCtx = this.bgLayer.getContext('2d');
    bgCtx.imageSmoothingEnabled = false;
    this.renderDistantBackground(bgCtx, 1600, this.height);

    // 2. Camada Intermediária (Vila Costeira Contínua: Sobrados Geminados 60% da Altura)
    this.midLayer = document.createElement('canvas');
    this.midLayer.width = 2800;
    this.midLayer.height = this.height;
    const midCtx = this.midLayer.getContext('2d');
    midCtx.imageSmoothingEnabled = false;
    this.renderCoastalTown(midCtx, 2800, this.height);
  }

  // --- CAMADA 0 & 1: CÉU DOURADO COM DITHERING & CIDADELA MEDIEVAL ---
  renderDistantBackground(ctx, w, h) {
    // Céu de pôr do sol dourado rico com degradê escalonado
    const skyColors = [
      '#241208', '#421f0b', '#73370f', '#ad5213', 
      '#d97316', '#f29829', '#fcc244', '#fee482'
    ];
    const bandH = Math.ceil(h / skyColors.length);

    skyColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, i * bandH, w, bandH + 2);

      // Padrão de Dithering clássico 16-bit nas transições entre faixas
      if (i < skyColors.length - 1) {
        ctx.fillStyle = skyColors[i + 1];
        const transY = (i + 1) * bandH - 8;
        for (let x = 0; x < w; x += 4) {
          ctx.fillRect(x + (transY % 8 === 0 ? 0 : 2), transY, 2, 2);
          ctx.fillRect(x + (transY % 8 === 0 ? 2 : 0), transY + 2, 2, 2);
          ctx.fillRect(x, transY + 4, 2, 2);
          ctx.fillRect(x + 2, transY + 6, 2, 2);
        }
      }
    });

    // Nuvens Volumosas com Sombreamento em 3 Tons (Hi-Bit)
    this.drawHiBitClouds(ctx, 80, 50, 320, 70);
    this.drawHiBitClouds(ctx, 520, 90, 420, 85);
    this.drawHiBitClouds(ctx, 1100, 60, 380, 80);

    // Colina Rochosa da Cidadela
    const hillTopY = h - 300;
    ctx.fillStyle = '#2b1b14';
    ctx.beginPath();
    ctx.moveTo(350, h);
    ctx.lineTo(440, hillTopY + 80);
    ctx.lineTo(600, hillTopY);
    ctx.lineTo(1050, hillTopY + 20);
    ctx.lineTo(1220, hillTopY + 120);
    ctx.lineTo(1350, h);
    ctx.closePath();
    ctx.fill();

    // Destaque de luz na crista da colina
    ctx.fillStyle = '#8f4b16';
    ctx.fillRect(580, hillTopY, 480, 4);
    ctx.fillRect(610, hillTopY + 4, 430, 4);

    // CIDADELA MEDIEVAL / FORTALEZA TECH (Atrás dos Sobrados)
    this.drawMedievalCitadel(ctx, 620, hillTopY - 140);
  }

  drawHiBitClouds(ctx, x, y, w, h) {
    const topCol = '#ffe8b3';   // Luz dourada
    const midCol = '#d97925';   // Tom intermediário
    const baseCol = '#6e2b0b';  // Sombra profunda
    const darkEdge = '#3d1405'; // Contorno inferior

    const segments = 12;
    const segW = w / segments;

    // Sombra Base
    ctx.fillStyle = baseCol;
    for (let i = 0; i < segments; i++) {
      const cx = x + i * segW;
      const ch = h * (0.6 + Math.sin((i / segments) * Math.PI) * 0.4);
      ctx.fillRect(cx, y + (h - ch), segW + 4, ch);
    }

    // Contorno escuro embaixo
    ctx.fillStyle = darkEdge;
    ctx.fillRect(x, y + h - 4, w, 4);

    // Camada Intermediária
    ctx.fillStyle = midCol;
    for (let i = 1; i < segments - 1; i++) {
      const cx = x + i * segW;
      const ch = h * (0.45 + Math.sin((i / segments) * Math.PI) * 0.4);
      ctx.fillRect(cx, y + (h - ch) - 8, segW + 2, ch * 0.8);
    }

    // Crista de Luz Iluminada
    ctx.fillStyle = topCol;
    for (let i = 2; i < segments - 2; i++) {
      const cx = x + i * segW;
      const ch = h * 0.35 * Math.sin((i / segments) * Math.PI);
      ctx.fillRect(cx + 4, y + (h - ch) - 20, segW - 8, ch);
      ctx.fillRect(cx + 8, y + (h - ch) - 26, segW - 16, 6);
    }
  }

  drawMedievalCitadel(ctx, cx, cy) {
    const castleW = 380;
    const castleH = 150;

    // Paredes da Fortaleza com Textura Individual de Blocos
    const stoneBase = '#6e6559';
    const stoneDark = '#474037';
    const stoneLight = '#968c7e';
    const stoneJoint = '#2e2821';

    ctx.fillStyle = stoneBase;
    ctx.fillRect(cx, cy, castleW, castleH);

    // Textura de blocos de cantaria com juntas escuras
    const blockW = 20;
    const blockH = 10;
    for (let by = cy; by < cy + castleH; by += blockH) {
      const row = Math.floor((by - cy) / blockH);
      const rowOffset = (row % 2 === 0) ? 0 : 10;

      // Junta horizontal
      ctx.fillStyle = stoneJoint;
      ctx.fillRect(cx, by, castleW, 2);

      for (let bx = cx + rowOffset; bx < cx + castleW; bx += blockW) {
        // Junta vertical
        ctx.fillRect(bx, by, 2, blockH);

        // Variação de tons sutis em cada bloco
        if ((bx * 7 + by * 13) % 5 === 0) {
          ctx.fillStyle = stoneLight;
          ctx.fillRect(bx + 2, by + 2, blockW - 4, 3);
        } else if ((bx * 3 + by * 17) % 4 === 0) {
          ctx.fillStyle = stoneDark;
          ctx.fillRect(bx + 2, by + blockH - 4, blockW - 4, 2);
        }
        ctx.fillStyle = stoneJoint;
      }
    }

    // Torres Altas com Ameias (Crenels)
    this.drawCastleTower(ctx, cx - 24, cy - 40, 48, castleH + 40);
    this.drawCastleTower(ctx, cx + castleW - 24, cy - 40, 48, castleH + 40);
    this.drawCastleTower(ctx, cx + 160, cy - 70, 60, castleH + 70);

    // Ameias no topo do muro central
    ctx.fillStyle = stoneBase;
    for (let x = cx + 30; x < cx + castleW - 30; x += 22) {
      ctx.fillRect(x, cy - 14, 14, 14);
      ctx.fillStyle = stoneLight;
      ctx.fillRect(x, cy - 14, 14, 3);
      ctx.fillStyle = stoneJoint;
      ctx.fillRect(x + 12, cy - 14, 2, 14);
      ctx.fillStyle = stoneBase;
    }

    // Janelas Arqueadas com Barras de Ferro e Luz Âmbar
    const windowPositions = [
      { x: cx + 70, y: cy + 40 },
      { x: cx + 120, y: cy + 40 },
      { x: cx + 250, y: cy + 40 },
      { x: cx + 300, y: cy + 40 }
    ];

    windowPositions.forEach(wPos => {
      ctx.fillStyle = stoneJoint;
      ctx.fillRect(wPos.x - 2, wPos.y - 2, 18, 28);
      // Arco
      ctx.beginPath();
      ctx.arc(wPos.x + 7, wPos.y - 2, 9, Math.PI, 0);
      ctx.fill();

      // Vidro iluminado com reflexo
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(wPos.x + 2, wPos.y + 2, 10, 20);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(wPos.x + 4, wPos.y + 4, 3, 14);

      // Grade de ferro
      ctx.fillStyle = '#1c1712';
      ctx.fillRect(wPos.x + 6, wPos.y + 2, 2, 20);
      ctx.fillRect(wPos.x + 2, wPos.y + 11, 10, 2);
    });
  }

  drawCastleTower(ctx, tx, ty, tw, th) {
    const stoneBase = '#6e6559';
    const stoneLight = '#968c7e';
    const stoneJoint = '#2e2821';

    ctx.fillStyle = stoneBase;
    ctx.fillRect(tx, ty, tw, th);

    // Contorno lateral
    ctx.fillStyle = stoneLight;
    ctx.fillRect(tx, ty, 3, th);
    ctx.fillStyle = stoneJoint;
    ctx.fillRect(tx + tw - 3, ty, 3, th);

    // Ameias da Torre
    for (let x = tx; x < tx + tw; x += 14) {
      ctx.fillStyle = stoneBase;
      ctx.fillRect(x, ty - 12, 10, 12);
      ctx.fillStyle = stoneLight;
      ctx.fillRect(x, ty - 12, 10, 2);
      ctx.fillStyle = stoneJoint;
      ctx.fillRect(x + 8, ty - 12, 2, 12);
    }

    // Telhado Cônico Agudo (Ardósia Azulada)
    ctx.fillStyle = '#233245';
    ctx.beginPath();
    ctx.moveTo(tx - 4, ty - 12);
    ctx.lineTo(tx + tw / 2, ty - 55);
    ctx.lineTo(tx + tw + 4, ty - 12);
    ctx.closePath();
    ctx.fill();

    // Destaque de luz no telhado
    ctx.fillStyle = '#426287';
    ctx.beginPath();
    ctx.moveTo(tx - 4, ty - 12);
    ctx.lineTo(tx + tw / 2, ty - 55);
    ctx.lineTo(tx + tw / 2, ty - 12);
    ctx.closePath();
    ctx.fill();

    // Janela Fenda (Arrowslit)
    ctx.fillStyle = stoneJoint;
    ctx.fillRect(tx + tw / 2 - 2, ty + 20, 4, 18);
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(tx + tw / 2 - 1, ty + 22, 2, 14);
  }

  // --- CAMADA 2: VILA COSTEIRA (SOBRADOS GEMINADOS 60% DA ALTURA DA TELA) ---
  renderCoastalTown(ctx, w, h) {
    const groundY = h - 160;
    const buildingHeight = 410; // ~60% da tela de 720px!
    const buildingY = groundY - buildingHeight;

    // Paleta Rica de Fachadas Européias Geminadas
    const buildings = [
      { width: 220, wallCol: '#d9a05b', wallShadow: '#99672f', name: 'BARBERSHOP', shopType: 'barber', awning1: '#c0392b', awning2: '#ffffff' },
      { width: 240, wallCol: '#2e5288', wallShadow: '#1a3359', name: 'ACADEMIA DE CÓDIGO', shopType: 'code', awning1: '#00e5ff', awning2: '#0d47a1' },
      { width: 200, wallCol: '#b85342', wallShadow: '#7a2d20', name: 'CAFÉ 200 OK', shopType: 'cafe', awning1: '#f39c12', awning2: '#3e2723' },
      { width: 230, wallCol: '#7a9a82', wallShadow: '#4a6951', name: 'FORJA DO DEV', shopType: 'forge', awning1: '#e74c3c', awning2: '#ffd700' },
      { width: 210, wallCol: '#d9a05b', wallShadow: '#99672f', name: 'TAVERNA LINUX', shopType: 'barber', awning1: '#27ae60', awning2: '#ffffff' },
      { width: 250, wallCol: '#2e5288', wallShadow: '#1a3359', name: 'API HUB', shopType: 'code', awning1: '#9b59b6', awning2: '#ffffff' },
      { width: 220, wallCol: '#b85342', wallShadow: '#7a2d20', name: 'STACK OVERFLOW CAFÉ', shopType: 'cafe', awning1: '#e67e22', awning2: '#ffffff' },
      { width: 240, wallCol: '#7a9a82', wallShadow: '#4a6951', name: 'PORTFÓLIO LAB', shopType: 'forge', awning1: '#3498db', awning2: '#ffffff' },
      { width: 230, wallCol: '#d9a05b', wallShadow: '#99672f', name: 'BYTE STORE', shopType: 'code', awning1: '#e74c3c', awning2: '#2c3e50' },
      { width: 220, wallCol: '#b85342', wallShadow: '#7a2d20', name: 'DOCS INN', shopType: 'cafe', awning1: '#f1c40f', awning2: '#27ae60' },
      { width: 240, wallCol: '#2e5288', wallShadow: '#1a3359', name: 'CLOUD BAZAAR', shopType: 'code', awning1: '#00e5ff', awning2: '#ffffff' },
      { width: 260, wallCol: '#7a9a82', wallShadow: '#4a6951', name: 'REPOSITÓRIO MATRIZ', shopType: 'forge', awning1: '#e74c3c', awning2: '#f39c12' }
    ];

    let currX = 0;
    buildings.forEach((bld, idx) => {
      this.drawTownHouse(ctx, currX, buildingY, bld.width, buildingHeight, bld, idx);

      // Postes de Luz de Ferro Forjado Preto entre fachadas
      this.drawWroughtIronLamp(ctx, currX + bld.width - 14, groundY - 110);

      currX += bld.width; // Colados uns nos outros, sem vãos vazios!
    });
  }

  drawTownHouse(ctx, x, y, width, height, data, index) {
    const groundY = y + height;
    const roofHeight = 70;
    const houseY = y + roofHeight;
    const houseH = height - roofHeight;

    // 1. TELHADO INCLINADO DE ARDÓSIA (Escamas de Ardósia Cinza-Azulada)
    const slateDark = '#1c2738';
    const slateMid = '#32455e';
    const slateLight = '#4d698e';

    // Base Triangular / Mansarda
    ctx.fillStyle = slateDark;
    ctx.fillRect(x - 4, y, width + 8, roofHeight);

    // Telhas em escamas horizontais
    const rowH = 8;
    for (let ry = y; ry < y + roofHeight; ry += rowH) {
      const isAlt = (Math.floor((ry - y) / rowH) % 2 === 0);
      ctx.fillStyle = isAlt ? slateMid : slateDark;
      ctx.fillRect(x - 2, ry, width + 4, rowH);

      // Destaque de luz em cada escama
      ctx.fillStyle = slateLight;
      for (let tx = x + (isAlt ? 0 : 8); tx < x + width; tx += 16) {
        ctx.fillRect(tx, ry, 10, 2);
      }
    }

    // Cumeeira do Telhado
    ctx.fillStyle = '#0f1721';
    ctx.fillRect(x - 6, y, width + 12, 4);
    ctx.fillStyle = '#6585af';
    ctx.fillRect(x - 4, y, width + 8, 2);

    // 2. CHAMINÉ DE TIJOLOS COM FUMAÇA PIXELADA
    const chimX = x + (index % 2 === 0 ? 30 : width - 50);
    const chimY = y - 36;
    ctx.fillStyle = '#7a2818';
    ctx.fillRect(chimX, chimY, 22, 40);
    ctx.fillStyle = '#9e3925';
    ctx.fillRect(chimX + 2, chimY + 2, 8, 36);
    // Borda superior da chaminé
    ctx.fillStyle = '#3a130b';
    ctx.fillRect(chimX - 3, chimY, 28, 6);
    ctx.fillStyle = '#cf6d59';
    ctx.fillRect(chimX - 2, chimY, 26, 2);

    // Partículas de fumaça inicial
    ctx.fillStyle = 'rgba(230, 230, 230, 0.55)';
    ctx.fillRect(chimX + 6, chimY - 8, 8, 6);
    ctx.fillRect(chimX + 10, chimY - 18, 12, 8);
    ctx.fillRect(chimX + 16, chimY - 30, 16, 10);

    // 3. FACHADA PRINCIPAL (Alvenaria com Textura Sutil)
    ctx.fillStyle = data.wallCol;
    ctx.fillRect(x, houseY, width, houseH);

    // Sombra vertical na lateral direita do prédio
    ctx.fillStyle = data.wallShadow;
    ctx.fillRect(x + width - 12, houseY, 12, houseH);

    // Pedras de Quina (*Quoins*) Alternadas nas Bordas
    const quoinCol1 = '#eceff1';
    const quoinCol2 = '#b0bec5';
    const quoinH = 14;
    for (let qy = houseY; qy < groundY - 100; qy += quoinH) {
      const isLong = (Math.floor((qy - houseY) / quoinH) % 2 === 0);
      const qW = isLong ? 16 : 9;

      // Quina Esquerda
      ctx.fillStyle = quoinCol1;
      ctx.fillRect(x, qy, qW, quoinH - 2);
      ctx.fillStyle = quoinCol2;
      ctx.fillRect(x, qy + quoinH - 3, qW, 1);
      ctx.fillRect(x + qW - 1, qy, 1, quoinH - 2);

      // Quina Direita
      ctx.fillStyle = quoinCol1;
      ctx.fillRect(x + width - qW, qy, qW, quoinH - 2);
      ctx.fillStyle = quoinCol2;
      ctx.fillRect(x + width - qW, qy + quoinH - 3, qW, 1);
    }

    // 4. JANELAS FRANCESAS 16-BIT (2 Andares de Janelas Detalhadas)
    const windowCols = Math.floor((width - 40) / 54);
    const winSpacing = (width - 40) / windowCols;

    for (let floor = 0; floor < 2; floor++) {
      const winY = houseY + 36 + floor * 90;

      for (let c = 0; c < windowCols; c++) {
        const winX = x + 26 + c * winSpacing;
        this.drawDetailedWindow(ctx, winX, winY);
      }
    }

    // Friso de Cantaria entre Andar Superior e Térreo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 2, groundY - 120, width + 4, 6);
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(x - 2, groundY - 116, width + 4, 4);

    // 5. TÉRREO: LOJA COM TOLDO LISTRADO, PORTA DE MADEIRA E LETREIRO ORNAMENTADO
    this.drawShopGroundFloor(ctx, x, groundY - 110, width, 110, data);
  }

  drawDetailedWindow(ctx, wx, wy) {
    const winW = 34;
    const winH = 54;

    // Moldura de Cantaria Branca
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wx - 3, wy - 3, winW + 6, winH + 6);
    // Parapeito de Pedra
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(wx - 5, wy + winH + 1, winW + 10, 5);
    ctx.fillStyle = '#90a4ae';
    ctx.fillRect(wx - 5, wy + winH + 5, winW + 10, 2);

    // Vidro Escuro com Gradiente
    ctx.fillStyle = '#0f2238';
    ctx.fillRect(wx, wy, winW, winH);

    // Reflexo de Luz Diagonal no Vidro (Efeito Clássico 16-bit)
    ctx.fillStyle = 'rgba(100, 190, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(wx + 6, wy);
    ctx.lineTo(wx + 18, wy);
    ctx.lineTo(wx, wy + 26);
    ctx.lineTo(wx, wy + 12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(wx + 22, wy);
    ctx.lineTo(wx + 30, wy);
    ctx.lineTo(wx, wy + 48);
    ctx.lineTo(wx, wy + 36);
    ctx.closePath();
    ctx.fill();

    // Grade de Madeira Branca (Muntins 3x2)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wx + winW / 2 - 1, wy, 2, winH); // Vertical
    ctx.fillRect(wx, wy + winH * 0.38 - 1, winW, 2); // Horizontal 1
    ctx.fillRect(wx, wy + winH * 0.72 - 1, winW, 2); // Horizontal 2

    // Sombra superior da janela
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(wx, wy, winW, 4);
  }

  drawShopGroundFloor(ctx, x, y, width, height, data) {
    // Paredes da Loja
    ctx.fillStyle = '#212121';
    ctx.fillRect(x, y, width, height);

    // 1. Toldo Listrado Estilizado (Awning)
    const awningW = width;
    const awningH = 26;
    const stripeW = 16;
    let stripeIdx = 0;

    for (let ax = x; ax < x + awningW; ax += stripeW) {
      ctx.fillStyle = (stripeIdx % 2 === 0) ? data.awning1 : data.awning2;
      ctx.fillRect(ax, y, Math.min(stripeW, x + awningW - ax), awningH);

      // Franja inferior recortada em ondas pixeladas
      ctx.fillRect(ax, y + awningH, Math.min(stripeW, x + awningW - ax), 4);
      ctx.fillStyle = '#111111';
      ctx.fillRect(ax + stripeW - 2, y + awningH + 2, 2, 3);

      stripeIdx++;
    }

    // Sombra do toldo projetada na vitrine
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x, y + awningH + 4, width, 8);

    // 2. Vitrine Grande de Vidro com Moldura de Mogno
    const winW = width * 0.52;
    const winH = 60;
    const winX = x + 12;
    const winY = y + awningH + 12;

    ctx.fillStyle = '#4e342e';
    ctx.fillRect(winX - 3, winY - 3, winW + 6, winH + 6);
    ctx.fillStyle = '#102027';
    ctx.fillRect(winX, winY, winW, winH);

    // Luz interna e reflexo da vitrine
    ctx.fillStyle = 'rgba(255, 235, 59, 0.2)';
    ctx.fillRect(winX, winY, winW, winH);
    ctx.fillStyle = 'rgba(128, 222, 234, 0.4)';
    ctx.beginPath();
    ctx.moveTo(winX + 8, winY);
    ctx.lineTo(winX + 24, winY);
    ctx.lineTo(winX, winY + 36);
    ctx.lineTo(winX, winY + 16);
    ctx.closePath();
    ctx.fill();

    // 3. Porta de Madeira com Almofadas e Vidro
    const doorX = winX + winW + 14;
    const doorW = width - (winW + 36);
    const doorH = 68;
    const doorY = y + awningH + 8;

    ctx.fillStyle = '#3e2723';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(doorX + 3, doorY + 3, doorW - 6, doorH - 4);

    // Vidro da porta
    ctx.fillStyle = '#80deea';
    ctx.fillRect(doorX + 6, doorY + 6, doorW - 12, 28);
    // Maçaneta de latão brilhante
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(doorX + 6, doorY + 38, 4, 6);

    // 4. Placa / Letreiro de Madeira com Correntes
    const signW = Math.min(160, width - 40);
    const signH = 18;
    const signX = x + (width - signW) / 2;
    const signY = y + 4;

    ctx.fillStyle = '#212121';
    ctx.fillRect(signX, signY, signW, signH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(signX, signY, signW, signH);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(data.name, signX + signW / 2, signY + 12);
  }

  drawWroughtIronLamp(ctx, lx, ly) {
    // Poste de Ferro Forjado Preto 16-bit
    ctx.fillStyle = '#141414';
    ctx.fillRect(lx, ly + 20, 4, 90);      // Haste vertical
    ctx.fillRect(lx - 4, ly + 104, 12, 6); // Base do poste

    // Suporte arqueado ornamentado da lanterna
    ctx.fillRect(lx - 6, ly + 16, 16, 4);
    ctx.fillRect(lx + 8, ly + 10, 4, 10);

    // Lanterna Hexagonal
    ctx.fillStyle = '#141414';
    ctx.fillRect(lx + 4, ly - 4, 12, 4);  // Chapéu
    ctx.fillRect(lx + 2, ly, 16, 2);
    ctx.fillRect(lx + 4, ly + 18, 12, 3); // Base

    // Vidro Iluminado com Luz Quente
    ctx.fillStyle = '#fff59d';
    ctx.fillRect(lx + 4, ly + 2, 12, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(lx + 8, ly + 4, 4, 10);

    // Halo Luminoso Suave em Degradê Radial
    const halo = ctx.createRadialGradient(lx + 10, ly + 10, 2, lx + 10, ly + 10, 36);
    halo.addColorStop(0, 'rgba(255, 235, 59, 0.45)');
    halo.addColorStop(1, 'rgba(255, 235, 59, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(lx + 10, ly + 10, 36, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- CAMADA 3: CALÇADÃO DE CANTARIA E MAR ANIMADO COM CRISTAS DE ESPUMA ---
  render(ctx, cameraX, dt = 0.016) {
    this.waterTime += dt * 4.5;
    this.updateLivingWorld(dt);

    const bgPng1 = this.renderer && this.renderer.ext && this.renderer.ext('bg_buildings');
    const bgPng2 = this.renderer && this.renderer.ext && this.renderer.ext('bg_buildings_2');
    const fgPng = this.renderer && this.renderer.ext && (this.renderer.ext('fg_promenade') || this.renderer.ext('fg_promenade_strip'));
    const groundY = this.height - 160;

    if (bgPng1 && fgPng) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;

      // 1. Cenário Hi-Bit Alternado: Vila Costeira + Prédios Tech / Coworking / Escritórios (0.4x parallax)
      const bgH = 540;
      const bgW = Math.round(bgPng1.width * (bgH / bgPng1.height));
      const parallaxX = cameraX * 0.4;
      const startIdx = Math.floor(parallaxX / bgW) - 1;
      const endIdx = Math.ceil((parallaxX + this.width) / bgW) + 1;

      for (let idx = startIdx; idx <= endIdx; idx++) {
        const drawX = Math.floor(idx * bgW - parallaxX);
        const img = (Math.abs(idx) % 2 === 1 && bgPng2) ? bgPng2 : bgPng1;
        ctx.drawImage(img, drawX, 0, bgW + 1, bgH);
      }

      // 2. Vida no Céu e Chaminés (Nuvens móveis, Gaivotas batendo asas e Fumaça)
      this.renderSkyAndSmoke(ctx);

      // 3. Calçadão do Cais e Mar Azul (1.0x parallax)
      const fgTop = 510;
      const fgH = this.height - fgTop; // 210px
      const fgW = Math.round(fgPng.width * (fgH / fgPng.height));
      const offFg = (cameraX * 1.0) % fgW;
      for (let x = -offFg - fgW; x < this.width + fgW; x += fgW) {
        ctx.drawImage(fgPng, Math.floor(x), fgTop, fgW + 1, fgH);
      }

      // 4. Vida no Calçadão: Pessoas andando, Devs, Cachorro, Gato, Pombos e Ciclista!
      this.renderWalkersAndAnimals(ctx, cameraX);

      // 5. Vida no Mar: Barcos a vela, Peixes saltando e Cristas de Espuma Branca
      this.renderOceanLife(ctx, cameraX);

      ctx.restore();
      return;
    }
    if (bgPng1) { this.renderPierAndOcean(ctx, cameraX); return; }

    // 1. Fundo (Céu e Cidadela - 0.12x parallax)
    const bgOffset = (cameraX * 0.12) % 1600;
    ctx.drawImage(this.bgLayer, -bgOffset, 0);
    if (bgOffset > 1600 - this.width) {
      ctx.drawImage(this.bgLayer, -bgOffset + 1600, 0);
    }

    // 2. Meio (Sobrados Geminados da Vila Costeira - 0.45x parallax)
    const midOffset = (cameraX * 0.45) % 2800;
    ctx.drawImage(this.midLayer, -midOffset, 0);
    if (midOffset > 2800 - this.width) {
      ctx.drawImage(this.midLayer, -midOffset + 2800, 0);
    }

    // 3. Frente / Calçadão do Cais e Mar Animado (1.0x)
    this.renderPierAndOcean(ctx, cameraX);
  }

  renderPierAndOcean(ctx, cameraX) {
    const groundY = this.height - 160;
    const waterY = this.height - 84;

    // 1. Piso do Calçadão em Perspectiva com Lajotas de Cantaria
    ctx.fillStyle = '#616161';
    ctx.fillRect(0, groundY, this.width, 32);

    // Ladrilhos cinzas alternados com juntas de pedra
    const tileW = 32;
    const tileH = 16;
    const tileOffX = cameraX % tileW;

    for (let ty = groundY; ty < groundY + 32; ty += tileH) {
      const isShifted = Math.floor((ty - groundY) / tileH) % 2 === 0;
      for (let tx = -tileOffX - (isShifted ? 16 : 0); tx < this.width + 32; tx += tileW) {
        ctx.fillStyle = '#757575';
        ctx.fillRect(tx, ty, tileW - 2, tileH - 2);
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(tx, ty, tileW - 2, 2);
        ctx.fillStyle = '#424242';
        ctx.fillRect(tx, ty + tileH - 3, tileW - 2, 1);
      }
    }

    // 2. Muro do Cais de Pedra (Sea Wall)
    ctx.fillStyle = '#37474f';
    ctx.fillRect(0, groundY + 32, this.width, waterY - (groundY + 32));

    // Blocos maciços do paredão com musgo verde e sombras
    const blockW = 48;
    const blockH = 12;
    const wallOffX = cameraX % blockW;

    for (let wy = groundY + 32; wy < waterY; wy += blockH) {
      for (let wx = -wallOffX; wx < this.width + blockW; wx += blockW) {
        ctx.fillStyle = '#455a64';
        ctx.fillRect(wx, wy, blockW - 2, blockH - 2);
        ctx.fillStyle = '#263238';
        ctx.fillRect(wx, wy + blockH - 3, blockW - 2, 1);
        // Musgo na junção com o mar
        if (wy >= waterY - 14) {
          ctx.fillStyle = '#2e7d32';
          ctx.fillRect(wx, wy + 4, blockW - 2, 4);
        }
      }
    }

    // 3. Cabeços de Amarração de Ferro Forjado (`Bollards`) e Arbustos Decorativos
    const bollardSpacing = 160;
    const bollardOffX = cameraX % bollardSpacing;

    for (let bx = -bollardOffX; bx < this.width + bollardSpacing; bx += bollardSpacing) {
      // Cabeço de Amarração
      ctx.fillStyle = '#1b1b1b';
      ctx.fillRect(bx + 40, groundY + 12, 12, 20);
      ctx.fillRect(bx + 36, groundY + 10, 20, 6); // Topo do cabeço
      ctx.fillStyle = '#424242';
      ctx.fillRect(bx + 38, groundY + 10, 16, 2);

      // Corda enrolada no cabeço
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(bx + 38, groundY + 18, 16, 4);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(bx + 38, groundY + 22, 16, 2);

      // Pequeno vaso de arbusto decorativo
      ctx.fillStyle = '#795548';
      ctx.fillRect(bx + 110, groundY + 14, 16, 16);
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(bx + 106, groundY + 2, 24, 14);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(bx + 110, groundY - 2, 16, 6);
    }

    // 4. MAR ANIMADO 16-BIT EM MÚLTIPLOS TONS COM CRISTAS DE ESPUMA
    // Camada de Água Profunda (Tons ricos: #0a2a54 -> #1b4d89 -> #2c6eb5 -> #5ce1e6)
    ctx.fillStyle = '#0a2a54';
    ctx.fillRect(0, waterY, this.width, this.height - waterY);

    ctx.fillStyle = '#1b4d89';
    ctx.fillRect(0, waterY + 16, this.width, this.height - (waterY + 16));

    ctx.fillStyle = '#2c6eb5';
    ctx.fillRect(0, waterY + 36, this.width, this.height - (waterY + 36));

    // Cristas de Espuma Branca em Pixel Art Animadas Frame a Frame
    const waveCycle = Math.floor(this.waterTime * 4) % 4;

    for (let x = 0; x < this.width + 16; x += 16) {
      const waveShift = Math.sin(this.waterTime + (x + cameraX) * 0.035) * 5;
      const cy = waterY + waveShift;

      // Camada azul turquesa rasa
      ctx.fillStyle = '#5ce1e6';
      ctx.fillRect(x, cy, 16, 6);

      // Cristas de espuma branca pixelada com variação de frames
      ctx.fillStyle = '#ffffff';
      if (waveCycle === 0) {
        ctx.fillRect(x, cy - 2, 12, 3);
        ctx.fillRect(x + 4, cy + 2, 6, 2);
      } else if (waveCycle === 1) {
        ctx.fillRect(x + 2, cy - 3, 14, 3);
        ctx.fillRect(x + 8, cy + 2, 8, 2);
      } else if (waveCycle === 2) {
        ctx.fillRect(x + 4, cy - 2, 12, 3);
        ctx.fillRect(x + 2, cy + 3, 6, 2);
      } else {
        ctx.fillRect(x + 1, cy - 1, 14, 2);
        ctx.fillRect(x + 6, cy + 2, 6, 2);
      }

      // Reflexos cintilantes na água
      if ((x + Math.floor(this.waterTime * 10)) % 64 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, cy + 14, 18, 2);
        ctx.fillRect(x + 8, cy + 22, 12, 2);
      }
    }
  }

  // --- ELEMENTOS VIVOS DO CENÁRIO (NUVENS, PÁSSAROS, PESSOAS, ANIMAIS, BARCOS) ---
  renderSkyAndSmoke(ctx) {
    ctx.save();
    // 1. Nuvens fofinhas passando no céu
    for (const c of this.clouds) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(Math.floor(c.x), Math.floor(c.y), c.w, 14);
      ctx.fillRect(Math.floor(c.x + 12), Math.floor(c.y - 8), c.w - 24, 10);
      ctx.fillStyle = 'rgba(230, 244, 255, 0.35)';
      ctx.fillRect(Math.floor(c.x + 6), Math.floor(c.y + 10), c.w - 12, 6);
    }

    // 2. Gaivotas batendo asas
    for (const b of this.birds) {
      const wingUp = Math.sin(b.phase) > 0;
      const bx = Math.floor(b.x);
      const by = Math.floor(b.y);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx - 2, by, 4, 2); // corpo
      if (wingUp) {
        ctx.fillRect(bx - 6, by - 3, 4, 2);
        ctx.fillRect(bx + 2, by - 3, 4, 2);
      } else {
        ctx.fillRect(bx - 6, by + 2, 4, 2);
        ctx.fillRect(bx + 2, by + 2, 4, 2);
      }
    }

    // 3. Fumaça das chaminés
    for (const s of this.smokeParticles) {
      const alpha = (s.life / s.maxLife) * 0.45;
      ctx.fillStyle = `rgba(240, 240, 245, ${alpha.toFixed(2)})`;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.floor(s.size), Math.floor(s.size * 0.8));
    }
    ctx.restore();
  }

  renderWalkersAndAnimals(ctx, cameraX) {
    const walkY = 532; // Parte traseira do calçadão (atrás do jogador)

    ctx.save();
    for (const w of this.walkers) {
      const sx = Math.floor(w.x - cameraX);
      if (sx < -120 || sx > this.width + 120) continue;

      const step = Math.sin(w.phase);
      const bob = Math.abs(step) * 2;

      if (w.type === 'cyclist') {
        // Ciclista pedalando pela rua
        const wheelRot = Math.floor(this.worldTime * 15) % 2;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(sx - 16, walkY + 2, 32, 4);

        // Rodas
        ctx.strokeStyle = '#141013';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx - 10, walkY - 4, 6, 0, Math.PI * 2);
        ctx.arc(sx + 10, walkY - 4, 6, 0, Math.PI * 2);
        ctx.stroke();

        // Quadro da bicicleta
        ctx.fillStyle = '#ff5252';
        ctx.fillRect(sx - 10, walkY - 12, 20, 3);
        // Ciclista
        ctx.fillStyle = w.shirt;
        ctx.fillRect(sx - 5, walkY - 26 + wheelRot, 10, 14);
        ctx.fillStyle = '#ffccbc';
        ctx.fillRect(sx - 3, walkY - 34 + wheelRot, 8, 8);
        ctx.fillStyle = '#ffd700'; // Capacete
        ctx.fillRect(sx - 4, walkY - 36 + wheelRot, 10, 4);
      } else if (w.type === 'cat') {
        // Gatinho caminhando pela mureta do cais
        const tailWag = Math.sin(this.worldTime * 6 + w.x) * 3;
        ctx.fillStyle = w.color;
        ctx.fillRect(sx - 6, walkY - 8 - bob * 0.5, 12, 6);
        ctx.fillRect(sx + (w.dir === 1 ? 4 : -8), walkY - 13 - bob * 0.5, 6, 6); // cabeça
        ctx.fillRect(sx + (w.dir === 1 ? 5 : -7), walkY - 15 - bob * 0.5, 2, 2); // orelha
        // Rabo
        ctx.fillRect(sx + (w.dir === 1 ? -9 : 6), walkY - 11 + tailWag * 0.5, 3, 5);
        // Patinhas
        ctx.fillRect(sx - 4 + step * 2, walkY - 2, 2, 3);
        ctx.fillRect(sx + 2 - step * 2, walkY - 2, 2, 3);
      } else if (w.type === 'pigeon_flock') {
        // Pombos bicando o chão e saltitando
        for (let p = 0; p < 3; p++) {
          const px = sx + p * 18;
          const hop = Math.abs(Math.sin(this.worldTime * 5 + p)) * 3;
          ctx.fillStyle = '#90a4ae';
          ctx.fillRect(px, walkY - 5 - hop, 6, 4);
          ctx.fillStyle = '#eceff1';
          ctx.fillRect(px + 4, walkY - 7 - hop, 3, 3);
        }
      } else {
        // Pedestre / Dev caminhando
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(sx - 6, walkY + 2, 12, 3);

        // Pernas animadas
        ctx.fillStyle = '#263238';
        ctx.fillRect(sx - 3 + step * 3, walkY - 9, 3, 10);
        ctx.fillRect(sx + 1 - step * 3, walkY - 9, 3, 10);

        // Tronco / Camisa
        ctx.fillStyle = w.shirt;
        ctx.fillRect(sx - 5, walkY - 21 - bob, 10, 12);

        // Cabeça + Cabelo
        ctx.fillStyle = '#ffccbc';
        ctx.fillRect(sx - 4, walkY - 29 - bob, 8, 8);
        ctx.fillStyle = w.hair;
        ctx.fillRect(sx - 4, walkY - 31 - bob, 8, 4);

        // Acessório (Café, Laptop ou Cachorro na coleira!)
        if (w.type === 'dev_coffee') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx + (w.dir === 1 ? 6 : -8), walkY - 17 - bob, 4, 5);
        } else if (w.type === 'dev_laptop') {
          ctx.fillStyle = '#b0bec5';
          ctx.fillRect(sx + (w.dir === 1 ? 5 : -9), walkY - 16 - bob, 6, 5);
        } else if (w.type === 'dog_walker') {
          const dogX = sx + w.dir * 22;
          const dogStep = Math.sin(w.phase * 1.4) * 2;
          // Coleira
          ctx.strokeStyle = '#ffeb3b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx + w.dir * 4, walkY - 14 - bob);
          ctx.lineTo(dogX, walkY - 8);
          ctx.stroke();

          // Cachorrinho trotando
          ctx.fillStyle = '#d7ccc8';
          ctx.fillRect(dogX - 6, walkY - 9 - Math.abs(dogStep), 12, 6);
          ctx.fillRect(dogX + (w.dir === 1 ? 4 : -8), walkY - 13 - Math.abs(dogStep), 6, 5); // cabeça
          ctx.fillStyle = '#8d6e63';
          ctx.fillRect(dogX - 5 + dogStep, walkY - 3, 2, 4);
          ctx.fillRect(dogX + 3 - dogStep, walkY - 3, 2, 4);
        }
      }
    }
    ctx.restore();
  }

  renderOceanLife(ctx, cameraX) {
    ctx.save();
    // 1. Barcos a vela deslizando pelo mar
    for (const boat of this.boats) {
      const bx = Math.floor(boat.x - cameraX * 0.7);
      if (bx < -80 || bx > this.width + 80) continue;
      const bob = Math.sin(this.waterTime * 0.8 + boat.x * 0.02) * 2;
      const by = Math.floor(boat.y + bob);

      // Casco
      ctx.fillStyle = boat.hullColor;
      ctx.fillRect(bx - 16, by, 32, 7);
      ctx.fillRect(bx - 12, by + 7, 24, 3);
      // Mastro
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(bx - 1, by - 24, 2, 24);
      // Vela triangular
      ctx.fillStyle = boat.sailColor;
      ctx.beginPath();
      ctx.moveTo(bx + 1, by - 23);
      ctx.lineTo(bx + (boat.dir === 1 ? 16 : -16), by - 4);
      ctx.lineTo(bx + 1, by - 4);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Peixes/Golfinhos saltando da água com splash
    for (const f of this.jumpingFish) {
      if (!f.active) continue;
      const fx = Math.floor(f.x - cameraX + f.t * 48);
      if (fx < -40 || fx > this.width + 40) continue;
      const arc = Math.sin(f.t * Math.PI) * 34;
      const fy = Math.floor(668 - arc);

      ctx.fillStyle = '#4dd0e1';
      ctx.fillRect(fx - 5, fy - 3, 10, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx - 2, fy - 2, 4, 2);

      // Respingos brancos ao entrar/sair da água
      if (f.t < 0.2 || f.t > 0.8) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(fx - 8, 666, 4, 3);
        ctx.fillRect(fx + 5, 665, 4, 4);
      }
    }

    // 3. Cristas de Espuma Branca Pixelada Animadas no Mar
    const waterY = this.height - 78;
    const waveCycle = Math.floor(this.waterTime) % 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let x = 0; x < this.width + 32; x += 32) {
      const waveShift = Math.sin(this.waterTime * 0.5 + (x + cameraX) * 0.03) * 3;
      const cy = waterY + waveShift;
      if (waveCycle === 0) {
        ctx.fillRect(x, cy, 18, 2);
        ctx.fillRect(x + 4, cy + 8, 10, 2);
      } else if (waveCycle === 1) {
        ctx.fillRect(x + 2, cy - 1, 22, 2);
        ctx.fillRect(x + 8, cy + 9, 12, 2);
      } else if (waveCycle === 2) {
        ctx.fillRect(x + 4, cy, 18, 2);
        ctx.fillRect(x + 2, cy + 7, 8, 2);
      } else {
        ctx.fillRect(x + 1, cy + 1, 20, 2);
        ctx.fillRect(x + 6, cy + 8, 12, 2);
      }
    }
    ctx.restore();
  }
}
