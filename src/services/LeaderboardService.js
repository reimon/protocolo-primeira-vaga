/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * LeaderboardService.js - Sistema Híbrido de Placar com Fallback e Seed Realista
 */

export class LeaderboardService {
  constructor(apiEndpoint = null, apiKey = null) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.storageKey = 'protocolo_primeira_vaga_leaderboard';
    this.memStorage = null;
    this.ensureDefaultScores();
  }

  getStorage() {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
    if (!this.memStorage) {
      const store = {};
      this.memStorage = {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); }
      };
    }
    return this.memStorage;
  }

  ensureDefaultScores() {
    const storage = this.getStorage();
    const existing = storage.getItem(this.storageKey);
    if (!existing) {
      const defaultLeaderboard = [
        { name: 'ANA', score: 12450, role: 'Fullstack Dev Pleno', date: 'Hoje' },
        { name: 'LEO', score: 10800, role: 'Engenheiro de Software Jr', date: 'Ontem' },
        { name: 'GAB', score: 9550, role: 'Frontend Ninja Jr', date: '3 dias atrás' },
        { name: 'MAR', score: 8700, role: 'Backend Golang Jr', date: '5 dias atrás' },
        { name: 'DAN', score: 7900, role: 'Desenvolvedor Mobile Jr', date: '1 sem atrás' },
        { name: 'BEA', score: 6850, role: 'Data Analyst Jr', date: '2 sem atrás' },
        { name: 'RAU', score: 5400, role: 'QA Automation Jr', date: '1 mês atrás' },
        { name: 'LUI', score: 4300, role: 'Estagiário Dev', date: '1 mês atrás' },
        { name: 'SAM', score: 3200, role: 'Estudante Bootcamp', date: '2 meses atrás' },
        { name: 'VAG', score: 2100, role: 'Aprendiz Iniciante', date: '2 meses atrás' }
      ];
      storage.setItem(this.storageKey, JSON.stringify(defaultLeaderboard));
    }
  }

  async getScores() {
    // Tenta buscar de API remota se configurada
    if (this.apiEndpoint) {
      try {
        const response = await fetch(`${this.apiEndpoint}/leaderboard`, {
          headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
        }
      } catch (err) {
        console.warn('Leaderboard remoto indisponível, usando fallback local:', err.message);
      }
    }

    // Fallback LocalStorage
    try {
      const list = JSON.parse(this.getStorage().getItem(this.storageKey) || '[]');
      return list.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch (e) {
      return [];
    }
  }

  async saveScore(name, score, role = 'Contratado!') {
    const sanitizedName = (name || 'DEV').toUpperCase().slice(0, 8);
    const newEntry = {
      name: sanitizedName,
      score: Math.floor(score),
      role,
      date: 'Agora'
    };

    // Salva Local
    let list = [];
    try {
      list = JSON.parse(this.getStorage().getItem(this.storageKey) || '[]');
    } catch (e) {
      list = [];
    }
    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);
    list = list.slice(0, 10);
    this.getStorage().setItem(this.storageKey, JSON.stringify(list));

    // Se API remota estiver configurada, envia assincronamente em background
    if (this.apiEndpoint) {
      try {
        fetch(`${this.apiEndpoint}/leaderboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
          },
          body: JSON.stringify(newEntry)
        }).catch(() => {});
      } catch (e) {}
    }

    return list;
  }

  calculateFinalScore({ enemiesDefeated, timeSeconds, maxCombo, remainingHp, bossDefeated }) {
    let score = enemiesDefeated * 200;
    score += maxCombo * 150;
    score += remainingHp * 25;
    // Bônus de tempo (quanto mais rápido, mais pontos)
    const timeBonus = Math.max(0, Math.floor((300 - timeSeconds) * 20));
    score += timeBonus;

    if (bossDefeated) {
      score += 5000; // Bônus épico de oferta conquistada
    }

    return Math.max(100, score);
  }
}
