package com.printlele.printerclient.bean;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class PrintHub {

	String alias;
	String name;
	Address address;
	String id;
	ArrayList<Printer> printers;
	String ownerId;
	Map<String, Printer> printerMap;
	
	public String getAlias() {
		return alias;
	}
	public void setAlias(String alias) {
		this.alias = alias;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Address getAddress() {
		return address;
	}
	public void setAddress(Address address) {
		this.address = address;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public ArrayList<Printer> getPrinters() {
		return printers;
	}
	public void setPrinters(ArrayList<Printer> printers) {
		this.printers = printers;
		
		printerMap = new HashMap<>();
		for (Printer printer : printers)
			printerMap.put(printer.alias, printer);
	}
	public String getOwnerId() {
		return ownerId;
	}
	public void setOwnerId(String ownerId) {
		this.ownerId = ownerId;
	}
	public Map<String, Printer> getPrinterMap() {
		return printerMap;
	}
}
