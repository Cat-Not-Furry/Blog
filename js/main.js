import { loadHeaderFooter } from './modules/components.js';
import { loadProjects } from './modules/data-loader.js';
import { initProjectFilter } from './modules/project-filter.js';
import { initScrollReveal } from './modules/scroll-reveal.js';
import { initThemeToggle } from './modules/theme-toggle.js';
import { loadProjectDetail } from './modules/project-detail.js';
import { loadAnalytics } from './modules/analytics.js';

document.addEventListener('DOMContentLoaded', async () => {
	await loadHeaderFooter();
	initThemeToggle();
	loadAnalytics();

	if (document.getElementById('projects-container')) {
		await loadProjects();
		initProjectFilter();
		initScrollReveal();
	}

	if (document.getElementById('project-detail')) {
		await loadProjectDetail('project-detail');
	}

	highlightActiveLink();
});

function highlightActiveLink() {
	const currentPath = window.location.pathname;
	const links = document.querySelectorAll('.nav__link');

	links.forEach(link => {
		const href = link.getAttribute('href');
		const isHome = currentPath.endsWith('/') || currentPath.endsWith('index.html');
		const isHomeLink = href === '/' || href === 'index.html';
		if (currentPath.endsWith(href) || (isHome && isHomeLink)) {
			link.classList.add('active');
		}
	});
}
