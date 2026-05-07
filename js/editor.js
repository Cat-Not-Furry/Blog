import { initThemeToggle } from './modules/theme-toggle.js';
import { getIconHtml } from './modules/icons.js';

initThemeToggle();

const CONTAINER = document.getElementById('projects-container');
const FORM = document.getElementById('project-form');
const JSON_OUTPUT = document.getElementById('json-output');
const BTN_SUBMIT = document.getElementById('btn-submit');
const BTN_CANCEL = document.getElementById('btn-cancel-edit');
const FORM_TITLE = document.getElementById('form-title');
let editingCard = null;

function slugify(text) {
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildCardHTML(project, withActions) {
	const techTags = (project.tecnologias || []).map(t => `<span class="tech-tag">${t.trim()}</span>`).join('');
	const featuresList = (project.caracteristicas || []).map(f => `<li>${f.trim()}</li>`).join('');
	const docsUrl = project.enlaces?.docs || project.enlaces?.wiki || '';
	const iconHtml = getIconHtml(project.icon);
	const actionsHtml = withActions
		? `<div class="card-actions">
			<button type="button" class="btn btn--tech" data-action="edit">Editar</button>
			<button type="button" class="btn btn--tech" data-action="remove">Eliminar</button>
		</div>`
		: '';
	return `${actionsHtml}
		<div class="project-card__header">
			${iconHtml ? `<div class="project-card__icon-wrap">${iconHtml}</div>` : ''}
			<h3 class="project-card__title">${project.titulo || '—'}</h3>
			<p class="project-card__subtitle">${project.subtitulo || '—'}</p>
		</div>
		<div class="project-card__content">
			<p class="project-card__description">${project.descripcion || '—'}</p>
			<div class="project-card__tech">${techTags}</div>
			<ul class="project-card__features">${featuresList}</ul>
		</div>
		<div class="project-card__footer">
			<a href="${project.enlaces?.repo || '#'}" target="_blank" class="btn btn--cyber">Repositorio</a>
			${docsUrl ? `<a href="${docsUrl}" target="_blank" class="btn btn--tech">Documentación</a>` : ''}
		</div>`;
}

function createCard(project) {
	const id = project.id || slugify(project.titulo);
	const full = { id, ...project };
	const article = document.createElement('article');
	article.className = `project-card project-card--${project.category || 'dev'}`;
	article.style.borderLeftColor = project.color || '#8A4AF3';
	article.dataset.project = JSON.stringify(full);
	article.innerHTML = buildCardHTML(project, true);
	return article;
}

function createPreviewCard(project) {
	const article = document.createElement('article');
	article.className = `project-card project-card--${project.category || 'dev'}`;
	article.style.borderLeftColor = project.color || '#8A4AF3';
	article.innerHTML = buildCardHTML(project, false);
	return article;
}

function getProjectFromForm() {
	const fd = new FormData(FORM);
	const tecnologias = (fd.get('tecnologias') || '').split('\n').filter(Boolean);
	const caracteristicas = (fd.get('caracteristicas') || '').split('\n').filter(Boolean);
	return {
		titulo: fd.get('titulo') || '',
		subtitulo: fd.get('subtitulo') || '',
		category: fd.get('category') || 'dev',
		icon: fd.get('icon') || undefined,
		color: fd.get('color') || '#8A4AF3',
		descripcion: fd.get('descripcion') || '',
		tecnologias,
		caracteristicas,
		enlaces: {
			repo: fd.get('repo') || '#',
			docs: fd.get('docs') || undefined
		}
	};
}

function updatePreview() {
	const wrapper = document.getElementById('preview-card-wrapper');
	if (!wrapper) return;
	const project = getProjectFromForm();
	const hasContent = project.titulo || project.subtitulo || project.descripcion || project.tecnologias.length || project.caracteristicas.length;
	if (!hasContent) {
		wrapper.innerHTML = '<p class="preview-placeholder">La vista previa aparecerá al rellenar el formulario.</p>';
		return;
	}
	wrapper.innerHTML = '';
	wrapper.appendChild(createPreviewCard(project));
}

function fillForm(project) {
	document.getElementById('titulo').value = project.titulo || '';
	document.getElementById('subtitulo').value = project.subtitulo || '';
	document.getElementById('category').value = project.category || 'dev';
	document.getElementById('icon').value = project.icon || '';
	document.getElementById('color').value = project.color || '#ff3b9d';
	document.getElementById('descripcion').value = project.descripcion || '';
	document.getElementById('tecnologias').value = (project.tecnologias || []).join('\n');
	document.getElementById('caracteristicas').value = (project.caracteristicas || []).join('\n');
	document.getElementById('repo').value = project.enlaces?.repo || '';
	document.getElementById('docs').value = project.enlaces?.docs || project.enlaces?.wiki || '';
	updatePreview();
}

function setEditMode(card) {
	editingCard = card;
	const project = JSON.parse(card.dataset.project);
	fillForm(project);
	BTN_SUBMIT.textContent = 'Actualizar';
	BTN_CANCEL.style.display = 'inline-block';
	FORM_TITLE.textContent = 'Editar proyecto';
}

function cancelEdit() {
	editingCard = null;
	FORM.reset();
	document.getElementById('color').value = '#ff3b9d';
	BTN_SUBMIT.textContent = 'Añadir tarjeta';
	BTN_CANCEL.style.display = 'none';
	FORM_TITLE.textContent = 'Añadir proyecto';
	updatePreview();
}

CONTAINER.addEventListener('click', (e) => {
	const btn = e.target.closest('[data-action]');
	if (!btn) return;
	const card = btn.closest('.project-card');
	if (btn.dataset.action === 'remove') {
		card.remove();
		if (editingCard === card) cancelEdit();
	} else if (btn.dataset.action === 'edit') {
		setEditMode(card);
	}
});

FORM.addEventListener('input', updatePreview);
FORM.addEventListener('change', updatePreview);

FORM.addEventListener('submit', (e) => {
	e.preventDefault();
	const project = getProjectFromForm();
	if (editingCard) {
		const newCard = createCard(project);
		editingCard.replaceWith(newCard);
		cancelEdit();
	} else {
		CONTAINER.appendChild(createCard(project));
		FORM.reset();
		document.getElementById('color').value = '#ff3b9d';
	}
});

BTN_CANCEL.addEventListener('click', cancelEdit);

document.getElementById('btn-import').addEventListener('click', () => {
	const raw = document.getElementById('import-json').value.trim();
	if (!raw) return;
	try {
		const data = JSON.parse(raw);
		if (!Array.isArray(data)) throw new Error('El JSON debe ser un array');
		CONTAINER.innerHTML = '';
		data.forEach(p => CONTAINER.appendChild(createCard(p)));
		document.getElementById('import-json').value = '';
		if (editingCard) cancelEdit();
	} catch (err) {
		alert('JSON inválido: ' + err.message);
	}
});

function cardsToJson() {
	const cards = CONTAINER.querySelectorAll('[data-project]');
	return Array.from(cards).map(c => JSON.parse(c.dataset.project));
}

function exportJson() {
	const data = cardsToJson();
	const json = JSON.stringify(data, null, 2);
	JSON_OUTPUT.value = json;
	return json;
}

document.getElementById('btn-export').addEventListener('click', () => exportJson());

const btnCopyCommand = document.getElementById('btn-copy-command');
if (btnCopyCommand) {
	btnCopyCommand.addEventListener('click', async () => {
		const cmd = document.getElementById('export-command');
		if (!cmd) return;
		try {
			await navigator.clipboard.writeText(cmd.textContent);
			const orig = btnCopyCommand.textContent;
			btnCopyCommand.textContent = 'Copiado';
			setTimeout(() => { btnCopyCommand.textContent = orig; }, 2000);
		} catch {
			cmd.select();
			cmd.setSelectionRange(0, 99999);
			alert('No se pudo copiar. Selecciona el comando manualmente.');
		}
	});
}

document.getElementById('btn-copy').addEventListener('click', async () => {
	const json = exportJson();
	try {
		await navigator.clipboard.writeText(json);
		const btn = document.getElementById('btn-copy');
		const orig = btn.textContent;
		btn.textContent = 'Copiado';
		setTimeout(() => { btn.textContent = orig; }, 2000);
	} catch {
		JSON_OUTPUT.select();
		JSON_OUTPUT.setSelectionRange(0, 99999);
		alert('No se pudo copiar. Usa Ctrl+C en el área de texto.');
	}
});

document.getElementById('btn-download').addEventListener('click', () => {
	const json = exportJson();
	const blob = new Blob([json], { type: 'application/json' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = 'projects.json';
	a.click();
	URL.revokeObjectURL(a.href);
});

fetch('data/projects.json')
	.then(r => r.ok ? r.json() : [])
	.catch(() => [])
	.then(projects => {
		projects.forEach(p => CONTAINER.appendChild(createCard(p)));
	});

updatePreview();
