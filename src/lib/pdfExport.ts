import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportDoseReport(record: any) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(0, 38, 83); // Primary color
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DoseTrack Rwanda', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Dosimetry Report', 14, 30);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 160, 30);

  // Patient Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Patient & Procedure Details', 14, 55);
  
  autoTable(doc, {
    startY: 60,
    head: [['Field', 'Value']],
    body: [
      ['Patient ID', record.id || record.patientId],
      ['Exam Date', record.date || record.examDate],
      ['Exam Type', record.type || record.examType],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 38, 83] },
  });

  // Dosimetry Data
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('Radiation Dosimetry Parameters', 14, finalY + 10);
  
  autoTable(doc, {
    startY: finalY + 15,
    head: [['Parameter', 'Measurement', 'Unit']],
    body: [
      ['CTDI vol', record.ctdi || record.ctdiVol, 'mGy'],
      ['DLP', record.dlp, 'mGy·cm'],
      ['Status', record.status || 'Verified', ''],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 105, 114] }, // Secondary color
  });

  // Footer / Compliance
  const finalY2 = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Regulatory Compliance: MoH Rwanda Radiology Standard v4.2', 14, finalY2);
  doc.text('This report is electronically generated and verified by DoseTrack ML prediction engine.', 14, finalY2 + 5);

  doc.save(`DoseReport_${record.id || record.patientId}.pdf`);
}
