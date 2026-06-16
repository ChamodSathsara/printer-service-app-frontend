import { Visit } from "./types";

function formatDateTime(visit: Visit) {
  return `${visit.visitDate} ${visit.visitTime}`;
}

function formatLocation(visit: Visit) {
  if (visit.latitude == null || visit.longitude == null) return "—";
  return `${visit.latitude.toFixed(5)}, ${visit.longitude.toFixed(5)}`;
}

const REPORT_HEADERS = [
  "Visit ID",
  "Technician Code",
  "Technician Name",
  "Visit Date",
  "Visit Time",
  "Machine Ref No",
  "Solution Category",
  "Notes",
  "Meter Reading",
  "Location",
];

function visitToRow(v: Visit): string[] {
  return [
    v.id,
    v.techCode,
    v.techName,
    v.visitDate,
    v.visitTime,
    v.machineRefNo,
    v.solutionCategory,
    v.note || "",
    v.meterReading != null ? String(v.meterReading) : "",
    formatLocation(v),
  ];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportVisitsToCSV(visits: Visit[], filename: string) {
  const rows = [REPORT_HEADERS, ...visits.map(visitToRow)];
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = `${cell}`.replace(/"/g, '""');
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(",")
    )
    .join("\r\n");

  // Prefix with BOM so Excel renders UTF-8 correctly
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export async function exportVisitsToPDF(
  visits: Visit[],
  filename: string,
  title: string,
  subtitle?: string
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.setTextColor(228, 0, 43);
  doc.text(title, 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(subtitle || `Generated on ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    head: [REPORT_HEADERS],
    body: visits.map(visitToRow),
    startY: 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [228, 0, 43], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 246, 248] },
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

export { formatDateTime, formatLocation };
