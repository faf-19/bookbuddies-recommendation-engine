
import { Book, User, RecommendationScore } from "../types";
import { getAllBooks, getUserData } from "./api";

// Weights for different types of interactions
const WEIGHTS = {
  PREFERRED_GENRE: 5,
  VIEWED: 1,
  TIME_SPENT: 0.1, // per minute
  RATING: 2, // per star
  RECENCY: 0.1, // per day (recent interactions get higher scores)
};

// Calculate the recency factor (higher for more recent interactions)
const calculateRecencyFactor = (timestamp: number): number => {
  const daysAgo = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  return Math.max(1, 10 - daysAgo * WEIGHTS.RECENCY);
};

// Main recommendation algorithm
export const getRecommendedBooks = async (limit: number = 10): Promise<Book[]> => {
  try {
    const user = await getUserData();
    const allBooks = await getAllBooks();
    const scores: RecommendationScore[] = [];
    
    // If user has no preferences yet, return random books
    if (user.preferences.genres.length === 0 && 
        user.history.viewed.length === 0 && 
        user.history.rated.length === 0) {
      const shuffled = [...allBooks].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    }
    
    // Calculate score for each book
    allBooks.forEach(book => {
      let score = 0;
      
      // Score based on preferred genres
      const genreMatches = book.genres.filter(genre => 
        user.preferences.genres.includes(genre)
      ).length;
      score += genreMatches * WEIGHTS.PREFERRED_GENRE;
      
      // Score based on view history
      const views = user.history.viewed.filter(view => view.bookId === book.id);
      views.forEach(view => {
        score += WEIGHTS.VIEWED * calculateRecencyFactor(view.timestamp);
      });
      
      // Score based on time spent
      const timeSpent = user.history.timeSpent.find(time => time.bookId === book.id);
      if (timeSpent) {
        // Convert ms to minutes for calculation
        const minutesSpent = timeSpent.duration / (1000 * 60);
        score += minutesSpent * WEIGHTS.TIME_SPENT * calculateRecencyFactor(timeSpent.timestamp);
      }
      
      // Score based on ratings
      const rating = user.history.rated.find(rated => rated.bookId === book.id);
      if (rating) {
        score += rating.rating * WEIGHTS.RATING * calculateRecencyFactor(rating.timestamp);
      }
      
      // Avoid recommending books the user has already rated highly
      if (rating && rating.rating > 4) {
        score = score * 0.5; // Reduce score to avoid re-recommending
      }
      
      scores.push({
        bookId: book.id,
        score
      });
    });
    
    // Sort by score and get top books
    const topScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // Map scores back to book objects
    return topScores.map(score => 
      allBooks.find(book => book.id === score.bookId)!
    );
  } catch (error) {
    console.error("Error getting recommended books:", error);
    // Return empty array if there's an error
    return [];
  }
};

// Get books filtered by genre
export const getBooksByGenre = async (genre: string): Promise<Book[]> => {
  const allBooks = await getAllBooks();
  return allBooks.filter(book => book.genres.includes(genre));
};
