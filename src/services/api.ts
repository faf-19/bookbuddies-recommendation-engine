
import { MongoClient, ObjectId, Document, WithId } from "mongodb";
import { Book, User, BookInteraction, BookRating, BookTimeSpent } from "../types";
import { mockBooks } from "../data/mockData";

// MongoDB connection string - in a real app, this would be in an environment variable
const MONGODB_URI = "mongodb://localhost:27017";
const DB_NAME = "bookBuddyDB";
const BOOKS_COLLECTION = "books";
const USERS_COLLECTION = "users";

// MongoDB client instance
let client: MongoClient | null = null;

// Initialize MongoDB connection
const connectToMongoDB = async (): Promise<MongoClient> => {
  if (client) return client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");
    
    // Initialize the database with mock data if it's empty
    await initializeDatabaseIfEmpty();
    
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Fallback to mock data if connection fails
    throw error;
  }
};

// Initialize database with mock data if collections are empty
const initializeDatabaseIfEmpty = async () => {
  if (!client) return;
  
  const db = client.db(DB_NAME);
  
  // Check if books collection is empty
  const booksCount = await db.collection(BOOKS_COLLECTION).countDocuments();
  if (booksCount === 0) {
    // Insert mock books
    await db.collection(BOOKS_COLLECTION).insertMany(mockBooks);
    console.log("Initialized books collection with mock data");
  }
};

// Handle MongoDB connection errors by falling back to localStorage
const handleMongoError = (error: any) => {
  console.error("MongoDB operation failed:", error);
  console.log("Falling back to localStorage");
  return null;
};

// Local storage fallback for when MongoDB is unavailable
const LOCAL_STORAGE_KEY = "bookBuddyUser";

// Initialize user from localStorage or create new user
const initializeUser = (): User => {
  const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  
  // Create new user
  const newUser: User = {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    preferences: {
      genres: [],
      authors: []
    },
    history: {
      viewed: [],
      rated: [],
      timeSpent: []
    }
  };
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
};

// Get user data
export const getUserData = async (): Promise<User> => {
  try {
    const client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    
    // For simplicity, we're getting the first user
    // In a real app, you'd use authentication to identify the current user
    const user = await db.collection(USERS_COLLECTION).findOne({});
    
    if (user) {
      // Convert MongoDB document to User type
      return {
        id: user._id.toString(),
        preferences: {
          genres: user.preferences?.genres || [],
          authors: user.preferences?.authors || []
        },
        history: {
          viewed: user.history?.viewed || [],
          rated: user.history?.rated || [],
          timeSpent: user.history?.timeSpent || []
        }
      };
    } else {
      // No user found, create a new one
      const newUser = initializeUser();
      await db.collection(USERS_COLLECTION).insertOne(newUser);
      return newUser;
    }
  } catch (error) {
    // Fall back to localStorage if MongoDB fails
    return initializeUser();
  }
};

// Update user preferences
export const updateUserPreferences = async (genres: string[], authors: string[] = []): Promise<void> => {
  try {
    const client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    const user = await getUserData();
    
    await db.collection(USERS_COLLECTION).updateOne(
      { _id: user.id },
      { $set: {
        "preferences.genres": genres,
        "preferences.authors": authors
      }}
    );
  } catch (error) {
    // Fall back to localStorage if MongoDB fails
    const user = initializeUser();
    user.preferences.genres = genres;
    user.preferences.authors = authors;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  }
};

// Record book view
export const recordBookView = async (bookId: string): Promise<void> => {
  try {
    const client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    const user = await getUserData();
    const now = Date.now();
    
    await db.collection(USERS_COLLECTION).updateOne(
      { _id: user.id },
      { $push: {
        "history.viewed": {
          bookId,
          timestamp: now
        } as BookInteraction
      }}
    );
  } catch (error) {
    // Fall back to localStorage if MongoDB fails
    const user = initializeUser();
    const now = Date.now();
    
    user.history.viewed.push({
      bookId,
      timestamp: now
    });
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  }
};

