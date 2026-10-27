"use strict";

/* CONFIGURACIÓN: completá con datos reales antes de publicar.
   WhatsApp: código de país + número, solo dígitos (Argentina móvil: 549...).
   Con campos vacíos, la demostración no envía consultas a terceros. */
const CONFIG = Object.freeze({
  whatsapp: "",
  email: "",
  instagram: "",
  defaultMessage: "Hola, Amelia. Quisiera consultar por un pedido de tartas.",
});

document.body.classList.add("js-enabled");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
const messageField = document.querySelector("#message");
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
let toastTimer;

function notify(message) {
  const toast = document.querySelector("#toast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 6500);
}

function closeMenu() {
  navigation.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
}

menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  navigation.classList.toggle("open", open);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
window.matchMedia("(min-width: 801px)").addEventListener("change", closeMenu);

// Preparar una consulta conserva la selección y lleva el foco al formulario.
function prepareInquiry(message) {
  messageField.value = message;
  messageField.dispatchEvent(new Event("input", { bubbles: true }));
  document
    .querySelector("#contacto")
    .scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth" });
  messageField.focus({ preventScroll: true });
}

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  const message = link.dataset.product
    ? `Hola, Amelia. Quisiera pedir la tarta de ${link.dataset.product}. ¿Me cuentan la disponibilidad y las opciones de entrega?`
    : CONFIG.defaultMessage;
  if (/^\d{10,15}$/.test(CONFIG.whatsapp)) {
    link.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      prepareInquiry(message);
      notify(
        "Esta es una demostración. Los pedidos por WhatsApp todavía no están habilitados.",
      );
    });
  }
});

document.querySelector("[data-quote]").addEventListener("click", (event) => {
  event.preventDefault();
  prepareInquiry(
    "Hola, Amelia. Quisiera una cotización para un evento.\nFecha: \nCantidad de personas: \nZona de entrega: \nPreferencias dulces o saladas: ",
  );
});

// Filtros accesibles: botones con estado y anuncio de resultados.
const filters = [...document.querySelectorAll("[data-filter]")];
const products = [...document.querySelectorAll(".product-card")];
filters.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filters.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    let count = 0;
    products.forEach((product) => {
      const visible =
        category === "todas" || product.dataset.category === category;
      product.hidden = !visible;
      if (visible) {
        count++;
        product.classList.add("is-visible");
      }
    });
    document.querySelector("#filter-status").textContent =
      `Se muestran ${count} tartas${category === "todas" ? "" : ` ${category}`}.`;
  });
});

// Solo se anima si el navegador soporta IntersectionObserver y no se pide reducir movimiento.
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  document.body.classList.add("has-reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => revealObserver.observe(element));
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      document.body.classList.remove("has-reveal");
      revealObserver.disconnect();
    }
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigation.querySelectorAll("a").forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
  );
  document
    .querySelectorAll("main section[id]")
    .forEach((section) => sectionObserver.observe(section));
}

// HTML valida campos. Sin backend: con email configurado se abre un borrador,
// nunca se afirma que el mensaje haya sido enviado ni se guarda información.
if (CONFIG.email) {
  document.querySelector("#form-note").textContent =
    "Abriremos tu aplicación de correo para que revises y envíes la consulta. Los campos con * son obligatorios.";
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const email = String(data.get("email")).trim();
  const message = String(data.get("message")).trim();
  if (!name || message.length < 10) {
    formStatus.textContent =
      "Completá tu nombre y un mensaje de al menos 10 caracteres, sin contar espacios al principio y al final.";
    return;
  }
  if (!CONFIG.email) {
    formStatus.textContent =
      "Tu consulta está preparada. Este sitio es una demostración: el envío de mensajes todavía no está habilitado. No se enviaron ni almacenaron tus datos.";
    return;
  }
  const subject = encodeURIComponent(`Consulta desde la web · ${name}`);
  const body = encodeURIComponent(
    `Nombre: ${name}\nEmail de contacto: ${email}\n\n${message}`,
  );
  window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
  formStatus.textContent =
    "Intentamos abrir tu aplicación de correo con el borrador. Revisalo y enviá el mensaje desde allí. Si no se abrió, comprobá que tengas una aplicación de correo configurada.";
});
form.addEventListener("input", () => {
  formStatus.textContent = "";
});

const socialLink = document.querySelector("[data-social]");
if (/^https:\/\/(www\.)?instagram\.com\//i.test(CONFIG.instagram)) {
  socialLink.href = CONFIG.instagram;
  socialLink.target = "_blank";
  socialLink.rel = "noopener noreferrer";
  socialLink.setAttribute("aria-label", "Visitar el Instagram de Amelia");
} else {
  socialLink.addEventListener("click", (event) => {
    event.preventDefault();
    notify(
      "El perfil de Instagram de esta marca de ejemplo todavía no está disponible.",
    );
  });
}

// Modales legales nativos: Escape, foco inicial y retorno al disparador.
const legalDialog = document.querySelector("#legal-dialog");
let legalTrigger;
const legalCopy = {
  privacy: {
    title: "Privacidad",
    paragraphs: [
      "Esta página es una demostración de una marca ficticia. El formulario no envía ni guarda datos en un servidor. No usamos herramientas de analítica ni cookies propias.",
      "Las tipografías, fotografías y el mapa se cargan desde Google Fonts, Unsplash y Google Maps. Estos proveedores reciben los datos técnicos necesarios para atender la conexión y aplican sus propias políticas de privacidad.",
      "Si se habilitan los enlaces de contacto, WhatsApp, Instagram o tu aplicación de correo procesarán la información que decidas compartir. Antes de usar este sitio con un negocio real, se debe publicar la identidad y el contacto del responsable y adaptar esta información al funcionamiento efectivo del servicio.",
    ],
  },
  terms: {
    title: "Condiciones de compra",
    paragraphs: [
      "Los productos, importes en pesos argentinos, testimonios y datos de la marca son ilustrativos. Este sitio de demostración no procesa pagos ni confirma pedidos.",
      "En la propuesta comercial, cada pedido requiere confirmación expresa de variedad, cantidad, precio final, disponibilidad y modalidad de entrega. El envío se cotiza por separado antes de confirmar.",
      "Antes de publicar para un negocio real, completá la razón social, CUIT, domicilio y canales de atención, y definí las condiciones de pago, cancelación y devolución que correspondan.",
    ],
  },
};
document.querySelectorAll("[data-legal]").forEach((button) => {
  button.addEventListener("click", () => {
    const content = legalCopy[button.dataset.legal];
    legalTrigger = button;
    document.querySelector("#legal-title").textContent = content.title;
    const paragraphs = content.paragraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    });
    document.querySelector("#legal-content").replaceChildren(...paragraphs);
    legalDialog.showModal();
  });
});
document.querySelectorAll(".dialog-close, .dialog-done").forEach((button) => {
  button.addEventListener("click", () => legalDialog.close());
});
legalDialog.addEventListener("click", (event) => {
  const bounds = legalDialog.getBoundingClientRect();
  if (
    event.target === legalDialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  )
    legalDialog.close();
});
legalDialog.addEventListener("close", () => legalTrigger?.focus());
document.querySelector("#year").textContent = new Date().getFullYear();
// Solo habilitar el formulario cuando su controlador ya esté instalado.
form.querySelector('button[type="submit"]').disabled = false;
