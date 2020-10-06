package com.printlele.printerclient.bean;

import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PrintHubResponse {
	
	@JsonProperty("Items")
	ArrayList<PrintHub> Items;
	@JsonProperty("Count")
	int Count;
	@JsonProperty("ScannedCount")
	int ScannedCount;
	
	public ArrayList<PrintHub> getItems() {
		return Items;
	}
	public void setItems(ArrayList<PrintHub> items) {
		Items = items;
	}
	public int getCount() {
		return Count;
	}
	public void setCount(int count) {
		Count = count;
	}
	public int getScannedCount() {
		return ScannedCount;
	}
	public void setScannedCount(int scannedCount) {
		ScannedCount = scannedCount;
	}
	
	
}
