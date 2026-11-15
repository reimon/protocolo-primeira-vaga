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
import { buildLevel1 } from '../world/Level1.js';
import { ParticleSystem } from '../world/ParticleSystem.js';

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
      assert('Boss inicia com 500 HP na fase 1', boss.hp === 500 && boss.phase === 1);
      boss.takeDamage(260, false, null, sound, { trigger: () => {} });
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
      const level = buildLevel1(5200, 720);
      assert('Level1 gera 3 checkpoints', level.checkpoints.length === 3);
      assert('Level1 possui plataformas móveis', level.platforms.some(p => !!p.moving));
      assert('Level1 possui armadilhas de burnout', level.hazards.length >= 3);
      assert('Level1 instancia o Boss ATS-9000', level.boss && level.boss.maxHp === 500);
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
      msBoss.takeDamage(160, false, null, sound, { trigger: () => {} });
      assert('Boss quebra módulo de filtro ao cair abaixo de 70% HP', msBoss.moduleBroken === true);
      msBoss.takeDamage(500, true, null, sound, { trigger: () => {} });
      assert('Boss inicia morte cinematográfica antes de finalizar', msBoss.isDead === true && msBoss.deathFinished === false);
      for (let t = 0; t < 12; t++) {
        msBoss.update(0.2, msPlayer, [], [], [], sound, null, { trigger: () => {} }, () => {});
      }
      assert('Boss finaliza explosão em cadeia após deathTimer', msBoss.deathFinished === true);

      assert('Level1 possui caixas destrutíveis, POWs e plataformas na arena do Boss',
        Array.isArray(level.crates) && level.crates.length >= 4 &&
        Array.isArray(level.pows) && level.pows.length >= 3 &&
        level.platforms.some(p => p.x >= 4450 && p.y < 720 - 160)
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
