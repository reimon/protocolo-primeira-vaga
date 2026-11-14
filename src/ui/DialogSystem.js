/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * DialogSystem.js - Sistema de Diálogos RPG do Mentor (Typewriter, Escolhas e Render)
 */

export class DialogSystem {
  constructor(soundEngine, typewriterDelay = 0.025) {
    this.sound = soundEngine;
    this.typewriterDelay = typewriterDelay;
    this.activeDialog = null;
    this.activeMentorInstance = null;
  }

  get isOpen() {
    return this.activeDialog !== null;
  }

  selectChoice(index) {
    if (this.activeDialog && this.activeDialog.choices) {
      this.activeDialog.selectedChoice = index;
      this.sound.playTypewriterBeep();
    }
  }

  open(mentor) {
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

    const touchEl = document.getElementById('touchControls');
    if (touchEl) touchEl.classList.add('hidden');
  }

  update(dt, input) {
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

    if (this.activeDialog.choices && this.activeDialog.displayedChars >= currentLine.length) {
      if (input.jumpPressed || input.left) {
        this.activeDialog.selectedChoice = 0;
      }
      if (input.dashPressed || input.right) {
        this.activeDialog.selectedChoice = 1;
      }
    }
  }

  /**
   * Avança o diálogo. Retorna true quando o diálogo for encerrado.
   */
  advance({ player, stats, particles, touchEnabled }) {
    if (!this.activeDialog) return false;

    const currentLine = this.activeDialog.lines[this.activeDialog.currentLineIndex];

    if (this.activeDialog.displayedChars < currentLine.length) {
      this.activeDialog.displayedChars = currentLine.length;
      this.sound.playTypewriterBeep();
      return false;
    }

    if (this.activeDialog.currentLineIndex < this.activeDialog.lines.length - 1) {
      this.activeDialog.currentLineIndex++;
      this.activeDialog.displayedChars = 0;
      this.activeDialog.charTimer = 0;
      this.sound.playTypewriterBeep();
      return false;
    }

    if (this.activeDialog.choices) {
      const choice = this.activeDialog.choices[this.activeDialog.selectedChoice];
      if (choice && choice.buff === 'defense') {
        player.bonusDefense += 6;
        stats.activeMentorTip = 'Buff Ativo: Fundamentos Sólidos (+Defesa)';
      } else if (choice && choice.buff === 'attack') {
        player.bonusDamage += 10;
        stats.activeMentorTip = 'Buff Ativo: Portfólio Prático (+Ataque)';
      }
      this.sound.playLevelUp();
    }

    if (this.activeDialog.grantDoubleJump) {
      player.hasDoubleJump = true;
      stats.activeMentorTip = 'Habilidade Adquirida: Pulo Duplo Desbloqueado!';
      this.sound.playLevelUp();
    }

    if (this.activeMentorInstance && typeof this.activeMentorInstance.vanish === 'function') {
      this.activeMentorInstance.vanish(particles, this.sound);
    }

    this.activeDialog = null;
    this.activeMentorInstance = null;

    if (touchEnabled) {
      const touchEl = document.getElementById('touchControls');
      if (touchEl) touchEl.classList.remove('hidden');
    }

    return true;
  }

  reset() {
    this.activeDialog = null;
    this.activeMentorInstance = null;
  }

  render(ctx, renderer, width, height) {
    if (!this.activeDialog) return;

    const boxW = Math.min(1060, width - 120);
    const boxX = (width - boxW) / 2;
    const boxY = height - 310;
    const boxH = 190;

    ctx.fillStyle = 'rgba(8, 10, 22, 0.96)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const portrait = renderer.ext('mentor_portrait') || renderer.get('portrait_mentor');
    if (portrait) {
      ctx.drawImage(portrait, boxX + 16, boxY + 20, 76, 76);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX + 16, boxY + 20, 76, 76);
    }

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MESTRE DOS MAGOS DA CARREIRA', boxX + 108, boxY + 36);

    const currentLine = this.activeDialog.lines[this.activeDialog.currentLineIndex];
    const textToShow = currentLine.slice(0, this.activeDialog.displayedChars);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';

    const maxCharsPerLine = 58;
    if (textToShow.length > maxCharsPerLine) {
      ctx.fillText(textToShow.slice(0, maxCharsPerLine), boxX + 108, boxY + 68);
      ctx.fillText(textToShow.slice(maxCharsPerLine), boxX + 108, boxY + 92);
    } else {
      ctx.fillText(textToShow, boxX + 108, boxY + 68);
    }

    if (this.activeDialog.choices && this.activeDialog.displayedChars >= currentLine.length) {
      this.activeDialog.choices.forEach((choice, idx) => {
        const isSelected = this.activeDialog.selectedChoice === idx;
        const cy = boxY + 115 + idx * 26;
        ctx.fillStyle = isSelected ? '#00e5ff' : '#90a4ae';
        ctx.font = isSelected ? 'bold 14px monospace' : '13px monospace';
        const prefix = isSelected ? '▶ ' : '  ';
        ctx.fillText(`${prefix}${choice.label}`, boxX + 108, cy);
      });
    }

    const pulse = Math.floor(Date.now() / 350) % 2 === 0;
    ctx.fillStyle = pulse ? '#ffd700' : '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('[TOQUE NA TELA / QUALQUER BOTÃO / ESPAÇO PARA AVANÇAR ▶]', boxX + boxW - 16, boxY + boxH - 14);
  }
}