// Record book rating
export const recordBookRating = async (bookId: string, rating: number): Promise<void> => {
  try {
    const client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    const user = await getUserData();
    const now = Date.now();
    
    // First, check if the book was already rated
    const existingRating = user.history.rated.find(r => r.bookId === bookId);
    
    if (existingRating) {
      // Update existing rating
      await db.collection(USERS_COLLECTION).updateOne(
        { _id: user.id, "history.rated.bookId": bookId },
        { $set: {
          "history.rated.$.rating": rating,
          "history.rated.$.timestamp": now
        }}
      );
    } else {
      // Add new rating
      await db.collection(USERS_COLLECTION).updateOne(
        { _id: user.id },
        { $push: {
          "history.rated": {
            bookId,
            rating,
            timestamp: now
          } as BookRating
        }}
      );
    }
  } catch (error) {
    // Fall back to localStorage if MongoDB fails
    const user = initializeUser();
    const now = Date.now();
    
    // Check if book was already rated and update if so
    const existingRatingIndex = user.history.rated.findIndex(r => r.bookId === bookId);
    
    if (existingRatingIndex >= 0) {
      user.history.rated[existingRatingIndex] = {
        bookId,
        rating,
        timestamp: now
      };
    } else {
      user.history.rated.push({
        bookId,
        rating,
        timestamp: now
      });
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  }
};

// Record time spent on book
export const recordTimeSpent = async (bookId: string, duration: number): Promise<void> => {
  try {
    const client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    const user = await getUserData();
    const now = Date.now();
    
    // Check if we already have a record for this book
    const existingTimeSpent = user.history.timeSpent.find(t => t.bookId === bookId);
    
    if (existingTimeSpent) {
      // Update existing time spent
      await db.collection(USERS_COLLECTION).updateOne(
        { _id: user.id, "history.timeSpent.bookId": bookId },
        { $inc: { "history.timeSpent.$.duration": duration },
          $set: { "history.timeSpent.$.timestamp": now }
        }
      );
    } else {
      // Add new time spent record
      await db.collection(USERS_COLLECTION).updateOne(
        { _id: user.id },
        { $push: {
          "history.timeSpent": {
            bookId,
            duration,
            timestamp: now
          } as BookTimeSpent
        }}
      );
    }
  } catch (error) {
    // Fall back to localStorage if MongoDB fails
    const user = initializeUser();
    const now = Date.now();
    
    // Check if we already have a record for this book and update
    const existingTimeIndex = user.history.timeSpent.findIndex(t => t.bookId === bookId);
    
    if (existingTimeIndex >= 0) {
      user.history.timeSpent[existingTimeIndex].duration += duration;
      user.history.timeSpent[existingTimeIndex].timestamp = now;
    } else {
      user.history.timeSpent.push({
        bookId,
        duration,
        timestamp: now
      });
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  }
};

// Get all books from MongoDB
export const getAllBooks = async (): Promise<Book[]> => {
  try {
    const client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    
    const books = await db.collection(BOOKS_COLLECTION).find({}).toArray();
    // Convert MongoDB documents to Book types
    return books.map(book => ({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      description: book.description,
      genres: book.genres,
      rating: book.rating,
      releaseDate: book.releaseDate,
      pages: book.pages
    })) as Book[];
  } catch (error) {
    console.error("Error fetching books from MongoDB:", error);
    // Fallback to mock data
    return mockBooks;
  }
};

// Get a single book by ID
export const getBookById = async (id: string): Promise<Book | undefined> => {
  try {
    const client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    
    const book = await db.collection(BOOKS_COLLECTION).findOne({ _id: id });
    if (!book) return undefined;
    
    // Convert MongoDB document to Book type
    return {
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      description: book.description,
      genres: book.genres,
      rating: book.rating,
      releaseDate: book.releaseDate,
      pages: book.pages
    } as Book;
  } catch (error) {
    console.error("Error fetching book from MongoDB:", error);
    // Fallback to mock data
    return mockBooks.find(book => book.id === id);
  }
};
