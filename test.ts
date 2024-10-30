
import { NCERTScraper } from './services/NCERTScraper';
import { PDFProcessingService } from './services/PDFProcessingService';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  try {
    // Initialize services
    const scraper = new NCERTScraper();
    const pdfService = new PDFProcessingService();

    // Fetch books
    console.log('Fetching NCERT books...');
    const books = await scraper.fetchBooks();
    console.log(`Found ${books.length} books`);

    // Process first book as test
    if (books.length > 0) {
      const book = books[0];
      console.log(`Processing book: ${book.title}`);

      // Download PDF
      const response = await axios.get(book.pdfUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // Process PDF
      const processedPages = await pdfService.processPDF(buffer);
      console.log(`Processed ${processedPages.length} pages`);

      // Save to database
      const savedBook = await prisma.book.create({
        data: {
          title: book.title,
          subject: book.subject,
          grade: parseInt(book.class),
          pdfUrl: book.pdfUrl,
          chapters: {
            create: processedPages.map((page, index) => ({
              title: page.metadata?.chapter || `Chapter ${index + 1}`,
              order: index,
              sections: {
                create: [{
                  title: 'Main Content',
                  order: 0,
                  content: {
                    create: [
                      {
                        type: 'text',
                        content: page.content.text,
                        order: 0
                      }
                    ]
                  }
                }]
              }
            }))
          }
        }
      });

      console.log('Saved book to database:', savedBook.id);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();