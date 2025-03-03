
import { MongoClient, ObjectId, Document, WithId } from "mongodb";
import { Book, User, BookInteraction, BookRating, BookTimeSpent } from "../types";
import { mockBooks } from "../data/mockData";

// MongoDB connection string - in a real app, this would be in an environment variable
const MONGODB_URI = "mongodb://localhost:27017";
const DB_NAME = "BookComass";
const BOOKS_COLLECTION = "books";
const USERS_COLLECTION = "users";

// MongoDB client instance
let client: MongoClient | null = null;

// Since we're running in the browser where MongoDB can't connect directly,
// we'll use the mock data instead of trying to connect to a real MongoDB instance
const connectToMongoDB = async (): Promise<MongoClient | null> => {
  console.log("Using mock data instead of MongoDB connection");
  return null;
};

// Initialize database with mock data if collections are empty
const initializeDatabaseIfEmpty = async () => {
  // In browser environment, this is a no-op
  console.log("Mock initialization");
};

// Local storage fallback for user data
const LOCAL_STORAGE_KEY = "bookBuddyUser";

// Initialize user from localStorage or create new user
const initializeUser = (): User => {
  try {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
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
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
  return newUser;
};

// Helper function to convert MongoDB document to User type
const convertDocToUser = (doc: WithId<Document>): User => {
  return {
    id: doc._id.toString(),
    preferences: {
      genres: doc.preferences?.genres || [],
      authors: doc.preferences?.authors || []
    },
    history: {
      viewed: doc.history?.viewed || [],
      rated: doc.history?.rated || [],
      timeSpent: doc.history?.timeSpent || []
    }
  };
};

// Helper function to convert MongoDB document to Book type
const convertDocToBook = (doc: WithId<Document>): Book => {
  return {
    id: doc._id.toString(),
    title: doc.title,
    author: doc.author,
    coverImage: doc.coverImage,
    description: doc.description,
    genres: doc.genres,
    rating: doc.rating,
    releaseDate: doc.releaseDate,
    pages: doc.pages
  };
};

// Get user data
export const getUserData = async (): Promise<User> => {
  try {
    // Skip MongoDB connection attempt in browser and use localStorage directly
    return initializeUser();
  } catch (error) {
    console.error("Failed to get user data:", error);
    // Fall back to localStorage if MongoDB fails
    return initializeUser();
  }
};

// Update user preferences
export const updateUserPreferences = async (genres: string[], authors: string[] = []): Promise<void> => {
  try {
    // In browser environment, update localStorage directly
    const user = await getUserData();
    user.preferences.genres = genres;
    user.preferences.authors = authors;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to update user preferences:", error);
  }
};

// Record book view
export const recordBookView = async (bookId: string): Promise<void> => {
  try {
    const user = await getUserData();
    const now = Date.now();
    
    const bookInteraction: BookInteraction = {
      bookId,
      timestamp: now
    };
    
    user.history.viewed.push(bookInteraction);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to record book view:", error);
  }
};

// Record book rating
export const recordBookRating = async (bookId: string, rating: number): Promise<void> => {
  try {
    const user = await getUserData();
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
  } catch (error) {
    console.error("Failed to record book rating:", error);
  }
};

// Record time spent on book
export const recordTimeSpent = async (bookId: string, duration: number): Promise<void> => {
  try {
    const user = await getUserData();
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
  } catch (error) {
    console.error("Failed to record time spent:", error);
  }
};

// Get all books from MongoDB
export const getAllBooks = async (): Promise<Book[]> => {
  console.log("Getting all books from mock data");
  // Use mock data directly instead of trying to query MongoDB
  return mockBooks;
};

// Get a single book by ID
export const getBookById = async (id: string): Promise<Book | undefined> => {
  console.log("Getting book by ID from mock data:", id);
  // Use mock data directly
  return mockBooks.find(book => book.id === id);
};
