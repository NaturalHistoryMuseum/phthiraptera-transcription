const SSR = require( 'vue-server-renderer');
const serverBundle = require('../../dist/vue-ssr-server-bundle.json');
const clientManifest = require('../../dist/client/vue-ssr-client-manifest.json');

const renderer = SSR.createBundleRenderer(serverBundle, { clientManifest });

/**
 * Find and render the Vue component, or return null
 * @param {Object} context Context object with component url and loadData callback
 */
async function renderComponent(context) {
	try {
		return await renderer.renderToString(context);
	} catch(e) {
		// This error is defined in entry/server.js
		if(e.constructor.name === 'RouteNotFoundError') {
			return null;
		}

		throw e;
	}
}

/**
 * Render the component for the given URL
 * @param {string} url The pathname for the component
 * @param {function} loadData Callback to load data for the component. Component constructor passed as argument.
 * @param {string} title The site title
 */
module.exports = async function(url, loadData, title) {
	const context = { url, loadData };

	const body = await renderComponent(context);

	// If the body's empty try the next route
	if(!body) {
		return null;
	}

	// NB the context object gets populated with some utility
	// functions by the vue-loader
	return `<!doctype html>
	<html lang="en">
	<head>
		<meta charset="utf-8">
		${context.renderResourceHints()}
		${context.renderStyles()}
		<title>${title}</title>
	</head>

	<body>
		${body}
		${context.renderState()}
		${context.renderScripts()}
	</body>
	</html>`;
}
