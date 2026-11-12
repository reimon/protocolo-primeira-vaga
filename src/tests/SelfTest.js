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
