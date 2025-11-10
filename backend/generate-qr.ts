import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const generateTestQRCodes = async () => {
  try {
    // Create qr-codes directory
    const qrDir = path.join(__dirname, 'qr-codes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Generate Entry QR Code as PNG
    await QRCode.toFile(path.join(qrDir, 'entry-qr.png'), 'ENTRY_QR_CODE', {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 2,
    });

    // Generate Exit QR Code as PNG
    await QRCode.toFile(path.join(qrDir, 'exit-qr.png'), 'EXIT_QR_CODE', {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 2,
    });

    // Also generate as data URLs for web use
    const entryQR = await QRCode.toDataURL('ENTRY_QR_CODE');
    fs.writeFileSync(path.join(qrDir, 'entry-qr-dataurl.txt'), entryQR);

    const exitQR = await QRCode.toDataURL('EXIT_QR_CODE');
    fs.writeFileSync(path.join(qrDir, 'exit-qr-dataurl.txt'), exitQR);

    console.log('✅ QR codes generated successfully in qr-codes directory');
    console.log('📁 Files created:');
    console.log('   - entry-qr.png (Entry QR code image)');
    console.log('   - exit-qr.png (Exit QR code image)');
    console.log('   - entry-qr-dataurl.txt (Entry QR code data URL)');
    console.log('   - exit-qr-dataurl.txt (Exit QR code data URL)');
    console.log('');
    console.log('📱 Usage:');
    console.log('   1. Open entry-qr.png and exit-qr.png in an image viewer');
    console.log('   2. Display them on separate devices/screens at library entrance/exit');
    console.log('   3. Print them out and place them at library entrance/exit');
    console.log('   4. The data URL files can be used in HTML if needed');
    
  } catch (error) {
    console.error('❌ Error generating QR codes:', error);
  }
};

generateTestQRCodes();
