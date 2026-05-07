export function initScrollReveal() {
	const projectCards = document.querySelectorAll('.project-card');
	const testimonialCards = document.querySelectorAll('.testimonial-card');
	const cards = [...projectCards, ...testimonialCards];
	if (cards.length === 0) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('project-card--visible');
					entry.target.classList.add('testimonial-card--visible');
				}
			});
		},
		{ threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
	);

	cards.forEach((card) => observer.observe(card));
}
