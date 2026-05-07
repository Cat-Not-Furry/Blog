import { getIconHtml } from './icons.js';

const CACHE_KEY = 'projects_cache';
const CACHE_TTL = 60 * 1000;

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, updated } = JSON.parse(raw);
    if (Date.now() - updated > CACHE_TTL) return null;
    return { data, updated };
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, updated: Date.now() }));
  } catch (e) {
    console.warn('No se pudo guardar en caché:', e);
  }
}

function renderProjects(container, projects) {
  if (projects.length === 0) {
    container.innerHTML = '<p class="loading">No hay proyectos para mostrar</p>';
    return;
  }

  container.innerHTML = '';
  projects.forEach((project) => {
    const card = createProjectCard(project);
    container.appendChild(card);
  });
}

function getProjectDetailUrl(project) {
  const projectId = project.id || project.titulo?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
  if (!projectId) return '#';
  const base = document.location.pathname.includes('/pages/') ? '' : 'pages/';
  return `${base}proyecto.html?id=${encodeURIComponent(projectId)}`;
}

function createProjectCard(project) {
  const article = document.createElement('article');
  const category = project.category || 'dev';
  article.className = 'project-card project-card--' + category;
  article.style.borderLeftColor = project.color;

  const docsUrl = project.enlaces?.docs || project.enlaces?.wiki;
  const iconHtml = getIconHtml(project.icon);
  const detailUrl = getProjectDetailUrl(project);

  const techTags = (project.tecnologias || []).map(tech =>
    `<span class="tech-tag">${tech}</span>`
  ).join('');

  const featuresList = (project.caracteristicas || []).map(feature =>
    `<li>${feature}</li>`
  ).join('');

  article.innerHTML = `
		<div class="project-card__header">
			${iconHtml ? `<div class="project-card__icon-wrap">${iconHtml}</div>` : ''}
			<h3 class="project-card__title"><a href="${detailUrl}" class="project-card__title-link">${project.titulo}</a></h3>
			<p class="project-card__subtitle">${project.subtitulo}</p>
		</div>
		<div class="project-card__content">
			<p class="project-card__description">${project.descripcion}</p>
			<div class="project-card__tech">
				${techTags}
			</div>
			<ul class="project-card__features">
				${featuresList}
			</ul>
		</div>
		<div class="project-card__footer">
			<a href="${project.enlaces?.repo || '#'}" target="_blank" class="btn btn--cyber">Repositorio</a>
			${docsUrl ? `<a href="${docsUrl}" target="_blank" class="btn btn--tech">Documentación</a>` : ''}
		</div>
	`;

  return article;
}

function formatTimeAgo(ms) {
  const min = Math.floor(ms / 60000);
  const h = Math.floor(ms / 3600000);
  if (min < 60) return `hace ${min} min`;
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} días`;
}

export async function loadProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  const base = document.location.pathname.includes('/pages/') ? '../' : '';
  const url = base + 'data/projects.json';

  const tryFetch = async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('No se pudo cargar projects.json');
    return response.json();
  };

  try {
    const cached = getCache();

    if (cached) {
      renderProjects(container, cached.data);
      container.dataset.updated = cached.updated;
      const updatedEl = document.getElementById('projects-updated');
      if (updatedEl) updatedEl.textContent = 'Actualizado ' + formatTimeAgo(Date.now() - cached.updated);

      tryFetch().then((projects) => {
        setCache(projects);
      }).catch(() => { });
      return;
    }

    const projects = await tryFetch();
    setCache(projects);
    renderProjects(container, projects);
    container.dataset.updated = Date.now();

    const updatedEl = document.getElementById('projects-updated');
    if (updatedEl) updatedEl.textContent = 'Actualizado ahora';

  } catch (error) {
    console.error('Error:', error);
    const cached = getCache();
    if (cached) {
      renderProjects(container, cached.data);
    } else {
      container.innerHTML = '<p class="loading">Error al cargar los proyectos. Intenta más tarde.</p>';
    }
  }
}
