/**
 * Export Service
 * Handles exporting data to PDF and CSV formats
 */

import type { ShipmentAlert } from "../types/alert";
import type { Shipment } from "../types/shipment";

// CSV Export
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Simple PDF Export using HTML to PDF
export const exportAlertsToPDF = (alerts: ShipmentAlert[]): void => {
  const content = `
    <html>
      <head>
        <title>Shipment Alerts Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2A0800; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #2A0800; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .critical { color: #DC2626; font-weight: bold; }
          .high { color: #F97316; font-weight: bold; }
          .medium { color: #F59E0B; font-weight: bold; }
          .low { color: #10B981; font-weight: bold; }
          .footer { margin-top: 40px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Shipment Alerts Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Alerts: ${alerts.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Risk Tier</th>
              <th>Delay Probability</th>
              <th>Hours to SLA</th>
            </tr>
          </thead>
          <tbody>
            ${alerts
              .map(
                (alert) => `
              <tr>
                <td>${alert.shipment_id}</td>
                <td class="${alert.risk_tier.toLowerCase()}">${alert.risk_tier}</td>
                <td>${(alert.delay_probability * 100).toFixed(1)}%</td>
                <td>${alert.hours_to_sla}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Ship Risk AI - Intelligent Shipment Risk Management</p>
          <p>This report is confidential and for authorized use only.</p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([content], { type: "text/html;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `alerts-report-${new Date().toISOString().split("T")[0]}.html`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Fallback: Print to browser's PDF printer
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.print();
  }
};

// Export Utils
export const exportService = {
  exportAlertsAsCSV: (alerts: ShipmentAlert[]) => {
    const data = alerts.map((alert) => ({
      ShipmentID: alert.shipment_id,
      RiskTier: alert.risk_tier,
      DelayProbability: `${(alert.delay_probability * 100).toFixed(1)}%`,
      HoursToSLA: alert.hours_to_sla,
    }));
    exportToCSV(data, "shipment-alerts");
  },

  exportShipmentsAsCSV: (shipments: Shipment[]) => {
    const data = shipments.map((shipment) => ({
      ShipmentID: shipment.shipment_id,
      Origin: shipment.origin,
      Destination: shipment.destination,
      Carrier: shipment.carrier,
      Status: shipment.shipment_status,
      DelayProbability: `${(shipment.delay_probability * 100).toFixed(1)}%`,
      ETA: new Date(shipment.planned_eta).toLocaleString(),
    }));
    exportToCSV(data, "shipments-export");
  },

  exportAlertsToPDF,
};
