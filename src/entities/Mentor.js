/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Mentor.js - O Sábio Místico "Mestre dos Magos"
 */

export class Mentor {
  constructor(x, y, dialogId, data) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 56;
    this.dialogId = dialogId; // 'intro', 'checkpoint1', 'checkpoint2', 'boss_help'
    this.data = data; // Dicas, opções de buffs

    this.isActive = true;
    this.hasInteracted = false;
    this.isDisappearing = false;
    this.disappearTimer = 0;
    this.floatTimer = 0;
    this.sparkleTimer = 0;
  }

  update(dt, player, particleSystem, soundEngine, onTriggerDialog) {
    if (!this.isActive) return;

    this.floatTimer += dt * 3;
    this.sparkleTimer += dt;

    // Emite partículas mágicas douradas continuamente
    if (this.sparkleTimer > 0.08 && particleSystem) {
      this.sparkleTimer = 0;
      particleSystem.createSparks(
        this.x + Math.random() * this.width,
        this.y + Math.random() * this.height,
        '#ffd700',
        2
      );
    }

    if (this.isDisappearing) {
      this.disappearTimer -= dt;
      if (this.disappearTimer <= 0) {
        this.isActive = false;
      }
      return;
    }

    // Se o player estiver próximo e ainda não interagiu
    if (!this.hasInteracted) {
      const dist = Math.abs((player.x + player.width / 2) - (this.x + this.width / 2));
      if (dist < 70 && Math.abs(player.y - this.y) < 60) {
        this.triggerInteraction(onTriggerDialog, soundEngine);
      }
    }
  }

  triggerInteraction(onTriggerDialog, soundEngine) {
    this.hasInteracted = true;
    soundEngine.playMentorTeleport();
    if (onTriggerDialog) {
      onTriggerDialog(this);
    }
  }

  vanish(particleSystem, soundEngine) {
    this.isDisappearing = true;
    this.disappearTimer = 0.5;
    soundEngine.playMentorTeleport();
    if (particleSystem) {
      for (let i = 0; i < 35; i++) {
        particleSystem.createSparks(
          this.x + this.width / 2,
          this.y + this.height / 2,
          '#ffd700',
          1
        );
      }
    }
  }

  render(ctx, renderer, cameraX) {
    if (!this.isActive) return;

    const screenX = this.x - cameraX;
    const floatY = this.y + Math.sin(this.floatTimer) * 4;

    ctx.save();
    if (this.isDisappearing) {
      ctx.globalAlpha = Math.max(0, this.disappearTimer / 0.5);
    }

    const sprite = renderer.get('mentor_idle1') || renderer.get('mentor_float');
    if (sprite) {
      ctx.drawImage(sprite, screenX - 8, floatY - 14);
    }

    // Ícone '!' flutuante sobre a cabeça antes de interagir
    if (!this.hasInteracted) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', screenX + this.width / 2, floatY - 8);
    }

    ctx.restore();
  }
}
