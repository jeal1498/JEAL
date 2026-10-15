// Acciones para cerrar viajes y registrar pagos.
export function createPaymentHandlers({ client, openSheet, esc, money, payGrid, $, sheet, refresh, learnOffer, toast, today }) {
  function finishForm(t) {
    const c = client(t.clientId);
    openSheet(`<h2>Terminar viaje</h2>
      <p class="field wide" style="font-weight:400">${esc(c?.name)} · ${money(t.price)}</p>
      <span class="field wide">¿Cómo te pagó? <small>un toque y listo</small></span>${payGrid(c, { debt: true })}
      <div class="buttons"><button type="button" data-close>Cancelar</button></div>`, (form) => {
      $('[data-close]', form).onclick = () => sheet.close();
      form.querySelectorAll('[data-pay]').forEach((b) => (b.onclick = () => {
        const pay = b.dataset.pay;
        Object.assign(t, { status: 'hecho', pay, updatedAt: Date.now() });
        if (pay && c) c.lastPay = pay;
        sheet.close();
        refresh();
        const offer = learnOffer(t);
        toast(offer ? 'Viaje terminado · ruta repetida' : pay ? 'Viaje terminado' : 'Anotado en Cobros', offer);
      }));
    });
  }
  function payForm(list) {
    const total = list.reduce((s, t) => s + +t.price, 0);
    const c = client(list[0].clientId);
    openSheet(`<h2>Registrar pago</h2>
      <p class="field wide" style="font-weight:400">${esc(c?.name)} · ${list.length} viaje${list.length === 1 ? '' : 's'} · ${money(total)}</p>
      ${payGrid(c)}
      <div class="buttons"><button type="button" data-close>Cancelar</button></div>`, (form) => {
      $('[data-close]', form).onclick = () => sheet.close();
      form.querySelectorAll('[data-pay]').forEach((b) => (b.onclick = () => {
        const pay = b.dataset.pay;
        for (const t of list) Object.assign(t, { pay, paidAt: today(), updatedAt: Date.now() });
        if (c) c.lastPay = pay;
        sheet.close();
        refresh();
        toast('Cobrado');
      }));
    });
  }
  return { finishForm, payForm };
}
