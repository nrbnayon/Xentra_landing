/**
 * translationService.ts (Next.js version)
 */

const STORAGE_KEY = "xentra_translation_cache_v2";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isDev = process.env.NODE_ENV === "development";
const LOG = "[TranslationService]";

let circuitBroken = false;
let lastFailureTime = 0;
const BREAKER_COOLDOWN = 60000; // 1 minute

function log(msg: string, data?: unknown) {
  if (isDev) {
    data !== undefined
      ? console.log(`${LOG} ${msg}`, data)
      : console.log(`${LOG} ${msg}`);
  }
}

function warn(msg: string, err?: unknown) {
  console.warn(`${LOG} ⚠️ ${msg}`, err ?? "");
}

type StorageCache = Record<string, Record<string, string>>;

interface PersistedStore {
  cache: StorageCache;
  expiresAt: number;
}

const MANUAL_GLOSSARY: StorageCache = {
  th: {
    home: "หน้าแรก",
    about: "เกี่ยวกับเรา",
    contact: "ติดต่อ",
    "install now": "ติดตั้งตอนนี้",
    experience: "ประสบการณ์",
    sports: "กีฬา",
    "like never before": "อย่างที่ไม่เคยมีมาก่อน",
    "join thousands of users enjoying live match updates, secure transactions, and an immersive sports experience designed for every fan.":
      "เข้าร่วมกับผู้ใช้นับพันที่เพลิดเพลินกับการอัปเดตการแข่งขันสด การทำธุรกรรมที่ปลอดภัย และประสบการณ์กีฬาที่สมจริงซึ่งออกแบบมาเพื่อแฟนทุกคน",
    users: "ผู้ใช้",
    matches: "การแข่งขัน",
    "enjoy a seamless sports experience with advanced analytics, secure payments, and real-time match tracking designed to keep you ahead of the game.":
      "เพลิดเพลินกับประสบการณ์กีฬาที่ไร้รอยต่อด้วยการวิเคราะห์ขั้นสูง การชำระเงินที่ปลอดภัย และการติดตามการแข่งขันแบบเรียลไทม์ที่ออกแบบมาเพื่อให้คุณนำหน้าเกมเสมอ",
    "predict now": "ทำนายตอนนี้",
    "learn more": "เรียนรู้เพิ่มเติม",
    "about us": "เกี่ยวกับเรา",
    "built for the next generation of sports fans.":
      "สร้างขึ้นเพื่อแฟนกีฬารุ่นต่อไป",
    "we are focused on creating a next-generation sports platform with fast performance, real-time updates, secure transactions, and user-friendly experiences that keep fans connected to every moment of the game.":
      "เรามุ่งเน้นการสร้างแพลตฟอร์มกีฬายุคใหม่ด้วยประสิทธิภาพที่รวดเร็ว การอัปเดตแบบเรียลไทม์ ธุรกรรมที่ปลอดภัย และประสบการณ์ที่ใช้งานง่ายซึ่งช่วยให้แฟนๆ เชื่อมต่อกับทุกช่วงเวลาของเกม",
    "get updates": "รับข่าวสาร",
    "enter your email to get updates": "กรอกอีเมลของคุณเพื่อรับข่าวสาร",
    "send message": "ส่งข้อความ",
    "all rights reserved.": "สงวนลิขสิทธิ์",
    "privacy policy": "นโยบายความเป็นส่วนตัว",
    "terms of service": "ข้อกำหนดการให้บริการ",
    "powered by travex llc": "ขับเคลื่อนโดย Travex LLC",
    "real-time experience": "ประสบการณ์เรียลไทม์",
    "smart predictions": "การพยากรณ์อัจฉริยะ",
    "global competition": "การแข่งขันระดับโลก",
    "secure & fair": "ปลอดภัยและยุติธรรม",
    "stay updated with real-time scores, stats, and match highlights.": "อัปเดตคะแนน สถิติ และไฮไลท์การแข่งขันแบบเรียลไทม์",
    "compete in live predictions and test your knowledge against fans worldwide.": "ร่วมทำนายผลสดและทดสอบความรู้ของคุณกับแฟนๆ ทั่วโลก",
    "play, compete, and climb the leaderboards across the world.": "เล่น แข่งขัน และไต่อันดับกระดานผู้นำทั่วโลก",
    "transparent systems and a fair play environment you can trust.": "ระบบที่โปร่งใสและสภาพแวดล้อมการเล่นที่ยุติธรรมที่คุณไว้วางใจได้",
    "we're here to help!": "เราพร้อมช่วยเหลือคุณ!",
    "questions? reach out anytime, we're here": "มีคำถาม? ติดต่อเราได้ตลอดเวลา เราพร้อมช่วยเหลือ",
    "welcome to xentra": "ยินดีต้อนรับสู่ Xentra",
  },
  ht: {
    home: "Akèy",
    about: "Konsènan",
    contact: "Kontak",
    "install now": "Enstale kounye a",
    experience: "Eksperyans",
    sports: "Espò",
    "like never before": "tankou pa janm anvan",
    "welcome to xentra": "Byenvini sou Xentra!",
    "privacy policy": "Politk sou Konfidansyalite",
    "terms of service": "Kondisyon Jenerol",
    "predict now": "Fè prediksyon kounye a",
    "learn more": "Aprann plis",
    users: "Itilizatè yo",
    "get updates": "Resevwa mizajou",
    "enter your email to get updates": "Antre imèl ou pou resevwa mizajou",
    "send message": "Voye mesaj",
    "all rights reserved.": "Tout dwa rezève.",
    "powered by travex llc": "Powered by Travex LLC",
    "real-time experience": "Eksperyans an tan reyèl",
    "smart predictions": "Prediksyon entelijan",
    "global competition": "Konpetisyon mondyal",
    "secure & fair": "Sekirite ak Jis",
    "stay updated with real-time scores, stats, and match highlights.": "Rete enfòme ak nòt, estatistik ak pwen fò an tan reyèl.",
    "compete in live predictions and test your knowledge against fans worldwide.": "Konpeti nan prediksyon an dirèk epi teste konesans ou kont fanatik atravè mond lan.",
    "play, compete, and climb the leaderboards across the world.": "Jwe, konpeti, epi moute nan klasman mondyal yo.",
    "transparent systems and a fair play environment you can trust.": "Sistèm transparan ak yon anviwònman jwèt ki jis ou ka fè konfyans.",
    "we're here to help!": "Nou la pou ede ou!",
    "questions? reach out anytime, we're here": "Kesyon? Kontakte nou nenpòt lè, nou la",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    contact: "Contact",
    "install now": "Installer maintenant",
    experience: "Expérience",
    sports: "Sports",
    "like never before": "comme jamais auparavant",
    "join thousands of users enjoying live match updates, secure transactions, and an immersive sports experience designed for every fan.":
      "Rejoignez des milliers d'utilisateurs profitant de mises à jour de matchs en direct, de transactions sécurisées et d'une expérience sportive immersive conçue pour chaque fan.",
    users: "Utilisateurs",
    matches: "Matchs",
    "enjoy a seamless sports experience with advanced analytics, secure payments, and real-time match tracking designed to keep you ahead of the game.":
      "Profitez d'une expérience sportive fluide avec des analyses avancées, des paiements sécurisés et un suivi des matchs en temps réel conçu pour vous garder en tête du jeu.",
    "predict now": "Prédire maintenant",
    "learn more": "En savoir plus",
    "about us": "À propos de nous",
    "built for the next generation of sports fans.":
      "Conçu pour la prochaine génération de fans de sport.",
    "we are focused on creating a next-generation sports platform with fast performance, real-time updates, secure transactions, and user-friendly experiences that keep fans connected to every moment of the game.":
      "Nous nous concentrons sur la création d'une plateforme sportive de nouvelle génération avec des performances rapides, des mises à jour en temps réel, des transactions sécurisées et des expériences conviviales qui maintiennent les fans connectés à chaque instant du jeu.",
    "real-time experience": "Expérience en temps réel",
    "smart predictions": "Prédictions intelligentes",
    "global competition": "Compétition mondiale",
    "secure & fair": "Sûr et équitable",
    "stay updated with real-time scores, stats, and match highlights.":
      "Restez informé des scores, des statistiques et des moments forts des matchs en temps réel.",
    "compete in live predictions and test your knowledge against fans worldwide.":
      "Participez à des prédictions en direct et testez vos connaissances face à des fans du monde entier.",
    "play, compete, and climb the leaderboards across the world.":
      "Jouez, concourez et grimpez dans les classements mondiaux.",
    "transparent systems and a fair play environment you can trust.":
      "Des systèmes transparents et un environnement de jeu équitable en qui vous pouvez avoir confiance.",
    "we're here to help!": "Nous sommes là pour vous aider !",
    "questions? reach out anytime, we're here":
      "Des questions ? Contactez-nous à tout moment, nous sommes là",
    "get updates": "Recevoir des mises à jour",
    "enter your email to get updates":
      "Entrez votre e-mail pour recevoir des mises à jour",
    "send message": "Envoyer le message",
    "all rights reserved.": "Tous droits réservés.",
    "privacy policy": "Politique de confidentialité",
    "terms of service": "Conditions d'utilisation",
    "powered by travex llc": "Propulsé par Travex LLC",
  },
  es: {
    home: "Inicio",
    about: "Nosotros",
    contact: "Contacto",
    "install now": "Instalar ahora",
    experience: "Experiencia",
    sports: "Deportes",
    "like never before": "como nunca antes",
    "join thousands of users enjoying live match updates, secure transactions, and an immersive sports experience designed for every fan.":
      "Únete a miles de usuarios que disfrutan de actualizaciones de partidos en vivo, transacciones seguras y una experiencia deportiva inmersiva diseñada para cada fan.",
    users: "Usuarios",
    matches: "Partidos",
    "enjoy a seamless sports experience with advanced analytics, secure payments, and real-time match tracking designed to keep you ahead of the game.":
      "Disfruta de una experiencia deportiva fluida con analíticas avanzadas, pagos seguros y seguimiento de partidos en tiempo real diseñado para mantenerte a la vanguardia.",
    "predict now": "Predecir ahora",
    "learn more": "Saber más",
    "about us": "Nosotros",
    "built for the next generation of sports fans.":
      "Creado para la próxima generación de fans del deporte.",
    "we are focused on creating a next-generation sports platform with fast performance, real-time updates, secure transactions, and user-friendly experiences that keep fans connected to every moment of the game.":
      "Nos enfocamos en crear una plataforma deportiva de próxima generación con alto rendimiento, actualizaciones en tiempo real, transacciones seguras y experiencias fáciles de usar que mantienen a los fans conectados en cada momento.",
    "real-time experience": "Experiencia en tiempo real",
    "smart predictions": "Predicciones inteligentes",
    "global competition": "Competición global",
    "secure & fair": "Seguro y justo",
    "stay updated with real-time scores, stats, and match highlights.":
      "Mantente al día con resultados, estadísticas y resúmenes en tiempo real.",
    "compete in live predictions and test your knowledge against fans worldwide.":
      "Compite en predicciones en vivo y pon a prueba tus conocimientos contra fans de todo el mundo.",
    "play, compete, and climb the leaderboards across the world.":
      "Juega, compite y escala en las tablas de clasificación mundiales.",
    "transparent systems and a fair play environment you can trust.":
      "Sistemas transparentes y un entorno de juego limpio en el que puedes confiar.",
    "we're here to help!": "¡Estamos aquí para ayudarte!",
    "questions? reach out anytime, we're here":
      "¿Preguntas? Contáctanos en cualquier momento, estamos aquí",
    "get updates": "Recibir novedades",
    "enter your email to get updates":
      "Ingresa tu email para recibir novedades",
    "send message": "Enviar mensaje",
    "all rights reserved.": "Todos los derechos reservados.",
    "privacy policy": "Política de privacidad",
    "terms of service": "Términos de servicio",
    "powered by travex llc": "Desarrollado por Travex LLC",
  },
};

