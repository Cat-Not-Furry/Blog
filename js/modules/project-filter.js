export function initProjectFilter() {
	const container = document.getElementById('projects-container');
	const filterBtns = document.querySelectorAll('.filter-btn');
	if (!container || filterBtns.length === 0) return;

	filterBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const category = btn.dataset.category;
			filterBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			const cards = container.querySelectorAll('.project-card');
			cards.forEach(card => {
				const show = category === 'all' || card.classList.contains('project-card--' + category);
				card.style.display = show ? '' : 'none';
			});
		});
	});
}
