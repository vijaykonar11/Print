package com.printlele.printerclient.bean;

import java.util.ArrayList;

public class Printer {

	String name;
	String alias;
	String printerId;
	String queueUrl;
	
	ArrayList<Cost> cost;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public String getPrinterId() {
		return printerId;
	}

	public void setPrinterId(String printerId) {
		this.printerId = printerId;
	}

	public String getQueueUrl() {
		return queueUrl;
	}

	public void setQueueUrl(String queueUrl) {
		this.queueUrl = queueUrl;
	}

	public ArrayList<Cost> getCost() {
		return cost;
	}

	public void setCost(ArrayList<Cost> cost) {
		this.cost = cost;
	} 
	
	
}
