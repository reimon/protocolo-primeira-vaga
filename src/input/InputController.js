/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * InputController.js - Teclado, Touch Virtual e Bindings de Menu/Settings
 */

export class InputController {
  static bindAll(game) {
    InputController.bindKeyboardAndPointer(game);
    InputController.bindTouchControls(game);
    InputController.bindMenuAndSettings(game);
  }

  static bindKeyboardAndPointer(game) {
    const dialogAdvanceKeys = new Set([
      'Enter', 'Space', 'KeyE', 'KeyZ', 'KeyX', 'KeyC', 'KeyJ', 'KeyK'
    ]);

    const handleKeyDown = (e) => {
      game.sound.ensureContext();
      if (e.repeat) return;
      const key = e.code;

      if (game.state === 'LOADING') {
        if (game.loadingScene.isComplete || key === 'Enter' || key === 'Space' || key === 'Escape') {
          game.finishLoading();
        } else {
          game.loadingScene.targetProgress = 100;
        }
        return;
      }

      if (game.state === 'MENTOR_DIALOG') {
        if (dialogAdvanceKeys.has(key)) {
          e.preventDefault();
          game.advanceDialog();
          return;
        }
        if (game.dialog.isOpen) {
          if (key === 'ArrowUp' || key === 'ArrowLeft' || key === 'KeyW' || key === 'KeyA') {
            game.dialog.selectChoice(0);
          } else if (key === 'ArrowDown' || key === 'ArrowRight' || key === 'KeyS' || key === 'KeyD') {
            game.dialog.selectChoice(1);
          }
        }
        return;
      }

      if (key === 'ArrowLeft' || key === 'KeyA') game.input.left = true;
      if (key === 'ArrowRight' || key === 'KeyD') game.input.right = true;

      if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW' || key === 'KeyZ') {
        game.input.jump = true;
        game.input.jumpPressed = true;
      }
      if (key === 'KeyX' || key === 'KeyJ') game.input.attackPressed = true;
      if (key === 'KeyC' || key === 'KeyK' || key === 'ShiftLeft' || key === 'ShiftRight') {
        game.input.dashPressed = true;
      }
      if (key === 'Enter' || key === 'KeyE') {
        game.input.interactPressed = true;
        game.advanceDialog();
      }

      if (game.state === 'SETTINGS') {
        if (key === 'Escape' || key === 'KeyP') {
          e.preventDefault();
          game.closeSettings();
        }
        return;
      }

      if ((key === 'Escape' || key === 'KeyP') &&
          (game.state === 'PLAYING' || game.state === 'BOSS_FIGHT' || game.state === 'MENU')) {
        e.preventDefault();
        game.openSettings();
        return;
      }

      if (key === 'KeyM') {
        const isMuted = game.sound.toggleMute();
        game.updateMuteButtonUI(isMuted);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.code;
      if (key === 'ArrowLeft' || key === 'KeyA') game.input.left = false;
      if (key === 'ArrowRight' || key === 'KeyD') game.input.right = false;
      if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW' || key === 'KeyZ') game.input.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Listener único de pointerdown evita disparo duplicado ao avançar diálogos
    window.addEventListener('pointerdown', (e) => {
      game.sound.ensureContext();
      if (e.target && e.target.closest('button, input, .pixel-modal, .settings-modal')) {
        return;
      }
      if (game.state === 'LOADING') {
        if (game.loadingScene.isComplete) {
          game.finishLoading();
        } else {
          game.loadingScene.targetProgress = 100;
        }
        return;
      }
      if (game.state === 'MENTOR_DIALOG') {
        e.preventDefault();
        game.advanceDialog();
      }
    });
  }

  static bindTouchControls(game) {
    const bindBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); }, { passive: false });
      if (onUp) {
        el.addEventListener('mouseup', (e) => { e.preventDefault(); onUp(); });
        el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
        el.addEventListener('mouseleave', (e) => { e.preventDefault(); onUp(); });
      }
    };

    const handleAction = (onGameplay) => {
      if (game.state === 'LOADING') {
        game.finishLoading();
        return;
      }
      if (game.state === 'MENTOR_DIALOG') {
        game.advanceDialog();
        return;
      }
      onGameplay();
    };

    bindBtn('btnLeft', () => {
      if (game.state === 'MENTOR_DIALOG' && game.dialog.activeDialog?.choices) {
        game.dialog.selectChoice(0);
        return;
      }
      game.input.left = true;
    }, () => { game.input.left = false; });

    bindBtn('btnRight', () => {
      if (game.state === 'MENTOR_DIALOG' && game.dialog.activeDialog?.choices) {
        game.dialog.selectChoice(1);
        return;
      }
      game.input.right = true;
    }, () => { game.input.right = false; });

    bindBtn('btnJump', () => {
      handleAction(() => {
        game.input.jump = true;
        game.input.jumpPressed = true;
      });
    }, () => { game.input.jump = false; });

    bindBtn('btnAttack', () => {
      handleAction(() => { game.input.attackPressed = true; });
    });

    bindBtn('btnDash', () => {
      handleAction(() => { game.input.dashPressed = true; });
    });
  }

  static bindMenuAndSettings(game) {
    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    bindClick('btnPlayGame', () => {
      game.sound.ensureContext();
      game.startNewGame();
    });
    bindClick('btnIntro', () => game.openLoadingIntro());
    bindClick('btnMute', () => {
      const isMuted = game.sound.toggleMute();
      game.updateMuteButtonUI(isMuted);
    });
    bindClick('btnLeaderboard', () => {
      game.sound.ensureContext();
      game.openLeaderboard();
    });

    game.applySettings();

    bindClick('btnSettings', () => game.openSettings());
    bindClick('btnHudSettings', () => game.openSettings());
    bindClick('btnSettingsBack', () => game.closeSettings());

    const toggleSetting = (key) => {
      game.settings[key] = !game.settings[key];
      game.applySettings();
      game.saveSettings();
    };

    bindClick('btnToggleTouch', () => toggleSetting('touch'));
    bindClick('btnGamepadTouch', () => toggleSetting('touch'));
    bindClick('btnToggleShake', () => toggleSetting('shake'));
    bindClick('btnToggleCrt', () => toggleSetting('crt'));

    const setHeroGender = (gender) => {
      game.settings.heroGender = gender;
      game.applySettings();
      game.saveSettings();
    };
    bindClick('btnHeroMale', () => setHeroGender('male'));
    bindClick('btnHeroFemale', () => setHeroGender('female'));

    bindClick('btnKeyboardKeys', () => {
      const hint = document.getElementById('keyboardKeysHint');
      if (hint) hint.classList.toggle('hidden');
    });

    const sliderSfx = document.getElementById('sliderSfx');
    if (sliderSfx) {
      sliderSfx.addEventListener('input', (e) => {
        game.settings.sfx = Number(e.target.value);
        game.sound.setSfxVolume(game.settings.sfx / 100);
        game.saveSettings();
      });
    }

    const sliderMusic = document.getElementById('sliderMusic');
    if (sliderMusic) {
      sliderMusic.addEventListener('input', (e) => {
        game.settings.music = Number(e.target.value);
        game.sound.setBgmVolume(game.settings.music / 100);
        game.saveSettings();
      });
    }
  }

  static pollGamepad(game) {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const gp = pads && pads[0];
    if (!gp) return;

    if (!InputController._prevPad) {
      InputController._prevPad = { jump: false, attack: false, dash: false, start: false };
    }
    const prev = InputController._prevPad;

    const axisX = gp.axes[0] || 0;
    const dpadLeft = gp.buttons[14]?.pressed;
    const dpadRight = gp.buttons[15]?.pressed;

    if (axisX < -0.35 || dpadLeft) game.input.left = true;
    else if (axisX > 0.35 || dpadRight) game.input.right = true;

    const jumpDown = !!gp.buttons[0]?.pressed;
    const attackDown = !!gp.buttons[2]?.pressed;
    const dashDown = !!(gp.buttons[1]?.pressed || gp.buttons[5]?.pressed);
    const startDown = !!gp.buttons[9]?.pressed;

    if (jumpDown) game.input.jump = true;
    if (jumpDown && !prev.jump) {
      if (game.state === 'MENTOR_DIALOG') game.advanceDialog();
      else game.input.jumpPressed = true;
    }
    if (attackDown && !prev.attack) game.input.attackPressed = true;
    if (dashDown && !prev.dash) game.input.dashPressed = true;
    if (startDown && !prev.start) {
      if (game.state === 'PLAYING' || game.state === 'BOSS_FIGHT') game.openSettings();
      else if (game.state === 'SETTINGS') game.closeSettings();
    }

    prev.jump = jumpDown;
    prev.attack = attackDown;
    prev.dash = dashDown;
    prev.start = startDown;
  }
}
