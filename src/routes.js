// Map paths to page components
module.exports = {
	routes: {
		'/': './pages/App.vue',
		'/login': './pages/Login.vue',
		'/browse': './pages/Browse.vue',
	},

	/**
	 * Get a list of the route components
	 */
	values() {
		return Object.values(this.routes).map(r => require.resolve(r));
	},

	/**
	 * Return the file path for a component given its URL path
	 * @param {string} path The path to lookup
	 */
	get(path){
		const route = this.routes[path];
		return route && require.resolve(route);
	}
}
