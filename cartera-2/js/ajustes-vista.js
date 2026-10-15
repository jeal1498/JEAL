// Vista de ajustes y acciones de copia de seguridad.
export function createSettingsView({ getData, header, setTabs, setFab, view, icon, esc, initials, $, today, save, toast, pickBackup, importContacts, resetOnboarding }) {
  function renderSettings() {
    const data = getData();
    header('Ajustes', { back: '#/' });
    setTabs('');
    setFab(null);
    const s = data.settings;
    view.innerHTML = `
      <a class="card mecard" href="#/perfil"><span class="avatar">${esc(initials(s.driver || '?'))}</span><span><b>${esc(s.driver || 'Mi perfil')}</b><small>Tus datos, tu auto, tu tarifa y cómo cobras</small></span>${icon('right')}</a>
      <form class="card" id="cfg" style="display:grid;gap:12px">
        <label class="field">Lada del país para WhatsApp<input name="lada" inputmode="numeric" value="${esc(s.lada)}" placeholder="52"><small>Se agrega a los números de 10 dígitos.</small></label>
        <button class="primary">Guardar</button>
      </form>
      <section class="card"><h3>Tus datos</h3>
        <p class="muted" style="margin-bottom:10px">Todo se guarda solo en este teléfono. Descarga una copia de vez en cuando.</p>
        <div class="actions"><button data-export>Descargar copia</button><button type="button" data-import>Cargar copia</button>${'contacts' in navigator ? '<button type="button" data-contacts>Importar contactos</button>' : ''}</div></section>
      <section class="card"><button type="button" data-tour>Ver el inicio rápido otra vez</button></section>
      <p class="muted" style="text-align:center;font-size:12px">${data.clients.length} clientes · ${data.trips.length} viajes · v1.2</p>`;
    $('#cfg').onsubmit = (e) => {
      e.preventDefault();
      data.settings.lada = new FormData(e.target).get('lada').replace(/\D/g, '') || '52';
      save();
      toast('Guardado');
    };
    $('[data-export]', view).onclick = () => {
      const blob = new Blob([JSON.stringify({ app: 'cartera', exportedAt: new Date().toISOString(), ...data }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cartera-${today()}.json`;
      a.click();
    };
    $('[data-import]', view).onclick = pickBackup;
    $('[data-contacts]', view)?.addEventListener('click', importContacts);
    $('[data-tour]', view).onclick = resetOnboarding;
  }
  return renderSettings;
}
