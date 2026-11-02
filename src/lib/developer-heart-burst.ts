import gsap from 'gsap';
import { brandEase } from './motion-curve';

/** A fixed decorative pool: no timers, DOM growth or saved-project side effects. */
export function createDeveloperHeartBurst(root: HTMLElement, layer: HTMLElement, reduced: boolean) {
  const particles = Array.from(layer.querySelectorAll<HTMLElement>('[data-heart-particle]'));
  const flights = new Map<HTMLElement, gsap.core.Timeline>();
  let cursor = 0;
  let lastPhase = 0;
  let lastEmission = -Infinity;
  let lastCard = -1;

  return {
    update(phase: number, card: HTMLElement | undefined, index: number, wide: boolean) {
      if (!card || Math.abs(phase - lastPhase) < 0.001) return;
      const now = performance.now();
      if (now - lastEmission < 180) return;
      if (index === lastCard && Math.abs(phase - lastPhase) < 0.18) return;
      lastPhase = phase;
      lastCard = index;
      lastEmission = now;

      const photo = card.querySelector<HTMLElement>('.developer-hero-photo')!;
      const bounds = root.getBoundingClientRect();
      const image = photo.getBoundingClientRect();
      // Never emit on a refreshed/restored page when the gallery is off screen.
      if (image.bottom < 0 || image.top > innerHeight) return;
      const originX = image.left + image.width / 2 - bounds.left;
      const originY = image.top + image.height * 0.44 - bounds.top;
      const introBottom = root
        .querySelector<HTMLElement>('.developer-hero-intro')!
        .getBoundingClientRect().bottom;
      const availableRise = Math.max(0, originY - (introBottom - bounds.top + 24));
      const burstSize = reduced ? 1 : wide ? 3 : 2;
      layer.dataset.sourceProject = card.dataset.projectId;

      for (let i = 0; i < burstSize; i++) {
        const heart = particles[cursor++ % particles.length];
        flights.get(heart)?.kill();
        const side = ((cursor % 5) - 2) / 2;
        const scale = [0.7, 1, 0.85][cursor % 3];
        gsap.set(heart, {
          x: originX - 12 + (reduced ? 0 : side * 8),
          y: originY - 12,
          opacity: 0,
          scale: reduced ? 1 : 0.4,
          rotation: reduced ? 0 : side * 12,
        });
        const flight = gsap.timeline({ delay: i * 0.07 });
        if (!reduced) {
          flight.to(
            heart,
            {
              x: originX - 12 + side * (wide ? 40 : 24),
              y: originY - 12 - Math.min(availableRise, (wide ? 160 : 112) + (cursor % 3) * 16),
              scale,
              rotation: side * -16,
              duration: 1.6,
              ease: brandEase,
            },
            0,
          );
        }
        flight
          .to(heart, { opacity: 0.95, duration: 0.2, ease: brandEase }, 0)
          .to(
            heart,
            { opacity: 0, duration: reduced ? 0.4 : 0.8, ease: brandEase },
            reduced ? 0.2 : 0.65,
          );
        flights.set(heart, flight);
      }
    },
    destroy() {
      flights.forEach((flight) => flight.kill());
      flights.clear();
      gsap.killTweensOf(particles);
      gsap.set(particles, { opacity: 0 });
      delete layer.dataset.sourceProject;
    },
  };
}
