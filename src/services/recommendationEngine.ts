
import { Book, User, RecommendationScore } from "../types";
import { getAllBooks, getUserData } from "./api";
import * as tf from "@tensorflow/tfjs";

// Weights for different types of interactions (traditional approach)
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

// Bi-LSTM model for recommendations
class BiLSTMRecommender {
  private model: tf.LayersModel | null = null;
  private vocabSize: number = 1000; // Size of the vocabulary
  private embeddingDim: number = 50; // Embedding dimension
  private initialized: boolean = false;
  private encoderMap: Map<string, number> = new Map(); // For encoding book IDs
  private genreMap: Map<string, number> = new Map(); // For encoding genres

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      console.log("Initializing Bi-LSTM model");
      // Create the Bi-LSTM model
      const model = tf.sequential();
      
      // Input layer
      model.add(tf.layers.embedding({
        inputDim: this.vocabSize,
        outputDim: this.embeddingDim,
        inputLength: 5, // Sequence length (history size)
      }));
      
      // Bi-LSTM layer
      model.add(tf.layers.bidirectional({
        layer: tf.layers.lstm({
          units: 32,
          returnSequences: true,
        }),
        mergeMode: 'concat'
      }));
      
      // Another Bi-LSTM layer
      model.add(tf.layers.bidirectional({
        layer: tf.layers.lstm({
          units: 32,
          returnSequences: false,
        }),
        mergeMode: 'concat'
      }));
      
      // Dense output layer
      model.add(tf.layers.dense({
        units: this.vocabSize,
        activation: 'softmax'
      }));
      
