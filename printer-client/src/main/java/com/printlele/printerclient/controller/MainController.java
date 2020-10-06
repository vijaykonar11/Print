package com.printlele.printerclient.controller;

import java.util.Map;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.printlele.printerclient.bean.ApiCredentials;
import com.printlele.printerclient.bean.PrintHub;
import com.printlele.printerclient.bean.Printer;
import com.printlele.printerclient.service.ApiCredentialService;
import com.printlele.printerclient.service.PrintHubService;
import com.printlele.printerclient.service.PrintSQSQueueListener;

@RestController
public class MainController {

	Logger logger = LoggerFactory.getLogger(getClass()); 
	
	@Autowired
	PrintHubService printHubService;
	@Autowired
	PrintSQSQueueListener printSQSQueueListener;
	@Autowired
	ApiCredentialService apiCredentialService;
	
	@PostConstruct
	private void init() {
		Map<String, PrintHub> printHubs = printHubService.getPrintHubs();
		
		if(printHubs != null){
			for (String id : printHubs.keySet()) {
				PrintHub hub = printHubs.get(id);
				
				if(hub.getPrinters() == null)
					continue;
					
				for (Printer printer : hub.getPrinters()) {
					printSQSQueueListener.addPrinterQueueListener(printer);
				}
			}
			logger.info("Init complete...");
		} else {
			logger.warn("No print hubs information...");
		}
		
	}
	
	@GetMapping("heart-beat")
	public String heartBeat() {
		return "ACTIVE";
	}
	
	@GetMapping("refresh")
	public Map<String, PrintHub> refresh() {
		printHubService.populate();
		return printHubService.getPrintHubs();
	}
	
	@PostMapping("register")
	public String register(@RequestBody ApiCredentials credentials) {
		apiCredentialService.setRegisterCredentials(credentials);
		restart();
		return "REGISTERED";
	}
	
	@GetMapping("restart")
	public String restart() {
		printSQSQueueListener.stopAllListeners();
		printHubService.populate();
		init();
		return "RESTARTED";
	}
	
	
}
