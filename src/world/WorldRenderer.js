/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * WorldRenderer.js - Renderização de Plataformas, Armadilhas, Checkpoints, Colecionáveis, Projéteis e Indicadores
 */

export class WorldRenderer {
  static renderPlatforms(ctx, renderer, platforms, cameraX, height) {
    const tileStone = renderer.get('tile_stone');
    const tilePlat = renderer.get('tile_platform');

    for (const p of platforms) {
      if (p.width <= 30) continue;

      if (p.y >= height - 160) {
        if (renderer.ext('fg_promenade')) continue;
        if (tileStone) {
          for (let x = p.x; x < p.x + p.width; x += 32) {
            ctx.drawImage(tileStone, x - cameraX, p.y);
          }
        }
      } else if (tilePlat) {
        for (let x = p.x; x < p.x + p.width; x += 64) {
          ctx.drawImage(tilePlat, x - cameraX, p.y);
        }
      } else {
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(p.x - cameraX, p.y, p.width, p.height);
      }
    }
  }

  static renderHazards(ctx, hazards, cameraX, width) {
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.01);
    for (const h of hazards) {
      const sx = h.x - cameraX;
      if (sx + h.width < -20 || sx > width + 20) continue;

      ctx.save();
      ctx.fillStyle = `rgba(255, 61, 0, ${0.75 * pulse})`;
      ctx.fillRect(sx, h.y + 4, h.width, h.height - 4);

      ctx.fillStyle = '#ffd600';
      for (let x = sx; x < sx + h.width - 8; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, h.y + h.height);
        ctx.lineTo(x + 6, h.y);
        ctx.lineTo(x + 12, h.y + h.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  static renderCheckpoints(ctx, checkpoints, cameraX, width) {
    for (const cp of checkpoints) {
      const sx = cp.x - cameraX;
      if (sx < -60 || sx > width + 60) continue;

      ctx.save();
      ctx.fillStyle = '#455a64';
      ctx.fillRect(sx + 12, cp.y, 6, cp.height);

      const active = cp.activated;
      ctx.fillStyle = active ? '#00e676' : '#ffab00';
      ctx.fillRect(sx + 18, cp.y + 4, 24, 16);
      ctx.fillStyle = '#0d1117';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(active ? 'OK' : 'GIT', sx + 20, cp.y + 15);

      if (active) {
        ctx.fillStyle = 'rgba(0, 230, 118, 0.25)';
        ctx.fillRect(sx + 4, cp.y + cp.height - 6, 22, 6);
      }
      ctx.restore();
    }
  }

  static renderCollectibles(ctx, renderer, collectibles, cameraX) {
    for (const c of collectibles) {
      let spriteKey = 'item_coffee';
      if (c.type === 'book') spriteKey = 'item_book';
      if (c.type === 'offer') spriteKey = 'item_offer';

      const sprite = renderer.get(spriteKey);
      if (sprite) {
        const floatY = c.y + Math.sin(Date.now() * 0.005 + c.x) * 4;
        ctx.drawImage(sprite, c.x - cameraX, floatY);
      }
    }
  }

  static renderProjectiles(ctx, renderer, projectiles, cameraX) {
    for (const p of projectiles) {
      let spriteKey = 'proj_filter';
      if (p.type === 'ghosting') spriteKey = 'proj_ghosting';
      if (p.type === 'shockwave') spriteKey = 'proj_shockwave';

      const sprite = renderer.get(spriteKey);
      if (sprite) {
        ctx.drawImage(sprite, p.x - cameraX, p.y);
      } else {
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(p.x - cameraX, p.y, p.width, p.height);
      }
    }
  }

  static renderGameplayIndicators(ctx, player) {
    if (!player) return;
    ctx.save();
    const x = 18;
    const y = 94;

    const ready = player.dashCooldownTimer <= 0;
    const pct = ready ? 1 : Math.max(0, 1 - player.dashCooldownTimer / player.dashCooldown);

    ctx.fillStyle = 'rgba(10, 14, 26, 0.78)';
    ctx.fillRect(x, y, 128, 22);
    ctx.strokeStyle = ready ? '#00e5ff' : '#546e7a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 128, 22);

    ctx.fillStyle = ready ? '#00e5ff' : '#ff9100';
    ctx.fillRect(x + 3, y + 3, Math.floor(122 * pct), 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(ready ? 'DASH READY' : 'DASH...', x + 8, y + 15);

    if (player.hasDoubleJump) {
      ctx.fillStyle = 'rgba(10, 14, 26, 0.78)';
      ctx.fillRect(x + 136, y, 112, 22);
      ctx.strokeStyle = '#ffd700';
      ctx.strokeRect(x + 136, y, 112, 22);
      ctx.fillStyle = '#ffd700';
      ctx.fillText('2X JUMP', x + 148, y + 15);
    }
    ctx.restore();
  }

  static renderZoneBanner(ctx, zoneBanner, width) {
    if (!zoneBanner) return;
    const { title, subtitle, timer, maxTimer } = zoneBanner;
    const fadeIn = Math.min(1, (maxTimer - timer) / 0.35);
    const fadeOut = Math.min(1, timer / 0.5);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

    ctx.save();
    ctx.globalAlpha = alpha;
    const boxW = 540;
    const boxH = 68;
    const boxX = (width - boxW) / 2;
    const boxY = 104;

    ctx.fillStyle = 'rgba(8, 12, 24, 0.88)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText(title, width / 2, boxY + 28);

    ctx.fillStyle = '#e0f7fa';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(subtitle, width / 2, boxY + 50);
    ctx.restore();
  }
}
