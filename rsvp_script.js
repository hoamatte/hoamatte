
/* ==========================================
   SETTINGS — EDIT YOUR INFORMATION HERE
========================================== */

const SETTINGS = {
  googleMapsUrl: "https://maps.app.goo.gl/GvbNT3b8N9Pje87b8",
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbxBb947UNeFFn6hDw-p-vtFq10vsotUOCn8RI2sOOmGZ2S0z53CUMMaiQg1u5qOVj27/exec",

  vi: {
    date: "03 . Tháng 01 . 2027",
    time: "9:00",
    venue: "Chùa Tảo Sách (Linh Sơn Tự)",
    address: "386 Đ. Lạc Long Quân, Tây Hồ,\r\nHà Nội",
    dresscode: "Áo Dài - Âu Phục",

    programButton: "CHƯƠNG TRÌNH BUỔI LỄ",
    programIntro: "CHƯƠNG TRÌNH & THỜI GIAN",

    timeline: [
      {
        time: "09:00",
        title: "Đón tiếp khách mời",
        note: "Chào đón gia đình và bạn bè"
      },
      {
        time: "09:30",
        title: "Nghi thức Lễ Hằng Thuận",
        note: "Tại chánh điện"
      },
      {
        time: "10:30",
        title: "Chụp ảnh lưu niệm",
        note: "Cùng gia đình và khách mời"
      },
      {
        time: "11:30",
        title: "Tiệc chay thân mật",
        note: "Gặp gỡ và chung vui"
      }
    ],

    rsvpTitle: "XÁC NHẬN THAM DỰ",
    nextButton: "XÁC NHẬN THAM DỰ",
    rsvpButton: "GỬI XÁC NHẬN",
    back: "← Quay lại",

    name: "Họ và tên",
    guests: "Số lượng tham dự",
    departure: "Bạn khởi hành từ đâu?",
    messageHint:
      "Tên người đi cùng, câu hỏi hoặc yêu cầu (nếu có)",
    dietary:
      "Yêu cầu ăn uống / Dị ứng (nếu có)",

    sending: "ĐANG GỬI...",
    sent:
      "Yêu cầu đã được gửi!",
    error: "Không thể gửi. Vui lòng thử lại.",
    noScript: "Chưa kết nối Google Sheets.",
    noMap: "Chưa có liên kết Google Maps.",
	rsvpHelp: "Vui lòng xác nhận trước ngày 1 tháng 12"
  },

  it: {
    date: "03 . Gennaio . 2027",
    time: "9:00",
    venue: "Tao Sach Pagoda (Linh Son Tu)",
    address: "386 Via Lac Long Quan, Tay Ho,\r\nHanoi, Vietnam",
    dresscode: "Ao Dai - Abito",

    programButton: "PROGRAMMA DELLA CERIMONIA",
    programIntro: "PROGRAMMA E ORARI",

    timeline: [
      {
        time: "09:00",
        title: "Accoglienza degli ospiti",
        note: "Benvenuto a familiari e amici"
      },
      {
        time: "09:30",
        title: "Cerimonia Hằng Thuận",
        note: "Nel tempio"
      },
      {
        time: "10:30",
        title: "Foto ricordo",
        note: "Con familiari e invitati"
      },
      {
        time: "11:30",
        title: "Ricevimento",
        note: "Pranzo vegetariano tradizionale"
      }
    ],

    rsvpTitle: "CONFERMA PRESENZA",
    nextButton: "CONFERMA PRESENZA",
    rsvpButton: "INVIA CONFERMA",
    back: "← Indietro",

    name: "Nome e cognome",
    guests: "Numero di partecipanti",
    departure: "Da dove partirai?",
    messageHint:
      "Nomi degli accompagnatori, domande o richieste",
    dietary: "Esigenze alimentari / Allergie",

    sending: "INVIO...",
    sent:
      "Richiesta inviata!",
    error: "Invio non riuscito. Riprova.",
    noScript:
      "Google Sheets non è ancora collegato.",
    noMap:
      "Il link di Google Maps non è disponibile.",
	rsvpHelp: "Per favore, confermare entro il 01/12"
  }
};

/* ==========================================
   VARIABLES
========================================== */

const $ = id => document.getElementById(id);

let currentLanguage = "vi";
let guestCount = 1;

function t() {
  return SETTINGS[currentLanguage];
}

/* ==========================================
   PAGE NAVIGATION WITH FADING
========================================== */

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    const isActive = page.id === pageId;

    page.classList.toggle("active", isActive);
    page.inert = !isActive;

    page.setAttribute(
      "aria-hidden",
      String(!isActive)
    );
  });
}

function openInvitation(language) {
  currentLanguage = language;
  updateLanguage();
  showPage("detailsPage");
}

/* ==========================================
   BILINGUAL CONTENT
========================================== */

