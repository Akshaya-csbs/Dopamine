import confetti from 'canvas-confetti';

export function fireSingleHabitConfetti(originX = 0.5, originY = 0.5) {
  try {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { x: originX, y: originY },
      colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      disableForReducedMotion: true,
      ticks: 200,
    });
  } catch (e) {
    console.error('Confetti error:', e);
  }
}

export function fireCelebrationConfetti() {
  try {
    const end = Date.now() + 1000;
    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    console.error('Confetti celebration error:', e);
  }
}

export function fireStreakFlameConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#f97316', '#fbbf24'],
    });
  } catch (e) {
    console.error('Confetti streak error:', e);
  }
}
