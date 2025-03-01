
export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  genres: string[];
  rating: number;
  releaseDate: string;
  pages: number;
}

export interface User {
  id: string;
  preferences: {
    genres: string[];
    authors: string[];
  };
  history: {
    viewed: BookInteraction[];
    rated: BookRating[];
    timeSpent: BookTimeSpent[];
  };
}

export interface BookInteraction {
  bookId: string;
  timestamp: number;
  duration?: number;
}

export interface BookRating {
  bookId: string;
  rating: number;
  timestamp: number;
}

export interface BookTimeSpent {
  bookId: string;
  duration: number;
  timestamp: number;
}

export interface RecommendationScore {
  bookId: string;
  score: number;
}
