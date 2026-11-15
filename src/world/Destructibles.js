/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * Destructibles.js - Caixas, Barris Explosivos, Servidores, POWs e Reações em Cadeia
 */

export function updateDestructibles(crates, dt, particles) {
  if (!crates) return;
  for (const c of crates) {
    if (c.destroyed) continue;
    if (c.hitTimer > 0) c.hitTimer = Math.max(0, c.hitTimer - dt);
    if (c.kind === 'server' && (c.maxHp || 1) > 1 && c.hp < c.maxHp && particles && Math.random() < 0.08) {
      particles.createSparks(c.x + c.width / 2, c.y + 10, '#00e5ff', 2);
    }
  }
}

export function rescuePow(world, pow) {
  if (!pow || pow.rescued) return;
  pow.rescued = true;
  pow.runTimer = 1.6;
  if (world.stats) {
    world.stats.devsRescued += 1;
    world.stats.score += 500;
  }
  if (world.sound) world.sound.playLevelUp();
  const px = pow.x + pow.width / 2;
  const py = pow.y + pow.height / 2;
  if (world.particles) {
    world.particles.createSparks(px, py, '#00e676', 14);
    if (world.particles.createImpactBurst) {
      world.particles.createImpactBurst(px, py, 1, '#00e676');
    }
    world.particles.createDamageNumber(px, pow.y - 12, 'POW RESGATADO! +500', '#00e676');
  }
  if (pow.drop && world.collectibles) {
    world.collectibles.push({ type: pow.drop, x: pow.x + 5, y: pow.y + 14, width: 24, height: 24 });
  }
}

export function hitDestructible(world, crate, forceDestroy = false) {
  if (!crate || crate.destroyed) return false;
  const cx = crate.x + crate.width / 2;
  const cy = crate.y + crate.height / 2;
  const groundY = (world.height || 720) - 160;

  if (crate.explosive || crate.kind === 'barrel') {
    crate.destroyed = true;
    if (world.stats) world.stats.score += 150;
    explodeArea(world, cx, cy, {
      radius: 112,
      damage: 55,
      scale: 1.35,
      label: 'DEPLOY EXPLODIU!',
      flashColor: '#ff9100'
    });
    if (world.onHitstop) world.onHitstop(0.06);
    return true;
  }

  if (!forceDestroy && (crate.hp || 1) > 1) {
    crate.hp -= 1;
    crate.hitTimer = 0.22;
    if (world.sound) world.sound.playHit();
    if (world.screenShake) world.screenShake.trigger(4, 0.12);
    if (world.onHitstop) world.onHitstop(0.035);

    const isServer = crate.kind === 'server';
    if (world.particles) {
      world.particles.createDebris(cx, cy, isServer ? ['#00e5ff', '#37474f', '#ffd600'] : ['#8d6e63', '#ffd54f', '#5d4037'], 4);
      if (world.particles.createImpactBurst) {
        world.particles.createImpactBurst(cx, cy, world.player ? world.player.facing : 1, isServer ? '#00e5ff' : '#ffd54f');
      }
      world.particles.createDamageNumber(cx, crate.y - 10, isServer ? 'CURTO!' : 'RACHANDO!', isServer ? '#00e5ff' : '#ffd54f');
    }
    return false;
  }

  crate.destroyed = true;
  if (world.sound) world.sound.playHit();
  const isServer = crate.kind === 'server';
  if (world.stats) world.stats.score += isServer ? 150 : 100;
  if (world.screenShake) world.screenShake.trigger(isServer ? 6 : 4, 0.14);
  if (world.onHitstop) world.onHitstop(0.04);

  if (world.particles) {
    if (isServer) {
      world.particles.createExplosion(cx, cy, 0.65, groundY);
      world.particles.createDebris(cx, cy, ['#00e5ff', '#37474f', '#cfd8dc', '#ff9100'], 9);
    } else {
      world.particles.createDebris(cx, cy, ['#8d6e63', '#ffd54f', '#5d4037', '#78909c'], 9);
      if (world.particles.createImpactBurst) {
        world.particles.createImpactBurst(cx, cy, world.player ? world.player.facing : 1, '#ffd54f');
      }
    }
  }

  if (crate.drop && world.collectibles) {
    world.collectibles.push({ type: crate.drop, x: crate.x + 5, y: crate.y + 8, width: 24, height: 24 });
  }
  return true;
}

export function explodeArea(world, cx, cy, options = {}) {
  const blastRadius = options.radius || 90;
  const damage = options.damage || 50;
  const scale = options.scale || 1.25;
  const groundY = (world.height || 720) - 160;

  if (world.particles) {
    world.particles.createExplosion(cx, cy, scale, groundY);
    if (world.particles.triggerScreenFlash) {
      world.particles.triggerScreenFlash(options.flashColor || '#ffffff', 0.28, 0.09);
    }
    if (options.label) {
      world.particles.createDamageNumber(cx, cy - 22, options.label, '#ffd600');
    }
  }
  if (world.screenShake) world.screenShake.trigger(Math.round(10 * Math.min(1.5, scale)), 0.25);
  if (world.sound) world.sound.playEnemyDeath();

  for (const e of world.enemies || []) {
    if (e.isDead) continue;
    const dist = Math.hypot((e.x + e.width / 2) - cx, (e.y + e.height / 2) - cy);
    if (dist <= blastRadius) {
      if (e.hasFrontShield) e.shatterShield(world.particles, world.sound);
      const dealt = e.takeDamage(damage, (e.x + e.width / 2) >= cx ? 1 : -1, world.particles, world.sound);
      if (dealt > 0 && world.registerComboHit) world.registerComboHit(110);
    }
  }

  if (world.state === 'BOSS_FIGHT' && world.boss && !world.boss.isDead) {
    const bDist = Math.hypot((world.boss.x + world.boss.width / 2) - cx, (world.boss.y + world.boss.height / 2) - cy);
    if (bDist <= blastRadius + 45) {
      const isGold = world.player && world.player.armorTier === 'gold';
      const dealt = world.boss.takeDamage(damage, isGold, world.particles, world.sound, world.screenShake);
      if (dealt > 0 && world.registerComboHit) world.registerComboHit(160);
    }
  }

  for (const c of world.crates || []) {
    if (!c.destroyed && Math.hypot((c.x + c.width / 2) - cx, (c.y + c.height / 2) - cy) <= blastRadius) {
      hitDestructible(world, c, true);
    }
  }

  for (const pow of world.pows || []) {
    if (!pow.rescued && Math.hypot((pow.x + pow.width / 2) - cx, (pow.y + pow.height / 2) - cy) <= blastRadius) {
      rescuePow(world, pow);
    }
  }
}
