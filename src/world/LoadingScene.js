/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * LoadingScene.js - Abertura & Carregamento Temático da Carreira Tech
 * Ilustração 16-Bit Hi-Bit épica: O Jovem Aprendiz com a Espada de Código,
 * o Mentor com o Contrato/Oferta Dourada, e a Cidadela Corporativa ao fundo.
 */

export class LoadingScene {
  constructor(canvasWidth, canvasHeight, soundEngine, renderer = null) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.sound = soundEngine;
    this.renderer = renderer;

    this.progress = 0;
    this.targetProgress = 0;
    this.isComplete = false;
    this.time = 0;

    // Imagem Hi-Bit de Fundo Temática
    this.bgImage = null;
    this.loadIllustration();

    // Frases narrativas focadas na jornada do Primeiro Emprego
    this.quotes = [
      "O código abre portas. A persistência e o portfólio conquistam a primeira vaga.",
      "O mapa não é o território: construa projetos reais para vencer o filtro do RH!",
      "Dos tutoriais infinitos ao contrato assinado: fundamentos constroem lendas.",
      "O algoritmo do ATS busca palavras-chave, mas o time de engenharia contrata quem resolve problemas.",
      "Aprenda rápido, erre barato, versione tudo no Git e mostre valor prático ao mercado.",
      "Todo desenvolvedor sênior um dia foi um jovem aprendiz enfrentando o primeiro desafio."
    ];
    this.quoteIndex = 0;
    this.quoteTimer = 0;

    // Runas de código e fragmentos de tecnologia flutuantes
    this.floatingCodeRunes = [];
    this.initFloatingRunes();

