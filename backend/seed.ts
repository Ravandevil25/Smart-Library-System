import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Book } from './src/models';
import connectDB from './src/utils/database';

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Seeding database...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        name: 'John Doe',
        rollNo: 'STU001',
        email: 'john@college.edu',
        password: hashedPassword,
        role: 'student',
        totalHours: 0,
        borrowedCount: 0
      },
      {
        name: 'Jane Smith',
        rollNo: 'STU002',
        email: 'jane@college.edu',
        password: hashedPassword,
        role: 'student',
        totalHours: 0,
        borrowedCount: 0
      },
      {
        name: 'Admin User',
        rollNo: 'ADM001',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'admin',
        totalHours: 0,
        borrowedCount: 0
      },
      {
        name: 'Librarian User',
        rollNo: 'LIB001',
        email: 'librarian@college.edu',
        password: hashedPassword,
        role: 'librarian',
        totalHours: 0,
        borrowedCount: 0
      }
    ];

    await User.deleteMany({});
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create sample books
    const books = [
      {
        barcode: '9780134685991',
        title: 'Effective TypeScript',
        authors: ['Dan Vanderkam'],
        copiesTotal: 3,
        copiesAvailable: 3
      },
      {
        barcode: '9781492052204',
        title: 'Learning React',
        authors: ['Alex Banks', 'Eve Porcello'],
        copiesTotal: 2,
        copiesAvailable: 2
      },
      {
        barcode: '9780132350884',
        title: 'Clean Code',
        authors: ['Robert C. Martin'],
        copiesTotal: 4,
        copiesAvailable: 4
      },
      {
        barcode: '9780596007126',
        title: 'Head First Design Patterns',
        authors: ['Eric Freeman', 'Elisabeth Robson'],
        copiesTotal: 2,
        copiesAvailable: 2
      },
      {
        barcode: '9780135957059',
        title: 'The Pragmatic Programmer',
        authors: ['David Thomas', 'Andrew Hunt'],
        copiesTotal: 3,
        copiesAvailable: 3
      }
    ];

    await Book.deleteMany({});
    const createdBooks = await Book.insertMany(books);
    console.log(`✅ Created ${createdBooks.length} books`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('Sample login credentials:');
    console.log('Student: STU001 / password123');
    console.log('Student: STU002 / password123');
    console.log('Admin: ADM001 / password123');
    console.log('Librarian: LIB001 / password123');
    console.log('');
    console.log('Sample book barcodes for testing:');
    books.forEach(book => {
      console.log(`${book.barcode} - ${book.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
