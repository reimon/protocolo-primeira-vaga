/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * OverlayScreens.js - Modais de Vitória, Game Over e Hall da Fama
 */

export class OverlayScreens {
  static showVictory({ stats, finalScore, onSave }) {
    const overlay = document.getElementById('gameOverlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="pixel-modal victory-modal">
        <h1 class="glow-gold">PRIMEIRA VAGA CONQUISTADA!</h1>
        <p class="flavor-text">Você derrotou o ATS-9000 e provou seu valor técnico!</p>
        <div class="score-summary">
          <div>Inimigos Superados: ${stats.enemiesDefeated}</div>
          <div>Combo Máximo: ${stats.maxCombo} Hits</div>
          <div>Tempo Total: ${Math.floor(stats.timeElapsed)}s</div>
          <div class="final-score">PONTUAÇÃO FINAL: ${finalScore}</div>
        </div>
        <div class="initials-box">
          <p>REGISTRE SEU NOME NO HALL DA FAMA:</p>
          <input type="text" id="playerInitials" maxlength="6" value="DEV" class="arcade-input" />
          <button id="btnSaveScore" class="btn-arcade">SALVAR RECORDE</button>
        </div>
      </div>
    `;
    overlay.classList.remove('hidden');

    const submit = () => {
      const input = document.getElementById('playerInitials');
      onSave(input ? input.value : 'DEV');
    };

    document.getElementById('btnSaveScore').addEventListener('click', submit);
    const initialsInput = document.getElementById('playerInitials');
    if (initialsInput) {
      initialsInput.focus();
      initialsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submit();
        }
      });
    }
  }

  static showGameOver({ score, activeCheckpoint, onContinue, onRetry }) {
    const overlay = document.getElementById('gameOverlay');
    if (!overlay) return;

    const canContinue = activeCheckpoint && activeCheckpoint.x > 80;
    overlay.innerHTML = `
      <div class="pixel-modal gameover-modal">
        <h1 class="glow-red">BARRA DE CONFIANÇA ESGOTADA</h1>
        <p class="flavor-text">Todo desenvolvedor experiente já enfrentou dezenas de "nãos".</p>
        <p class="flavor-text">Aprenda com cada feedback, revise seus fundamentos e tente novamente!</p>
        <div class="score-summary">
          <div>Pontuação Conquistada: ${score}</div>
        </div>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          ${canContinue ? `<button id="btnContinueCheckpoint" class="btn-arcade">CONTINUAR (${activeCheckpoint.label.toUpperCase()})</button>` : ''}
          <button id="btnRetry" class="${canContinue ? 'pixel-btn' : 'btn-arcade'}">${canContinue ? 'RECOMEÇAR DO ZERO' : 'TENTAR NOVAMENTE'}</button>
        </div>
      </div>
    `;
    overlay.classList.remove('hidden');

    if (canContinue) {
      document.getElementById('btnContinueCheckpoint').addEventListener('click', () => {
        overlay.classList.add('hidden');
        onContinue();
      });
    }

    document.getElementById('btnRetry').addEventListener('click', () => {
      overlay.classList.add('hidden');
      onRetry();
    });
  }

  static async showLeaderboard(leaderboardService, onClose) {
    const scores = await leaderboardService.getScores();
    const overlay = document.getElementById('gameOverlay');
    if (!overlay) return;

    const rows = scores.map((s, idx) => `
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
      onClose();
    });
  }
}
