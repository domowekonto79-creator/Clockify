
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
  HeadingLevel, 
  VerticalAlign,
  BorderStyle,
  TableLayoutType,
  PageOrientation
} from "docx";
import saveAs from "file-saver";
import { ProcessedEntry } from "../types";

export const generateWordReport = async (
  userName: string, 
  monthName: string, 
  entries: ProcessedEntry[]
) => {
  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);

  // KONFIGURACJA STRONY A4 (Jednostki: Twips/DXA)
  // A4 ma szerokość ok. 11906 dxa.
  // Marginesy: 800 dxa (ok. 1.4cm) z każdej strony.
  // Dostępna szerokość robocza: 11906 - 1600 = 10306 dxa.
  
  const PAGE_WIDTH_DXA = 10306; 
  
  // Obliczamy szerokości kolumn na sztywno:
  const colDateWidth = 1500;   // ~2.6cm (wystarczy na datę)
  const colTimeWidth = 1300;   // ~2.3cm (wystarczy na czas)
  const colActivityWidth = PAGE_WIDTH_DXA - colDateWidth - colTimeWidth; // ~13.2cm (reszta na opis)

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 Width
              height: 16838, // A4 Height
              orientation: PageOrientation.PORTRAIT,
            },
            margin: {
              top: 800,
              bottom: 800,
              left: 800,
              right: 800,
            },
          },
        },
        children: [
          // Nagłówek raportu
          new Paragraph({
            text: `Czas pracy: ${monthName}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          // Dane pracownika
          new Paragraph({
            children: [
              new TextRun({ text: "Pracownik: ", bold: true, size: 24 }),
              new TextRun({ text: userName, size: 24 }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Wygenerowano: ", bold: true, size: 20 }),
              new TextRun({ text: new Date().toLocaleDateString('pl-PL'), size: 20 }),
            ],
            spacing: { after: 400 },
          }),

          // Tabela z danymi
          new Table({
            layout: TableLayoutType.FIXED, // Wymusza trzymanie się podanych szerokości
            width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
            rows: [
              // Nagłówek tabeli
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({ 
                    width: { size: colDateWidth, type: WidthType.DXA },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Data", bold: true, color: "FFFFFF", size: 22 })],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: { fill: "2e2e2e" },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({ 
                    width: { size: colActivityWidth, type: WidthType.DXA },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Projekt / Opis Zadania", bold: true, color: "FFFFFF", size: 22 })],
                      alignment: AlignmentType.LEFT
                    })],
                    shading: { fill: "2e2e2e" },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({ 
                    width: { size: colTimeWidth, type: WidthType.DXA },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Czas", bold: true, color: "FFFFFF", size: 22 })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "2e2e2e" },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                ],
              }),
              // Wiersze danych
              ...entries.map(entry => new TableRow({
                cantSplit: true, // Zapobiega rozdzielaniu wiersza między stronami
                children: [
                  new TableCell({ 
                    width: { size: colDateWidth, type: WidthType.DXA },
                    children: [new Paragraph({ 
                      text: entry.date, 
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 60, after: 60 }
                    })],
                    verticalAlign: VerticalAlign.TOP,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({ 
                    width: { size: colActivityWidth, type: WidthType.DXA },
                    children: [
                      // Projekt
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: entry.project.toUpperCase(), 
                            bold: true, 
                            size: 16, 
                            color: "4F46E5" 
                          }),
                        ],
                        spacing: { before: 60, after: 60 }
                      }),
                      // Opis
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: entry.description, 
                            size: 22 
                          }),
                        ],
                        spacing: { after: 120 }
                      })
                    ],
                    verticalAlign: VerticalAlign.TOP,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({ 
                    width: { size: colTimeWidth, type: WidthType.DXA },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: `${entry.durationHours.toFixed(2)}h`, size: 22 })],
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 60, after: 60 }
                    })],
                    verticalAlign: VerticalAlign.TOP,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                ],
              })),
              // Podsumowanie
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "SUMA:", bold: true, size: 24 })],
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 120, after: 120 }
                    })], 
                    columnSpan: 2,
                    shading: { fill: "E2E8F0" },
                    margins: { right: 200 }
                  }),
                  new TableCell({ 
                    width: { size: colTimeWidth, type: WidthType.DXA },
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: `${totalHours.toFixed(2)}h`, bold: true, size: 24 })],
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 120, after: 120 }
                    })],
                    shading: { fill: "E2E8F0" }
                  }),
                ],
              }),
            ],
          }),

          // Stopka / Podpisy
          new Paragraph({
            text: "",
            spacing: { before: 800 }
          }),
          new Table({
            width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
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
                    width: { size: PAGE_WIDTH_DXA / 2, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        text: "__________________________",
                        alignment: AlignmentType.CENTER
                      }),
                      new Paragraph({
                        text: "Podpis Pracownika",
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 100 }
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: PAGE_WIDTH_DXA / 2, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        text: "__________________________",
                        alignment: AlignmentType.CENTER
                      }),
                      new Paragraph({
                        text: "Zatwierdzenie (Podpis Przełożonego)",
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 100 }
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Raport_${userName.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, fileName);
};
