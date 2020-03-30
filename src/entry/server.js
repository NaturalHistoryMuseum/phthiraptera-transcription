import createApp from './createApp';
import routes from '../pages/routes';

class RouteNotFoundError extends Error {}

export default async function(context) {
	const Component = await routes.get(context.url);

	if(!Component) {
		throw new RouteNotFoundError('No component found for URL');
	}

	context.state = await context.loadData(Component);

	return createApp(Component, context.state);
}
