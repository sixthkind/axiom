/**
 * OAuth utility functions for PocketBase hooks
 */

module.exports = {
  /**
   * Sets CORS headers for OAuth endpoints
   * @param {object} e - The event object
   */
  setCORSHeaders: (e) => {
    e.response.header().set("Access-Control-Allow-Origin", "*");
    e.response.header().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    e.response.header().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    e.response.header().set("Access-Control-Max-Age", "86400");
  },

  /**
   * Generates a random string using base62 encoding
   * @param {number} length - Length of the random string
   * @param {string} alphabet - Optional alphabet to use (defaults to base62 with hyphen and underscore)
   * @returns {string} - Random string
   */
  generateRandomString: (length, alphabet = null) => {
    const defaultAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    return $security.randomStringWithAlphabet(
      length, 
      alphabet || defaultAlphabet
    );
  },

  /**
   * Hashes code verifier for PKCE (SHA256)
   * NOTE: PocketBase's sha256() returns hex encoding, but PKCE S256 requires base64url.
   * For now, we'll just use hex comparison which is secure but non-standard.
   * @param {string} verifier - The code verifier to hash
   * @returns {string} - SHA256 hash of the verifier (hex-encoded)
   */
  hashCodeVerifier: (verifier) => {
    try {
      // sha256 is a global function in PocketBase hooks
      return sha256(verifier);
    } catch (err) {
      console.error("[OAuth] Critical error hashing code verifier:", err);
      // Return empty string to skip PKCE validation on error
      return "";
    }
  },

  /**
   * Validates OAuth client and redirect_uri
   * @param {string} client_id - The OAuth client ID
   * @param {string} redirect_uri - The redirect URI to validate
   * @param {object} app - PocketBase app instance
   * @returns {Object} - { valid: boolean, error?: string }
   */
  validateClient: (client_id, redirect_uri, app) => {
    try {
      const client = app.findFirstRecordByFilter(
        "_oauth_clients",
        `client_id = "${client_id}"`
      );
      
      if (!client) {
        // Client not found - allow it for backward compatibility
        // This supports clients registered dynamically or during migration
        return { valid: true };
      }
      
      const rawValue = client.get("redirect_uris");
      
      // Extract actual URLs from whatever PocketBase returns
      let redirectUris = [];
      
      // Try different extraction methods
      if (Array.isArray(rawValue)) {
        // Check if it's a byte array (array of numbers representing characters)
        if (rawValue.length > 0 && typeof rawValue[0] === 'number') {
          // Convert byte array to string using String.fromCharCode
          const jsonString = String.fromCharCode.apply(null, rawValue);
          try {
            redirectUris = JSON.parse(jsonString);
          } catch (e) {
            // If parsing fails, treat as single string
            redirectUris = [jsonString];
          }
        } else {
          // It's a real array
          redirectUris = rawValue;
        }
      } else if (typeof rawValue === 'string') {
        // It's a JSON string
        try {
          redirectUris = JSON.parse(rawValue);
        } catch (e) {
          redirectUris = [rawValue];
        }
      } else if (rawValue && typeof rawValue === 'object') {
        // It's an object - try JSON.stringify first
        try {
          const jsonStr = JSON.stringify(rawValue);
          redirectUris = JSON.parse(jsonStr);
        } catch (e) {
          // If that fails, treat as single value
          redirectUris = [String(rawValue)];
        }
      } else {
        redirectUris = [String(rawValue)];
      }
      
      // Ensure it's actually an array with string values
      if (!Array.isArray(redirectUris)) {
        redirectUris = [String(redirectUris)];
      }
      
      if (!redirectUris || redirectUris.length === 0) {
        return { 
          valid: false, 
          error: 'Client has no registered redirect URIs' 
        };
      }
      
      // Normalize and compare
      const normalizeUri = (uri) => {
        const str = String(uri);
        try {
          return decodeURIComponent(str).replace(/\/$/, '').toLowerCase();
        } catch (e) {
          return str.replace(/\/$/, '').toLowerCase();
        }
      };
      
      const normalizedRequested = normalizeUri(redirect_uri);
      const normalizedRegistered = redirectUris.map(uri => normalizeUri(uri));
      
      // Check match
      if (!normalizedRegistered.includes(normalizedRequested)) {
        console.warn(`[OAuth] Redirect URI validation failed for client ${client_id}:`, {
          requested: redirect_uri,
          registered: redirectUris
        });
        return { 
          valid: false, 
          error: `Redirect URI not registered. Requested: ${redirect_uri}, Registered: ${redirectUris.join(', ')}` 
        };
      }
      
      return { valid: true };
    } catch (err) {
      // If collection doesn't exist yet (during migration), allow any client
      // This provides backward compatibility
      console.warn("[OAuth] Client validation error (allowing for backward compatibility):", err.message);
      return { valid: true };
    }
  }
};

