
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  VerticalAlign,
  BorderStyle,
  Header,
  Footer
} from "docx";
import saveAs from "file-saver";
import { ProcessedEntry } from "../types";

export const generateWordReport = async (
  userName: string, 
  monthName: string, 
  entries: ProcessedEntry[]
) => {
  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);
  const now = new Date();
  const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
  const yearNum = now.getFullYear().toString();

  const headerOrange = "ED7D31";
  const hoursBlue = "BDD7EE";

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 60, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Pracownicze Towarzystwo Emerytalne", bold: true, size: 20 }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Załącznik do Umowy o świadczenie usług", size: 18 })
                            ],
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                        verticalAlign: VerticalAlign.TOP,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Strona 1 z 1", size: 16 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "B2B", size: 16 }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ 
                text: `Zestawienie czynności wykonanych w miesiącu ${monthNum}/${yearNum}`, 
                bold: true, 
                size: 32 
              }),
            ],
            spacing: { after: 600 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    width: { size: 12, type: WidthType.PERCENTAGE },
                    shading: { fill: headerOrange },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Data", bold: true, color: "FFFFFF", size: 18 })],
                      alignment: AlignmentType.CENTER 
                    })],
                  }),
                  new TableCell({
                    width: { size: 78, type: WidthType.PERCENTAGE },
                    shading: { fill: headerOrange },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Opis", bold: true, color: "FFFFFF", size: 18 })],
                      alignment: AlignmentType.LEFT 
                    })],
                  }),
                  new TableCell({
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    shading: { fill: hoursBlue },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Godziny", bold: true, size: 18 })],
                      alignment: AlignmentType.CENTER 
                    })],
                  }),
                ],
              }),
              ...entries.map(entry => {
                const dateParts = entry.date.split('.');
                const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : entry.date;
                
                return new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 12, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: formattedDate, size: 18 })],
                        alignment: AlignmentType.CENTER
                      })],
                    }),
                    new TableCell({
                      width: { size: 78, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: entry.description, size: 18 })] 
                      })],
                    }),
                    new TableCell({
                      width: { size: 10, type: WidthType.PERCENTAGE },
                      shading: { fill: hoursBlue },
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: entry.durationHours.toFixed(0), size: 18 })],
                        alignment: AlignmentType.CENTER 
                      })],
                    }),
                  ],
                });
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Suma:", bold: true, size: 20 })] 
                    })],
                    columnSpan: 2,
                  }),
                  new TableCell({
                    shading: { fill: hoursBlue },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: totalHours.toFixed(0), bold: true, size: 20 })],
                      alignment: AlignmentType.CENTER 
                    })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { before: 800 } }),
          new Paragraph({ 
            children: [new TextRun({ text: userName, size: 20 })],
            spacing: { after: 100 }
          }),
          new Paragraph({ 
            children: [new TextRun({ text: "___________________________________________", bold: true })] 
          }),
          new Paragraph({ 
            children: [new TextRun({ text: "Podpis Kontrahenta", size: 16 })],
            spacing: { after: 800 }
          }),
          
          new Paragraph({ 
            children: [new TextRun({ text: "___________________________________________", bold: true })] 
          }),
          new Paragraph({ 
            children: [new TextRun({ text: "Podpis osoby akceptującej zestawienie w imieniu PTE", size: 16 })] 
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Zestawienie_${userName.replace(/\s+/g, '_')}_${monthNum}_${yearNum}.docx`;
  saveAs(blob, fileName);
};
