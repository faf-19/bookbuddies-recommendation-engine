
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3001;

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'BookComass';
const BOOKS_COLLECTION = 'books';
const USERS_COLLECTION = 'users';
const INTERACTIONS_COLLECTION = 'interactions';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection function
async function connectToMongoDB() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(DB_NAME);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// API routes
app.get('/api/books', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const books = await db.collection(BOOKS_COLLECTION).find({}).toArray();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const book = await db.collection(BOOKS_COLLECTION).findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error(`Error fetching book ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

app.post('/api/interactions/view', async (req, res) => {
  try {
    const { bookId } = req.body;
    const db = await connectToMongoDB();
    
    await db.collection(INTERACTIONS_COLLECTION).insertOne({
      type: 'view',
      bookId: new ObjectId(bookId),
      timestamp: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording book view:', error);
    res.status(500).json({ error: 'Failed to record book view' });
  }
});

app.post('/api/interactions/rate', async (req, res) => {
  try {
    const { bookId, rating } = req.body;
    const db = await connectToMongoDB();
    
    await db.collection(INTERACTIONS_COLLECTION).insertOne({
      type: 'rating',
      bookId: new ObjectId(bookId),
      rating,
      timestamp: new Date()
    });
    
    // Update average rating for the book
    const ratings = await db.collection(INTERACTIONS_COLLECTION)
      .find({ type: 'rating', bookId: new ObjectId(bookId) })
      .toArray();
    
    if (ratings.length > 0) {
      const averageRating = ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
      
      await db.collection(BOOKS_COLLECTION).updateOne(
        { _id: new ObjectId(bookId) },
        { $set: { rating: averageRating } }
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording book rating:', error);
    res.status(500).json({ error: 'Failed to record book rating' });
  }
});

app.post('/api/interactions/time', async (req, res) => {
  try {
    const { bookId, duration } = req.body;
    const db = await connectToMongoDB();
    
    await db.collection(INTERACTIONS_COLLECTION).insertOne({
      type: 'timeSpent',
      bookId: new ObjectId(bookId),
      duration,
      timestamp: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording time spent:', error);
    res.status(500).json({ error: 'Failed to record time spent' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
