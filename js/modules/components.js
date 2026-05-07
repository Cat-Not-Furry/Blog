export async function loadHeaderFooter() {
	try {
		const base = document.location.pathname.includes('/pages/') ? '../' : '';
		const headerResponse = await fetch(base + 'templates/header.html');
		if (!headerResponse.ok) throw new Error('Error al cargar header');
		const headerHtml = await headerResponse.text();
		document.getElementById('header').innerHTML = headerHtml;

		const footerResponse = await fetch(base + 'templates/footer.html');
		if (!footerResponse.ok) throw new Error('Error al cargar footer');
		const footerHtml = await footerResponse.text();
		document.getElementById('footer').innerHTML = footerHtml;
	} catch (error) {
		console.error('Error cargando componentes:', error);
	}
}
