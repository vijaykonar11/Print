package com.printlele.printerclient.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.printlele.printerclient.bean.ApiCredentials;

@Service
public class ApiCredentialService {

	Logger logger = LoggerFactory.getLogger(getClass());

	@Value("${api.credentials.file}")
	private String file;
	
	@Value("${api.credentials.clientId}")
	private String clientId;

	ObjectMapper objectMapper;

	ApiCredentials apiCredentials;

	@PostConstruct
	public void init(){
		objectMapper = new ObjectMapper();
		apiCredentials = new ApiCredentials();
		try {
			File file = new File(this.file);
			
			if(file.exists()){
				byte[] jsonData = Files.readAllBytes(Paths.get(this.file));
				
				apiCredentials = objectMapper.readValue(jsonData, ApiCredentials.class);
			} else {
				logger.warn("No credentials present");
			}
		} catch (IOException e) {
			e.printStackTrace();
			throw new RuntimeException("Unable to read credentials file", e);
		}
	}
	
	public ApiCredentials getApiCredentials() {
		return apiCredentials;
	}
	
	public void keepUpdated() {
		if(apiCredentials.getIdToken() == null){
			logger.error("ID Token is null");
			return;
		}
		
		DecodedJWT jwt = JWT.decode(apiCredentials.getIdToken());
		if(jwt.getExpiresAt().getTime() < System.currentTimeMillis()){
			
			String tokenUrl = "https://printnets.auth.us-east-1.amazoncognito.com/oauth2/token";

			HttpHeaders headers = new HttpHeaders();
			headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
			headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

			MultiValueMap<String, String> params = new LinkedMultiValueMap<String, String>();
            params.add("grant_type", "refresh_token");
            params.add("client_id", clientId);
            params.add("refresh_token", apiCredentials.getRefreshToken());

			HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<MultiValueMap<String, String>>(params, headers);			
            
			RestTemplate template = new RestTemplate();
			ResponseEntity<ApiCredentials> responseEntity = template.exchange(tokenUrl, HttpMethod.POST, entity, ApiCredentials.class);
			
			apiCredentials.setIdToken(responseEntity.getBody().getIdToken());
			apiCredentials.setAccessToken(responseEntity.getBody().getAccessToken());
			
			writeToFile();
		}
	}
	
	private void writeToFile() {
		try {
			objectMapper.writeValue(new File(file), apiCredentials);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void setRegisterCredentials(ApiCredentials credentials) {
		apiCredentials.set(credentials);
		writeToFile();
	}
	
}
