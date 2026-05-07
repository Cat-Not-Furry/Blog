const THEME_KEY = 'theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

function getStoredTheme() {
	return localStorage.getItem(THEME_KEY);
}

function setStoredTheme(theme) {
	localStorage.setItem(THEME_KEY, theme);
}

function getPreferredTheme() {
	const stored = getStoredTheme();
	if (stored) return stored;
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
		return THEME_LIGHT;
	}
	return THEME_DARK;
}

function applyTheme(theme) {
	document.documentElement.dataset.theme = theme === THEME_LIGHT ? THEME_LIGHT : '';
	setStoredTheme(theme);
	updateToggleIcon(theme);
}

function updateToggleIcon(theme) {
	const btn = document.getElementById('theme-toggle');
	if (!btn) return;
	const iconSun = btn.querySelector('.theme-toggle__icon-sun');
	const iconMoon = btn.querySelector('.theme-toggle__icon-moon');
	if (iconSun) iconSun.hidden = theme === THEME_LIGHT;
	if (iconMoon) iconMoon.hidden = theme === THEME_DARK;
}

function toggleTheme() {
	const current = getStoredTheme() || getPreferredTheme();
	const next = current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
	applyTheme(next);
}

export function initThemeToggle() {
	applyTheme(getPreferredTheme());

	const btn = document.getElementById('theme-toggle');
	if (btn) {
		btn.addEventListener('click', toggleTheme);
	}
}
