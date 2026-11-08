// =========================================================
// 1. SELEZIONE ELEMENTI DOM
// =========================================================
const stage = document.getElementById('stage');
const charLeft = document.getElementById('charLeft');
const charRight = document.getElementById('charRight');
const gateLeft = document.getElementById('gateLeft');
const gateRight = document.getElementById('gateRight');
const finalTitle = document.getElementById('finalTitle');
const flyingBird = document.getElementById('flyingBird');
const bottomSubtitle = document.getElementById('bottomSubtitle');

// Parametri temporali globali
let walkDurationMs = 2500;   // Calcolato dinamicamente in base alla larghezza dello stage
const bowDurationMs = 1200;  // Durata esatta dell'animazione dell'inchino (1.2s nel CSS)
const initialDelayMs = 500;  // Pausa iniziale prima di far partire la camminata

// =========================================================
// 2. CALCOLO VELOCITÀ DINAMICA
// =========================================================
function applyDynamicWalkSpeed() {
  const stageWidth = stage ? stage.clientWidth : window.innerWidth;
  
  // Distanza che l'omino deve percorrere dal bordo al centro (50% dello stage)
  const distanceToCenter = stageWidth / 2;  
  
  // Riduciamo i pixel al secondo (es. da 140 a 90 o 100) 
  // per rendere il passo più fluido e rilassato su tutti gli schermi
  const pixelsPerSecond = 95;  
  
  // Calcolo preliminare della durata
  let walkDurationSeconds = distanceToCenter / pixelsPerSecond;
  
  // SOGLIA DI SICUREZZA PER MOBILE:
  // Se lo schermo è stretto (es. smartphone), imponiamo una durata minima 
  // (es. 2.2 secondi) per evitare che l'animazione diventi uno scatto fulmineo.
  const minWalkDuration = 2.2; 
  if (walkDurationSeconds < minWalkDuration) {
    walkDurationSeconds = minWalkDuration;
  }
  
  walkDurationMs = walkDurationSeconds * 1000;
  
  // Aggiorna la variabile CSS
  document.documentElement.style.setProperty('--walk-duration', `${walkDurationSeconds.toFixed(2)}s`);
}

// =========================================================
// 3. CONFIGURAZIONE INTERAZIONE UCCELLINO (FUORI DALLA TIMELINE)
// =========================================================
function initBirdInteraction() {
  if (!flyingBird) return;

  // Ascoltiamo la fine della transizione di zoom
  flyingBird.addEventListener('transitionend', (event) => {
    // Vogliamo assicurarci che sia finita la transizione del transform (lo zoom)
    if (event.propertyName === 'transform' && flyingBird.classList.contains('zoom-in')) {
      
      // Lo zoom è completato: rendiamo l'uccellino cliccabile aggiungendo la classe CSS
      flyingBird.classList.add('clickable');
    }
  });

  // Mettiamo in ascolto il click del mouse (funzionerà solo quando .clickable sbloccherà i pointer-events)

  flyingBird.addEventListener('click', () => {
    if (flyingBird.classList.contains('clickable')) {
    
      // 1. Attiva immediatamente la riga 2 dello spritesheet
      flyingBird.classList.add('row-2');
    
      // 2. Disattiva ulteriori click per evitare doppi invii
      flyingBird.style.pointerEvents = 'none';

      // 3. Aspetta 1.5 secondi e poi reindirizza alla seconda pagina
      setTimeout(() => {
        // Sostituisci 'pagina2.html' con il nome esatto del secondo file HTML su GitHub
        window.location.href = 'rsvp_index.html'; 
      }, 800);
    
    }
  });
}

// =========================================================
// 4. SEQUENZA ANIMAZIONE PRINCIPALE
// =========================================================
function runAnimation() {
  // FASE 1: Inizio Camminata (dopo 0.5s)
  setTimeout(() => {
    charLeft.classList.add('center-stage', 'walking');
    charRight.classList.add('center-stage', 'walking');
  }, initialDelayMs);

  // FASE 2: Arrivo al Centro -> Inizio Inchino
  const timeToCenter = initialDelayMs + walkDurationMs;
  setTimeout(() => {
    charLeft.classList.remove('walking');
    charRight.classList.remove('walking');
    charLeft.classList.add('bowing');
    charRight.classList.add('bowing');
  }, timeToCenter);

  // FASE 3: Fine Inchino -> Apertura Battenti Portone
  const timeToOpenGate = timeToCenter + bowDurationMs;
  setTimeout(() => {
    if (gateLeft && gateRight) {
      gateLeft.classList.add('open');
      gateRight.classList.add('open');
    }
  }, timeToOpenGate);
  
  // FASE 4: Uccellino con lettera esce da dietro il portone (zoom in avanti)
  const timeToFlyLetter = timeToOpenGate + 1000; 
  setTimeout(() => {
    if (flyingBird) {
      flyingBird.classList.add('zoom-in');
    }
  }, timeToFlyLetter);

  // FASE 5: Comparsa Titolo Finale
  const timeToShowTitle = timeToFlyLetter + 500; 
  setTimeout(() => {
    if (finalTitle) {
      finalTitle.classList.add('show');
    }
  }, timeToShowTitle);
  
}

// =========================================================
// 5. AVVIO AL CARICAMENTO DELLA PAGINA
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  applyDynamicWalkSpeed();
  initBirdInteraction(); // Inizializza l'ascoltatore del click
  runAnimation();        // Fa partire la sequenza visiva
});

window.addEventListener('resize', applyDynamicWalkSpeed);