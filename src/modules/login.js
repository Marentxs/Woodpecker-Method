import { OAuth2AuthCodePKCE } from '@bity/oauth2-auth-code-pkce';

export const lichessHost = 'https://lichess.org';
export const scopes = ['puzzle:read', 'puzzle:write'];
export const clientId = 'lichess-api-demo';
export const clientUrl = `${location.protocol}//${location.host}/`;

export class Auth {
  oauth = new OAuth2AuthCodePKCE({
    authorizationUrl: `${lichessHost}/oauth`,
    tokenUrl: `${lichessHost}/api/token`,
    clientId,
    scopes,
    redirectUrl: clientUrl,
    storage: sessionStorage,
    onAccessTokenExpiry: (refreshAccessToken) => refreshAccessToken(),
    onInvalidGrant: console.warn,
  });

  me = undefined;

  async init() {
    try {
      const accessContext = await this.oauth.getAccessToken();
      if (accessContext) {
        await this.authenticate();
      }
    } catch (err) {
      console.error(err);
    }
    if (!this.me) {
      try {
        const hasAuthCode = await this.oauth.isReturningFromAuthServer();
        if (hasAuthCode) {
          await this.authenticate();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async login() {
    await this.oauth.fetchAuthorizationCode();
  }

  async logout() {
    if (this.me) {
      try {
        await this.me.httpClient(`${lichessHost}/api/token`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Token revocation failed, but clearing local state anyway.', e);
      }
    }
    // Instead of clear(), remove only OAuth-specific keys
    const oauthKey = 'oauth2authcodepkce-state';
    if (localStorage.getItem(oauthKey) !== null) {
      localStorage.removeItem(oauthKey);
    }

    this.me = undefined;
  }

  authenticate = async () => {
    const httpClient = this.oauth.decorateFetchHTTPClient(window.fetch);
    const res = await httpClient(`${lichessHost}/api/account`);
    const me = {
      ...(await res.json()),
      httpClient,
    };
    if (me.error) {
      throw me.error;
    }
    this.me = me;
  };

  fetchBody = async (path, config = {}) => {
    const res = await this.fetchResponse(path, config);
    return await res.json();
  };

  fetchResponse = async (path, config = {}) => {
    const res = await (this.me?.httpClient || window.fetch)(`${lichessHost}${path}`, config);
    if (res.error || !res.ok) {
      const errorBody = await res.text();
      console.error(`API Error ${res.status}:`, errorBody);
      throw new Error(`Request to ${path} failed. Please check the console for details.`);
    }
    return res;
  };
}
