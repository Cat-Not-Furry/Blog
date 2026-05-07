/**
 * Carga GoatCounter solo en producción (no en localhost).
 * Evita ERR_BLOCKED_BY_CLIENT durante desarrollo local.
 * Sustituir YOUR_GOATCOUNTER_CODE por tu código de goatcounter.com
 *
 * Nota: En producción, visitantes con bloqueador de anuncios pueden ver
 * ERR_BLOCKED_BY_CLIENT en su consola. El sitio funciona igual; solo no se registra la visita.
 */
const GOATCOUNTER_CODE = 'YOUR_GOATCOUNTER_CODE';

export function loadAnalytics() {
	if (/localhost|127\.0\.0\.1/i.test(window.location.hostname)) {
		return;
	}
	if (!GOATCOUNTER_CODE || GOATCOUNTER_CODE === 'YOUR_GOATCOUNTER_CODE') {
		return;
	}
	const script = document.createElement('script');
	script.async = true;
	script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
	script.src = 'https://gc.zgo.at/count.js';
	document.head.appendChild(script);
}
