
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../services/api";
import { getRecommendedBooks } from "../services/recommendationEngine";
import { Book } from "../types";
import GenreSelector from "../components/GenreSelector";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookGrid from "../components/BookGrid";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getAllBooks } from "../services/api";

const Index = () => {
  const navigate = useNavigate();
  const [showPreferences, setShowPreferences] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserPreferences = async () => {
      try {
        setLoading(true);
        console.log("Checking user preferences");
        const user = await getUserData();
        console.log("User preferences:", user.preferences);
        
        // Check if user has preferences
        if (user.preferences.genres.length === 0) {
          console.log("User has no preferences, showing genre selector");
          setShowPreferences(true);
        } else {
          // User has preferences, load recommendations
          console.log("User has preferences, loading recommendations");
          loadRecommendations();
        }
      } catch (error) {
        console.error("Error checking user preferences:", error);
        setError("Failed to load user data. Please try again later.");
        toast.error("Failed to load user data. Using default recommendations instead.");
        // Load fallback books
        loadFallbackBooks();
      } finally {
        setLoading(false);
      }
    };
    
    checkUserPreferences();
  }, []);
  
  const loadRecommendations = async () => {
    try {
      setLoading(true);
      console.log("Loading recommendations");
      // Get personalized recommendations
      const recommendations = await getRecommendedBooks(8);
      console.log("Received recommendations:", recommendations.length);
      
      if (recommendations.length === 0) {
        // If no recommendations, fall back to random books
        console.log("No recommendations received, using fallback");
        await loadFallbackBooks();
      } else {
        setRecommendedBooks(recommendations);
        setError(null);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      setError("Failed to load recommendations. Using random books instead.");
      toast.error("Failed to load recommendations. Using random books instead.");
      await loadFallbackBooks();
    } finally {
      setLoading(false);
    }
  };
  
  const loadFallbackBooks = async () => {
    try {
      console.log("Loading fallback books");
      const allBooks = await getAllBooks();
      // Shuffle and take 8 random books
      const randomBooks = [...allBooks]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      console.log("Loaded fallback books:", randomBooks.length);
      setRecommendedBooks(randomBooks);
    } catch (err) {
      console.error("Error loading fallback books:", err);
      setRecommendedBooks([]);
    }
  };
  
  const handlePreferencesComplete = () => {
    setShowPreferences(false);
    loadRecommendations();
  };

  if (showPreferences) {
    return <GenreSelector onComplete={handlePreferencesComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Welcome to BookBuddies</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personalized book recommendation system that learns what you love
          </p>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-book-primary"></div>
          </div>
        ) : error && recommendedBooks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => loadRecommendations()}
              className="px-4 py-2 bg-book-primary text-white rounded-lg hover:bg-book-highlight"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <BookGrid 
              books={recommendedBooks}
              title="Recommended for You"
              subtitle="Based on your preferences and reading history"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => navigate("/explore")}
                className="px-6 py-3 rounded-full bg-book-primary text-white font-medium transition-all duration-300 hover:bg-book-highlight"
              >
                Explore More Books
              </button>
            </motion.div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