      // Compile the model
      model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });
      
      this.model = model;
      console.log("Bi-LSTM model initialized");
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing Bi-LSTM model:", error);
    }
  }

  // Prepare data for the model
  private async prepareData(user: User, allBooks: Book[]) {
    try {
      console.log("Preparing data for Bi-LSTM model");
      // Create mappings for encoding
      allBooks.forEach((book, index) => {
        this.encoderMap.set(book.id, index);
      });
      
      const allGenres = Array.from(new Set(allBooks.flatMap(book => book.genres)));
      allGenres.forEach((genre, index) => {
        this.genreMap.set(genre, index);
      });

      // Create training data from user history
      const userHistory = [...user.history.viewed, ...user.history.rated]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20); // Take most recent 20 interactions
      
      if (userHistory.length < 5) {
        console.log("Not enough user history for Bi-LSTM model");
        return null;
      }

      // Prepare sequences
      const sequences = [];
      const targets = [];
      
      for (let i = 0; i < userHistory.length - 5; i++) {
        const sequence = userHistory.slice(i, i + 5).map(item => this.encoderMap.get(item.bookId) || 0);
        const target = this.encoderMap.get(userHistory[i + 5]?.bookId) || 0;
        
        sequences.push(sequence);
        targets.push(target);
      }
      
      if (sequences.length === 0) {
        console.log("No sequences could be generated");
        return null;
      }

      // Convert to tensors
      const xTensor = tf.tensor2d(sequences, [sequences.length, 5], 'int32');
      const yTensor = tf.oneHot(tf.tensor1d(targets, 'int32'), this.vocabSize);
      
      return { xTensor, yTensor };
    } catch (error) {
      console.error("Error preparing data:", error);
      return null;
    }
  }

  // Train the model with user data
  public async train(user: User, allBooks: Book[]) {
    if (!this.initialized || !this.model) {
      await this.initializeModel();
    }
    
    try {
      console.log("Training Bi-LSTM model");
      const data = await this.prepareData(user, allBooks);
      if (!data) {
        console.log("No training data available");
        return false;
      }
      
      const { xTensor, yTensor } = data;
      
      // Train the model
      await this.model?.fit(xTensor, yTensor, {
        epochs: 10,
        batchSize: 32,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`);
          }
        }
      });
      
      // Clean up tensors
      xTensor.dispose();
      yTensor.dispose();
      
      console.log("Bi-LSTM model trained successfully");
      return true;
    } catch (error) {
      console.error("Error training Bi-LSTM model:", error);
      return false;
    }
  }

  // Generate recommendations
  public async getRecommendations(user: User, allBooks: Book[], limit: number): Promise<RecommendationScore[]> {
    if (!this.initialized || !this.model) {
      console.log("Model not initialized, using fallback");
      return [];
    }
    
    try {
      console.log("Generating recommendations with Bi-LSTM model");
      // Get user's recent interactions as input sequence
      const recentInteractions = [...user.history.viewed, ...user.history.rated]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
      
      if (recentInteractions.length < 5) {
        console.log("Not enough recent interactions for prediction");
        return [];
      }
      
      // Convert to input tensor
      const inputSequence = recentInteractions.map(item => this.encoderMap.get(item.bookId) || 0);
      const inputTensor = tf.tensor2d([inputSequence], [1, 5], 'int32');
      
      // Generate predictions
      const predictions = this.model.predict(inputTensor) as tf.Tensor;
      const predictionData = await predictions.data();
      
      // Convert predictions to scores
      const scores: RecommendationScore[] = [];
      
      for (let i = 0; i < predictionData.length; i++) {
        // Skip books that are in the recent interactions
        const bookId = Array.from(this.encoderMap.entries())
          .find(([_, val]) => val === i)?.[0];
          
        if (bookId && !recentInteractions.some(item => item.bookId === bookId)) {
          scores.push({
            bookId,
            score: predictionData[i]
          });
        }
      }
      
      // Clean up tensors
      inputTensor.dispose();
      predictions.dispose();
      
      return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("Error generating recommendations with Bi-LSTM:", error);
      return [];
    }
  }
}

// Create singleton instance
const biLSTMRecommender = new BiLSTMRecommender();

// Main recommendation algorithm
export const getRecommendedBooks = async (limit: number = 10): Promise<Book[]> => {
  try {
    console.log("Getting recommended books, limit:", limit);
    const user = await getUserData();
    const allBooks = await getAllBooks();
    
    // Try to use the Bi-LSTM model first
    try {
      // Train the model if we have enough data
      if (user.history.viewed.length > 5 || user.history.rated.length > 5) {
        console.log("Training Bi-LSTM model with user data");
        await biLSTMRecommender.train(user, allBooks);
      }
      
      // Get recommendations from the model
      const modelScores = await biLSTMRecommender.getRecommendations(user, allBooks, limit);
      
      // If we got valid recommendations, use them
      if (modelScores.length > 0) {
        console.log("Using Bi-LSTM recommendations");
        const recommendedBooks = modelScores.map(score => 
          allBooks.find(book => book.id === score.bookId)
        ).filter(book => book !== undefined) as Book[];
        console.log("Recommendations from Bi-LSTM model:", recommendedBooks.length);
        return recommendedBooks;
      }
    } catch (error) {
      console.error("Error using Bi-LSTM model, falling back to traditional approach:", error);
    }
    
    // Fallback to traditional approach if ML model fails or lacks data
    console.log("Using traditional recommendation approach");
    const scores: RecommendationScore[] = [];
    
    // If user has no preferences yet, return random books
    if (user.preferences.genres.length === 0 && 
        user.history.viewed.length === 0 && 
        user.history.rated.length === 0) {
      console.log("User has no history, returning random books");
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
    const recommendedBooks = topScores.map(score => 
      allBooks.find(book => book.id === score.bookId)
    ).filter(book => book !== undefined) as Book[];
    
    console.log("Recommendations from traditional approach:", recommendedBooks.length);
    return recommendedBooks;
  } catch (error) {
    console.error("Error getting recommended books:", error);
    // Return random books if there's an error
    const allBooks = await getAllBooks();
    const shuffled = [...allBooks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }
};

// Get books filtered by genre
export const getBooksByGenre = async (genre: string): Promise<Book[]> => {
  const allBooks = await getAllBooks();
  return allBooks.filter(book => book.genres.includes(genre));
};
