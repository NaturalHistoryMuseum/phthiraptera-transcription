import Vue from 'vue';

/**
 *
 * @param {Vue} Component Vue Component to render
 * @param {object} data Props to pass to the child node
 */
export default function createApp(Component, data) {
	return new Vue({
		name: 'root',
		data(){
			return {
				data
			};
		},
		render(h) {
			return  h(
				Component,
				{
					props: {
						...this.data
					}
				}
			)
		}
	});
}
