import createApp from './createApp';
import routes from '../pages/routes';

routes.get(window.location.pathname).then(Component => {
  // State data is set on window by vue ssr tools
  const app = createApp(Component, window.__INITIAL_STATE__);

  // Vue automatically gives the data-server-rendered attribute to the SSR root
  app.$mount('[data-server-rendered]');
});
