import { getIconHtml } from './icons.js';

function getProjectIdFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return params.get('id') || '';
}

function updateMetaTags(project) {
	const title = `${project.titulo} · Cat-Not-Furry`;
	const description = project.descripcion || project.subtitulo || 'Proyecto open-source de Cat-Not-Furry.';
	const url = window.location.href;

	document.title = title;

	const metaDesc = document.querySelector('meta[name="description"]');
	if (metaDesc) metaDesc.setAttribute('content', description);

	const ogTitle = document.querySelector('meta[property="og:title"]');
	if (ogTitle) ogTitle.setAttribute('content', title);

	const ogDesc = document.querySelector('meta[property="og:description"]');
	if (ogDesc) ogDesc.setAttribute('content', description);

	const ogUrl = document.querySelector('meta[property="og:url"]');
	if (ogUrl) ogUrl.setAttribute('content', url);

	const twTitle = document.querySelector('meta[name="twitter:title"]');
	if (twTitle) twTitle.setAttribute('content', title);

	const twDesc = document.querySelector('meta[name="twitter:description"]');
	if (twDesc) twDesc.setAttribute('content', description);
}

function renderProjectDetail(project) {
	const category = project.category || 'dev';
	const docsUrl = project.enlaces?.docs || project.enlaces?.wiki || '';
	const iconHtml = getIconHtml(project.icon);

	const techTags = (project.tecnologias || []).map(tech =>
		`<span class="tech-tag">${tech}</span>`
	).join('');

	const featuresList = (project.caracteristicas || []).map(feature =>
		`<li>${feature}</li>`
	).join('');

	return `
		<article class="project-detail project-detail--${category}" style="border-left-color: ${project.color || '#8A4AF3'};">
			<header class="project-detail__header">
				${iconHtml ? `<div class="project-detail__icon-wrap">${iconHtml}</div>` : ''}
				<h1 class="project-detail__title">${project.titulo}</h1>
				<p class="project-detail__subtitle">${project.subtitulo}</p>
			</header>
			<div class="project-detail__content">
				<p class="project-detail__description">${project.descripcion}</p>
				<div class="project-detail__tech">
					${techTags}
				</div>
				<ul class="project-detail__features">
					${featuresList}
				</ul>
			</div>
			<footer class="project-detail__footer">
				<a href="${project.enlaces?.repo || '#'}" target="_blank" class="btn btn--cyber">Repositorio</a>
				${docsUrl ? `<a href="${docsUrl}" target="_blank" class="btn btn--tech">Documentación</a>` : ''}
				<a href="../index.html#proyectos" class="btn btn--tech">Volver a proyectos</a>
			</footer>
		</article>
	`;
}

function renderNotFound() {
	return `
		<div class="project-detail project-detail--404">
			<h2 class="project-detail__title">Proyecto no encontrado</h2>
			<p class="project-detail__description">El proyecto que buscas no existe o la URL es incorrecta.</p>
			<a href="../index.html#proyectos" class="btn btn--tech">Volver a proyectos</a>
		</div>
	`;
}

export async function loadProjectDetail(containerId, projectId) {
	const container = document.getElementById(containerId);
	if (!container) return;

	const id = projectId || getProjectIdFromUrl();
	if (!id) {
		container.innerHTML = renderNotFound();
		return;
	}

	const base = document.location.pathname.includes('/pages/') ? '../' : '';
	const url = base + 'data/projects.json';

	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error('No se pudo cargar projects.json');
		const projects = await response.json();

		const project = projects.find((p) => (p.id || '').toLowerCase() === id.toLowerCase());
		if (!project) {
			container.innerHTML = renderNotFound();
			return;
		}

		container.innerHTML = renderProjectDetail(project);
		updateMetaTags(project);
	} catch (error) {
		console.error('Error:', error);
		container.innerHTML = renderNotFound();
	}
}