class TranslationService {
  private mem: StorageCache = {};
  private hydrated = false;
  private hydratePromise: Promise<void> | null = null;
  private inflight = new Map<string, Promise<string>>();

  async hydrate(): Promise<void> {
    if (this.hydrated) return;
    if (this.hydratePromise) return this.hydratePromise;

    this.hydratePromise = (async () => {
      if (typeof window === "undefined") return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const stored: PersistedStore = JSON.parse(raw);
        if (Date.now() < stored.expiresAt) {
          this.mem = stored.cache;
          log("Cache hydrated.");
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        warn("Failed to hydrate cache:", e);
      } finally {
        this.hydrated = true;
      }
    })();

    return this.hydratePromise;
  }

  private normalize(text: string): string {
    if (!text) return "";
    // Lowercase, trim, and replace all whitespace/newlines with a single space
    return text.toLowerCase().trim().replace(/\s+/g, " ");
  }

  private memGet(lang: string, text: string): string | undefined {
    const key = this.normalize(text);
    const manual = MANUAL_GLOSSARY[lang]?.[key];
    if (manual) return manual;
    return this.mem[lang]?.[key];
  }

  private memSet(lang: string, text: string, translation: string): void {
    if (!this.mem[lang]) this.mem[lang] = {};
    this.mem[lang][this.normalize(text)] = translation;
  }

