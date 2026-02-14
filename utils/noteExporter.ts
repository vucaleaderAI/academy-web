import { Note } from '@/store/noteStore';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';
// html2pdf.js is not typed, so we might need to use require or ts-ignore if import fails, 
// or declare module. For now, let's try standard import and usage.
// If it fails, we will dynamically import or use window.

export const exportToTxt = (note: Note) => {
    const blob = new Blob([note.preview || ""], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${note.title || '제목없음'}.txt`);
};

export const exportToHtml = (note: Note) => {
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${note.title}</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>${note.title}</h1>
            ${note.content}
        </body>
        </html>
    `;
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${note.title || '제목없음'}.html`);
};

export const exportToPdf = async (note: Note) => {
    // Dynamic import to avoid SSR issues if any
    const html2pdf = (await import('html2pdf.js')).default;

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">${note.title}</h1>
            <div style="font-size: 14px; line-height: 1.6;">
                ${note.content}
            </div>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `${note.title || '제목없음'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(content).save();
};

export const exportToWord = async (note: Note) => {
    // Simple HTML to Docx is hard without a library that parses HTML.
    // 'docx' library requires building the document tree manually.
    // Parsing generic HTML to 'docx' nodes is complex.
    // For MVP, we can try to strip tags and just put text, OR use a simpler "HTML as .doc" hack (MIME type).
    // Let's use the HTML-as-Word hack for rich text preservation without complex parsing.

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
        "xmlns:w='urn:schemas-microsoft-com:office:word' " +
        "xmlns='http://www.w3.org/TR/REC-html40'>" +
        "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";

    const footer = "</body></html>";
    const sourceHTML = header + `<h1>${note.title}</h1>` + note.content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${note.title || '제목없음'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
};

export const exportToExcel = (note: Note) => {
    // Excel isn't great for free-text notes, but user asked for it.
    // We'll create a simple sheet with Title | Content (Text) | Created At
    const ws = XLSX.utils.json_to_sheet([
        {
            Title: note.title,
            Content: note.preview, // Use plain text preview
            CreatedAt: new Date(note.createdAt).toLocaleString(),
            UpdatedAt: new Date(note.updatedAt).toLocaleString()
        }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Note");
    XLSX.writeFile(wb, `${note.title || '제목없음'}.xlsx`);
};
