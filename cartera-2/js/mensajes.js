// Mensajes y enlaces de contacto de Cartera.
// La lógica se mantiene aislada del DOM y recibe las funciones de formato desde la aplicación.
export function createMessaging({ getSettings, firstName, dayLabel, hour12, money, fdate, cap, byWhen }) {
  const phoneIntl = (p) => {
    const d = String(p || '').replace(/\D/g, '');
    const settings = getSettings();
    return d.length === 10 ? (settings.lada || '52') + d : d;
  };
  const waLink = (c, text) => `https://wa.me/${phoneIntl(c.phone)}?text=${encodeURIComponent(text)}`;
  const payTo = () => {
    const s = getSettings();
    return (s.pays || []).includes('Transferencia') && s.clabe ? [s.bank, s.clabe].filter(Boolean).join(' ') : '';
  };
  const sign = () => {
    const settings = getSettings();
    return settings.driver ? `\n— ${settings.driver}` : '';
  };
  const MSG = {
    confirm: (c, t) => `Hola ${firstName(c)}, te confirmo tu viaje ${dayLabel(t.date)}${t.time ? ' a las ' + hour12(t.time) : ''}${t.from || t.to ? `: ${t.from || '…'} → ${t.to || '…'}` : ''}. Costo ${money(t.price)}. ¡Gracias!${sign()}`,
    arrived: (c, t) => `Hola ${firstName(c)}, ya estoy afuera${t.from ? ' en ' + t.from : ''}. 🚗`,
    charge: (c, list) => {
      const transfer = payTo();
      return `Hola ${firstName(c)}, te comparto lo pendiente:\n${list.map((t) => `• ${fdate(t.date, { day: 'numeric', month: 'short' })}${t.to ? ' · ' + (t.from ? t.from + ' → ' : '') + t.to : ''}: ${money(t.price)}`).join('\n')}\nTotal: ${money(list.reduce((s, t) => s + +t.price, 0))}.${transfer ? `\nTransferencia: ${transfer}` : ''}\n¡Gracias!${sign()}`;
    },
    week: (c, list) => {
      const short = (l) => (l || '…').split(',')[0];
      const days = [...new Set(list.map((t) => t.date))];
      const lines = days.map((d) => `• ${cap(fdate(d, { weekday: 'short', day: 'numeric', month: 'short' }))}: ${list.filter((t) => t.date === d).sort(byWhen).map((t) => `${t.time ? hour12(t.time) + ' ' : ''}${short(t.from)} → ${short(t.to)}`).join(' · ')}`).join('\n');
      return `Hola ${firstName(c)}, te confirmo tus viajes:\n${lines}\nSon ${list.length} viaje${list.length === 1 ? '' : 's'} (${money(list.reduce((s, t) => s + +t.price, 0))}). ¡Gracias!${sign()}`;
    },
    hello: (c) => `Hola ${firstName(c)}, ¿cómo estás? Te recuerdo que sigo a tus órdenes para tus viajes. Cuando lo necesites, escríbeme y lo agendamos.${sign()}`,
  };
  return { phoneIntl, waLink, payTo, sign, MSG };
}