  private persistDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  private schedulePersist(): void {
    if (this.persistDebounceTimer) clearTimeout(this.persistDebounceTimer);
    this.persistDebounceTimer = setTimeout(() => this.persist(), 2000);
  }

  private async persist(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const store: PersistedStore = {
        cache: this.mem,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      log("Cache persisted.");
    } catch (e) {
      warn("Failed to persist cache:", e);
    }
  }

  private checkCircuit(): boolean {
    if (circuitBroken) {
      if (Date.now() - lastFailureTime > BREAKER_COOLDOWN) {
        circuitBroken = false;
        return true;
      }
      return false;
    }
    return true;
  }

  private triggerBreaker() {
    circuitBroken = true;
    lastFailureTime = Date.now();
    warn("Circuit broken. Pausing translation requests for 60s.");
  }

  async translate(text: string, targetLang: string): Promise<string> {
    if (!text || !text.trim() || targetLang === "en") return text;
    if (!this.checkCircuit()) return text;

    await this.hydrate();

    const cached = this.memGet(targetLang, text);
    if (cached !== undefined) return cached;

    const inflightKey = `${targetLang}:${text}`;
    const existing = this.inflight.get(inflightKey);
    if (existing) return existing;

    // Small delay to prevent massive bursts
    await new Promise(r => setTimeout(r, 100));

    const request = this.fetchSingle(text, targetLang).finally(() => {
      this.inflight.delete(inflightKey);
    });

    this.inflight.set(inflightKey, request);
    return request;
  }

  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    if (targetLang === "en") return texts;
    if (!this.checkCircuit()) return texts;

