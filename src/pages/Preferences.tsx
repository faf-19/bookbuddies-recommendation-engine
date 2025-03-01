
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { genres } from "../data/mockData";
import { getUserData, updateUserPreferences } from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Preferences = () => {
  const navigate = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load user's current preferences
    const user = getUserData();
    setSelectedGenres(user.preferences.genres);
  }, []);

  const handleGenreClick = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedGenres.length === 0) {
      toast.error("Please select at least one genre");
      return;
    }

    setIsLoading(true);
    // Update preferences
    updateUserPreferences(selectedGenres);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Your preferences have been updated");
      navigate("/");
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Your Reading Preferences</h1>
            <p className="text-muted-foreground">
              Update your genre preferences to get better recommendations
            </p>
          </div>
          
          <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Select your favorite genres</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {genres.map((genre) => (
                <motion.button
                  key={genre}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGenreClick(genre)}
                  className={cn(
                    "py-2 px-4 rounded-lg border transition-all duration-300",
                    selectedGenres.includes(genre)
                      ? "bg-book-highlight text-white border-book-highlight"
                      : "bg-white text-book-primary border-gray-200 hover:border-book-highlight"
                  )}
                >
                  {genre}
                </motion.button>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              {selectedGenres.length === 0 
                ? "Select at least one genre to continue" 
                : `You've selected ${selectedGenres.length} ${
                    selectedGenres.length === 1 ? "genre" : "genres"
                  }`}
            </p>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 rounded-full border border-book-primary text-book-primary transition-all duration-300 hover:bg-book-primary hover:text-white"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={selectedGenres.length === 0 || isLoading}
                className={cn(
                  "px-6 py-2 rounded-full bg-book-primary text-white transition-all duration-300",
                  selectedGenres.length === 0 || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-book-highlight"
                )}
              >
                {isLoading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Preferences;
