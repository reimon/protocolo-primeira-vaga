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

  static renderCrates(ctx, renderer, crates, cameraX, width) {
    if (!crates) return;
    const crateSprite = renderer && renderer.get('item_crate');
    for (const c of crates) {
      if (c.destroyed) continue;
      const sx = c.x - cameraX;
      if (sx + c.width < -20 || sx > width + 20) continue;

      ctx.save();
      if (crateSprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(crateSprite, sx, c.y, c.width, c.height);
      } else {
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(sx, c.y, c.width, c.height);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, c.y, c.width, c.height);
      }

      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.label || 'CODE', sx + c.width / 2, c.y - 4);
      ctx.restore();
    }
  }

  static renderPows(ctx, renderer, pows, cameraX, width) {
    if (!pows) return;
    const now = Date.now();
    const t = now * 0.006;
    const runFrame = Math.floor(now / 95) % 4;
    for (const p of pows) {
      if (p.rescued && p.runTimer <= 0) continue;
      const sx = p.x - cameraX;
      if (sx < -80 || sx > width + 80) continue;

      const npcSheet = renderer && renderer.ext && renderer.ext(p.spriteKey || 'bg_npc_dev');
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (!p.rescued) {
        // Jaula/Corda "Tutorial Infinito" com sprite Hi-Bit real dentro
        ctx.fillStyle = 'rgba(13, 18, 30, 0.72)';
        ctx.fillRect(sx, p.y, p.width, p.height);

        if (npcSheet) {
          const fw = npcSheet.width / 4;
          const fh = npcSheet.height;
          const drawH = p.height - 6;
          const drawW = Math.round(fw * (drawH / fh));
          ctx.drawImage(npcSheet, 0, 0, fw, fh, sx + (p.width - drawW) / 2, p.y + p.height - drawH - 2, drawW, drawH);
        } else {
          ctx.fillStyle = '#ffd6b8';
          ctx.fillRect(sx + 11, p.y + 10, 12, 10);
          ctx.fillStyle = '#00e5ff';
          ctx.fillRect(sx + 10, p.y + 20, 14, 14);
        }

        ctx.strokeStyle = '#ff9100';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, p.y, p.width, p.height);
        ctx.fillStyle = '#90a4ae';
        for (let bx = sx + 6; bx < sx + p.width - 3; bx += 8) {
          ctx.fillRect(bx, p.y + 2, 2, p.height - 4);
        }

        const bob = Math.sin(t) * 3;
        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SOS', sx + p.width / 2, p.y - 6 + bob);
      } else {
        // Dev libertado correndo em ciclo de 4 frames estilo POW do Metal Slug
        const alpha = Math.min(1, p.runTimer / 0.5);
        ctx.globalAlpha = alpha;
        if (npcSheet) {
          const fw = npcSheet.width / 4;
          const fh = npcSheet.height;
          const drawH = p.height + 10;
          const drawW = Math.round(fw * (drawH / fh));
          ctx.drawImage(npcSheet, runFrame * fw, 0, fw, fh, sx + (p.width - drawW) / 2, p.y + p.height - drawH, drawW, drawH);
        } else {
          ctx.fillStyle = '#ffd6b8';
          ctx.fillRect(sx + 11, p.y + 10, 12, 10);
          ctx.fillStyle = '#00e676';
          ctx.fillRect(sx + 10, p.y + 20, 14, 14);
        }
        ctx.fillStyle = '#00e676';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.quip || 'THANK YOU!', sx + p.width / 2, p.y - 12);
      }
      ctx.restore();
    }
  }

  static renderCollectibles(ctx, renderer, collectibles, cameraX) {
    const glintFrame = Math.floor(Date.now() / 220) % 2 === 0 ? 1 : 2;
    for (const c of collectibles) {
      const floatY = c.y + Math.sin(Date.now() * 0.005 + c.x) * 4;
      const sx = c.x - cameraX;

      if (c.type === 'pickup_f' || c.type === 'pickup_g') {
        const sprite = renderer.get(`item_${c.type}_${glintFrame}`);
        if (sprite) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.shadowColor = c.type === 'pickup_f' ? '#00e5ff' : '#ff9100';
          ctx.shadowBlur = 10;
          ctx.drawImage(sprite, sx, floatY);
          ctx.restore();
        }
        continue;
      }

      let spriteKey = 'item_coffee';
      if (c.type === 'book') spriteKey = 'item_book';
      if (c.type === 'offer') spriteKey = 'item_offer';

      const sprite = renderer.get(spriteKey);
      if (sprite) {
        ctx.drawImage(sprite, sx, floatY);
      }
    }
  }

  static renderProjectiles(ctx, renderer, projectiles, cameraX) {
    for (const p of projectiles) {
      if (p.type === 'git_bomb') {
        const sx = p.x - cameraX;
        const bombFrame = Math.floor(Date.now() / 90) % 2 === 0 ? 1 : 2;
        const sprite = renderer.get(`proj_git_bomb_${bombFrame}`);
        ctx.save();
        ctx.shadowColor = '#ff9100';
        ctx.shadowBlur = 10;
        if (sprite) {
          ctx.drawImage(sprite, sx, p.y);
        } else {
          ctx.fillStyle = '#ff6d00';
          ctx.beginPath();
          ctx.arc(sx + p.width / 2, p.y + p.height / 2, p.width * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        continue;
      }

      if (p.type === 'code_wave') {
        const sx = p.x - cameraX;
        ctx.save();
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(sx, p.y + 4, p.width, p.height - 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 4, p.y + 8, p.width - 8, p.height - 16);
        ctx.restore();
        continue;
      }

      let spriteKey = 'proj_filter';
      if (p.type === 'ghosting') spriteKey = 'proj_ghosting';
      if (p.type === 'shockwave') spriteKey = 'proj_shockwave';

      const sprite = renderer.get(spriteKey);
      ctx.save();
      if (p.deflected) {
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 14;
      }
      if (sprite) {
        ctx.drawImage(sprite, p.x - cameraX, p.y);
      } else {
        ctx.fillStyle = p.deflected ? '#00e5ff' : '#ff1744';
        ctx.fillRect(p.x - cameraX, p.y, p.width, p.height);
      }
      ctx.restore();
    }
  }

  static renderGameplayIndicators(ctx, player, combo = null, width = 1280) {
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

    // Barra de Foco Chronos (Q) e Indicador Iaido Blitz (F/L)
    const iaidoReady = player.iaidoCooldownTimer <= 0;
    const iaidoPct = iaidoReady ? 1 : Math.max(0, 1 - player.iaidoCooldownTimer / player.iaidoCooldown);
    const ix = x + 136;
    ctx.fillStyle = 'rgba(10, 14, 26, 0.78)';
    ctx.fillRect(ix, y, 128, 22);
    ctx.strokeStyle = iaidoReady ? '#ff2a85' : '#546e7a';
    ctx.strokeRect(ix, y, 128, 22);
    ctx.fillStyle = iaidoReady ? '#ff2a85' : '#880e4f';
    ctx.fillRect(ix + 3, y + 3, Math.floor(122 * iaidoPct), 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(iaidoReady ? 'IAIDO [F]' : 'IAIDO...', ix + 8, y + 15);

    const cxBar = ix + 136;
    const chronosPct = Math.max(0, Math.min(1, (player.chronosEnergy || 0) / (player.chronosMax || 100)));
    ctx.fillStyle = 'rgba(10, 14, 26, 0.78)';
    ctx.fillRect(cxBar, y, 136, 22);
    ctx.strokeStyle = player.chronosActive ? '#ffffff' : '#7c4dff';
    ctx.strokeRect(cxBar, y, 136, 22);
    ctx.fillStyle = player.chronosActive ? '#00e5ff' : '#7c4dff';
    ctx.fillRect(cxBar + 3, y + 3, Math.floor(130 * chronosPct), 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(player.chronosActive ? 'CHRONOS ON' : 'CHRONOS [Q]', cxBar + 8, y + 15);

    if (player.hasDoubleJump) {
      const djX = cxBar + 144;
      ctx.fillStyle = 'rgba(10, 14, 26, 0.78)';
      ctx.fillRect(djX, y, 112, 22);
      ctx.strokeStyle = '#ffd700';
      ctx.strokeRect(djX, y, 112, 22);
      ctx.fillStyle = '#ffd700';
      ctx.fillText('2X JUMP', djX + 12, y + 15);
    }

    // Indicadores Metal Slug: [G] Git Bombs e [F] Framework Burst
    const bombX = x;
    const bombY = y + 28;
    ctx.fillStyle = 'rgba(10, 14, 26, 0.78)';
    ctx.fillRect(bombX, bombY, 128, 20);
    ctx.strokeStyle = (player.bombAmmo || 0) > 0 ? '#ff9100' : '#546e7a';
    ctx.strokeRect(bombX, bombY, 128, 20);
    ctx.fillStyle = (player.bombAmmo || 0) > 0 ? '#ff9100' : '#90a4ae';
    ctx.fillText(`[G] BOMB x${player.bombAmmo || 0}`, bombX + 8, bombY + 14);

    if ((player.frameworkAmmo || 0) > 0) {
      const fwX = bombX + 136;
      ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
      ctx.fillRect(fwX, bombY, 148, 20);
      ctx.strokeStyle = '#00e5ff';
      ctx.strokeRect(fwX, bombY, 148, 20);
      ctx.fillStyle = '#00e5ff';
      ctx.fillText(`[F] BURST x${player.frameworkAmmo}`, fwX + 8, bombY + 14);
    }

    // Contador de Combo em Tempo Real
    if (combo && combo.count >= 2 && combo.timer > 0) {
      const cx = width - 210;
      const cy = 94;
      const decayPct = Math.max(0, combo.timer / combo.maxTimer);
      const mult = (1 + Math.min(3, Math.floor(combo.count / 3)) * 0.5).toFixed(1);

      ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
      ctx.fillRect(cx, cy, 192, 34);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, 192, 34);

      ctx.fillStyle = '#ffd700';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText(`COMBO x${combo.count}`, cx + 10, cy + 16);

      ctx.fillStyle = '#00e5ff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(`${mult}x PTS`, cx + 124, cy + 16);

      ctx.fillStyle = '#263238';
      ctx.fillRect(cx + 8, cy + 23, 176, 6);
      ctx.fillStyle = '#ff9100';
      ctx.fillRect(cx + 8, cy + 23, Math.floor(176 * decayPct), 6);
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
