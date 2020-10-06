package com.printlele.printerclient.service;

import java.io.File;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.ChangeMessageVisibilityRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.printlele.printerclient.bean.PrintJob;
import com.printlele.printerclient.bean.Printer;
import com.printlele.printerclient.utility.Constants;

@Service
public class PrintSQSQueueListener {
	
	Logger logger = LoggerFactory.getLogger(getClass());
	
	ExecutorService executorService;
	
	AmazonSQS sqs;

	@Value("${aws.region}")
	String awsRegion;
	@Value("${aws.credentials.secretKey}")
	String secretKey;
	@Value("${aws.credentials.accessKey}")
	String accessKey;

	ObjectMapper jsonMapper;
	
	@Autowired
	DocumentApiService documentApiService;
	@Autowired
	PrintJobService printJobService;
	
	boolean running;
	
	@PostConstruct
	private void init() {
		jsonMapper = new ObjectMapper();
		
		sqs = AmazonSQSClientBuilder.standard().withRegion(awsRegion).withCredentials(new AWSCredentialsProvider() {
			@Override
			public void refresh() {}
			@Override
			public AWSCredentials getCredentials() {
				return new AWSCredentials() {
					@Override
					public String getAWSSecretKey() {
						return secretKey;
					}
					@Override
					public String getAWSAccessKeyId() {
						return accessKey;
					}
				};
			}
		}).build();
		
		running = true;
	}
	
	
	public void addPrinterQueueListener(Printer printer) {
		
		logger.debug("addPrinterQueueListener alias:{} id:{}", printer.getAlias(), printer.getPrinterId());
		executorService = Executors.newCachedThreadPool();
		
		executorService.submit(new Thread() {
			
			@Override
			public void run() {
				
				while (running) {
					PrintJob job = null;
					String lastMessage = null;
					try{
						
						logger.info("Polling for printer {}", printer.getAlias());
						
						ReceiveMessageRequest receiveRequest = new ReceiveMessageRequest()
						        .withQueueUrl(printer.getQueueUrl())
						        .withWaitTimeSeconds(20);
						
						List<Message> messages = sqs.receiveMessage(receiveRequest).getMessages();
						
						for (Message message : messages) {
							
							lastMessage = message.getReceiptHandle();
							logger.info("Message ReceiptHandle {}", lastMessage);
							
							String sqsBody = message.getBody();
							logger.info(message.getMessageId());
							logger.info(sqsBody);
							
							job = jsonMapper.readValue(sqsBody, PrintJob.class);
							
							documentApiService.updatePrintJobStatus(job, Constants.JOB_PICKED, null);
							logger.info("Updated PrintJOb {}", Constants.JOB_PICKED);
							
							File printFile = documentApiService.getFile(job);
							
							if(printFile == null)
								throw new RuntimeException("Unable to download file!!");
								
							documentApiService.updatePrintJobStatus(job, Constants.JOB_PROCESSING, null);
							logger.info("Updated PrintJOb {}", Constants.JOB_PROCESSING);
							
							logger.info("Printing started.. ");
							printJobService.print(printFile.getAbsolutePath(), printer.getName(), job);
							logger.info("Printing completed.. ");
							
							documentApiService.updatePrintJobStatus(job, Constants.JOB_SUCCESS, null);
							logger.info("Updated PrintJOb {}", Constants.JOB_SUCCESS);

							sqs.deleteMessage(printer.getQueueUrl(), lastMessage);
							logger.info("Message deleted from queue.. ");
							
							documentApiService.updatePrintJobStatus(job, Constants.JOB_DELETED_FROM_QUEUE, null);
							logger.info("Updated PrintJOb {}", Constants.JOB_DELETED_FROM_QUEUE);
							
							job = null;
							lastMessage = null;
						}
					} catch (Exception e) {
						logger.error("Error occured printing", e);
						
						try{
							if(job != null){
								documentApiService.updatePrintJobStatus(job, Constants.JOB_FAILED, e.getMessage());
								logger.info("Updated PrintJOb {}", Constants.JOB_FAILED);
							}
							
							if(lastMessage != null){
								ChangeMessageVisibilityRequest visibleRequest = new ChangeMessageVisibilityRequest()
										.withQueueUrl(printer.getQueueUrl())
										.withVisibilityTimeout(60)
										.withReceiptHandle(lastMessage);
								
								sqs.changeMessageVisibility(visibleRequest);
								logger.info("changeMessageVisibility completed.. ");
							}
						} catch (Exception dx) {
							logger.error("Exception in Exception", e);
						}
					} finally {
						job = null;
						lastMessage = null;
					}
				}
				
			}
		});
	}
	
	public void stopAllListeners() {
		logger.info("restart started..");
		running = false;
		
		try {
			if(executorService != null && !executorService.awaitTermination(20, TimeUnit.SECONDS))
				executorService.shutdownNow();
			
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		
		running = true;
		logger.info("Listeners stopped..");
	}
	
}
