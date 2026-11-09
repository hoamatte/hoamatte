
"use strict";

// =========================================================
// 1. ELEMENTS
// =========================================================

const stage = document.getElementById("stage");
const charLeft = document.getElementById("charLeft");
const charRight = document.getElementById("charRight");
const gateLeft = document.getElementById("gateLeft");
const gateRight = document.getElementById("gateRight");
const finalTitle = document.getElementById("finalTitle");
const flyingBird = document.getElementById("flyingBird");

// =========================================================
// 2. SETTINGS
// =========================================================

const SETTINGS = {
  initialDelay: 500,
  bowDuration: 1200,
  gateDuration: 2000,
  birdDuration: 4000,
  walkingSpeed: 95,
  minimumWalkDuration: 2200,
  rsvpPage: "rsvp_index.html"
};

// These are the images used by your CSS.
// Keep the filenames exactly as they are in your folder.

const IMAGE_ASSETS = [
  "pagoda_x4.png",
  "bird_anim.png",
  "aodai_man_1.png",
  "aodai_lady_1.png",
  "door_left.png",
  "door_right.png",
  "bird_letter.png"
];

let walkDurationMs = SETTINGS.minimumWalkDuration;
let animationStarted = false;
let birdClicked = false;

// =========================================================
// 3. HELPERS
// =========================================================

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

// =========================================================
// 4. IMAGE PRELOADING
// =========================================================

// Load all images before showing the animation.
// Promise.allSettled prevents one missing image from
// freezing the entire website.

function preloadImage(src) {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = async () => {
      try {
        if (img.decode) {
          await img.decode();
        }
      } catch (error) {
        // Image is still usable if decode fails.
      }

      resolve({ src, success: true });
    };

    img.onerror = () => {
      console.warn("Could not load image:", src);
      resolve({ src, success: false });
    };

    img.src = src;
  });
}

async function preloadAllImages() {
  const results = await Promise.allSettled(
    IMAGE_ASSETS.map(preloadImage)
  );

  const failed = results.filter(result => {
    return (
      result.status === "rejected" ||
      !result.value.success
    );
  });

  if (failed.length > 0) {
    console.warn(
      `${failed.length} image(s) could not be loaded.`
    );
  }

  return results;
}

// =========================================================
// 5. DYNAMIC WALKING SPEED
// =========================================================

function applyDynamicWalkSpeed() {
  if (!stage) return;

  const stageWidth = stage.clientWidth;
  const distanceToCenter = stageWidth / 2;

  walkDurationMs = Math.max(
    SETTINGS.minimumWalkDuration,
    (distanceToCenter / SETTINGS.walkingSpeed) * 1000
  );

  document.documentElement.style.setProperty(
    "--walk-duration",
    `${(walkDurationMs / 1000).toFixed(2)}s`
  );
}

// =========================================================
// 6. BIRD INTERACTION
// =========================================================

function initBirdInteraction() {
  if (!flyingBird) return;

  // Make the bird clickable only after its
  // entrance animation has finished.

  flyingBird.addEventListener("transitionend", event => {
    if (
      event.target === flyingBird &&
      event.propertyName === "transform" &&
      flyingBird.classList.contains("zoom-in")
    ) {
      flyingBird.classList.add("clickable");
      flyingBird.setAttribute("tabindex", "0");
      flyingBird.setAttribute("role", "button");
      flyingBird.setAttribute(
        "aria-label",
        "Open wedding invitation"
      );
    }
  });

  function openInvitation() {
    if (birdClicked) return;

    if (!flyingBird.classList.contains("clickable")) {
      return;
    }

    birdClicked = true;

    flyingBird.classList.remove("clickable");
    flyingBird.classList.add("row-2");
    flyingBird.style.pointerEvents = "none";

    // Give the envelope animation time to play.
    setTimeout(() => {
      window.location.href = SETTINGS.rsvpPage;
    }, 800);
  }

  flyingBird.addEventListener("click", openInvitation);

  flyingBird.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openInvitation();
    }
  });
}

