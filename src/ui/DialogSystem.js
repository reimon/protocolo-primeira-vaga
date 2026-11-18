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
    const data = mentor && mentor.data ? mentor.data : mentor;
    this.activeDialog = {
      lines: data.lines,
      currentLineIndex: 0,
      displayedChars: 0,
      charTimer: 0,
      choices: data.choices || null,
      selectedChoice: 0,
      grantDoubleJump: data.grantDoubleJump || false,
      onFinish: typeof data.onFinish === 'function' ? data.onFinish : null
    };
    if (data.openSound === 'alert') {
      this.sound.playHit();
    } else {
      this.sound.playMentorTeleport();
    }

    const touchEl = document.getElementById('touchControls');
    if (touchEl) touchEl.classList.add('hidden');
  }

  getLineText(line) {
    return typeof line === 'string' ? line : (line?.text || '');
  }

  getLineSpeaker(line) {
    return typeof line === 'string' ? 'MESTRE DOS MAGOS DA CARREIRA' : (line?.speaker || 'MESTRE DOS MAGOS DA CARREIRA');
  }

  getLineColor(line) {
    return typeof line === 'string' ? '#ffd700' : (line?.color || '#ffd700');
  }

  wrapText(text, maxChars = 66) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const w of words) {
      const candidate = current ? `${current} ${w}` : w;
      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  update(dt, input) {
    if (!this.activeDialog) return;

    const currentLine = this.getLineText(this.activeDialog.lines[this.activeDialog.currentLineIndex]);
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

    const currentLine = this.getLineText(this.activeDialog.lines[this.activeDialog.currentLineIndex]);

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

    const onFinish = this.activeDialog.onFinish;
    this.activeDialog = null;
    this.activeMentorInstance = null;

    if (onFinish) {
      onFinish({ player, stats, particles });
    }

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

  render(ctx, renderer, width, height, playerGender = 'male') {
    if (!this.activeDialog) return;

    const rawLine = this.activeDialog.lines[this.activeDialog.currentLineIndex];
    const speaker = this.getLineSpeaker(rawLine);
    const accentColor = this.getLineColor(rawLine);
    const portraitType = typeof rawLine === 'object' && rawLine ? rawLine.portrait : 'mentor';

    const boxW = Math.min(1060, width - 120);
    const boxX = (width - boxW) / 2;
    const boxY = height - 310;
    const boxH = 190;

    ctx.fillStyle = 'rgba(8, 10, 22, 0.96)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Retrato do interlocutor (Mentor, Chefe Louca ou Herói/Heroína)
    const pX = boxX + 16;
    const pY = boxY + 20;
    const pSize = 76;
    ctx.fillStyle = 'rgba(18, 24, 42, 0.95)';
    ctx.fillRect(pX, pY, pSize, pSize);

    if (portraitType === 'chefe_louca') {
      const sheet = renderer.ext && renderer.ext('enemy_blonde_glasses');
      if (sheet) {
        ctx.drawImage(sheet, 16, 0, 88, 88, pX, pY, pSize, pSize);
      }
    } else if (portraitType === 'hero') {
      const sheetKey = playerGender === 'female' ? 'hero_female' : 'hero';
      const sheet = renderer.ext && renderer.ext(sheetKey);
      if (sheet) {
        const fw = sheet.width / 4;
        ctx.drawImage(sheet, fw + 118, 6, 170, 170, pX, pY, pSize, pSize);
      } else {
        const fallback = renderer.get('player_base_idle');
        if (fallback) ctx.drawImage(fallback, pX, pY, pSize, pSize);
      }
    } else {
      const portrait = (renderer.ext && renderer.ext('mentor_portrait')) || renderer.get('portrait_mentor');
      if (portrait) {
        ctx.drawImage(portrait, pX, pY, pSize, pSize);
      }
    }
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(pX, pY, pSize, pSize);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(speaker, boxX + 108, boxY + 36);

    const currentLine = this.getLineText(rawLine);
    const textToShow = currentLine.slice(0, this.activeDialog.displayedChars);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';

    const wrapped = this.wrapText(textToShow, 66);
    wrapped.slice(0, 3).forEach((ln, idx) => {
      ctx.fillText(ln, boxX + 108, boxY + 66 + idx * 23);
    });

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
