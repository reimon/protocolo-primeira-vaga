/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * HudController.js - Gestão de HUD e Persistência de Configurações
 */

const SETTINGS_STORAGE_KEY = 'ppv_settings_v1';

export class HudController {
  static loadSettings(defaults) {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        return { ...defaults, ...JSON.parse(raw) };
      }
    } catch (_) {}
    return { ...defaults };
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {}
  }

  static applySettings(settings, soundEngine, onShakeChange) {
    soundEngine.setSfxVolume(settings.sfx / 100);
    soundEngine.setBgmVolume(settings.music / 100);
    if (onShakeChange) onShakeChange(!!settings.shake);

    const crtOverlay = document.querySelector('.crt-scanlines');
    if (crtOverlay) crtOverlay.classList.toggle('hidden', !settings.crt);

    document.body.classList.toggle('touch-enabled', !!settings.touch);

    const sliderSfx = document.getElementById('sliderSfx');
    if (sliderSfx) sliderSfx.value = String(settings.sfx);

    const sliderMusic = document.getElementById('sliderMusic');
    if (sliderMusic) sliderMusic.value = String(settings.music);

    const shakeBtn = document.getElementById('btnToggleShake');
    if (shakeBtn) {
      shakeBtn.textContent = settings.shake ? 'On' : 'Off';
      shakeBtn.classList.toggle('is-off', !settings.shake);
    }

    const crtBtn = document.getElementById('btnToggleCrt');
    if (crtBtn) {
      crtBtn.textContent = settings.crt ? 'On' : 'Off';
      crtBtn.classList.toggle('is-off', !settings.crt);
    }

    const touchBtn = document.getElementById('btnToggleTouch');
    if (touchBtn) {
      touchBtn.textContent = settings.touch ? '🎮 TOUCH: ON' : '🎮 TOUCH: OFF';
    }

    const gpBtn = document.getElementById('btnGamepadTouch');
    if (gpBtn) {
      gpBtn.classList.toggle('is-off', !settings.touch);
    }

    const gender = settings.heroGender === 'female' ? 'female' : 'male';
    document.getElementById('btnHeroMale')?.classList.toggle('active', gender === 'male');
    document.getElementById('btnHeroFemale')?.classList.toggle('active', gender === 'female');
  }

  static updateMuteButton(isMuted) {
    const muteBtn = document.getElementById('btnMute');
    if (muteBtn) {
      muteBtn.textContent = isMuted ? '🔇 ÁUDIO: OFF' : '🔊 ÁUDIO: ON';
    }
  }

  static updateHUD(player, stats) {
    const hpBar = document.getElementById('hpFill');
    const xpBar = document.getElementById('xpFill');
    const scoreVal = document.getElementById('hudScore');
    const tipText = document.getElementById('hudTip');

    if (hpBar && player) {
      const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
      hpBar.style.width = `${hpPct}%`;
    }
    if (xpBar && player) {
      const xpPct = Math.max(0, (player.xp / player.nextXp) * 100);
      xpBar.style.width = `${xpPct}%`;
    }
    if (scoreVal && stats) {
      scoreVal.textContent = String(stats.score).padStart(6, '0');
    }
    if (tipText && stats) {
      tipText.textContent = stats.activeMentorTip;
    }
  }
}
