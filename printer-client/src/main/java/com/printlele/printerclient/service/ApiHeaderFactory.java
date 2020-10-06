package com.printlele.printerclient.service;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

@Service
public class ApiHeaderFactory {

	@Autowired
	ApiCredentialService credentialService;
	
	HttpEntity<String> entity;
	
	public HttpEntity<String> getEntity() {		
		HttpHeaders headers = getHeaders();
		entity = new HttpEntity<String>(headers);
		return entity;
	}
	
	public HttpHeaders getHeaders() {
		credentialService.keepUpdated();
		
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", credentialService.getApiCredentials().getIdToken());
		headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
		return headers;
	}
	
}
