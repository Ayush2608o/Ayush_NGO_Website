import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const providedQr = fileURLToPath(new URL('../../QR_CODE.jpeg', import.meta.url));

export async function initializeLocalPaymentSettings(database, uploadRoot) {
  if (database.prepare('SELECT id FROM payment_settings LIMIT 1').get()) return false;

  try {
    await fs.access(providedQr);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }

  const publicUploads = path.join(uploadRoot, 'public');
  const qrPath = path.resolve(publicUploads, 'ayush-ngo-upi-qr.jpeg');
  await fs.mkdir(publicUploads, { recursive: true });
  await fs.copyFile(providedQr, qrPath);

  database.prepare(`
    INSERT INTO payment_settings
      (upi_id, qr_image_path, account_holder_name, instructions, updated_by)
    VALUES (?, ?, ?, ?, NULL)
  `).run(
    'ayushsk2041@oksbi',
    qrPath,
    'Ayush Raj',
    'Scan the QR code with a UPI app. Confirm the recipient is Ayush Raj before paying.'
  );

  return true;
}
