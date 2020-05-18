const { OAuth2Server } = require('oauth2-mock-server');

module.exports = async (port = 1235) => {
	const server = new OAuth2Server();
	await server.start(port, 'localhost');
	server.service.on('beforeResponse', response => {
		response.body.name = 'Test User';
		response.body.orcid = '0000-0000-0000-1234';
		response.body.expires_in = 3600;
	});
	await server.issuer.keys.generateRSA();
	return server;
}
