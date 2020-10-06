package com.printlele.printerclient.bean;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApiCredentials {
	
	@JsonProperty("id_token")
	private String idToken;
	
	@JsonProperty("refresh_token")
	private String refreshToken;
	
	@JsonProperty("access_token")
	private String accessToken;
	
	public String getIdToken() {
		return idToken;
	}
	public void setIdToken(String idToken) {
		this.idToken = idToken;
	}
	public String getRefreshToken() {
		return refreshToken;
	}
	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}
	public String getAccessToken() {
		return accessToken;
	}
	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}
	public void set(ApiCredentials credentials) {
		setAccessToken(credentials.accessToken);
		setIdToken(credentials.idToken);
		setRefreshToken(credentials.refreshToken);
	}
}
