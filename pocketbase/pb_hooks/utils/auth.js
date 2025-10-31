/**
 * Authentication utility functions for PocketBase hooks
 * Validates OAuth tokens for user API endpoints
 */

module.exports = {
  /**
   * Validates OAuth token from Authorization header
   * @param {object} e - The event object
   * @param {object} app - PocketBase app instance
   * @returns {Object} - { valid: boolean, user?: Record, error?: string }
   */
  validateApiKey: (e, app) => {
    try {
      // Get Authorization header
      const authHeader = e.request.header.get("Authorization");
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
          valid: false,
          error: "Missing or invalid Authorization header. Expected: Bearer <token>"
        };
      }
      
      const token = authHeader.slice(7).trim();
      
      if (!token) {
        return {
          valid: false,
          error: "Empty authorization token"
        };
      }
      
      // OAuth tokens are 48 characters
      // (We're using OAuth tokens for authentication in axiom)
      if (token.length === 48) {
        // Validate OAuth token
        try {
          const tokenRecord = app.findFirstRecordByFilter(
            "_oauth_access_tokens",
            `token = "${token}"`
          );
          
          if (!tokenRecord) {
            return {
              valid: false,
              error: "Invalid or expired OAuth token"
            };
          }
          
          // Check if token is expired
          const expires = new Date(tokenRecord.get("expires"));
          if (expires < new Date()) {
            return {
              valid: false,
              error: "OAuth token has expired"
            };
          }
          
          // Get the user from the token
          const userId = tokenRecord.get("user");
          if (!userId) {
            return {
              valid: false,
              error: "OAuth token has no associated user"
            };
          }
          
          // Fetch the user record
          try {
            const user = app.findRecordById("users", userId);
            
            if (!user) {
              return {
                valid: false,
                error: "User not found"
              };
            }
            
            return {
              valid: true,
              user: user
            };
          } catch (err) {
            return {
              valid: false,
              error: `Failed to fetch user: ${err.message}`
            };
          }
        } catch (err) {
          return {
            valid: false,
            error: `OAuth token validation failed: ${err.message}`
          };
        }
      } else {
        return {
          valid: false,
          error: `Invalid token format. Expected OAuth token (48 characters), got ${token.length} characters`
        };
      }
    } catch (error) {
      console.error("[Auth] Token validation error:", error);
      return {
        valid: false,
        error: `Authentication error: ${error.message}`
      };
    }
  }
};

