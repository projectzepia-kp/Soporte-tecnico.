document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------
     Año dinámico en el footer
  --------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------
     Animación al hacer scroll (reveal)
  --------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Pequeño desfasaje entre elementos del mismo grupo para que no aparezcan todos a la vez
          setTimeout(() => entry.target.classList.add('is-visible'), (index % 3) * 90);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: si el navegador no soporta IntersectionObserver, se muestran directamente
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------
     Menú mobile
  --------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------
     Formulario de contacto -> WhatsApp
  --------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  // ⚠️ Reemplazá este número por el WhatsApp real del negocio, en formato
  // internacional y SIN espacios, signos ni el "+": código de país + área + línea.
  // Ejemplo Argentina (Buenos Aires, celular): 54 9 11 XXXX-XXXX -> "5491100000000"
  const WHATSAPP_NUMBER = '5491163367303';

  function construirMensajeWhatsApp({ nombre, telefono, email, servicio, problema }) {
    const lineas = [
      `Hola, soy ${nombre}.`,
      `Quisiera pedir un diagnóstico para mi equipo.`,
      ``,
      `📱 Teléfono: ${telefono}`,
      email ? `✉️ Email: ${email}` : null,
      servicio ? `🔧 Servicio: ${servicio}` : null,
      `🛠️ Problema: ${problema}`,
    ].filter(Boolean);

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lineas.join('\n'))}`;
  }

  const validators = {
    nombre: (value) => value.trim().length >= 2,
    telefono: (value) => /^[0-9\s()+-]{6,}$/.test(value.trim()),
    email: (value) => value.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    problema: (value) => value.trim().length >= 10,
  };

  const errorMessages = {
    nombre: 'Ingresá tu nombre completo.',
    telefono: 'Ingresá un teléfono válido.',
    email: 'Ingresá un email válido.',
    problema: 'Contanos un poco más sobre el problema (mínimo 10 caracteres).',
  };

  function setFieldError(field, message) {
    field.classList.toggle('is-invalid', Boolean(message));
    const errorEl = form.querySelector(`[data-error-for="${field.name}"]`);
    if (errorEl) errorEl.textContent = message || '';
  }

  function validateField(field) {
    const validate = validators[field.name];
    if (!validate) return true;
    const isValid = validate(field.value);
    setFieldError(field, isValid ? '' : errorMessages[field.name]);
    return isValid;
  }

  function setNote(text, variant) {
    if (!formNote) return;
    formNote.textContent = text;
    formNote.classList.remove('contact-form__note--success', 'contact-form__note--error');
    if (variant) formNote.classList.add(`contact-form__note--${variant}`);
  }

  if (form) {
    ['nombre', 'telefono', 'email', 'problema'].forEach((name) => {
      const field = form.elements[name];
      if (field) field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const fields = ['nombre', 'telefono', 'email', 'problema']
        .map((name) => form.elements[name])
        .filter(Boolean);

      const allValid = fields
        .map((field) => validateField(field))
        .every(Boolean);

      if (!allValid) {
        setNote('Revisá los datos marcados antes de continuar.', 'error');
        fields.find((field) => field.classList.contains('is-invalid'))?.focus();
        return;
      }

      const payload = {
        nombre: form.elements.nombre.value.trim(),
        telefono: form.elements.telefono.value.trim(),
        email: form.elements.email.value.trim(),
        servicio: form.elements.servicio ? form.elements.servicio.value : '',
        problema: form.elements.problema.value.trim(),
      };

      if (submitBtn) submitBtn.disabled = true;
      setNote('Abriendo WhatsApp...');

      // Abre WhatsApp con el mensaje ya redactado a partir de los datos del formulario.
      window.open(construirMensajeWhatsApp(payload), '_blank', 'noopener');

      setNote('¡Listo! Te llevamos a WhatsApp para que envíes tu consulta.', 'success');
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
    });
  }
});
