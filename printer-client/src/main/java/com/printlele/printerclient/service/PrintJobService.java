package com.printlele.printerclient.service;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;

import javax.print.Doc;
import javax.print.DocFlavor;
import javax.print.DocPrintJob;
import javax.print.PrintException;
import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import javax.print.SimpleDoc;
import javax.print.attribute.Attribute;
import javax.print.attribute.DocAttributeSet;
import javax.print.attribute.HashDocAttributeSet;
import javax.print.attribute.HashPrintRequestAttributeSet;
import javax.print.attribute.PrintRequestAttributeSet;
import javax.print.attribute.standard.Chromaticity;
import javax.print.attribute.standard.Copies;
import javax.print.attribute.standard.MediaSizeName;
import javax.print.attribute.standard.Sides;
import javax.print.event.PrintJobEvent;
import javax.print.event.PrintJobListener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.printlele.printerclient.bean.PrintJob;

@Component
public class PrintJobService {
	Logger logger = LoggerFactory.getLogger(getClass());

	public void print(String fileName, String printerName, PrintJob job) throws PrintException, IOException {
		DocFlavor flavor = DocFlavor.SERVICE_FORMATTED.PAGEABLE;
		
		PrintRequestAttributeSet patts = new HashPrintRequestAttributeSet();
		
		PrintService[] ps = PrintServiceLookup.lookupPrintServices(flavor, patts);
		if (ps.length == 0) {
			throw new IllegalStateException("No Printer found");
		}
		logger.debug("Available printers: " + Arrays.asList(ps));

		PrintService myService = null;
		for (PrintService printService : ps) {
			if (printService.getName().equals(printerName)) {
				myService = printService;
				break;
			}
		}

		if (myService == null) {
			throw new IllegalStateException("Printer not found");
		}

		FileInputStream fis = new FileInputStream(fileName);
		Doc pdfDoc = new SimpleDoc(fis, DocFlavor.INPUT_STREAM.AUTOSENSE, null);
		DocPrintJob printJob = myService.createPrintJob();
		
		PrintRequestAttributeSet datts = new HashPrintRequestAttributeSet();
		datts.add(new Copies(job.getNoOfCopies()));
		datts.add(MediaSizeName.ISO_A4);
		
		switch(job.getPrintType()){
		case "color":
			datts.add(Chromaticity.COLOR);
			break;
		case "bw":
			datts.add(Chromaticity.MONOCHROME);
			break;
		default:
			throw new RuntimeException("Invalid Print Type");
		}
		
		PrintJobListener listener = getListener();
		printJob.addPrintJobListener(listener);		
		
		printJob.print(pdfDoc, datts);
		
//		printJob.removePrintJobListener(listener);
		fis.close();        
	}

	private PrintJobListener getListener() {
		return new PrintJobListener() {
			@Override
			public void printJobRequiresAttention(PrintJobEvent pje) {
				logger.debug("printJobRequiresAttention");
			}
			
			@Override
			public void printJobNoMoreEvents(PrintJobEvent pje) {
				logger.debug("printJobNoMoreEvents");
			}
			
			@Override
			public void printJobFailed(PrintJobEvent pje) {
				logger.debug("printJobFailed");
			}
			
			@Override
			public void printJobCompleted(PrintJobEvent pje) {
				logger.debug("printJobCompleted");
			}
			
			@Override
			public void printJobCanceled(PrintJobEvent pje) {
				logger.debug("printJobCanceled");
			}
			
			@Override
			public void printDataTransferCompleted(PrintJobEvent pje) {
				logger.debug("printDataTransferCompleted");
			}
		};
	}
	
}
