/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Level1.js - Definição de dados e entidades da Fase 1 (3 Zonas + Boss)
 */

import { Mentor } from '../entities/Mentor.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';

export function buildLevel1(levelWidth, height) {
  const groundY = height - 160;
  const platforms = [];
  const enemies = [];
  const mentors = [];
  const collectibles = [];
  const checkpoints = [];
  const hazards = [];
  const crates = [];
  const pows = [];

  // --- CHÃO CONTÍNUO & PAREDES ---
  platforms.push({ x: 0, y: groundY, width: levelWidth, height: 160 });
  platforms.push({ x: -30, y: 0, width: 30, height });
  platforms.push({ x: levelWidth, y: 0, width: 30, height });

  // --- ZONA 1: A VILA DA PROCRASTINAÇÃO (0 - 1600) ---
  platforms.push({ x: 300, y: groundY - 65, width: 120, height: 20 });
  platforms.push({ x: 480, y: groundY - 125, width: 140, height: 20 });
  platforms.push({ x: 700, y: groundY - 75, width: 160, height: 20 });
  platforms.push({ x: 1000, y: groundY - 80, width: 140, height: 20 });

  collectibles.push({ type: 'coffee', x: 340, y: groundY - 100, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 540, y: groundY - 160, width: 24, height: 24 });
  collectibles.push({ type: 'coffee', x: 1050, y: groundY - 120, width: 24, height: 24 });

  enemies.push(new Enemy('bug', 450, groundY - 30));
  enemies.push(new Enemy('bug', 850, groundY - 30));
  enemies.push(new Enemy('bug', 1200, groundY - 30));

  mentors.push(new Mentor(600, groundY - 56, 'mentor_1', {
    lines: [
      'Bem-vindo, jovem aprendiz! Vejo a centelha do código em seus olhos.',
      'A jornada até sua primeira vaga é cheia de armadilhas como a Procrastinação e o Medo.',
      'Para avançar, você deve escolher onde focar sua energia inicial:'
    ],
    choices: [
      { label: '1. Focar em Fundamentos e Lógica (+20% Defesa)', buff: 'defense' },
      { label: '2. Construir Projetos Práticos (+20% Ataque)', buff: 'attack' }
    ]
  }));

  // --- ZONA 2: FLORESTA DOS TUTORIAIS INFINITOS (1600 - 3400) ---
  checkpoints.push({ x: 1620, y: groundY - 64, width: 32, height: 64, zone: 2, label: 'Floresta dos Tutoriais', activated: false });
  platforms.push({ x: 1750, y: groundY - 80, width: 140, height: 20 });
  platforms.push({ x: 1980, y: groundY - 140, width: 140, height: 20 });
  platforms.push({ x: 2200, y: groundY - 85, width: 180, height: 20 });
  platforms.push({
    x: 2550, y: groundY - 130, width: 150, height: 20,
    moving: { axis: 'y', baseX: 2550, baseY: groundY - 130, range: 40, speed: 1.8, phase: 0, dx: 0, dy: 0 }
  });
  platforms.push({ x: 2850, y: groundY - 70, width: 160, height: 20 });

  hazards.push({ x: 1990, y: groundY - 14, width: 110, height: 14, label: 'BURNOUT' });
  hazards.push({ x: 2565, y: groundY - 14, width: 120, height: 14, label: 'DEADLINE' });

  enemies.push(new Enemy('ghost', 1800, 280));
  enemies.push(new Enemy('golem', 2250, groundY - 50));
  enemies.push(new Enemy('ghost', 2600, 260));
  enemies.push(new Enemy('golem', 3000, groundY - 50));

  collectibles.push({ type: 'book', x: 2030, y: groundY - 175, width: 24, height: 24 });
  collectibles.push({ type: 'coffee', x: 2600, y: groundY - 165, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 3100, y: groundY - 50, width: 24, height: 24 });

  // Plataforma Secreta Alta (Zona 2 - exige Pulo Duplo + Dash)
  platforms.push({ x: 2740, y: groundY - 215, width: 110, height: 20 });
  collectibles.push({ type: 'book', x: 2782, y: groundY - 252, width: 24, height: 24, xpBonus: 120 });

  mentors.push(new Mentor(2400, groundY - 56, 'mentor_2', {
    lines: [
      'Impressionante! Você superou o ciclo dos tutoriais sem fim!',
      "Atenção aos Golems de '5 Anos de Experiência': o escudo frontal deles é pura intimidação!",
      'Use o seu DASH (tecla C ou Shift) para passar pelas costas deles e atacar o ponto cego!',
      'Tome esta bênção mística: o lendário PULO DUPLO!'
    ],
    grantDoubleJump: true
  }));

  // --- ZONA 3: A CIDADELA CORPORATIVA & ARENA DO RH (3400 - 5200) ---
  checkpoints.push({ x: 3420, y: groundY - 64, width: 32, height: 64, zone: 3, label: 'Cidadela Corporativa', activated: false });
  platforms.push({ x: 3600, y: groundY - 90, width: 160, height: 20 });
  platforms.push({
    x: 3880, y: groundY - 140, width: 160, height: 20,
    moving: { axis: 'x', baseX: 3880, baseY: groundY - 140, range: 75, speed: 1.5, phase: 0, dx: 0, dy: 0 }
  });
  platforms.push({ x: 4180, y: groundY - 75, width: 180, height: 20 });

  hazards.push({ x: 3895, y: groundY - 14, width: 130, height: 14, label: 'BUG CRÍTICO' });
  checkpoints.push({ x: 4420, y: groundY - 64, width: 32, height: 64, zone: 3, label: 'Arena do ATS-9000', activated: false });

  enemies.push(new Enemy('drone', 3700, 240));
  enemies.push(new Enemy('drone', 4000, 240));
  enemies.push(new Enemy('golem', 3950, groundY - 50));

  collectibles.push({ type: 'coffee', x: 3650, y: groundY - 130, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 4230, y: groundY - 110, width: 24, height: 24 });

  // Plataforma Secreta Alta (Zona 3 - Café Dourado antes do Boss)
  platforms.push({ x: 3740, y: groundY - 220, width: 110, height: 20 });
  collectibles.push({ type: 'coffee', x: 3782, y: groundY - 256, width: 24, height: 24, healBonus: 60 });

  // Plataformas Táticas na Arena do ATS-9000 (leitura vertical estilo Metal Slug)
  platforms.push({ x: 4470, y: groundY - 95, width: 135, height: 20 });
  platforms.push({ x: 4645, y: groundY - 165, width: 120, height: 20 });

  // Caixas Destrutíveis (Legacy Crates com drops estilo Metal Slug)
  crates.push({ x: 380, y: groundY - 34, width: 34, height: 34, hp: 1, destroyed: false, label: 'LEGACY', drop: 'pickup_f' });
  crates.push({ x: 930, y: groundY - 34, width: 34, height: 34, hp: 1, destroyed: false, label: 'PDFs', drop: 'coffee' });
  crates.push({ x: 1860, y: groundY - 34, width: 34, height: 34, hp: 1, destroyed: false, label: 'GIT', drop: 'pickup_g' });
  crates.push({ x: 2910, y: groundY - 104, width: 34, height: 34, hp: 1, destroyed: false, label: 'NPM', drop: 'pickup_f' });
  crates.push({ x: 3670, y: groundY - 124, width: 34, height: 34, hp: 1, destroyed: false, label: 'DEPLOY', drop: 'pickup_g' });
  crates.push({ x: 4250, y: groundY - 109, width: 34, height: 34, hp: 1, destroyed: false, label: 'HOTFIX', drop: 'coffee' });

  // Prisioneiros POWs ("Devs Presos no Loop de Tutoriais")
  pows.push({ x: 520, y: groundY - 165, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_dev', quip: 'Saí do tutorial infinito!', drop: 'pickup_f' });
  pows.push({ x: 2260, y: groundY - 125, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_woman', quip: 'Valeu por quebrar o Golem!', drop: 'pickup_g' });
  pows.push({ x: 2770, y: groundY - 255, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_commuter', quip: 'Commit salvo! Toma café!', drop: 'coffee' });
  pows.push({ x: 4510, y: groundY - 135, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_dev', quip: 'Derrote o ATS-9000!', drop: 'pickup_f' });

  const boss = new Boss(4750, groundY - 130);

  return { platforms, enemies, mentors, collectibles, checkpoints, hazards, crates, pows, boss };
}
