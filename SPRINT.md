# 🏃 Sprint: Controles, Leitura Visual & Identidade 16-Bit

> **Objetivo:** Elevar o *Protocolo Primeira Vaga* ao padrão de *game feel*, clareza visual e identidade de clássicos 2D como *Celeste*, *Shovel Knight*, *Dead Cells* e *The Messenger*.

---

## Bloco 1 — Controles Imediatos e Justos (*Game Feel*)

- [x] **1.1 Cancelamento de ataque com Dash (*Dash Cancel*)**
  - **Arquivo:** `src/entities/Player.js`
  - **Critério de Aceite (DoD):** Pressionar `C` / `Shift` durante um golpe interrompe o ataque imediatamente e executa o Dash.
- [x] **1.2 Golpe para baixo no ar (*Pogo Attack*)**
  - **Arquivo:** `src/entities/Player.js`
  - **Critério de Aceite (DoD):** Segurar `S` / `ArrowDown` + `Ataque` no ar executa golpe para baixo estilo *Shovel Knight*/*Hollow Knight*, quicando o jogador ao acertar inimigos, Boss ou armadilhas.
- [x] **1.3 *Input Buffer* para Dash e Ataque**
  - **Arquivo:** `src/entities/Player.js`
  - **Critério de Aceite (DoD):** Apertar ataque ou dash até `100ms` antes do fim do cooldown/animação anterior dispara a ação automaticamente no próximo frame válido.

---

## Bloco 2 — Leitura Clara na Tela (*Telegraphs* & Feedback)

- [x] **2.1 *Telegraph* em todos os inimigos**
  - **Arquivo:** `src/entities/Enemy.js`
  - **Critério de Aceite (DoD):** Antes de o **Drone (Ghosting)** atirar ou o **Bug** dar o bote, exibir brilho/contorno de carga por `0.35s` para leitura justa.
- [x] **2.2 Barra de vida discreta nos inimigos + *Hit Flash* branco**
  - **Arquivos:** `src/entities/Enemy.js`, `src/entities/Boss.js`
  - **Critério de Aceite (DoD):** Ao acertar qualquer inimigo ou o **ATS-9000**, o sprite pisca branco por `80ms` e a barra de HP do inimigo aparece após o primeiro dano.
- [x] **2.3 Indicador de Núcleo Aberto no ATS-9000**
  - **Arquivo:** `src/entities/Boss.js`
  - **Critério de Aceite (DoD):** Quando `isCoreExposed === true`, exibir alvo pulsante dourado + texto **`NÚCLEO EXPOSTO!`** sobre o Boss.

---

## Bloco 3 — Identidade Forte, Humor & Áudio Marcante

- [x] **3.1 Atmosfera distinta por Zona (Céu & Iluminação)**
  - **Arquivo:** `src/world/ParallaxBackground.js`
  - **Critério de Aceite (DoD):** Transição gradual de paleta por `cameraX`: dia vibrante na **Zona 1**, crepúsculo roxo/néon na **Zona 2** e noite corporativa cibernética na **Zona 3**.
- [x] **3.2 Micro-falas de humor nos inimigos e Boss**
  - **Arquivos:** `src/entities/Enemy.js`, `src/entities/Boss.js`
  - **Critério de Aceite (DoD):** Balões curtos contextuais (ex: Bug dizendo `"Funciona na minha máquina!"`, ATS-9000 dizendo `"Faltam 10 anos de React!"` ao entrar na Fase 2).
- [x] **3.3 Scheduler de Áudio sem *jitter***
  - **Arquivo:** `src/audio/SoundEngine.js`
  - **Critério de Aceite (DoD):** Trocar `setInterval` do chiptune por *lookahead scheduling* com `ctx.currentTime` para manter o ritmo 16-bit cravado mesmo em troca de aba ou picos de CPU.

---

## ✅ Fechamento da Sprint (QA & Testes)

- [x] Adicionar testes unitários em `src/tests/SelfTest.js` para **Dash Cancel**, **Pogo Attack** e **Buffer de Ataque/Dash**.
- [x] Executar `node tests/run-tests.mjs` (100% verde) e validar no navegador em `http://localhost:8099`.

---

# 🔫 Sprint 2: DNA Metal Slug 1–3 (Ritmo Arcade, Destrutibilidade & Clímax)

> **Objetivo:** Incorporar referências de *Metal Slug 1, 2 e 3* para elevar o loop de risco-recompensa, feedback explosivo, humor visual e clímax de chefe.

- [x] **S2.1 Explosões em Camadas, Estilhaços e Poeira de Aterrissagem** (`src/world/ParticleSystem.js`, `src/entities/Player.js`)
- [x] **S2.2 Caixas Destrutíveis, Devs POWs Resgatáveis e Bônus no Placar** (`src/world/Level1.js`, `src/world/WorldRenderer.js`, `src/services/LeaderboardService.js`, `src/main.js`)
- [x] **S2.3 Pickups por Letra (`[F]` Framework Burst & `[G]` Git Bomb Anti-Escudo) + Status Cômico `Over-Caffeine`** (`src/entities/Player.js`, `src/entities/Enemy.js`, `src/input/InputController.js`)
- [x] **S2.4 Arena Tática, Módulo Destrutível, Spam Automático e Morte Cinematográfica do ATS-9000** (`src/entities/Boss.js`, `src/world/Level1.js`)
- [x] **S2.5 Cobertura de Testes em `src/tests/SelfTest.js` e Validação via `node tests/run-tests.mjs`**

---

# 🎨 Sprint 3: Densidade de Animação Frame-a-Frame Hi-Bit

> **Objetivo:** Elevar a expressividade frame-a-frame de heróis, inimigos, POWs e objetos de cena ao padrão 16-bit de *Metal Slug*.

- [x] **S3.1 Spritesheets de Ação do Herói & Heroína (`Jump`, `Fall/Dash`, `Crouch`, `Hurt`)** (`assets/sprites/hero_actions_frames.png`, `assets/sprites/hero_female_actions_frames.png`, `src/assets/PixelRenderer.js`, `src/entities/Player.js`)
- [x] **S3.2 Agachar Funcional (`S` / `↓`) com Redução de Hitbox & Corrida 4-Beat** (`src/entities/Player.js`)
- [x] **S3.3 Ciclos de 4 Frames e Estados Reativos em Todos os Inimigos (`lunge`, `noshield`, `charge`)** (`src/assets/PixelRenderer.js`, `src/entities/Enemy.js`)
- [x] **S3.4 Sprites Hi-Bit para Caixas, Pickups `[F]`/`[G]`, `Git Bomb` e POWs Animados com `bg_npc_*`** (`src/assets/PixelRenderer.js`, `src/world/WorldRenderer.js`, `src/world/Level1.js`)
- [x] **S3.5 Cobertura de Testes e Validação via `node tests/run-tests.mjs`**

---

# 💥 Pilar B: Destrutibilidade, Explosões e "Juice" Visual

> **Objetivo:** Transformar o impacto de combate e a interação com o cenário com explosões volumétricas em camadas, reação em cadeia, destrutíveis multi-hit e marcas permanentes no solo.

- [x] **PB.1 Explosões Volumétricas, Anéis de Onda de Choque, Marcas de Chamuscado & Screen Flash** (`src/world/ParticleSystem.js`, `src/entities/Enemy.js`, `src/entities/Boss.js`)
- [x] **PB.2 Barris Explosivos com Reação em Cadeia, Caixas Blindadas Multi-Hit & Servidores Corporativos** (`src/world/Destructibles.js`, `src/world/Level1.js`, `src/assets/PixelRenderer.js`, `src/world/WorldRenderer.js`, `src/main.js`)
- [x] **PB.3 Cobertura de Testes do Pilar B em `src/tests/SelfTest.js` (`node tests/run-tests.mjs`)**
