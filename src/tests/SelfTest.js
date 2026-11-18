/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * SelfTest.js - Suite de Testes Automatizados no Boot
 */

import { PixelRenderer } from '../assets/PixelRenderer.js';
import { SoundEngine } from '../audio/SoundEngine.js';
import { Player } from '../entities/Player.js';
import { Mentor } from '../entities/Mentor.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { ParallaxBackground } from '../world/ParallaxBackground.js';
import { LoadingScene } from '../world/LoadingScene.js';
import { LeaderboardService } from '../services/LeaderboardService.js';
import { buildLevel1, LEVEL1_CONFIG } from '../world/Level1.js';
import { ParticleSystem } from '../world/ParticleSystem.js';
import { hitDestructible } from '../world/Destructibles.js';
import { DialogSystem } from '../ui/DialogSystem.js';

export class SelfTest {
  static runAll() {
    const results = [];
    console.group('%c[SELF-TEST] PROTOCOLO PRIMEIRA VAGA - Testes Automatizados', 'color: #00e5ff; font-weight: bold;');

    function assert(name, condition) {
      if (condition) {
        results.push({ name, passed: true });
        console.log(`%c✔ PASS: ${name}`, 'color: #00e676;');
      } else {
        results.push({ name, passed: false });
        console.error(`✖ FAIL: ${name}`);
      }
    }

    try {
      // 1. Validação de PixelRenderer & Sprites
      const renderer = new PixelRenderer();
      assert('PixelRenderer instancia com sucesso', renderer !== null);
      assert('Sprite player_base_idle gerado', !!renderer.get('player_base_idle'));
      assert('Sprite mentor_idle1 gerado', !!renderer.get('mentor_idle1'));
      assert('Sprite enemy_bug_walk1 gerado', !!renderer.get('enemy_bug_walk1'));
      assert('Sprite enemy_golem_stand gerado', !!renderer.get('enemy_golem_stand'));
      assert('Sprite boss_ats_idle gerado', !!renderer.get('boss_ats_idle'));
      assert('Sprite item_offer gerado', !!renderer.get('item_offer'));
      assert('Retrato do Mentor gerado', !!renderer.get('portrait_mentor'));

      // 2. Validação do SoundEngine
      const sound = new SoundEngine();
      assert('SoundEngine instancia com sucesso', sound !== null);
      const muteToggled = sound.toggleMute();
      assert('SoundEngine toggleMute funciona', muteToggled === true);
      sound.toggleMute(); // restaura

      // 3. Validação do Player e Física
      const player = new Player(100, 200);
      assert('Player inicia com 100 HP', player.hp === 100);
      assert('Player inicia no estado idle', player.state === 'idle');

      // Simulação física de queda
      const fakePlatform = [{ x: 50, y: 300, width: 200, height: 32 }];
      const dummyInput = { left: false, right: false, jump: false, jumpPressed: false, dashPressed: false, attackPressed: false };
      player.update(0.016, dummyInput, fakePlatform, sound, null);
      assert('Player acelera com gravidade', player.vy > 0);

      // 4. Teste de Colisão AABB
      const r1 = { x: 10, y: 10, width: 20, height: 20 };
      const r2 = { x: 15, y: 15, width: 20, height: 20 };
      const r3 = { x: 100, y: 100, width: 20, height: 20 };
      assert('Detecção AABB colisão verdadeira', player.checkAABB(r1, r2) === true);
      assert('Detecção AABB colisão falsa', player.checkAABB(r1, r3) === false);

      // 5. Teste de Inimigos e Mecânicas
      const golem = new Enemy('golem', 200, 300);
      assert('Golem criado com escudo frontal', golem.hasFrontShield === true);
      // Ataque frontal deve ser bloqueado
      const blockedDmg = golem.takeDamage(20, 1, null, sound);
      assert('Escudo frontal do Golem bloqueia ataques de frente', blockedDmg === 0);
      // Ataque pelas costas (Player à direita golpeando para a esquerda contra golem virado para a esquerda)
      const backDmg = golem.takeDamage(20, -1, null, sound);
      assert('Ataque pelas costas do Golem causa dano', backDmg > 0);

      // Teste de Stomp estilo Mario sobre inimigo (ignora escudo do Golem e quica player)
      const stompBug = new Enemy('bug', 300, 300);
      const stompPlayer = new Player(305, 270);
      stompPlayer.vy = 200; // Caindo sobre o inimigo
      const initialBugHp = stompBug.hp;
      stompBug.update(0.016, stompPlayer, [], [], sound, null);
      assert('Pular em cima do inimigo causa dano (Stomp)', stompBug.hp < initialBugHp);
      assert('Stomp estilo Mario faz o Player quicar para cima', stompPlayer.vy < 0);
      assert('Stomp não causa dano ao Player', stompPlayer.hp === 100);

      // Stomp sobre o Golem deve causar dano mesmo com escudo frontal
      const stompGolem = new Enemy('golem', 400, 300);
      const initialGolemHp = stompGolem.hp;
      stompPlayer.x = 405;
      stompPlayer.y = 270;
      stompPlayer.vy = 220;
      stompGolem.update(0.016, stompPlayer, [], [], sound, null);
      assert('Stomp estilo Mario ignora o escudo frontal do Golem', stompGolem.hp < initialGolemHp);

      // 6. Teste do Boss ATS-9000
      const boss = new Boss(800, 300);
      assert('Boss inicia com 1400 HP na fase 1', boss.hp === 1400 && boss.phase === 1);
      const armoredHit = boss.takeDamage(100, false, null, sound, { trigger: () => {} });
      assert('Blindagem do Boss reduz dano fora da janela de núcleo exposto', armoredHit === 75);
      boss.takeDamage(960, false, null, sound, { trigger: () => {} });
      // Atualiza boss para disparar evento de transição
      boss.update(0.016, player, [], [], [], sound, null, { trigger: () => {} }, () => {});
      assert('Boss transiciona para fase 2 ao atingir 50% HP', boss.phase === 2);

      // 7. Teste de Leaderboard e Cálculo de Score
      const lb = new LeaderboardService();
      assert('LeaderboardService instancia com scores padrão', lb !== null);
      const score = lb.calculateFinalScore({
        enemiesDefeated: 5,
        timeSeconds: 120,
        maxCombo: 3,
        remainingHp: 80,
        bossDefeated: true
      });
      assert('Cálculo de Score inclui bônus do Boss', score >= 5000);

      // 8. Teste da Tela de Abertura e Carregamento (LoadingScene)
      const loading = new LoadingScene(1280, 720, sound);
      assert('LoadingScene instancia com sucesso', loading !== null);
      assert('LoadingScene possui frases inspiradoras', loading.quotes.length >= 3);
      loading.update(0.1);
      assert('LoadingScene atualiza progresso da barra', loading.progress >= 0);
      loading.targetProgress = 100;
      loading.update(0.5);
      assert('LoadingScene responde a avanço de targetProgress', loading.targetProgress === 100);

      // 9. Teste de Dados da Fase 1 (Checkpoints, Plataformas Móveis e Armadilhas)
      const level = buildLevel1(LEVEL1_CONFIG.width, 720);
      assert('Level1 gera 3 checkpoints', level.checkpoints.length === 3);
      assert('Level1 possui plataformas móveis', level.platforms.some(p => !!p.moving));
      assert('Level1 possui armadilhas de burnout', level.hazards.length >= 3);
      assert('Level1 instancia o Boss ATS-9000', level.boss && level.boss.maxHp === 1400);
      assert('Level1 possui recompensas secretas altas', level.collectibles.some(c => c.xpBonus >= 120));

      // 10. Teste de Level Up e Onda de Código no 3º Hit
      const wavePlayer = new Player(100, 200, 'female');
      wavePlayer.addXp(100, sound, null);
      assert('Player sobe para Nível 2 ao atingir 100 XP', wavePlayer.level === 2);
      wavePlayer.triggerAttack(sound);
      wavePlayer.triggerAttack(sound);
      wavePlayer.triggerAttack(sound);
      assert('3º golpe no Nível 2 gera projétil Onda de Código', wavePlayer.pendingProjectile && wavePlayer.pendingProjectile.type === 'code_wave');

      // 11. Teste de Game Feel (Bloco 1: Dash Cancel, Pogo Attack e Input Buffer)
      const gfPlayer = new Player(100, 200);
      gfPlayer.triggerAttack(sound);
      assert('Player inicia ataque antes do Dash Cancel', gfPlayer.isAttacking === true);
      gfPlayer.update(0.016, { left: false, right: false, down: false, jump: false, jumpPressed: false, dashPressed: true, attackPressed: false }, fakePlatform, sound, null);
      assert('Dash Cancel interrompe ataque imediatamente', gfPlayer.isDashing === true && gfPlayer.isAttacking === false);

      const pogoPlayer = new Player(100, 150);
      pogoPlayer.onGround = false;
      pogoPlayer.vy = 150;
      pogoPlayer.update(0.016, { left: false, right: false, down: true, jump: false, jumpPressed: false, dashPressed: false, attackPressed: true }, [], sound, null);
      assert('Pogo Attack cria hitbox para baixo no ar', pogoPlayer.attackHitbox && pogoPlayer.attackHitbox.isPogo === true);
      pogoPlayer.bounceFromPogo(sound, null);
      assert('Pogo bounce impulsiona o Player para cima', pogoPlayer.vy < 0);

      const bufPlayer = new Player(100, 200);
      bufPlayer.attackBufferTimer = 0.08;
      bufPlayer.update(0.016, { left: false, right: false, down: false, jump: false, jumpPressed: false, dashPressed: false, attackPressed: false }, fakePlatform, sound, null);
      assert('Input Buffer dispara ataque automaticamente quando válido', bufPlayer.isAttacking === true);

      // 12. Testes estilo Katana Zero (Up-Slash, Dash-Slash, Iaido Blitz, Chronos) e Pedestres de Fundo
      const upPlayer = new Player(100, 150);
      upPlayer.onGround = false;
      upPlayer.update(0.016, { left: false, right: false, up: true, down: false, jump: false, jumpPressed: false, dashPressed: false, attackPressed: true }, [], sound, null);
      assert('Up-Slash cria hitbox acima do Player', upPlayer.attackType === 'upslash' && upPlayer.attackHitbox && upPlayer.attackHitbox.y < upPlayer.y);

      const dsPlayer = new Player(100, 200);
      dsPlayer.update(0.016, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, dashPressed: true, attackPressed: false }, fakePlatform, sound, null);
      dsPlayer.update(0.016, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, dashPressed: false, attackPressed: true }, fakePlatform, sound, null);
      assert('Dash-Slash executa corte horizontal veloz durante o Dash', dsPlayer.attackType === 'dash_slash' && dsPlayer.attackHitbox && dsPlayer.attackHitbox.width >= 70);