    // Faíscas de energia cibernética
    this.sparks = [];
  }

  loadIllustration() {
    if (typeof Image === 'undefined') return;
    this.bgImage = new Image();
    this.bgImage.src = 'assets/sprites/intro_career_loading.png';
  }

  initFloatingRunes() {
    const snippets = [
      '{ code: 200 }',
      'git commit -m "feat: first job"',
      'const offer = await apply();',
      'npm test: 26/26 PASS',
      '<TechApprentice />',
      'function buildPortfolio()',
      'RH_FILTER.bypass(SKILLS)',
      'CleanCode.enforce()',
      'OFERTA_DOURADA: 100%'
    ];

    for (let i = 0; i < 14; i++) {
      this.floatingCodeRunes.push({
        text: snippets[i % snippets.length],
        x: 40 + Math.random() * (this.width - 240),
        y: this.height * 0.2 + Math.random() * (this.height * 0.6),
        vy: -15 - Math.random() * 25,
        alpha: 0.15 + Math.random() * 0.55,
        color: Math.random() < 0.6 ? '#00e5ff' : (Math.random() < 0.5 ? '#ffd700' : '#00e676')
      });
    }
  }

  update(dt) {
    this.time += dt;
    this.quoteTimer += dt;

    if (this.quoteTimer >= 4.0) {
      this.quoteTimer = 0;
      this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
    }

    // Progresso suave em direção ao targetProgress
    if (this.progress < this.targetProgress) {
      const step = Math.max(12 * dt, (this.targetProgress - this.progress) * 4.5 * dt);
      this.progress = Math.min(this.targetProgress, this.progress + step);
    }

    if (this.progress >= 100 && !this.isComplete) {
      this.progress = 100;
      this.isComplete = true;
      if (this.sound && typeof this.sound.playLevelUp === 'function') {
        this.sound.playLevelUp();
      }
    }

    // Atualiza runas de código flutuantes
    this.floatingCodeRunes.forEach(rune => {
      rune.y += rune.vy * dt;
      if (rune.y < 80) {
        rune.y = this.height - 90;
        rune.x = 40 + Math.random() * (this.width - 240);
      }
    });

    // Emissão de faíscas cibernéticas
    if (Math.random() < 0.35) {
      this.sparks.push({
        x: this.width * 0.42 + (Math.random() * 80 - 40),
        y: this.height * 0.5 + (Math.random() * 80 - 40),
        vx: (Math.random() * 60 - 30),
        vy: -20 - Math.random() * 40,
        color: Math.random() < 0.5 ? '#00e5ff' : '#ffd700',
        size: 2 + Math.random() * 2,
        life: 0.4
      });
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
      if (sp.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // 1. Ilustração Hi-Bit 16-Bit Temática do Primeiro Emprego
    const introImg = (this.renderer && this.renderer.ext && this.renderer.ext('intro_career')) || this.bgImage;

    if (introImg && introImg.complete && introImg.naturalWidth > 0) {
      ctx.drawImage(introImg, 0, 0, this.width, this.height);
    } else {
      // Fallback de degradê atmosférico enquanto o PNG decodifica
      const grad = ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, '#0a0d1a');
      grad.addColorStop(0.5, '#1e1435');
      grad.addColorStop(1, '#3b1c24');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Vinheta e Scanlines Retrô
    const vignette = ctx.createLinearGradient(0, 0, 0, this.height);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    vignette.addColorStop(0.2, 'rgba(0, 0, 0, 0.05)');
    vignette.addColorStop(0.75, 'rgba(0, 0, 0, 0.25)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.height);

    // 3. Runas de Código Flutuantes
    this.renderFloatingRunes(ctx);

    // 4. Efeitos de Faíscas
    this.renderSparks(ctx);

    // 5. Header / Badge Temático da Missão
    this.renderHeaderBadge(ctx);

    // 6. Citação Narrativa no Rodapé
    this.renderQuote(ctx);

    // 7. Barra de Compilação de Carreira (Loading HUD)
    this.renderLoadingHUD(ctx);
  }

  renderHeaderBadge(ctx) {
    ctx.save();
    // Badge Superior Esquerdo
    const bx = 36;
    const by = 28;

    // Fundo translúcido com borda neon
    ctx.fillStyle = 'rgba(8, 12, 24, 0.82)';
    ctx.fillRect(bx, by, 480, 56);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, 480, 56);

    // Acréscimo estético de cantos cibernéticos
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(bx - 2, by - 2, 6, 6);
    ctx.fillRect(bx + 476, by - 2, 6, 6);
    ctx.fillRect(bx - 2, by + 52, 6, 6);
    ctx.fillRect(bx + 476, by + 52, 6, 6);

    // Texto do Badge
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MISSAO: PROTOCOLO PRIMEIRA VAGA', bx + 16, by + 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('A JORNADA DO APRENDIZ ATE A OFERTA TECH', bx + 16, by + 42);

    ctx.restore();
  }

  renderFloatingRunes(ctx) {
    ctx.save();
    ctx.font = 'bold 11px monospace';
    this.floatingCodeRunes.forEach(rune => {
      ctx.fillStyle = rune.color;
      ctx.globalAlpha = rune.alpha * (0.8 + Math.sin(this.time * 3 + rune.x) * 0.2);
      ctx.fillText(rune.text, rune.x, rune.y);
    });
    ctx.restore();
  }

  renderSparks(ctx) {
    ctx.save();
    this.sparks.forEach(sp => {
      ctx.fillStyle = sp.color;
      ctx.fillRect(sp.x, sp.y, sp.size, sp.size);
    });
    ctx.restore();
  }

  renderQuote(ctx) {
    const text = this.quotes[this.quoteIndex];
    const qy = this.height - 38;

    ctx.save();
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    // Sombra preta para legibilidade
    ctx.fillStyle = '#000000';
    ctx.fillText(text, 37, qy + 1);
    ctx.fillText(text, 35, qy - 1);
    ctx.fillText(text, 36, qy + 1);

    ctx.fillStyle = '#f0f4f8';
    ctx.fillText(text, 36, qy);
    ctx.restore();
  }

  renderLoadingHUD(ctx) {
    const barW = 320;
    const barH = 7;
    const barX = this.width - barW - 40;
    const barY = this.height - 40;
    const pct = Math.min(100, Math.floor(this.progress));

    ctx.save();

    // Rótulo da Barra
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`COMPILANDO REQUISITOS TECH`, barX, barY - 14);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`${pct}%`, barX + barW, barY - 14);

    // Fundo da Barra
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Preenchimento com Gradiente Neon
    const fillW = (barW * pct) / 100;
    const barGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    barGrad.addColorStop(0, '#00e5ff');
    barGrad.addColorStop(0.6, '#00e676');
    barGrad.addColorStop(1, '#ffd700');
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, fillW, barH);

    // Botão / Chamada para ação ao concluir
    if (this.isComplete) {
      const blink = Math.floor(Date.now() / 320) % 2 === 0;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = blink ? '#ffd700' : '#ffffff';
      ctx.fillText('[ CLIQUE NA TELA OU ENTER PARA INICIAR ▶ ]', barX + barW, barY + 24);
    } else {
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#90a4ae';
      ctx.fillText('VALIDANDO PROJETOS REAIS • GIT • FUNDAMENTOS', barX + barW, barY + 20);
    }

    ctx.restore();
  }
}
