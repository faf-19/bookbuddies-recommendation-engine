
import { MongoClient, ObjectId, Document, WithId } from "mongodb";
import { Book, User, BookInteraction, BookRating, BookTimeSpent } from "../types";
import { mockBooks } from "../data/mockData";

// MongoDB connection string - this should be an environment variable in a real app
// Connect to your MongoDB instance - Replace with your actual MongoDB connection string
const MONGODB_URI = "mongodb://localhost:27017";
const DB_NAME = "BookComass";
const BOOKS_COLLECTION = "books";
const USERS_COLLECTION = "users";

// API endpoint for your server-side MongoDB connection
// In a real app, you should have a server that handles these requests
const API_ENDPOINT = "http://localhost:3001/api";

// Function to fetch data from the server API
const fetchFromApi = async (endpoint: string, options = {}) => {
  try {
    console.log(`Fetching from API: ${endpoint}`);
    const response = await fetch(`${API_ENDPOINT}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from API (${endpoint}):`, error);
    
    // If the server is unavailable, fall back to mock data
    console.warn("API server unavailable, using mock data instead");
    throw error;
  }
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

// Get user data
export const getUserData = async (): Promise<User> => {
  try {
    // First try to get data from API
    try {
      const userData = await fetchFromApi('users/current');
      return userData;
    } catch (error) {
      console.warn("Failed to get user from API, using localStorage instead:", error);
      return initializeUser();
    }
  } catch (error) {
    console.error("Failed to get user data:", error);
    // Fall back to localStorage if API fails
    return initializeUser();
  }
};

// Update user preferences
export const updateUserPreferences = async (genres: string[], authors: string[] = []): Promise<void> => {
  try {
    const user = await getUserData();
    user.preferences.genres = genres;
    user.preferences.authors = authors;
    
    // Try API first
    try {
      await fetchFromApi('users/preferences', {
        method: 'PUT',
        body: JSON.stringify({ genres, authors })
      });
    } catch (error) {
      console.warn("Failed to update user preferences via API, using localStorage instead:", error);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error("Failed to update user preferences:", error);
  }
};

// Record book view
export const recordBookView = async (bookId: string): Promise<void> => {
  try {
    // Try API first
    try {
      await fetchFromApi('interactions/view', {
        method: 'POST',
        body: JSON.stringify({ bookId })
      });
    } catch (error) {
      console.warn("Failed to record book view via API, using localStorage instead:", error);
      
      // Fall back to localStorage
      const user = await getUserData();
      const now = Date.now();
      
      const bookInteraction: BookInteraction = {
        bookId,
        timestamp: now
      };
      
      user.history.viewed.push(bookInteraction);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error("Failed to record book view:", error);
  }
};

// Record book rating
export const recordBookRating = async (bookId: string, rating: number): Promise<void> => {
  try {
    // Try API first
    try {
      await fetchFromApi('interactions/rate', {
        method: 'POST',
        body: JSON.stringify({ bookId, rating })
      });
    } catch (error) {
      console.warn("Failed to record book rating via API, using localStorage instead:", error);
      
      // Fall back to localStorage
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
    }
  } catch (error) {
    console.error("Failed to record book rating:", error);
  }
};

// Record time spent on book
export const recordTimeSpent = async (bookId: string, duration: number): Promise<void> => {
  try {
    // Try API first
    try {
      await fetchFromApi('interactions/time', {
        method: 'POST',
        body: JSON.stringify({ bookId, duration })
      });
    } catch (error) {
      console.warn("Failed to record time spent via API, using localStorage instead:", error);
      
      // Fall back to localStorage
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
    }
  } catch (error) {
    console.error("Failed to record time spent:", error);
  }
};

// Helper function to convert MongoDB document to Book type
const convertApiBookToBook = (apiBook: any): Book => {
  return {
    id: apiBook._id || apiBook.id,
    title: apiBook.title,
    author: apiBook.author,
    coverImage: apiBook.coverImage,
    description: apiBook.description,
    genres: apiBook.genres,
    rating: apiBook.rating,
    releaseDate: apiBook.releaseDate,
    pages: apiBook.pages
  };
};

// Get all books
export const getAllBooks = async (): Promise<Book[]> => {
  try {
    console.log("Attempting to get books from MongoDB API");
    const booksData = await fetchFromApi('books');
    console.log(`Received ${booksData.length} books from API`);
    return booksData.map(convertApiBookToBook);
  } catch (error) {
    console.error("Failed to get books from API, falling back to mock data:", error);
    console.log("Using mock data instead");
    return mockBooks;
  }
};

// Get a single book by ID
export const getBookById = async (id: string): Promise<Book | undefined> => {
  try {
    console.log(`Attempting to get book with ID ${id} from MongoDB API`);
    const bookData = await fetchFromApi(`books/${id}`);
    console.log("Book data received from API:", bookData);
    return convertApiBookToBook(bookData);
  } catch (error) {
    console.error(`Failed to get book ${id} from API, falling back to mock data:`, error);
    console.log("Looking for book in mock data instead");
    return mockBooks.find(book => book.id === id);
  }
};