function updateLanguage() {
  const a = t();

  document.documentElement.lang = currentLanguage;

  $("dateText").textContent = a.date;
  $("timeText").textContent = a.time;

  $("venueText").textContent = a.venue;
  $("addressText").textContent = a.address;
  $("dressText").textContent = a.dresscode;

  $("goProgram").textContent = a.programButton;
  $("programIntro").textContent = a.programIntro;

  const timelineItems = a.timeline.map(item => {
    const li = document.createElement("li");
    const time = document.createElement("time");
    const content = document.createElement("div");
    const title = document.createElement("strong");
    const note = document.createElement("small");

    time.textContent = item.time;
    title.textContent = item.title;
    note.textContent = item.note;

    content.append(title, note);
    li.append(time, content);

    return li;
  });

  $("timeline").replaceChildren(...timelineItems);

  $("goRSVP").textContent = a.nextButton;
  $("rsvpTitle").textContent = a.rsvpTitle;

  $("guestName").placeholder = a.name;
  $("guestCountLabel").textContent = a.guests;
  $("departure").placeholder = a.departure;
  $("guestMessage").placeholder = a.messageHint;
  $("dietary").placeholder = a.dietary;
	
  $("rsvpHelpText").textContent = a.rsvpHelp;
  $("submitRSVP").textContent = a.rsvpButton;

  [
    "backToCover",
    "backToDetails",
    "backToProgram"
  ].forEach(id => {
    $(id).textContent = a.back;
  });

  $("rsvpStatus").textContent = "";

}

/* ==========================================
   GUEST COUNTER
========================================== */

function changeGuests(delta) {
  guestCount = Math.max(
    1,
    Math.min(20, guestCount + delta)
  );

  $("guestCount").textContent = guestCount;
  $("minusGuest").disabled = guestCount === 1;
  $("plusGuest").disabled = guestCount === 20;
}

/* ==========================================
   RSVP — GOOGLE SHEETS
========================================== */

async function submitRSVP(event) {
  event.preventDefault();

  const a = t();
  const button = $("submitRSVP");
  const status = $("rsvpStatus");

  const scriptUrl = SETTINGS.googleScriptUrl.trim();

  if (!scriptUrl) {
    status.textContent = a.noScript;
    return;
  }

  const payload = {
    name: $("guestName").value.trim(),
    guests: guestCount,
    departure: $("departure").value.trim(),
    message: $("guestMessage").value.trim(),
    dietary: $("dietary").value.trim(),
    language: currentLanguage
  };

  if (!payload.name) {
    $("guestName").focus();
    return;
  }

  button.disabled = true;
  button.textContent = a.sending;
  status.textContent = "";

  try {
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    // no-cors cannot confirm Google Sheets
    // successfully saved the response.
    status.textContent = a.sent;

  } catch (error) {
    console.error("RSVP submission error:", error);
    status.textContent = a.error;

  } finally {
    button.disabled = false;
    button.textContent = a.rsvpButton;
  }
}

/* ==========================================
   BUTTON EVENTS
========================================== */

$("openItalian").addEventListener("click", () => {
  openInvitation("it");
});

$("openVietnamese").addEventListener("click", () => {
  openInvitation("vi");
});

$("mapButton").addEventListener("click", () => {
  if (!SETTINGS.googleMapsUrl) {
    alert(t().noMap);
    return;
  }

  window.open(
    SETTINGS.googleMapsUrl,
    "_blank",
    "noopener,noreferrer"
  );
});

$("goProgram").addEventListener("click", () => {
  showPage("programPage");
});

$("goRSVP").addEventListener("click", () => {
  showPage("rsvpPage");
});

$("backToCover").addEventListener("click", () => {
  showPage("coverPage");
});

$("backToDetails").addEventListener("click", () => {
  showPage("detailsPage");
});

$("backToProgram").addEventListener("click", () => {
  showPage("programPage");
});

$("minusGuest").addEventListener("click", () => {
  changeGuests(-1);
});

$("plusGuest").addEventListener("click", () => {
  changeGuests(1);
});

/* Only one submit listener — no page reload */
$("rsvpForm").addEventListener(
  "submit",
  submitRSVP
);


/* ==========================================
   FALLING PETALS ANIMATION
========================================== */

function createFallingPetals() {
  const container = $("fallingPetals");

  if (!container) return;

  const numberOfPetals = 14;

  for (let i = 0; i < numberOfPetals; i++) {
    const petal = document.createElement("span");

    petal.className = "petal";

    const startX = Math.random() * 100;
    const size = 5 + Math.random() * 7;
    const duration = 9 + Math.random() * 8;
    const delay = -Math.random() * duration;
    const drift = -70 + Math.random() * 140;
    const rotation = 180 + Math.random() * 540;

    petal.style.setProperty("--start-x", startX + "%");
    petal.style.setProperty("--petal-size", size + "px");
    petal.style.setProperty("--duration", duration + "s");
    petal.style.setProperty("--delay", delay + "s");
    petal.style.setProperty("--drift", drift + "px");
    petal.style.setProperty("--rotation", rotation + "deg");

    container.appendChild(petal);
  }
}


/* ==========================================
   INITIALIZE
========================================== */

updateLanguage();
showPage("coverPage");
changeGuests(0);
createFallingPetals();

