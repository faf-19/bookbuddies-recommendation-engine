
import { Book, User, BookInteraction, BookRating, BookTimeSpent } from "../types";
import { mockBooks } from "../data/mockData";

// Simulating MongoDB interactions - these would be replaced with actual MongoDB calls in production
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
export const getUserData = (): User => {
  return initializeUser();
};

// Update user preferences
export const updateUserPreferences = (genres: string[], authors: string[] = []): void => {
  const user = getUserData();
  user.preferences.genres = genres;
  user.preferences.authors = authors;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
};

// Record book view
export const recordBookView = (bookId: string): void => {
  const user = getUserData();
  const now = Date.now();
  
  user.history.viewed.push({
    bookId,
    timestamp: now
  });
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
};

// Record book rating
export const recordBookRating = (bookId: string, rating: number): void => {
  const user = getUserData();
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
};

// Record time spent on book
export const recordTimeSpent = (bookId: string, duration: number): void => {
  const user = getUserData();
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
};

// Get all books (would be a MongoDB query in production)
export const getAllBooks = (): Book[] => {
  return mockBooks;
};

// Get a single book by ID
export const getBookById = (id: string): Book | undefined => {
  return mockBooks.find(book => book.id === id);
};
