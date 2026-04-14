// Numero WhatsApp usato sia dal pulsante grande nella CTA finale
// sia dai piccoli pulsanti presenti dentro le card prodotto.
const WHATSAPP_NUMBER = "393296687552";

// Raccogliamo i riferimenti principali una sola volta.
// In questo modo il codice resta più leggibile e non interroga
// il DOM ripetutamente a ogni interazione.
const navbar = document.getElementById("navbar");
const mobileToggle = document.getElementById("mobileToggle");
const navLinks = document.getElementById("navLinks");
const cursorGlow = document.getElementById("cursorGlow");
const carousel = document.getElementById("carousel");
const carouselCards = carousel ? Array.from(carousel.querySelectorAll(".product-card")) : [];
const revealElements = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");

// Cambia aspetto alla navbar quando la pagina viene scrollata.
// L'effetto visivo serve a staccarla dallo sfondo e a renderla
// più leggibile una volta che non siamo più in cima alla hero.
window.addEventListener("scroll", () => {
  if (!navbar) {
    return;
  }

  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// Apre e chiude il menu mobile.
// Su schermi piccoli il bottone hamburger aggiunge o rimuove
// la classe "open" che attiva il pannello verticale via CSS.
if (mobileToggle && navLinks) {
  mobileToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  // Quando si clicca una voce del menu mobile, richiudiamo il menu
  // per evitare che resti aperto sopra il contenuto.
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// Gestisce le animazioni di entrata degli elementi marcati con .reveal.
// L'IntersectionObserver è più efficiente di uno scroll listener manuale
// perché reagisce solo quando gli elementi entrano davvero in viewport.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

// Fa avanzare il carosello prodotti di una card per volta.
// Calcoliamo la larghezza reale della prima card e sommiamo il gap fisso
// tra le card, così il movimento resta coerente anche su layout responsive.
function scrollCarousel(direction) {
  if (!carousel) {
    return;
  }

  const firstCard = carousel.querySelector(".product-card");
  if (!firstCard) {
    return;
  }

  const gap = Number.parseFloat(window.getComputedStyle(carousel).gap || "0");
  const cardWidth = firstCard.offsetWidth + gap;
  carousel.scrollBy({ left: cardWidth * direction, behavior: "smooth" });
}

// Tiene in evidenza la card più vicina al centro del carousel.
// In questo modo, soprattutto su touch, si capisce subito quale box
// è quello "attivo" durante lo scorrimento orizzontale.
function updateActiveCarouselCard() {
  if (!carousel || carouselCards.length === 0) {
    return;
  }

  const carouselRect = carousel.getBoundingClientRect();
  const carouselCenter = carouselRect.left + (carouselRect.width / 2);

  let activeCard = carouselCards[0];
  let minDistance = Number.POSITIVE_INFINITY;

  carouselCards.forEach((card) => {
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + (cardRect.width / 2);
    const distance = Math.abs(carouselCenter - cardCenter);

    if (distance < minDistance) {
      minDistance = distance;
      activeCard = card;
    }
  });

  carouselCards.forEach((card) => {
    card.classList.toggle("is-active", card === activeCard);
  });
}

// Collega i due pulsanti freccia del carosello alla funzione sopra.
document.querySelectorAll("[data-carousel-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    scrollCarousel(Number(button.dataset.carouselDirection));
  });
});

if (carousel) {
  let carouselTicking = false;

  const syncActiveCard = () => {
    if (carouselTicking) {
      return;
    }

    carouselTicking = true;
    requestAnimationFrame(() => {
      updateActiveCarouselCard();
      carouselTicking = false;
    });
  };

  updateActiveCarouselCard();
  carousel.addEventListener("scroll", syncActiveCard, { passive: true });
  window.addEventListener("resize", syncActiveCard);
}

// Muove il bagliore arancione solo sui dispositivi che supportano l'hover.
// Evitiamo così di far girare codice inutile su touch screen o mobile.
if (window.matchMedia("(hover: hover)").matches && cursorGlow) {
  document.addEventListener("mousemove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

// Anima i numeri della sezione missione quando entrano in vista.
// Ogni contatore parte da 0 e usa un easing morbido per sembrare più naturale.
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const counter = entry.target;
    const target = Number.parseInt(counter.dataset.target || "0", 10);
    const duration = 1500;
    const start = performance.now();

    function updateCounter(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(target * eased);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
    counterObserver.unobserve(counter);
  });
}, { threshold: 0.5 });

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

// Applica uno scroll dolce a tutti i link interni.
// Invece di saltare brutalmente alla sezione, usiamo scrollIntoView
// per mantenere una navigazione più fluida e coerente col look della pagina.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const selector = anchor.getAttribute("href");
    const target = selector ? document.querySelector(selector) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Ogni pulsante dentro le card prodotto può definire un messaggio diverso
// tramite l'attributo data-whatsapp. Qui costruiamo il link finale e lo
// apriamo in una nuova scheda per non interrompere la sessione corrente.
document.querySelectorAll("[data-whatsapp]").forEach((button) => {
  button.addEventListener("click", () => {
    const message = button.dataset.whatsapp || "";
    const url = `https://wa.me/${IL_TUO_NUMERO}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
});
