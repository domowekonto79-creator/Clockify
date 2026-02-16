// This service file has been temporarily disabled to simplify the application and resolve build errors.
/*
import { ProcessedEntry } from "../types";

export const copyToClipboardForGoogleDocs = async (
  userName: string, 
  monthName: string, 
  entries: ProcessedEntry[]
) => {
  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);
  const now = new Date();
  const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
  const yearNum = now.getFullYear().toString();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; font-size: 10pt; color: #000000; padding: 20px;">
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
          <td style="width: 60%; vertical-align: middle;">
            <div style="font-weight: bold; font-size: 11pt;">Pracownicze Towarzystwo Emerytalne</div>
          </td>
          <td style="width: 40%; text-align: right; vertical-align: top; font-size: 9pt;">
            Załącznik do Umowy o świadczenie usług
          </td>
        </tr>
      </table>
      
      <h2 style="font-size: 16pt; margin-bottom: 25px; text-align: center; font-weight: bold;">
        Zestawienie czynności wykonanych w miesiącu ${monthNum}/${yearNum}
      </h2>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
        <thead>
          <tr>
            <th style="background-color: #ED7D31; color: #ffffff; border: 1px solid #000; padding: 8px; text-align: center; width: 12%;">Data</th>
            <th style="background-color: #ED7D31; color: #ffffff; border: 1px solid #000; padding: 8px; text-align: left; width: 78%;">Opis</th>
            <th style="background-color: #BDD7EE; border: 1px solid #000; padding: 8px; text-align: center; width: 10%;">Godziny</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(e => {
            const dateParts = e.date.split('.');
            const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : e.date;
            return `
              <tr>
                <td style="border: 1px solid #000; padding: 6px; vertical-align: top; text-align: center; width: 12%;">${formattedDate}</td>
                <td style="border: 1px solid #000; padding: 6px; vertical-align: top; width: 78%;">${e.description}</td>
                <td style="border: 1px solid #000; background-color: #BDD7EE; padding: 6px; vertical-align: top; text-align: center; width: 10%;">${e.durationHours.toFixed(0)}</td>
              </tr>
            `;
          }).join('')}
          <tr style="font-weight: bold;">
            <td colspan="2" style="border: 1px solid #000; padding: 8px; text-align: left;">Suma:</td>
            <td style="border: 1px solid #000; background-color: #BDD7EE; padding: 8px; text-align: center;">${totalHours.toFixed(0)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 50px;">
        <div style="margin-bottom: 5px;">${userName}</div>
        <div style="margin-bottom: 5px;">___________________________________________</div>
        <div style="font-size: 9pt;">Podpis Kontrahenta</div>
      </div>

      <div style="margin-top: 40px;">
        <div style="margin-bottom: 5px;">___________________________________________</div>
        <div style="font-size: 9pt;">Podpis osoby akceptującej zestawienie w imieniu PTE</div>
      </div>

      <div style="margin-top: 60px; text-align: right; font-size: 8pt; color: #333;">
        Strona 1 z 1<br>B2B
      </div>

    </body>
    </html>
  `;

  const blobHtml = new Blob([htmlContent], { type: "text/html" });
  const blobText = new Blob([entries.map(e => `${e.date} | ${e.description} | ${e.durationHours}`).join('\n')], { type: "text/plain" });

  try {
    const data = [new ClipboardItem({ 
      "text/html": blobHtml,
      "text/plain": blobText 
    })];
    await navigator.clipboard.write(data);
  } catch (err) {
    throw new Error("Błąd schowka.");
  }
};
*/