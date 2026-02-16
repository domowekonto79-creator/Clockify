// This service file has been temporarily disabled to simplify the application and resolve build errors.
/*
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { ProcessedEntry } from "../types";

// Export function to generate PDF report using jsPDF and autoTable
export const generatePdfReport = async (
  userName: string, 
  _monthName: string, 
  entries: ProcessedEntry[]
) => {
  const doc = new jsPDF();
  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);
  const now = new Date();
  const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
  const yearNum = now.getFullYear().toString();

  const orangePTE = [237, 125, 49]; 
  const bluePTE = [189, 215, 238];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Pracownicze Towarzystwo Emerytalne", 14, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Załącznik do Umowy o świadczenie usług", 196, 20, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Zestawienie czynności wykonanych w miesiącu ${monthNum}/${yearNum}`, 105, 40, { align: "center" });

  const tableData: any[][] = entries.map(e => {
    const dateParts = e.date.split('.');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : e.date;
    return [formattedDate, e.description, e.durationHours.toFixed(0)];
  });

  tableData.push([
    { content: 'Suma:', colSpan: 2, styles: { fontStyle: 'bold' } }, 
    { content: totalHours.toFixed(0), styles: { fontStyle: 'bold', fillColor: bluePTE, halign: 'center' } }
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Data', 'Opis', 'Godziny']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: orangePTE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' }
    },
    didParseCell: function (data: any) {
      if (data.section === 'head' && data.column.index === 2) {
        data.cell.styles.fillColor = bluePTE;
        data.cell.styles.textColor = [0, 0, 0];
      }
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  let sigY = finalY + 20;
  doc.text(userName, 14, sigY);
  sigY += 2;
  doc.line(14, sigY, 100, sigY);
  sigY += 5;
  doc.setFontSize(8);
  doc.text("Podpis Kontrahenta", 14, sigY);

  sigY += 15;
  doc.line(14, sigY, 100, sigY);
  sigY += 5;
  doc.text("Podpis osoby akceptującej zestawienie w imieniu PTE", 14, sigY);

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text("Strona 1 z 1", 196, pageHeight - 15, { align: "right" });
  doc.text("B2B", 196, pageHeight - 10, { align: "right" });

  doc.save(`Zestawienie_${userName.replace(/\s+/g, '_')}_${monthNum}_${yearNum}.pdf`);
};
*/