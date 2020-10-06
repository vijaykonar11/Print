package com.printlele.printerclient.service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import javax.annotation.PostConstruct;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.printlele.printerclient.bean.PrintJob;

@Service
public class DocumentApiService {
	Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	ApiHeaderFactory apiHeaderFactory;

	RestTemplate template;

	@Value("${api.jobSignedDocument.url}")
	String jobSignedDocumentUrl;

	@Value("${api.jobAddStatus.url}")
	String jobAddStatusUrl;

	ObjectMapper jsonMapper;

	@PostConstruct
	private void init() {
		template = new RestTemplate();
		jsonMapper = new ObjectMapper();
	}

	public File getFile(PrintJob job) {
		
		String jobSignedDocumentUrl = this.jobSignedDocumentUrl.replace("{id}", job.getId());
		
		ResponseEntity<String> responseEntity = template.exchange(jobSignedDocumentUrl, HttpMethod.GET, 
				apiHeaderFactory.getEntity(), String.class);
		
		if(responseEntity.getStatusCode() == HttpStatus.OK) {
			String response = responseEntity.getBody();
			logger.debug("[GET] {} response:{}", jobSignedDocumentUrl, response);
			
			
			JsonNode node;
			try {
				File file = File.createTempFile("printlele-", "-doc");
				
				node = jsonMapper.readTree(response);
				String url = node.path("signedUrl").textValue();
				
				InputStream in = new URL(url).openStream();
				Files.copy(in, Paths.get(file.getAbsolutePath()), StandardCopyOption.REPLACE_EXISTING);
				
				return file;
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			throw new RuntimeException("Failed to retreive Signed URL for job document " + responseEntity.getStatusCode().getReasonPhrase());
		}
		
		return null;
	}
	
	public boolean updatePrintJobStatus(PrintJob job, String update, String error){
		jobAddStatusUrl = jobAddStatusUrl.replace("{id}", job.getId());
		
		HttpHeaders headers = apiHeaderFactory.getHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		
		String body = "{"
				+ " \"update\": \"" + update + "\" ,"
				+ " \"error\": \"" + error + "\" "
				+ "}";
		
		HttpEntity<String> entity = new HttpEntity<String>(body, headers); 
		
		ResponseEntity<String> responseEntity = template.exchange(jobAddStatusUrl, HttpMethod.POST, 
				entity, String.class);
		
		return responseEntity.getStatusCode() == HttpStatus.OK;
	}
}
