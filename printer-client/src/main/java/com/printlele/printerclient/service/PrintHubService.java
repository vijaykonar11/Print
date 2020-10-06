package com.printlele.printerclient.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.printlele.printerclient.bean.PrintHub;
import com.printlele.printerclient.bean.PrintHubResponse;

@Service
public class PrintHubService {

	Logger logger = LoggerFactory.getLogger(getClass());
	
	RestTemplate template;
	
	PrintHubResponse hubResponse;	
	Map<String, PrintHub> printHubs;
	
	@Autowired
	ApiHeaderFactory apiHeaderFactory;
	
	@Value("${api.printHub.url}")
	String hubApiUrl;
	
	@PostConstruct
	private void init() {
		template = new RestTemplate();
		
		try{
			populate();
		} catch (HttpClientErrorException e) {
			logger.error("Uable to populate Print Hub Service", e);
		}
	}
	
	public void populate() {
		
		ResponseEntity<PrintHubResponse> responseEntity = template.exchange(hubApiUrl, HttpMethod.GET, 
				apiHeaderFactory.getEntity(), PrintHubResponse.class);
		
		if (responseEntity.getStatusCode() == HttpStatus.OK) {
			hubResponse = responseEntity.getBody();
			populatePrintHubMap(hubResponse.getItems());
			
			logger.info("New print hub object updated...");
		} else {
			printHubs = null;
			throw new RuntimeException("Failed to retreive PrintHubs " + responseEntity.getStatusCode().getReasonPhrase());
		}
	}
	
	public Map<String, PrintHub> getPrintHubs() {
		return printHubs;
	}
	
	private void populatePrintHubMap(List<PrintHub> printHubList){
		printHubs = new HashMap<>();
		for (PrintHub printHub : printHubList){
			printHubs.put(printHub.getId(), printHub);
		}
	}
}
