
"use strict";

// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const stage = document.getElementById("stage");
const charLeft = document.getElementById("charLeft");
const charRight = document.getElementById("charRight");
const gateLeft = document.getElementById("gateLeft");
const gateRight = document.getElementById("gateRight");
const finalTitle = document.getElementById("finalTitle");
const flyingBird = document.getElementById("flyingBird");

// ==========================================
// 2. CONFIGURATION
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

const IMAGE_ASSETS = [
  "pagoda_x4.png",
  "aodai_man_1.png",
  "aodai_lady_1.png",
  "door_left.png",
  "door_right.png",
  "bird_anim.png",
  "bird_letter.png"
];

let walkDurationMs = CONFIG.minimumWalkDuration;
let animationStarted = false;
let invitationOpened = false;
let initialized = false;

// ==========================================
// 3. HELPERS
// ==========================================

function sleep(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

function nextFrame() {
  return new Promise(function(resolve) {
    requestAnimationFrame(function() {
      requestAnimationFrame(resolve);
    });
  });
}

// Wait for a CSS transition to finish.
// The fallback prevents the animation
// from becoming stuck if the event is missed.

function waitForTransition(element, property, fallbackMs) {
  return new Promise(function(resolve) {
    if (!element) {
      resolve();
      return;
    }

    let finished = false;

    function finish() {
      if (finished) return;

      finished = true;
      clearTimeout(timer);

      element.removeEventListener(
        "transitionend",
        onTransitionEnd
      );

      resolve();
    }

    function onTransitionEnd(event) {
      if (
        event.target === element &&
        event.propertyName === property
      ) {
        finish();
      }
    }

    const timer = setTimeout(finish, fallbackMs);

    element.addEventListener(
      "transitionend",
      onTransitionEnd
    );
  });
}

// ==========================================
// 4. IMAGE PRELOADING
// ==========================================

function preloadImage(src) {
  return new Promise(function(resolve) {
    const image = new Image();

    image.onload = function() {
      resolve(true);
    };

    image.onerror = function() {
      console.warn("Image failed to load:", src);
      resolve(false);
    };

    image.src = src;
  });
}

async function preloadImages() {
  const allImages = Promise.all(
    IMAGE_ASSETS.map(preloadImage)
  );

  await Promise.race([
    allImages,
    sleep(CONFIG.maxPreloadTime)
  ]);
}

// ==========================================
// 5. RESPONSIVE WALKING SPEED
// ==========================================

function updateWalkSpeed() {
  if (!stage) return;

  const stageWidth = stage.clientWidth;
  const distance = stageWidth / 2;

  walkDurationMs = Math.max(
    CONFIG.minimumWalkDuration,
    (distance / CONFIG.walkingSpeed) * 1000
  );

  document.documentElement.style.setProperty(
    "--walk-duration",
    (walkDurationMs / 1000).toFixed(2) + "s"
  );
}

// ==========================================
// 6. BIRD INTERACTION
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

    if (!flyingBird.classList.contains("clickable")) {
      return;
    }

    invitationOpened = true;

    flyingBird.classList.remove("clickable");
    flyingBird.classList.add("row-2");

    flyingBird.style.pointerEvents = "none";

    setTimeout(function() {
      window.location.href = CONFIG.rsvpPage;
    }, CONFIG.invitationDelay);
  }

  flyingBird.addEventListener(
    "click",
    openInvitation
  );

  flyingBird.addEventListener(
    "keydown",
    function(event) {
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
  if (!charLeft || !charRight) return;

  animationStarted = true;

  // STEP 1: Short pause before walking
  await sleep(CONFIG.initialDelay);

  // STEP 2: Characters walk to center
  const leftWalk = waitForTransition(
    charLeft,
    "left",
    walkDurationMs + 400
  );

  const rightWalk = waitForTransition(
    charRight,
    "right",
    walkDurationMs + 400
  );

  charLeft.classList.add("center-stage", "walking");
  charRight.classList.add("center-stage", "walking");

  await Promise.all([leftWalk, rightWalk]);

  // STEP 3: Characters bow
  charLeft.classList.remove("walking");
  charRight.classList.remove("walking");

  charLeft.classList.add("bowing");
  charRight.classList.add("bowing");

  await sleep(CONFIG.bowDuration);

  // STEP 4: Pagoda doors open
  if (gateLeft) {
    gateLeft.classList.add("open");
  }

  if (gateRight) {
    gateRight.classList.add("open");
  }

  await sleep(CONFIG.gateWait);

  // STEP 5: Bird flies forward
  if (flyingBird) {
    const birdFlight = waitForTransition(
      flyingBird,
      "transform",
      CONFIG.birdFlightDuration + 300
    );

    flyingBird.classList.add("zoom-in");

    // STEP 6: Final title appears
    await sleep(200);

    if (finalTitle) {
      finalTitle.classList.add("show");
    }

    await birdFlight;

    // Enable clicking after flight
    flyingBird.classList.add("clickable");
    flyingBird.setAttribute("tabindex", "0");
  } else if (finalTitle) {
    finalTitle.classList.add("show");
  }
}

// ==========================================
// 8. INITIALIZE PAGE
// ==========================================

async function initializePage() {
  if (initialized) return;
  initialized = true;

  if (!stage) {
    console.error("Stage element not found.");
    return;
  }

  // Remove any old loading screen
  const oldLoaders = document.querySelectorAll(
    "#weddingLoader, #loadingScreen"
  );

  oldLoaders.forEach(function(loader) {
    loader.remove();
  });

  updateWalkSpeed();
  setupBirdInteraction();

  // Wait briefly for images
  try {
    await preloadImages();
  } catch (error) {
    console.warn("Preloading issue:", error);
  }

  // Give browser time to paint
  await nextFrame();

  // Reveal scene
  stage.classList.add("ready");

  // Let fade-in finish
  await sleep(650);

  // Start animation
  startAnimation();
}

// ==========================================
// 9. START
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

// Recalculate walking speed on resize
window.addEventListener("resize", function() {
  if (!animationStarted) {
    updateWalkSpeed();
  }
});
