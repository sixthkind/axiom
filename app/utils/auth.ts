import { pb } from './pb';

class authUtils {
  static async register(
    input: { 
      email: string, 
      password: string,
    }) {
    return new Promise(async (resolve, reject) => {
      console.log('register', input);
      try {
        // Create a new user in the 'users' collection with the provided input data
        await pb.collection("users").create({
          email: input.email,
          password: input.password,
          passwordConfirm: input.password,
          emailVisibility: true
        });
  
        try {
          // Send a verification email to the newly registered user
          // await this.sendVerificationEmail(input.email);

          // Authenticate the user with the provided email and password
          await this.authenticate(input.email, input.password);

          console.log('register success');

          // resolve this function
          resolve(true);
        } catch (error: any) {
          console.error(error);
          reject(error.message);
        }
      } catch (error: any) {
        console.error(error);
        reject(error.message);
      }
    });
  }

  static async authenticate(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return authData;
  }


  static async oauth(provider: string) {
    try {
      await pb.collection('users').authWithOAuth2({ provider });
      const emailVisibility = pb.authStore.record?.emailVisibility ? null : true;

      // Create an object with firstName and lastName if they don't already exist
      let body: any = {};
      if (emailVisibility) body.emailVisibility = emailVisibility;

      // Update the user if the body object is not empty
      if (Object.keys(body).length > 0 && pb.authStore.record?.id) {
        await pb.collection('users').update(pb.authStore.record.id, body);
      }

      window.location.href = '/';
    } catch (error: any) {
      console.error(error);
    }
  }

  static async sendVerificationEmail(email: string) {
    await pb.collection("users").requestVerification(email);
  }

  static async sendReset(email: string) {
    await pb.collection("users").requestPasswordReset(email);
  }

  static async refresh() {
    try {
      await pb.collection('users').authRefresh();
      return;
    } catch (error: any) {
      if(error.status === 401) {
        // this means token is bad, logout
        this.logout();
      }
    }
  }

  static isAuthenticated() {
    return pb.authStore.isValid;
  }

  static getToken() {
    return pb.authStore.token;
  }

  static getUserId() {
    return pb.authStore.record?.id;
  }

  static logout() {
    pb.authStore.clear();
    window.location.href = '/auth';
  }
}

export { authUtils };