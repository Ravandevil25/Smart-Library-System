import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Sample books from seed.ts
const books = [
  {
    barcode: '9780134685991',
    title: 'Effective TypeScript',
  },
  {
    barcode: '9781492052204',
    title: 'Learning React',
  },
  {
    barcode: '9780132350884',
    title: 'Clean Code',
  },
  {
    barcode: '9780596007126',
    title: 'Head First Design Patterns',
  },
  {
    barcode: '9780135957059',
    title: 'The Pragmatic Programmer',
  }
];

const generateBarcodes = async () => {
  try {
    // Create barcodes directory
    const barcodeDir = path.join(__dirname, 'barcodes');
    if (!fs.existsSync(barcodeDir)) {
      fs.mkdirSync(barcodeDir, { recursive: true });
    }

    console.log('📚 Generating barcode images for sample books...\n');

    for (const book of books) {
      // Create canvas
      const canvas = createCanvas(400, 200);
      
      // Generate barcode - Use CODE128 format which accepts any string
      // This works for ISBN numbers and other barcode formats
      try {
        JsBarcode(canvas, book.barcode, {
          format: 'CODE128', // CODE128 works with any alphanumeric string
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 20,
          textMargin: 10,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000'
        });
      } catch (err) {
        // If CODE128 fails, try EAN13 (for valid ISBN-13)
        console.warn(`⚠️  CODE128 failed for ${book.barcode}, trying EAN13...`);
        try {
          JsBarcode(canvas, book.barcode, {
            format: 'EAN13',
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 20,
            textMargin: 10,
            margin: 10
          });
        } catch (eanErr) {
          // If both fail, create a text-based barcode representation
          console.error(`❌ Failed to generate barcode for ${book.barcode}: ${eanErr}`);
          throw eanErr;
        }
      }

      // Save as PNG
      const buffer = canvas.toBuffer('image/png');
      const filename = `${book.barcode}_${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      const filepath = path.join(barcodeDir, filename);
      
      fs.writeFileSync(filepath, buffer);
      console.log(`✅ Generated: ${filename}`);
      console.log(`   Barcode: ${book.barcode}`);
      console.log(`   Book: ${book.title}\n`);
    }

    // Create a summary text file
    const summaryPath = path.join(barcodeDir, 'BARCODES_LIST.txt');
    const summary = `Sample Book Barcodes for Testing
=====================================

${books.map((book, index) => 
  `${index + 1}. ${book.title}
   Barcode: ${book.barcode}
   File: ${book.barcode}_${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.png
`
).join('\n')}

📱 How to Use:
1. Open the PNG files on a phone/tablet screen
2. Or print them out
3. Scan with the barcode scanner in the Borrow Books section
4. You can also manually enter the barcode numbers above

💡 Tip: Make sure to seed the database first with:
   npm run seed
`;

    fs.writeFileSync(summaryPath, summary);

    console.log('✅ Barcode images generated successfully!');
    console.log(`📁 Location: ${barcodeDir}`);
    console.log(`📄 Summary saved to: BARCODES_LIST.txt\n`);
    console.log('📱 Next Steps:');
    console.log('   1. Open the PNG files on your phone/tablet or print them');
    console.log('   2. Scan them using the barcode scanner in the Borrow page');
    console.log('   3. Or manually enter the barcode numbers in the manual entry field');
    console.log('\n💡 Make sure you\'ve seeded the database first: npm run seed');
    
  } catch (error) {
    console.error('❌ Error generating barcodes:', error);
  }
};

generateBarcodes();

