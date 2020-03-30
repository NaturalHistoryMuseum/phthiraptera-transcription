// Map paths to page components
export default {
	routes: {
		'/': () => import('./App.vue'),
		'/login': () => import('./Login.vue'),
		'/browse': () => import('./Browse.vue'),
	},

	/**
	 * Return the file path for a component given its URL path
	 * @param {string} path The path to lookup
	 */
	async get(pathname){
		const route = this.routes[pathname];
		return route && (await route()).default;
	}
}
