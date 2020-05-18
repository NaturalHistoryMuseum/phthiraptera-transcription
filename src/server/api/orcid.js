const simpleOauth2 = require('simple-oauth2');
const path = require('path');

module.exports = class OrcidAuth {
	/**
	 * Class for authenticating against orcid
	 */
	constructor(options = {}) {
		options = {
			oauthUrl: 'https://sandbox.orcid.org/oauth',
			...options
		};
		const { origin, pathname } = new URL(options.oauthUrl);

		this._oauth = simpleOauth2.create({
			client: {
				id: options.clientId,
				secret: options.clientSecret
			},
			auth: {
				tokenHost: origin,
				tokenPath: path.join('/', pathname, 'token'),
				authorizePath: path.join('/', pathname, 'authorize')
			}
		}).authorizationCode;

		this._redirectUri = options.redirectUri;
		this._oauthUrl = options.oauthUrl;
	}

	/**
	 * Get the base url of Orcid's oauth service
	 */
	get oauthUrl() {
		return this._oauthUrl;
	}


	/**
	 * Get the ORCID sign-in url for the user
	 * @param {string} scope The scope to authenticate for
	 */
	getAuthUrl(scope = '/authenticate') {
		return this._oauth.authorizeURL({
			redirect_uri: this._redirectUri,
			scope
		});
	};

	/**
	 * Exchange an authentication code for the ORCID user details
	 * @param {string} code The code to exchange
	 * @param {string} grant_type The grant type
	 */
	exchangeAuth(code, grant_type = 'authorization_code'){
		return this._oauth.getToken({
			code,
			redirect_uri: this._redirectUri,
			grant_type
		});
	}
}
