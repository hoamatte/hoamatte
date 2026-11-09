
"use strict";

// ==========================================
// 1. ELEMENTS
// ==========================================

const stage = document.getElementById("stage");
const charLeft = document.getElementById("charLeft");
const charRight = document.getElementById("charRight");
const gateLeft = document.getElementById("gateLeft");
const gateRight = document.getElementById("gateRight");
const finalTitle = document.getElementById("finalTitle");
const flyingBird = document.getElementById("flyingBird");

// ==========================================
// 2. SETTINGS
// ==========================================

const CONFIG = {
  maxPreloadTime: 2500,
  initialDelay: 500,
  bowDuration: 1200,
  gateWait: 1100,
  walkingSpeed: 95,
  minimumWalkDuration: 2200,
  birdFlightDuration: 3200,
  invitationDelay: 800,
  rsvpPage: "rsvp_index.html"
};

const ASSETS = [
  "pagoda_x4.png",
  "aodai_man_1.png",
  "aodai_lady_1.png",
  "door_left.png",
  "door_right.png",
  "bird_anim.png",
  "bird_letter.png"
];

let walkDuration = CONFIG.minimumWalkDuration;
let animationStarted = false;
let invitationOpened = false;

// ==========================================
// 3. UTILITY FUNCTIONS
// ==========================================

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function nextFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

// Wait for a specific CSS transition.
// A timeout ensures the animation continues
// even if transitionend never fires.

function waitForTransition(
  element,
  propertyName,
  fallbackMs
) {
  return new Promise(resolve => {
    if (!element) {
      resolve();
      return;
    }

    let finished = false;

    const timer = setTimeout(finish, fallbackMs);

    function finish() {
      if (finished) return;

      finished = true;
      clearTimeout(timer);

      element.removeEventListener(
        "transitionend",
        onEnd
      );

      resolve();
    }

    function onEnd(event) {
      if (
        event.target === element &&
        event.propertyName === propertyName
      ) {
        finish();
      }
    }

    element.addEventListener(
      "transitionend",
      onEnd
    );
  });
}

// ==========================================
// 4. IMAGE PRELOADING
// ==========================================

// Start loading every image concurrently.
// Each image resolves whether it loads or fails.

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = () => {
      resolve(true);
    };

    img.onerror = () => {
      console.warn("Image unavailable:", src);
      resolve(false);
    };

    img.src = src;
  });
}

// Wait until either all images have loaded
// or the maximum preload time has passed.

async function preloadImages() {
  const allImages = Promise.all(
    ASSETS.map(loadImage)
  );

  const timeout = sleep(
    CONFIG.maxPreloadTime
  );

  await Promise.race([
    allImages,
    timeout
  ]);
}

// ==========================================
// 5. RESPONSIVE WALK SPEED
// ==========================================

function updateWalkSpeed() {
  if (!stage) return;

  const stageWidth = stage.clientWidth;

  const distance = stageWidth / 2;

  walkDuration = Math.max(
    CONFIG.minimumWalkDuration,
    distance / CONFIG.walkingSpeed * 1000
  );

  document.documentElement.style.setProperty(
    "--walk-duration",
    `${walkDuration / 1000}s`
  );
}

// ==========================================
// 6. BIRD CLICK
// ==========================================

function setupBirdInteraction() {
  if (!flyingBird) return;

  flyingBird.setAttribute(
    "aria-label",
    "Open wedding invitation"
  );

  flyingBird.setAttribute("role", "button");

  function openInvitation() {
    if (invitationOpened) return;

    if (
      !flyingBird.classList.contains("clickable")
    ) {
      return;
    }

    invitationOpened = true;

    flyingBird.classList.remove("clickable");
    flyingBird.classList.add("row-2");

    flyingBird.style.pointerEvents = "none";

    setTimeout(() => {
      window.location.href = CONFIG.rsvpPage;
    }, CONFIG.invitationDelay);
  }

  flyingBird.addEventListener(
    "click",
    openInvitation
  );

  flyingBird.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openInvitation();
      }
    }
  );
}

// ==========================================
// 7. MAIN ANIMATION
// ==========================================

async function startAnimation() {
  if (animationStarted) return;

  if (!charLeft || !charRight) {
    console.error("Character elements missing");
    return;
  }

  animationStarted = true;

  // PHASE 1
  // Pause before characters enter.

  await sleep(CONFIG.initialDelay);

  // PHASE 2
  // Both characters walk together.

  const leftWalk = waitForTransition(
    charLeft,
    "left",
    walkDuration + 350
  );

  const rightWalk = waitForTransition(
    charRight,
    "right",
    walkDuration + 350
  );

  charLeft.classList.add(
    "center-stage",
    "walking"
  );

  charRight.classList.add(
    "center-stage",
    "walking"
  );

  await Promise.all([
    leftWalk,
    rightWalk
  ]);

  // PHASE 3
  // Both characters bow together.

  charLeft.classList.remove("walking");
  charRight.classList.remove("walking");

  charLeft.classList.add("bowing");
  charRight.classList.add("bowing");

  await sleep(CONFIG.bowDuration);

  // PHASE 4
  // Pagoda doors open.

  if (gateLeft) {
    gateLeft.classList.add("open");
  }

  if (gateRight) {
    gateRight.classList.add("open");
  }

  await sleep(CONFIG.gateWait);

  // PHASE 5
  // Bird carrying letter flies forward.

  if (flyingBird) {
    const birdFlight = waitForTransition(
      flyingBird,
      "transform",
      CONFIG.birdFlightDuration + 350
    );

    flyingBird.classList.add("zoom-in");

    // PHASE 6
    // Title appears during the bird entrance.

    await sleep(500);

    if (finalTitle) {
      finalTitle.classList.add("show");
    }

    await birdFlight;

    // Bird is now clickable.

    flyingBird.classList.add("clickable");

    flyingBird.setAttribute(
      "tabindex",
      "0"
    );
  } else if (finalTitle) {
    finalTitle.classList.add("show");
  }
}

// ==========================================
// 8. PAGE INITIALIZATION
// ==========================================

async function initializePage() {
  if (!stage) {
    console.error("Stage not found");
    return;
  }

  // Calculate layout before animation.
  updateWalkSpeed();

  // Register bird interactions.
  setupBirdInteraction();

  // Begin image loading.
  // Maximum wait: 2.5 seconds.
  await preloadImages();

  // Let browser paint the scene.
  await nextFrame();

  // Reveal entire scene.
  stage.classList.add("ready");

  // Allow the fade-in to finish.
  await sleep(700);

  // Begin wedding animation.
  startAnimation();
}

// ==========================================
// 9. START WEBSITE
// ==========================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializePage,
    { once: true }
  );
} else {
  initializePage();
}

// Update walking speed before animation.
window.addEventListener("resize", () => {
  if (!animationStarted) {
    updateWalkSpeed();
  }
});
