/**
 * Iconos SVG inline (Lucide-style, MIT).
 * Nombres: gamepad-2, terminal, cpu, code, box, monitor
 */
const ICON_SVGS = {
	'gamepad-2': '<path d="M6 12h4a2 2 0 0 1 2 2v4"/><path d="M6 16h.01"/><path d="M20 12h.01"/><path d="M10 10V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M14 16v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2"/>',
	'terminal': '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
	'cpu': '<rect width="16" height="16" x="4" y="4" rx="2" ry="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
	'code': '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
	'box': '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
	'monitor': '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>'
};

const SVG_WRAPPER = (paths) =>
	`<svg class="project-card__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export function getIconHtml(iconName) {
	if (!iconName || typeof iconName !== 'string') return '';
	const paths = ICON_SVGS[iconName.trim().toLowerCase()];
	if (!paths) return '';
	return SVG_WRAPPER(paths);
}

export function getAvailableIcons() {
	return Object.keys(ICON_SVGS);
}
