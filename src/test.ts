import pdf from 'pdf-parse';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

async function getPDFFromUrl(url: string, label: string) {
  try {
    console.log(`Fetching ${label}...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.buffer();
    const data = await pdf(buffer);

    console.log(`\n=== ${label} ===`);
    console.log('Number of pages:', data.numpages);
    console.log('First 500 characters of text:', data.text.substring(0, 500));
    console.log('------------------------\n');

    if (data.text) {
      await savePDFText(data.text, label);
    }

    return data.text;
  } catch (error) {
    console.error(`Error parsing ${label}:`, error.message);
    return null;
  }
}

async function savePDFText(text: string, label: string) {
  try {
    const filename = `${label.toLowerCase().replace(/\s+/g, '-')}.txt`;
    await writeFile(filename, text);
    console.log(`Saved ${filename}`);
  } catch (error) {
    console.error(`Error saving ${label}:`, error);
  }
}

async function processAllPDFs() {
  const pdfs = [
    {
      url: 'https://ncert.nic.in/textbook/pdf/lemh1dd.pdf',
      label: 'NCERT Mathematics',
    },
    {
      url: 'https://ncert.nic.in/textbook/pdf/lesc1dd.pdf',
      label: 'NCERT Science',
    },
    {
      url: 'https://ncert.nic.in/textbook/pdf/lefl1dd.pdf',
      label: 'NCERT English',
    },
    {
      url: 'https://www.ck12.org/book/ck-12-basic-physics-second-edition/r1/section/1.1/',
      label: 'CK-12 Physics',
    },
  ];

  // Process PDFs with a small delay between each request to be polite to servers
  for (const pdf of pdfs) {
    await getPDFFromUrl(pdf.url, pdf.label);
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Run the processor
processAllPDFs()
  .then(() => {
    console.log('Finished processing all PDFs');
  })
  .catch(error => {
    console.error('Main process error:', error);
  });