    await this.hydrate();

    const results: string[] = new Array(texts.length);
    const misses: { text: string; idx: number }[] = [];

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text?.trim()) {
        results[i] = text;
        continue;
      }
      const cached = this.memGet(targetLang, text);
      if (cached !== undefined) {
        results[i] = cached;
      } else {
        misses.push({ text, idx: i });
      }
    }

    if (misses.length === 0) return results;

    try {
      const translations = await this.fetchBatch(
        misses.map((m) => m.text),
        targetLang,
      );

      for (let i = 0; i < misses.length; i++) {
        const translated = translations[i] ?? misses[i].text;
        results[misses[i].idx] = translated;
        this.memSet(targetLang, misses[i].text, translated);
      }

      this.schedulePersist();
    } catch (e) {
      warn("Batch translation failed:", e);
      for (const { text, idx } of misses) results[idx] = text;
    }

    return results;
  }

  getCached(text: string, targetLang: string): string | undefined {
    if (targetLang === "en") return text;
    return this.memGet(targetLang, text);
  }

  async clearCache(): Promise<void> {
    this.mem = {};
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    log("Cache cleared.");
  }

  private async fetchSingle(text: string, targetLang: string): Promise<string> {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          target: targetLang,
        }),
      });

      if (res.status === 403 || res.status === 429) {
        this.triggerBreaker();
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(errorData)}`);
      }

      const json = await res.json();
      const translated: string = json.data.translations[0].translatedText;

      this.memSet(targetLang, text, translated);
      this.schedulePersist();

      return translated;
    } catch (e) {
      warn(`API error for "${text.slice(0, 40)}":`, e);
      return text;
    }
  }

  private async fetchBatch(
    texts: string[],
    targetLang: string,
  ): Promise<string[]> {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: texts,
        target: targetLang,
      }),
    });

    if (res.status === 403 || res.status === 429) {
      this.triggerBreaker();
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(errorData)}`);
    }

    const json = await res.json();
    return json.data.translations.map(
      (t: { translatedText: string }) => t.translatedText,
    );
  }
}

export const translationService = new TranslationService();
