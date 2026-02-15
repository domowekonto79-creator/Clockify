
import { ProcessedEntry } from "../types";

export const copyToClipboardForGoogleDocs = async (
  userName: string, 
  monthName: string, 
  entries: ProcessedEntry[]
) => {
  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);
  const now = new Date().toLocaleDateString('pl-PL');

  // Style wzorowane na domyślnym wyglądzie Google Docs (Arial, kolory)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Raport ${monthName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000;">
      
      <h1 style="font-size: 20pt; color: #000000; text-align: center; margin-bottom: 24px;">Czas pracy: ${monthName}</h1>
      
      <p style="margin-bottom: 0;"><strong>Pracownik:</strong> ${userName}</p>
      <p style="margin-top: 0; margin-bottom: 24px;"><strong>Data wygenerowania:</strong> ${now}</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
        <thead>
          <tr style="background-color: #f3f3f3;">
            <th style="border: 1px solid #dadce0; padding: 10px; text-align: center; width: 15%; font-weight: bold;">Data</th>
            <th style="border: 1px solid #dadce0; padding: 10px; text-align: left; width: 70%; font-weight: bold;">Czynność (Projekt / Opis)</th>
            <th style="border: 1px solid #dadce0; padding: 10px; text-align: right; width: 15%; font-weight: bold;">Czas</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(e => `
            <tr>
              <td style="border: 1px solid #dadce0; padding: 8px; text-align: center; vertical-align: top;">
                ${e.date}
              </td>
              <td style="border: 1px solid #dadce0; padding: 8px; vertical-align: top;">
                <div style="color: #1a73e8; font-weight: bold; font-size: 10pt; margin-bottom: 4px;">${e.project.toUpperCase()}</div>
                <div style="color: #3c4043;">${e.description}</div>
              </td>
              <td style="border: 1px solid #dadce0; padding: 8px; text-align: right; vertical-align: top; white-space: nowrap;">
                ${e.durationHours.toFixed(2)}h
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #f8f9fa;">
            <td colspan="2" style="border: 1px solid #dadce0; padding: 12px; text-align: right; font-weight: bold; font-size: 12pt;">
              SUMA CAŁKOWITA:
            </td>
            <td style="border: 1px solid #dadce0; padding: 12px; text-align: right; font-weight: bold; font-size: 12pt;">
              ${totalHours.toFixed(2)}h
            </td>
          </tr>
        </tfoot>
      </table>

      <br><br><br>

      <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 40px;">
        <tr>
          <td style="width: 50%; padding: 20px; text-align: center; vertical-align: top;">
            <div style="border-top: 1px solid #000; display: inline-block; width: 200px; padding-top: 10px;">
              Podpis pracownika
            </div>
          </td>
          <td style="width: 50%; padding: 20px; text-align: center; vertical-align: top;">
            <div style="border-top: 1px solid #000; display: inline-block; width: 200px; padding-top: 10px;">
              Zatwierdził
            </div>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  // Utworzenie Blobów dla schowka
  // text/html jest kluczowe dla zachowania formatowania w Google Docs
  const blobHtml = new Blob([htmlContent], { type: "text/html" });
  const blobText = new Blob([entries.map(e => `${e.date} - ${e.project}: ${e.description} (${e.durationHours}h)`).join('\n')], { type: "text/plain" });

  try {
    const data = [new ClipboardItem({ 
      "text/html": blobHtml,
      "text/plain": blobText 
    })];
    await navigator.clipboard.write(data);
  } catch (err) {
    console.error("Clipboard write failed", err);
    throw new Error("Nie udało się skopiować do schowka. Twoja przeglądarka może tego nie obsługiwać.");
  }
};
