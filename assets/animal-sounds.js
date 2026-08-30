/**
 * Commeronix - Modular Animal Sounds Synthesizer Engine
 * Pure Client-Side Web Audio API (Zero external MP3 dependencies)
 * Can be independently modified or deleted without affecting core calculation logic.
 */
(function() {
  'use strict';

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Animal Definitions & Meta
  const ANIMAL_MAP = {
    '0': { name: 'Frog', emoji: '🐸', sound: 'Ribbit' },
    '1': { name: 'Cat', emoji: '🐱', sound: 'Meow' },
    '2': { name: 'Dog', emoji: '🐶', sound: 'Bark / Woof' },
    '3': { name: 'Bird', emoji: '🐦', sound: 'Chirp' },
    '4': { name: 'Duck', emoji: '🦆', sound: 'Quack' },
    '5': { name: 'Cow', emoji: '🐮', sound: 'Moo' },
    '6': { name: 'Sheep', emoji: '🐑', sound: 'Baa' },
    '7': { name: 'Lion', emoji: '🦁', sound: 'Roar' },
    '8': { name: 'Monkey', emoji: '🐵', sound: 'Ooh-Aah' },
    '9': { name: 'Elephant', emoji: '🐘', sound: 'Trumpet' },
    '+': { name: 'Wolf', emoji: '🐺', sound: 'Howl' },
    '-': { name: 'Owl', emoji: '🦉', sound: 'Hoot' },
    '*': { name: 'Bee', emoji: '🐝', sound: 'Buzz' },
    '×': { name: 'Bee', emoji: '🐝', sound: 'Buzz' },
    '/': { name: 'Cricket', emoji: '🦗', sound: 'Chirp' },
    '÷': { name: 'Cricket', emoji: '🦗', sound: 'Chirp' },
    '=': { name: 'Dolphin', emoji: '🐬', sound: 'Click & Whistle' },
    'C': { name: 'Bear', emoji: '🐻', sound: 'Growl' },
    'AC': { name: 'Bear', emoji: '🐻', sound: 'Growl' },
    'DEL': { name: 'Horse', emoji: '🐴', sound: 'Neigh' },
    '%': { name: 'Rooster', emoji: '🐔', sound: 'Cock-a-doodle' },
    '.': { name: 'Mouse', emoji: '🐭', sound: 'Squeak' },
    'sin': { name: 'Whale', emoji: '🐋', sound: 'Ocean Call' },
    'cos': { name: 'Eagle', emoji: '🦅', sound: 'Screech' },
    'tan': { name: 'Tiger', emoji: '🐯', sound: 'Purr-Growl' },
    'sqrt': { name: 'Cobra', emoji: '🐍', sound: 'Hiss' },
    'pow': { name: 'Rhino', emoji: '🦏', sound: 'Charge' },
    'log': { name: 'Panda', emoji: '🐼', sound: 'Squeak' },
    'ln': { name: 'Fox', emoji: '🦊', sound: 'Yip' },
    'pi': { name: 'Koala', emoji: '🐨', sound: 'Bellow' },
    'e': { name: 'Deer', emoji: '🦌', sound: 'Call' }
  };

  /**
   * Floating Animal Notification Badge
   */
  let badgeElem = null;
  let badgeTimer = null;

  function showAnimalBadge(info, key) {
    if (!badgeElem) {
      badgeElem = document.createElement('div');
      badgeElem.id = 'calc-animal-badge';
      badgeElem.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(16, 185, 129, 0.4);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.2);
        color: #fff;
        padding: 0.6rem 1.1rem;
        border-radius: 9999px;
        font-size: 0.9rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 9999;
        pointer-events: none;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
        opacity: 0;
        transform: translateY(20px) scale(0.9);
      `;
      document.body.appendChild(badgeElem);
    }

    badgeElem.innerHTML = `
      <span style="font-size: 1.4rem; line-height: 1;">${info.emoji}</span>
      <span>${info.name}</span>
      <span style="color: #10B981; font-weight: 500; font-size: 0.8rem; margin-left: 0.25rem;">"${info.sound}"</span>
      <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; color: #94A3B8; margin-left: 0.25rem;">[${key}]</span>
    `;

    badgeElem.style.opacity = '1';
    badgeElem.style.transform = 'translateY(0) scale(1)';

    clearTimeout(badgeTimer);
    badgeTimer = setTimeout(() => {
      if (badgeElem) {
        badgeElem.style.opacity = '0';
        badgeElem.style.transform = 'translateY(15px) scale(0.95)';
      }
    }, 1200);
  }

  /**
   * Synthesizes specific animal sounds via Web Audio API
   */
  window.playAnimalSound = function(key) {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const keyStr = String(key || '').trim();
      const info = ANIMAL_MAP[keyStr] || { name: 'Animal', emoji: '🐾', sound: 'Tick' };

      showAnimalBadge(info, keyStr);

      switch (keyStr) {
        case '0': // Frog (Ribbit)
          for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            const t = now + i * 0.08;
            osc.frequency.setValueAtTime(140 + i * 40, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.06);
          }
          break;

        case '1': // Cat (Meow)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.28);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
          }
          break;

        case '2': // Dog (Bark / Woof)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(95, now + 0.12);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
          }
          break;

        case '3': // Bird (Chirp)
          for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = now + i * 0.07;
            osc.frequency.setValueAtTime(2200 + i * 500, t);
            osc.frequency.linearRampToValueAtTime(3400 + i * 400, t + 0.03);
            osc.frequency.linearRampToValueAtTime(1900, t + 0.06);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.06);
          }
          break;

        case '4': // Duck (Quack)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(460, now);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
            gain.gain.setValueAtTime(0.24, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.18);
          }
          break;

        case '5': // Cow (Moo)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.linearRampToValueAtTime(160, now + 0.15);
            osc.frequency.linearRampToValueAtTime(115, now + 0.35);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
          }
          break;

        case '6': // Sheep (Baa)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.linearRampToValueAtTime(220, now + 0.28);
            // Tremolo
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
          }
          break;

        case '7': // Lion (Roar)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.linearRampToValueAtTime(65, now + 0.32);
            gain.gain.setValueAtTime(0.32, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
          }
          break;

        case '8': // Monkey (Ooh-Aah)
          for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const t = now + i * 0.12;
            osc.frequency.setValueAtTime(750 + i * 300, t);
            osc.frequency.exponentialRampToValueAtTime(1450 + i * 200, t + 0.08);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.08);
          }
          break;

        case '9': // Elephant (Trumpet)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.linearRampToValueAtTime(920, now + 0.18);
            osc.frequency.linearRampToValueAtTime(780, now + 0.32);
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
          }
          break;

        case '+': // Wolf (Howl)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(720, now + 0.2);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.45);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.45);
          }
          break;

        case '-': // Owl (Hoot)
          for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = now + i * 0.14;
            osc.frequency.setValueAtTime(320 - i * 40, t);
            osc.frequency.linearRampToValueAtTime(260 - i * 40, t + 0.1);
            gain.gain.setValueAtTime(0.22, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
          }
          break;

        case '*':
        case '×': // Bee (Buzz)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.linearRampToValueAtTime(260, now + 0.18);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.18);
          }
          break;

        case '/':
        case '÷': // Cricket (Chirp)
          for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = now + i * 0.04;
            osc.frequency.setValueAtTime(4400, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.025);
          }
          break;

        case '=': // Dolphin (Click & Celebratory Whistle)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(3600, now + 0.18);
            osc.frequency.exponentialRampToValueAtTime(2800, now + 0.28);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
          }
          break;

        case 'C':
        case 'AC': // Bear (Growl)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(90, now);
            osc.frequency.linearRampToValueAtTime(55, now + 0.2);
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
          }
          break;

        case 'DEL': // Horse (Neigh)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(550, now);
            osc.frequency.linearRampToValueAtTime(1100, now + 0.12);
            osc.frequency.linearRampToValueAtTime(750, now + 0.24);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.24);
          }
          break;

        case '%': // Rooster (Crow)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.1);
            osc.frequency.linearRampToValueAtTime(650, now + 0.22);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
          }
          break;

        case '.': // Mouse (Squeak)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(3600, now);
            osc.frequency.linearRampToValueAtTime(4800, now + 0.05);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
          }
          break;

        default: // Scientific / Other Keys (Playful Tone)
          {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(1040, now + 0.1);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
          }
          break;
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  console.log('🐾 Commeronix Animal Sounds Engine loaded successfully.');
})();
