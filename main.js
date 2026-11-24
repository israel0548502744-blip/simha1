/* ==========================================================
   SITE CONFIG – contact details
   ========================================================== */
const SITE_CONFIG = {
  // WhatsApp number in international format, digits only
  whatsapp: "972538899272",
  email: "sisidigital.bh@gmail.com",
};

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- hero video: skip on data-saver / reduced motion (poster stays) ---------- */
  const heroVideo = $(".hero-video");
  if (heroVideo) {
    const saveData = navigator.connection && navigator.connection.saveData;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (saveData || reduceMotion) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
    } else {
      heroVideo.play().catch(() => {}); // some browsers need an explicit play() for muted autoplay
    }
  }

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- header background + sticky mobile CTA ---------- */
  const header = $(".site-header");
  const stickyCta = $(".sticky-cta");
  const hero = $(".hero");
  const contact = $("#contact");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    const pastHero = y > hero.offsetHeight * 0.6;
    const atContact = contact.getBoundingClientRect().top < window.innerHeight * 0.85;
    stickyCta.classList.toggle("show", pastHero && !atContact);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const toggle = $("#menu-toggle");
  const nav = $("#main-nav");
  const overlay = $("#nav-overlay");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    overlay.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  overlay.addEventListener("click", () => setMenu(false));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
  });

  /* ---------- audience tabs ---------- */
  $$("[data-tabs]").forEach((group) => {
    const tabs = $$("[data-tab]", group);
    const panels = $$("[data-panel]", group);
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    };
    tabs.forEach((t, i) => {
      t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        // RTL: ArrowLeft moves forward
        const step = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = tabs[(i + step + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });

  /* ---------- buttons that preselect the audience in the form ---------- */
  $$("[data-audience]").forEach((a) =>
    a.addEventListener("click", () => {
      const radio = $$('#f-type input[name="type"]').find((r) => r.value === a.dataset.audience);
      if (radio) radio.checked = true;
    })
  );

  /* ---------- contact form ---------- */
  const form = $("#contact-form");
  const status = $("#form-status");
  const sendEmail = $("#send-email");

  const collect = () => {
    const d = Object.fromEntries(new FormData(form).entries());
    const nameBad = !String(d.name || "").trim();
    const phoneBad = String(d.phone || "").replace(/\D/g, "").length < 9;
    const email = String(d.email || "").trim();
    const emailBad = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    form.elements.name.closest(".field").classList.toggle("invalid", nameBad);
    form.elements.phone.closest(".field").classList.toggle("invalid", phoneBad);
    form.elements.email.closest(".field").classList.toggle("invalid", emailBad);
    if (nameBad || phoneBad) {
      status.textContent = nameBad ? "נא למלא שם וטלפון כדי שנוכל לחזור אליכם." : "נראה שמספר הטלפון חסר או קצר מדי.";
      (nameBad ? form.elements.name : form.elements.phone).focus();
      return null;
    }
    if (emailBad) {
      status.textContent = "נראה שכתובת הדוא״ל לא תקינה.";
      form.elements.email.focus();
      return null;
    }
    return [
      "היי שמחה, אשמח לפרטים על הרצאה / שיתוף פעולה 🙂",
      `שם: ${d.name}`,
      d.org && `ארגון / חברה: ${d.org}`,
      d.role && `תפקיד: ${d.role}`,
      `טלפון: ${d.phone}`,
      email && `דוא״ל: ${email}`,
      d.type && `קהל: ${d.type}`,
      d.size && `מספר משתתפים משוער: ${d.size}`,
      d.date && `מועד מבוקש: ${d.date}`,
      d.message && `פרטים נוספים: ${d.message}`,
    ].filter(Boolean).join("\n");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = collect();
    if (!text) return;
    status.textContent = "פותחים וואטסאפ...";
    window.open(`https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });

  sendEmail.addEventListener("click", () => {
    const text = collect();
    if (!text) return;
    status.textContent = "פותחים את תוכנת המייל...";
    const subject = encodeURIComponent("הזמנת הרצאה – שמחה לביא");
    window.location.href = `mailto:${SITE_CONFIG.email}?subject=${subject}&body=${encodeURIComponent(text)}`;
  });
})();
