import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { StoreSettings } from "../settings";

export type ReceiptLine = {
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  discount: number;
  total: number;
};

export type ReceiptData = {
  store: StoreSettings;
  invoiceNumber: string;
  date: string;
  cashierName?: string;
  customerName: string;
  customerPhone?: string;
  lines: ReceiptLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  changeDue: number;
  paymentMethod: string;
};

export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 800;
  const left = 50;

  const draw = (text: string, size = 10, bold = false) => {
    page.drawText(text, {
      x: left,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= size + 6;
  };

  draw(data.store.store_name, 18, true);
  draw(data.store.store_address, 9);
  draw(`Tel: ${data.store.store_phone} | ${data.store.store_email}`, 9);
  y -= 8;
  draw(`Invoice: ${data.invoiceNumber}`, 11, true);
  draw(`Date: ${data.date}`, 10);
  if (data.cashierName) draw(`Cashier: ${data.cashierName}`, 10);
  draw(`Customer: ${data.customerName}${data.customerPhone ? ` (${data.customerPhone})` : ""}`, 10);
  y -= 8;
  draw("Item                    SKU        Qty   Price    Total", 9, true);
  y -= 4;

  for (const line of data.lines) {
    const row = `${line.name.slice(0, 22).padEnd(22)} ${line.sku.slice(0, 10).padEnd(10)} ${String(line.qty).padStart(3)}  ${line.unitPrice.toFixed(0).padStart(6)}  ${line.total.toFixed(0).padStart(8)}`;
    draw(row, 9);
  }

  y -= 8;
  draw(`Subtotal: ${data.subtotal.toFixed(2)}`, 10);
  if (data.discount > 0) draw(`Discount: -${data.discount.toFixed(2)}`, 10);
  draw(`Tax: ${data.tax.toFixed(2)}`, 10);
  draw(`Total: ${data.total.toFixed(2)}`, 12, true);
  draw(`Paid (${data.paymentMethod}): ${data.amountPaid.toFixed(2)}`, 10);
  if (data.changeDue > 0) draw(`Change: ${data.changeDue.toFixed(2)}`, 10);
  y -= 12;
  draw("Thank you for shopping with Shahzad Brands!", 11, true);

  return doc.save();
}