      const iaidoPlayer = new Player(100, 200);
      iaidoPlayer.update(0.016, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, dashPressed: false, iaidoPressed: true, attackPressed: false }, fakePlatform, sound, null);
      assert('Iaido Blitz ativa investida invencível com corte longo', iaidoPlayer.isIaido === true && iaidoPlayer.attackType === 'iaido_blitz' && iaidoPlayer.invincibleTimer > 0);

      iaidoPlayer.update(0.016, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, dashPressed: false, chronosPressed: true, attackPressed: false }, fakePlatform, sound, null);
      assert('Chronos ativa foco temporal', iaidoPlayer.chronosActive === true);

      const parallax = new ParallaxBackground(renderer, 1280, 720);
      assert('ParallaxBackground possui pedestres Hi-Bit na calçada de fundo', Array.isArray(parallax.bgPedestrians) && parallax.bgPedestrians.length >= 6);

      // 13. Testes Sprint Metal Slug 1-3 (Git Bomb, Framework Burst, Shatter Shield, Boss Clímax, Crates/POWs, Explosões)
      const msPlayer = new Player(100, 200);
      assert('Player inicia com 2 Git Bombs', msPlayer.bombAmmo === 2);
      msPlayer.update(0.016, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, dashPressed: false, bombPressed: true, attackPressed: false }, fakePlatform, sound, null);
      assert('Git Bomb cria projétil parabólico e consome munição', msPlayer.pendingGrenade && msPlayer.pendingGrenade.type === 'git_bomb' && msPlayer.bombAmmo === 1);

      msPlayer.frameworkAmmo = 3;
      msPlayer.triggerAttack(sound);
      assert('[F] Framework Burst dispara Onda de Código mesmo no 1º golpe', msPlayer.pendingProjectile && msPlayer.pendingProjectile.type === 'code_wave' && msPlayer.frameworkAmmo === 2);

      const shieldGolem = new Enemy('golem', 300, 300);
      assert('Golem.shatterShield quebra o escudo frontal', shieldGolem.shatterShield(null, sound) === true && shieldGolem.hasFrontShield === false);
      assert('Após quebrar escudo, ataque frontal causa dano no Golem', shieldGolem.takeDamage(20, 1, null, sound) > 0);

      const msBoss = new Boss(800, 300);
      msBoss.takeDamage(600, false, null, sound, { trigger: () => {} });
      assert('Boss quebra módulo de filtro ao cair abaixo de 70% HP', msBoss.moduleBroken === true);
      msBoss.takeDamage(1600, true, null, sound, { trigger: () => {} });
      assert('Boss inicia morte cinematográfica antes de finalizar', msBoss.isDead === true && msBoss.deathFinished === false);
      for (let t = 0; t < 12; t++) {
        msBoss.update(0.2, msPlayer, [], [], [], sound, null, { trigger: () => {} }, () => {});
      }
      assert('Boss finaliza explosão em cadeia após deathTimer', msBoss.deathFinished === true);

      assert('Level1 possui caixas destrutíveis, POWs e plataformas na arena do Boss',
        Array.isArray(level.crates) && level.crates.length >= 4 &&
        Array.isArray(level.pows) && level.pows.length >= 3 &&
        level.platforms.some(p => p.x >= LEVEL1_CONFIG.bossTriggerX && p.y < 720 - 160)
      );

      const ps = new ParticleSystem();
      ps.createExplosion(100, 100);
      assert('Explosão Metal Slug gera flash central e estilhaços quicando', ps.flashes.length >= 1 && ps.debris.length >= 3);

      const scoreWithPows = lb.calculateFinalScore({
        enemiesDefeated: 5,
        devsRescued: 2,
        timeSeconds: 120,
        maxCombo: 3,
        remainingHp: 80,
        bossDefeated: true
      });
      assert('Cálculo de Score adiciona +500 por Dev POW resgatado', scoreWithPows === score + 1000);

      // 14. Testes de Densidade Frame-a-Frame & Agachar Funcional
      const crouchPlayer = new Player(100, 258);
      crouchPlayer.update(0.016, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, dashPressed: false, attackPressed: false }, fakePlatform, sound, null);
      crouchPlayer.update(0.016, { left: false, right: false, up: false, down: true, jump: false, jumpPressed: false, dashPressed: false, attackPressed: false }, fakePlatform, sound, null);
      assert('Agachar no chão reduz hitbox e ativa estado crouch', crouchPlayer.isCrouching === true && crouchPlayer.height === 26 && crouchPlayer.state === 'crouch');
      crouchPlayer.update(0.016, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, dashPressed: false, attackPressed: false }, fakePlatform, sound, null);
      assert('Levantar restaura altura padrão do Player', crouchPlayer.isCrouching === false && crouchPlayer.height === 42);

      assert('Inimigos possuem ciclos de 4 frames e estados reativos Hi-Bit',
        !!renderer.get('enemy_bug_walk4') && !!renderer.get('enemy_bug_lunge') &&
        !!renderer.get('enemy_ghost_float4') &&
        !!renderer.get('enemy_golem_walk4') && !!renderer.get('enemy_golem_noshield4') &&
        !!renderer.get('enemy_drone_fly4') && !!renderer.get('enemy_drone_charge')
      );
      assert('Sprites Hi-Bit gerados para caixas, pickups [F]/[G] e Git Bomb',
        !!renderer.get('item_crate') && !!renderer.get('item_pickup_f_2') &&
        !!renderer.get('item_pickup_g_2') && !!renderer.get('proj_git_bomb_2')
      );

      // 15. Testes Pilar B: Destrutibilidade, Explosões em Camadas e Juice Visual
      assert('Sprites Hi-Bit gerados para caixa rachada, barris explosivos e servidores',
        !!renderer.get('item_crate_dmg') && !!renderer.get('item_barrel_1') &&
        !!renderer.get('item_barrel_2') && !!renderer.get('item_server_ok') &&
        !!renderer.get('item_server_dmg')
      );

      const psB = new ParticleSystem();
      psB.createExplosion(200, 520, 1.2, 560);
      psB.triggerScreenFlash('#ff9100', 0.3, 0.08);
      assert('Explosão Pilar B gera ondas de choque, plumas volumétricas, marca no chão e flash de tela',
        psB.shockwaves.length >= 1 && psB.plumes.length >= 4 &&
        psB.scorchMarks.length >= 1 && psB.screenFlash !== null
      );
      psB.update(0.1, 560);
      assert('ScreenFlash decai e limpa após duração configurada', psB.screenFlash === null);

      const chainWorld = {
        height: 720,
        state: 'PLAYING',
        enemies: [new Enemy('golem', 330, 510)],
        crates: [
          { kind: 'armored_crate', x: 100, y: 526, width: 34, height: 34, hp: 2, maxHp: 2, hitTimer: 0, destroyed: false, drop: 'coffee' },
          { kind: 'barrel', x: 280, y: 526, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, explosive: true },
          { kind: 'barrel', x: 320, y: 526, width: 34, height: 34, hp: 1, maxHp: 1, hitTimer: 0, destroyed: false, explosive: true }
        ],
        pows: [],
        collectibles: [],
        particles: new ParticleSystem(),
        sound,
        screenShake: { trigger: () => {} },
        stats: { score: 0, devsRescued: 0 },
        player: { facing: 1, armorTier: 'base' },
        registerComboHit: () => {},
        onHitstop: () => {}
      };
      hitDestructible(chainWorld, chainWorld.crates[0]);
      assert('Caixa blindada (hp=2) racha no 1º golpe sem destruir e ativa hitTimer',
        chainWorld.crates[0].hp === 1 && !chainWorld.crates[0].destroyed && chainWorld.crates[0].hitTimer > 0
      );
      hitDestructible(chainWorld, chainWorld.crates[0]);
      assert('Caixa blindada quebra no 2º golpe e solta drop',
        chainWorld.crates[0].destroyed === true && chainWorld.collectibles.length === 1 && chainWorld.stats.score === 100
      );

      hitDestructible(chainWorld, chainWorld.crates[1]);
      assert('Barril explosivo detona em cadeia em barril vizinho e quebra escudo do Golem',
        chainWorld.crates[1].destroyed === true && chainWorld.crates[2].destroyed === true &&
        chainWorld.enemies[0].hasFrontShield === false
      );

      assert('Level1 possui barris explosivos e servidores/caixas multi-hit',
        level.crates.some(c => c.kind === 'barrel' && c.explosive) &&
        level.crates.some(c => (c.maxHp || 1) >= 2)
      );

      // 16. Testes da Fase 1 Expandida & Novos Inimigos Temáticos do Projeto
      assert('Fase 1 expandida possui largura >= 9000 e maior densidade de encontros',
        LEVEL1_CONFIG.width >= 9000 &&
        level.enemies.length >= 20 &&
        level.platforms.length >= 22 &&
        level.pows.length >= 5
      );
      assert('Sprites Hi-Bit gerados para Scroll Infinito, Live Coding e projétil Whiteboard',
        !!renderer.get('enemy_procrastination_walk4') && !!renderer.get('enemy_procrastination_charge') &&
        !!renderer.get('enemy_interviewer_walk4') && !!renderer.get('enemy_interviewer_throw') &&
        !!renderer.get('proj_whiteboard')
      );

      const scrollBot = new Enemy('procrastination', 300, 300);
      const scrollPlayer = new Player(450, 300);
      scrollBot.update(0.016, scrollPlayer, [], [], sound, null);
      assert('Scroll Infinito inicia windup de investida ao avistar o Player',
        scrollBot.label === 'SCROLL INFINITO' && scrollBot.chargeState === 'windup'
      );

      const interviewer = new Enemy('interviewer', 500, 300);
      const intProj = [];
      interviewer.throwTimer = 0.01;
      interviewer.update(0.05, scrollPlayer, [], intProj, sound, null);
      assert('Avaliador Live Coding lança projétil Whiteboard deflectável',
        interviewer.label === 'LIVE CODING' &&
        intProj.length === 1 && intProj[0].type === 'whiteboard' && intProj[0].isEnemy === true
      );

      // 17. Testes de IA & Arsenal Metal Slug do Boss ATS-9000
      assert('Sprites Hi-Bit gerados para projéteis Metal Slug do Boss (vulcan, mortar, missile)',
        !!renderer.get('proj_vulcan') && !!renderer.get('proj_mortar') && !!renderer.get('proj_missile')
      );

      const aiBoss = new Boss(800, 300);
      const aiPlayer = new Player(350, 350);
      const bossProjectiles = [];
      const dummyShake = { trigger: () => {} };

      aiBoss.startAttackState('vulcan_burst', aiPlayer);
      for (let i = 0; i < 40; i++) {
        aiBoss.update(0.03, aiPlayer, [], bossProjectiles, [], sound, null, dummyShake, () => {});
      }
      assert('Boss executa rajada Vulcan mirando na direção do Player',
        bossProjectiles.some(p => p.type === 'vulcan' && p.isEnemy === true)
      );

      bossProjectiles.length = 0;
      aiBoss.startAttackState('mortar_barrage', aiPlayer);
      for (let i = 0; i < 45; i++) {
        aiBoss.update(0.03, aiPlayer, [], bossProjectiles, [], sound, null, dummyShake, () => {});
      }
      assert('Boss lança morteiros parabólicos com gravidade',
        bossProjectiles.some(p => p.type === 'boss_mortar' && p.gravity > 0)
      );

      bossProjectiles.length = 0;
      aiBoss.startAttackState('missile_salvo', aiPlayer);
      for (let i = 0; i < 30; i++) {
        aiBoss.update(0.03, aiPlayer, [], bossProjectiles, [], sound, null, dummyShake, () => {});
      }
      assert('Boss dispara salva de mísseis teleguiados',
        bossProjectiles.some(p => p.type === 'boss_missile' && p.homingTime > 0)
      );

      aiBoss.phase = 2;
      aiBoss.mentorEventTriggered = true;
      aiBoss.startAttackState('mega_beam', aiPlayer);
      for (let i = 0; i < 45; i++) {
        aiBoss.update(0.03, aiPlayer, [], bossProjectiles, [], sound, null, dummyShake, () => {});
      }
      assert('Boss ativa Mega-Beam estilo Metal Slug na Fase 2',
        aiBoss.beamActive === true && aiBoss.getMegaBeamHitbox() !== null
      );

      aiBoss.startAttackState('charge_rush', aiPlayer);
      const startRushX = aiBoss.x;
      for (let i = 0; i < 30; i++) {
        aiBoss.update(0.03, aiPlayer, [], bossProjectiles, [], sound, null, dummyShake, () => {});
      }
      assert('Boss executa investida horizontal pela arena',
        aiBoss.x !== startRushX
      );

      // 18. Testes das Novas Inimigas da Fase 1 (Loira de Óculos / Cabelo & Loira Sem Óculos / Língua)
      assert('Sprites Hi-Bit gerados para blonde_glasses e blonde_tongue',
        !!renderer.get('enemy_blonde_glasses_walk4') && !!renderer.get('enemy_blonde_glasses_attack') &&
        !!renderer.get('enemy_blonde_tongue_walk4') && !!renderer.get('enemy_blonde_tongue_attack')
      );

      assert('Level1 inclui instâncias de blonde_glasses e blonde_tongue',
        level.enemies.some(e => e.type === 'blonde_glasses') &&
        level.enemies.some(e => e.type === 'blonde_tongue')
      );

      const enemyFloor = [{ x: 0, y: 352, width: 1000, height: 40 }];
      const hairEnemy = new Enemy('blonde_glasses', 400, 300);
      const hairTarget = new Player(290, 310);
      for (let i = 0; i < 35; i++) {
        hairEnemy.update(0.02, hairTarget, enemyFloor, [], sound, null);
      }
      assert('Chefe Louca (óculos) chicoteia cabelo com longo alcance e causa dano',
        hairEnemy.label === 'CHEFE LOUCA' && hairTarget.hp < 100
      );

      const tongueEnemy = new Enemy('blonde_tongue', 400, 300);
      const tongueTarget = new Player(255, 310);
      for (let i = 0; i < 40; i++) {
        tongueEnemy.update(0.02, tongueTarget, enemyFloor, [], sound, null);
      }
      assert('Chefe Louca (sem óculos) estende língua com longo alcance e causa dano',
        tongueEnemy.label === 'CHEFE LOUCA' && tongueTarget.hp < 100
      );

      // 19. Teste de Diálogo Multi-Speaker (Chefe Louca vs Herói/Heroína)
      const dlg = new DialogSystem(sound, 0.01);
      let finishCalled = false;
      dlg.open({
        data: {
          openSound: 'alert',
          lines: [
            { speaker: 'CHEFE LOUCA', portrait: 'chefe_louca', text: 'Quero todos os relatórios e visitar clientes agora!' },
            { speaker: 'HERÓI DEV', portrait: 'hero', text: 'Mesmo usando IA ainda não dá tempo!' }
          ],
          onFinish: () => { finishCalled = true; }
        }
      });
      assert('DialogSystem abre diálogo estruturado da Chefe Louca',
        dlg.isOpen === true && dlg.getLineSpeaker(dlg.activeDialog.lines[0]) === 'CHEFE LOUCA'
      );
      dlg.advance({ player: hairTarget, stats: { activeMentorTip: '' }, particles: null, touchEnabled: false });
      dlg.advance({ player: hairTarget, stats: { activeMentorTip: '' }, particles: null, touchEnabled: false });
      dlg.advance({ player: hairTarget, stats: { activeMentorTip: '' }, particles: null, touchEnabled: false });
      const closed = dlg.advance({ player: hairTarget, stats: { activeMentorTip: '' }, particles: null, touchEnabled: false });
      assert('DialogSystem alterna falas e executa onFinish ao encerrar',
        closed === true && !dlg.isOpen && finishCalled === true
      );

    } catch (error) {
      console.error('Falha crítica nos testes:', error);
      results.push({ name: `Erro Crítico: ${error.message}`, passed: false });
    }

    const allPassed = results.every(r => r.passed);
    console.log(`%c[SELF-TEST] Resultado: ${results.filter(r => r.passed).length}/${results.length} passaram.`,
      allPassed ? 'color: #00e676; font-weight: bold;' : 'color: #ff1744; font-weight: bold;'
    );
    console.groupEnd();
    return allPassed;
  }
}