// =========================================================
// 7. SMOOTH ANIMATION SEQUENCE
// =========================================================

async function runAnimation() {
  if (animationStarted) return;
  if (!charLeft || !charRight) return;

  animationStarted = true;

  // PHASE 1: Wait briefly before walking.
  await wait(SETTINGS.initialDelay);

  charLeft.classList.add("center-stage", "walking");
  charRight.classList.add("center-stage", "walking");

  // PHASE 2: Characters reach the center.
  await wait(walkDurationMs);

  charLeft.classList.remove("walking");
  charRight.classList.remove("walking");

  charLeft.classList.add("bowing");
  charRight.classList.add("bowing");

  // PHASE 3: Characters bow.
  await wait(SETTINGS.bowDuration);

  if (gateLeft && gateRight) {
    gateLeft.classList.add("open");
    gateRight.classList.add("open");
  }

  // PHASE 4: Wait for doors to open enough.
  await wait(1000);

  // PHASE 5: Bird flies forward.
  if (flyingBird) {
    flyingBird.classList.add("zoom-in");
  }

  // PHASE 6: Reveal final title.
  await wait(500);

  if (finalTitle) {
    finalTitle.classList.add("show");
  }
}

// =========================================================
// 8. LOADING SCREEN
// =========================================================

function createLoadingScreen() {
  const loader = document.createElement("div");

  loader.id = "weddingLoader";

  Object.assign(loader.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    backgroundColor: "#fff8ef",
    opacity: "1",
    transition: "opacity 0.8s ease",
    pointerEvents: "auto"
  });

  const flower = document.createElement("div");
  flower.textContent = "❀";

  Object.assign(flower.style, {
    fontSize: "54px",
    color: "#d92b1d",
    animation: "loaderPulse 1.5s ease-in-out infinite"
  });

  const message = document.createElement("div");
  message.textContent = "Duyên Lành Hội Ngộ";

  Object.assign(message.style, {
    color: "#405b22",
    fontFamily: "'Corinthia', cursive, serif",
    fontSize: "clamp(32px, 6vw, 54px)",
    textAlign: "center"
  });

  const loadingText = document.createElement("div");
  loadingText.textContent = "Đang chuẩn bị thiệp mời...";

  Object.assign(loadingText.style, {
    fontFamily: "sans-serif",
    fontSize: "13px",
    letterSpacing: "1px",
    color: "#8b725c"
  });

  const style = document.createElement("style");

  style.textContent = `
    @keyframes loaderPulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.65;
      }
      50% {
        transform: scale(1.15);
        opacity: 1;
      }
    }
  `;

  document.head.appendChild(style);

  loader.appendChild(flower);
  loader.appendChild(message);
  loader.appendChild(loadingText);

  document.body.appendChild(loader);

  return loader;
}

// =========================================================
// 9. REVEAL SCENE
// =========================================================

async function revealScene(loader) {
  // Ensure browser has painted the loaded scene.
  await nextFrame();

  // Smoothly fade away the loading screen.
  loader.style.opacity = "0";
  loader.style.pointerEvents = "none";

  await wait(800);

  loader.remove();

  // Start only after the scene is visible.
  runAnimation();
}

// =========================================================
// 10. INITIALIZE WEBSITE
// =========================================================

async function initializeWebsite() {
  if (!stage) {
    console.error("Stage element not found.");
    return;
  }

  const loader = createLoadingScreen();

  applyDynamicWalkSpeed();
  initBirdInteraction();

  // Wait for all required artwork.
  await preloadAllImages();

  // Allow the browser to render everything.
  await nextFrame();

  // Reveal the complete scene.
  await revealScene(loader);
}

// =========================================================
// 11. START
// =========================================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeWebsite,
    { once: true }
  );
} else {
  initializeWebsite();
}

// Update speed only before the animation begins.
window.addEventListener("resize", () => {
  if (!animationStarted) {
    applyDynamicWalkSpeed();
  }
});
