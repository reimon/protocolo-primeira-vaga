/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Level1.js - Definição de dados e entidades da Fase 1 (3 Zonas Expandidas + Boss)
 */

import { Mentor } from '../entities/Mentor.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';

export const LEVEL1_CONFIG = {
  width: 9600,
  zone2Start: 2800,
  zone3Start: 6000,
  bossTriggerX: 8800,
  bossSpawnX: 9150
};

export function buildLevel1(levelWidth = LEVEL1_CONFIG.width, height = 720) {
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

  // =========================================================================
  // ZONA 1: A VILA DA PROCRASTINAÇÃO (0 - 2800)
  // =========================================================================
  platforms.push({ x: 300, y: groundY - 65, width: 130, height: 20 });
  platforms.push({ x: 480, y: groundY - 125, width: 150, height: 20 });
  platforms.push({ x: 780, y: groundY - 75, width: 170, height: 20 });
  platforms.push({ x: 1060, y: groundY - 130, width: 150, height: 20 });
  platforms.push({ x: 1360, y: groundY - 75, width: 160, height: 20 });
  platforms.push({ x: 1560, y: groundY - 125, width: 150, height: 20 });
  platforms.push({ x: 1850, y: groundY - 80, width: 160, height: 20 });
  platforms.push({
    x: 2070, y: groundY - 135, width: 140, height: 20,
    moving: { axis: 'y', baseX: 2070, baseY: groundY - 135, range: 44, speed: 1.7, phase: 0, dx: 0, dy: 0 }
  });
  platforms.push({ x: 2245, y: groundY - 205, width: 115, height: 20 }); // Secreta Zona 1
  platforms.push({ x: 2330, y: groundY - 85, width: 170, height: 20 });

  hazards.push({ x: 1580, y: groundY - 14, width: 110, height: 14, label: 'DISTRAÇÃO' });

  collectibles.push({ type: 'coffee', x: 345, y: groundY - 102, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 545, y: groundY - 162, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 1120, y: groundY - 168, width: 24, height: 24 });
  collectibles.push({ type: 'coffee', x: 1620, y: groundY - 162, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 2290, y: groundY - 242, width: 24, height: 24, xpBonus: 100 });
  collectibles.push({ type: 'coffee', x: 2455, y: groundY - 122, width: 24, height: 24 });

  enemies.push(new Enemy('bug', 450, groundY - 38));
  enemies.push(new Enemy('procrastination', 920, groundY - 48));
  enemies.push(new Enemy('bug', 1260, groundY - 38));
  enemies.push(new Enemy('blonde_glasses', 1500, groundY - 52));
  enemies.push(new Enemy('procrastination', 1750, groundY - 48));
  enemies.push(new Enemy('bug', 2040, groundY - 38));
  enemies.push(new Enemy('blonde_tongue', 2160, groundY - 52));
  enemies.push(new Enemy('procrastination', 2520, groundY - 48));
  enemies.push(new Enemy('bug', 2650, groundY - 38));

  crates.push({ kind: 'crate', x: 380, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, label: 'LEGACY', drop: 'pickup_f' });
  crates.push({ kind: 'barrel', x: 850, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, explosive: true, label: 'HOTFIX-TNT', drop: null });
  crates.push({ kind: 'crate', x: 1030, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, label: 'PDFs', drop: 'coffee' });
  crates.push({ kind: 'server', x: 1440, y: groundY - 42, width: 36, height: 42, hp: 2, maxHp: 2, hitTimer: 0, destroyed: false, label: 'PROXY', drop: 'book' });
  crates.push({ kind: 'barrel', x: 2215, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, explosive: true, label: 'REELS-TNT', drop: null });
  crates.push({ kind: 'crate', x: 2270, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, label: 'SOFÁ', drop: 'pickup_f' });

  pows.push({ x: 515, y: groundY - 165, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_dev', quip: 'Saí do tutorial infinito!', drop: 'pickup_f' });
  pows.push({ x: 2390, y: groundY - 125, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_commuter', quip: 'Larguei o scroll infinito!', drop: 'coffee' });

  mentors.push(new Mentor(640, groundY - 56, 'mentor_1', {
    lines: [
      'Bem-vindo, jovem aprendiz! Vejo a centelha do código em seus olhos.',
      'A jornada até sua primeira vaga é cheia de armadilhas como a Procrastinação e Bugs em Produção.',
      'Para avançar, você deve escolher onde focar sua energia inicial:'
    ],
    choices: [
      { label: '1. Focar em Fundamentos e Lógica (+20% Defesa)', buff: 'defense' },
      { label: '2. Construir Projetos Práticos (+20% Ataque)', buff: 'attack' }
    ]
  }));

  // =========================================================================
  // ZONA 2: FLORESTA DOS TUTORIAIS INFINITOS (2800 - 6000)
  // =========================================================================
  checkpoints.push({ x: 2820, y: groundY - 64, width: 32, height: 64, zone: 2, label: 'Floresta dos Tutoriais', activated: false });
  platforms.push({ x: 2940, y: groundY - 80, width: 150, height: 20 });
  platforms.push({ x: 3180, y: groundY - 140, width: 150, height: 20 });
  platforms.push({ x: 3420, y: groundY - 85, width: 180, height: 20 });
  platforms.push({
    x: 3860, y: groundY - 130, width: 150, height: 20,
    moving: { axis: 'y', baseX: 3860, baseY: groundY - 130, range: 40, speed: 1.8, phase: 0, dx: 0, dy: 0 }
  });
  platforms.push({ x: 4070, y: groundY - 220, width: 120, height: 20 }); // Secreta Zona 2 (Pulo Duplo)
  platforms.push({ x: 4220, y: groundY - 80, width: 170, height: 20 });
  platforms.push({
    x: 4520, y: groundY - 140, width: 160, height: 20,
    moving: { axis: 'x', baseX: 4520, baseY: groundY - 140, range: 70, speed: 1.4, phase: 0, dx: 0, dy: 0 }
  });
  platforms.push({ x: 4920, y: groundY - 90, width: 180, height: 20 });
  platforms.push({ x: 5140, y: groundY - 150, width: 150, height: 20 });
  platforms.push({ x: 5620, y: groundY - 80, width: 170, height: 20 });

  hazards.push({ x: 3190, y: groundY - 14, width: 115, height: 14, label: 'BURNOUT' });
  hazards.push({ x: 3875, y: groundY - 14, width: 120, height: 14, label: 'DEADLINE' });
  hazards.push({ x: 5150, y: groundY - 14, width: 130, height: 14, label: 'ESCOPO INFINITO' });

  enemies.push(new Enemy('ghost', 3120, 290));
  enemies.push(new Enemy('blonde_tongue', 3340, groundY - 52));
  enemies.push(new Enemy('golem', 3560, groundY - 72));
  enemies.push(new Enemy('ghost', 3960, 270));
  enemies.push(new Enemy('interviewer', 4380, groundY - 54));
  enemies.push(new Enemy('blonde_glasses', 4620, groundY - 52));
  enemies.push(new Enemy('golem', 4720, groundY - 72));
  enemies.push(new Enemy('bug', 4860, groundY - 38));
  enemies.push(new Enemy('blonde_tongue', 5220, groundY - 52));
  enemies.push(new Enemy('ghost', 5360, 280));
  enemies.push(new Enemy('interviewer', 5500, groundY - 54));
  enemies.push(new Enemy('golem', 5820, groundY - 72));

  collectibles.push({ type: 'book', x: 3240, y: groundY - 178, width: 24, height: 24 });
  collectibles.push({ type: 'coffee', x: 3925, y: groundY - 168, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 4120, y: groundY - 256, width: 24, height: 24, xpBonus: 140 });
  collectibles.push({ type: 'coffee', x: 4990, y: groundY - 128, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 5200, y: groundY - 188, width: 24, height: 24 });

  crates.push({ kind: 'armored_crate', x: 3000, y: groundY - 34, width: 34, height: 34, hp: 2, maxHp: 2, hitTimer: 0, destroyed: false, label: 'MONOLITO', drop: 'pickup_g' });
  crates.push({ kind: 'barrel', x: 4250, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, explosive: true, label: 'PROD-DB', drop: null });
  crates.push({ kind: 'server', x: 4340, y: groundY - 42, width: 36, height: 42, hp: 2, maxHp: 2, hitTimer: 0, destroyed: false, label: 'CI/CD', drop: 'coffee' });
  crates.push({ kind: 'crate', x: 4580, y: groundY - 174, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, label: 'NPM', drop: 'pickup_f' });
  crates.push({ kind: 'armored_crate', x: 5030, y: groundY - 124, width: 34, height: 34, hp: 2, maxHp: 2, hitTimer: 0, destroyed: false, label: 'TECH-DEBT', drop: 'pickup_g' });
  crates.push({ kind: 'barrel', x: 5660, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, explosive: true, label: 'HOTFIX-2', drop: null });
  crates.push({ kind: 'crate', x: 5730, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, label: 'README', drop: 'coffee' });

  pows.push({ x: 3480, y: groundY - 125, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_woman', quip: 'Valeu por quebrar o Porteiro!', drop: 'pickup_g' });
  pows.push({ x: 4100, y: groundY - 260, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_dev', quip: 'Commit salvo! Toma café!', drop: 'coffee' });

  mentors.push(new Mentor(3720, groundY - 56, 'mentor_2', {
    lines: [
      'Impressionante! Você superou o ciclo dos tutoriais sem fim!',
      "Atenção aos Porteiros de '5 Anos de Experiência': a barreira frontal deles é pura intimidação!",
      'Use o seu DASH (tecla C ou Shift) para passar pelas costas deles ou jogue uma Git Bomb [G]!',
      'Tome esta bênção mística: o lendário PULO DUPLO!'
    ],
    grantDoubleJump: true
  }));

  // =========================================================================
  // ZONA 3: A CIDADELA CORPORATIVA & ARENA DO RH (6000 - 9600)
  // =========================================================================
  checkpoints.push({ x: 6020, y: groundY - 64, width: 32, height: 64, zone: 3, label: 'Cidadela Corporativa', activated: false });
  platforms.push({ x: 6180, y: groundY - 90, width: 170, height: 20 });
  platforms.push({ x: 6320, y: groundY - 225, width: 115, height: 20 }); // Secreta Zona 3 (Café Dourado)
  platforms.push({
    x: 6460, y: groundY - 145, width: 160, height: 20,
    moving: { axis: 'x', baseX: 6460, baseY: groundY - 145, range: 75, speed: 1.5, phase: 0, dx: 0, dy: 0 }
  });
  platforms.push({ x: 6900, y: groundY - 85, width: 185, height: 20 });
  platforms.push({
    x: 7340, y: groundY - 135, width: 170, height: 20,
    moving: { axis: 'y', baseX: 7340, baseY: groundY - 135, range: 40, speed: 1.75, phase: 0, dx: 0, dy: 0 }
  });
  platforms.push({ x: 7530, y: groundY - 100, width: 160, height: 20 });
  platforms.push({ x: 7940, y: groundY - 80, width: 180, height: 20 });
  platforms.push({ x: 8420, y: groundY - 120, width: 150, height: 20 });

  hazards.push({ x: 6475, y: groundY - 14, width: 130, height: 14, label: 'BUG CRÍTICO' });
  hazards.push({ x: 7540, y: groundY - 14, width: 120, height: 14, label: 'LAYOFF' });

  checkpoints.push({ x: 8820, y: groundY - 64, width: 32, height: 64, zone: 3, label: 'Arena do ATS-9000', activated: false });

  enemies.push(new Enemy('drone', 6340, 240));
  enemies.push(new Enemy('golem', 6620, groundY - 72));
  enemies.push(new Enemy('drone', 6780, 240));
  enemies.push(new Enemy('blonde_glasses', 6960, groundY - 52));
  enemies.push(new Enemy('interviewer', 7120, groundY - 54));
  enemies.push(new Enemy('procrastination', 7260, groundY - 48));
  enemies.push(new Enemy('blonde_tongue', 7450, groundY - 52));
  enemies.push(new Enemy('ghost', 7660, 275));
  enemies.push(new Enemy('golem', 7820, groundY - 72));
  enemies.push(new Enemy('blonde_glasses', 8100, groundY - 52));
  enemies.push(new Enemy('drone', 8220, 240));
  enemies.push(new Enemy('interviewer', 8340, groundY - 54));

  collectibles.push({ type: 'coffee', x: 6240, y: groundY - 130, width: 24, height: 24 });
  collectibles.push({ type: 'coffee', x: 6365, y: groundY - 262, width: 24, height: 24, healBonus: 60 });
  collectibles.push({ type: 'book', x: 6970, y: groundY - 122, width: 24, height: 24 });
  collectibles.push({ type: 'book', x: 8000, y: groundY - 118, width: 24, height: 24 });
  collectibles.push({ type: 'coffee', x: 8475, y: groundY - 158, width: 24, height: 24 });

  // Plataformas Táticas na Arena do ATS-9000 (leitura vertical estilo Metal Slug)
  platforms.push({ x: 8870, y: groundY - 95, width: 135, height: 20 });
  platforms.push({ x: 9045, y: groundY - 165, width: 120, height: 20 });

  crates.push({ kind: 'crate', x: 6290, y: groundY - 124, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, label: 'PORTFÓLIO', drop: 'pickup_f' });
  crates.push({ kind: 'armored_crate', x: 6530, y: groundY - 179, width: 34, height: 34, hp: 2, maxHp: 2, hitTimer: 0, destroyed: false, label: 'DOCKER', drop: 'pickup_g' });
  crates.push({ kind: 'barrel', x: 7020, y: groundY - 34, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, explosive: true, label: 'OVERCLOCK', drop: null });
  crates.push({ kind: 'server', x: 7410, y: groundY - 177, width: 36, height: 42, hp: 2, maxHp: 2, hitTimer: 0, destroyed: false, label: 'K8S-NODE', drop: 'pickup_f' });
  crates.push({ kind: 'crate', x: 8060, y: groundY - 114, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, label: 'HOTFIX', drop: 'coffee' });
  crates.push({ kind: 'server', x: 8940, y: groundY - 42, width: 36, height: 42, hp: 2, maxHp: 2, hitTimer: 0, destroyed: false, label: 'ATS-CACHE', drop: 'pickup_g' });

  pows.push({ x: 8005, y: groundY - 120, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_woman', quip: 'Passei da triagem técnica!', drop: 'pickup_g' });
  pows.push({ x: 8910, y: groundY - 135, width: 34, height: 40, rescued: false, runTimer: 0, spriteKey: 'bg_npc_exec', quip: 'Derrote o ATS-9000!', drop: 'pickup_f' });

  const boss = new Boss(LEVEL1_CONFIG.bossSpawnX, groundY - 130);

  return { platforms, enemies, mentors, collectibles, checkpoints, hazards, crates, pows, boss };
}
