export default {
	async navigateToKeycloak () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
		// store redirect URL for later token request
		await storeValue("redirectURL", appsmith.URL.fullPath) 
		navigateTo( "https://idm.urban-data.cloud/auth/realms/udc-dev/protocol/openid-connect/auth",
							 { "client_id": "apps",
								"response_type": "code",
								"approval_prompt": "force",
								"redirect_uri": appsmith.URL.fullPath,
								"scope": "openid email profile"
							 }
							)

	},

	async storesession () {
		//	use async-await or promises
		if (appsmith.URL.queryParams.code != null && appsmith.URL.queryParams.code.trim() != '') {
			// First exchange the code to a token
			await storeValue("authCode", appsmith.URL.queryParams.code)
			await KeycloakTokenEndpoint.run()
			await storeValue("accessToken",KeycloakTokenEndpoint.data.access_token)
			await storeValue("accessTokenExpiresIn",KeycloakTokenEndpoint.data.expires_in)
			await storeValue("refreshToken",KeycloakTokenEndpoint.data.refresh_token)
			await storeValue("refreshTokenExpiresIn",KeycloakTokenEndpoint.data.refresh_expires_in)
			await this.checkSessionState()					
		}
	},

	checkAndFormatKey (input) {
		const pemHeader = "-----BEGIN PUBLIC KEY-----";
		const pemFooter = "-----END PUBLIC KEY-----";
		const formattedInput = input.replace(/\s/g, ""); // Remove all whitespace

		if (input.startsWith(pemHeader) && input.endsWith(pemFooter)) {
			// The input is already in PEM format
			return input;
		} else {
			// The input is not in PEM format
			const pemLines = [];
			for (let i = 0; i < formattedInput.length; i += 64) {
				// Split the input into 64 byte chunks
				pemLines.push(formattedInput.slice(i, i + 64));
			}
			// Concatenate the PEM lines
			const pemContent = pemLines.join("\n");
			// Add the PEM header and footer
			const pemFormattedString = `${pemHeader}\n${pemContent}\n${pemFooter}`;
			return pemFormattedString;
		}
	},

	async checkSessionState () {
		//	use async-await or promises
		// invalid token - synchronous
		//try {
		var signingKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0uMg5H/pto++/7onW2L8M6uf8rTRnO8no5zUoW3Q5QdL5+EgCN8XkmzwONn8CcatFyJ9HM6tTAxxK3uTMvipNCNeh8ZLK+HmeHKp1AKtlpWk2be96SwgsvLulA7Xm5eoqfmZCQmnkF8NFW2lge47YPzLPrlTEGIPJUgH1oEtpM8oLr87cjWa7UFxF3ves5sQh8bXhSAhV4r8PxJEmOhpGKEpU8KNnIIN7cvMujDQ55kQYKhx0qtfmWZuJKWhWULzpEEzNWYr33WxEBst5OjRB0bvcBHsE6TPNjJJYMqohD4Ox76CuR8f2c/avdSZTygzJCTf4XUB0eZoT2dN998+0QIDAQAB"
		var decoded = jsonwebtoken.verify(appsmith.store.accessToken, this.checkAndFormatKey(signingKey) );
		await storeValue('decodedToken', decoded)
		//} catch(err) {
		//	console.log("Error")
		//}
	},

	async resetSession () {
		//	use async-await or promises
		await removeValue("authCode")
		await removeValue("accessToken")
		await removeValue("accessTokenExpiresIn")
		await removeValue("refreshToken")
		await removeValue("refreshTokenExpiresIn")
		await removeValue("decodedToken")
		await removeValue("redirectURL")
	}	

}
