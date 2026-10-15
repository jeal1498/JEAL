// Pantalla del inicio rápido, sin poseer el estado principal de Cartera.
export function createOnboardingView({ getData, getObStep, setObStep, getObDraft, setObDraft, top, tabs, setFab, view, icon, ONB, PROFILE_STEPS, stepHtml, wireStep, $, esc, toast, save, render, pickBackup, importContacts, clientForm }) {
  function renderOnboarding() {
      const data = getData();
      let obDraft = getObDraft();
      if (!obDraft) { obDraft = structuredClone(data.settings); setObDraft(obDraft); }
      const obStep = getObStep();
    top.innerHTML = '';
    tabs.innerHTML = '';
    setFab(null);
    const D = obDraft;
    const n = obStep;
    if (n === 0) {
      view.innerHTML = `<section class="ob"><div class="welcome">
        <span class="mark">${icon('users')}</span>
        <h2>Tus clientes privados, en orden</h2>
        <ul class="benefits">
          <li><span class="ic">${icon('wa')}</span><div><b>Agenda y confirma por WhatsApp</b><span>Mensajes listos con fecha, ruta y precio.</span></div></li>
          <li><span class="ic">${icon('nav')}</span><div><b>Precio justo en segundos</b><span>Punto A y B, distancia, tiempo y tu tarifa.</span></div></li>
          <li><span class="ic">${icon('wallet')}</span><div><b>Sabes quién te debe</b><span>Cobros pendientes y recordatorio amable.</span></div></li>
        </ul></div>
        <button class="cta primary" data-go="1">Empezar · 1 minuto</button>
        <button class="skip" data-backup>Ya tengo una copia de mis datos</button></section>`;
    } else if (n <= ONB.length) {
      view.innerHTML = `<section class="ob"><div class="progress">${ONB.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
        <span class="steplabel">Paso ${n} de ${ONB.length} · ${PROFILE_STEPS[ONB[n - 1] - 1]}</span>
        <div class="pstep">${stepHtml(ONB[n - 1], D)}</div>
        <div class="nav"><button type="button" data-go="${n - 1}">Atrás</button><button type="button" class="primary" data-go="${n + 1}">${n === ONB.length ? 'Terminar' : 'Siguiente'}</button></div></section>`;
      wireStep($('.pstep', view), D, renderOnboarding);
    } else {
      view.innerHTML = `<section class="ob"><div class="done"><span class="mark">${icon('check')}</span>
        <h2>¡Listo${D.driver ? ', ' + esc(D.driver) : ''}!</h2>
        <p class="muted">Tu perfil y tu tarifa quedaron guardados. Tu auto y cómo cobras los completas luego en Mi perfil.</p></div>
        <button class="cta primary" data-finish="client">＋ Agregar mi primer cliente</button>
        ${'contacts' in navigator ? '<button class="cta" data-finish="contacts">Importar de mis contactos</button>' : ''}
        <button class="skip" data-finish="">Ir a mi agenda</button></section>`;
    }
    view.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => {
      const to = +b.dataset.go;
      if (n === 1 && to === 2 && !D.driver.trim()) { toast('Escribe tu nombre para firmar los mensajes'); $('[data-k=driver]', view).focus(); return; }\n      if (n === 1 && to === 2 && String(D.phone || '').replace(/\D/g, '').length !== 10) { toast('Ingresa un WhatsApp válido de 10 dígitos'); $('[data-k=phone]', view).focus(); return; }
      if (to === ONB.length + 1) { data.settings = { ...D, onboarded: false }; save(); }
      setObStep(to);
      render();
    }));
    $('[data-backup]', view)?.addEventListener('click', pickBackup);
    view.querySelectorAll('[data-finish]').forEach((b) => (b.onclick = () => {
      data.settings.onboarded = true;
      setObDraft(null);
      setObStep(0);
      save();
      if (b.dataset.finish === 'contacts') return importContacts();
      location.hash = b.dataset.finish === 'client' ? '#/clientes' : '#/';
      render();
      if (b.dataset.finish === 'client') clientForm();
    }));
  }
  return renderOnboarding;
}
