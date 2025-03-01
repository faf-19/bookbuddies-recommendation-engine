
import { useState, useEffect } from "react";
import { genres } from "../data/mockData";
import { updateUserPreferences, getUserData } from "../services/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GenreSelectorProps {
  onComplete: () => void;
}

const GenreSelector = ({ onComplete }: GenreSelectorProps) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load any existing preferences
    const user = getUserData();
    if (user.preferences.genres.length > 0) {
      setSelectedGenres(user.preferences.genres);
    }
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
      return;
    }

    setIsSubmitting(true);
    updateUserPreferences(selectedGenres);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 800);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-4"
        >
          Welcome to BookBuddies
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-muted-foreground"
        >
          Select your favorite genres to help us recommend books you'll love
        </motion.p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {genres.map((genre) => (
          <motion.div 
            key={genre} 
            variants={item}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => handleGenreClick(genre)}
              className={cn(
                "w-full py-3 px-4 rounded-xl border transition-all duration-300",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-book-highlight",
                selectedGenres.includes(genre)
                  ? "bg-book-highlight text-white border-book-highlight"
                  : "bg-white text-book-primary border-gray-200"
              )}
            >
              {genre}
            </button>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-12 text-center"
      >
        <button
          onClick={handleSubmit}
          disabled={selectedGenres.length === 0 || isSubmitting}
          className={cn(
            "px-8 py-3 rounded-full bg-book-primary text-white font-medium",
            "transition-all duration-300 focus:outline-none focus:ring-2",
            "focus:ring-book-highlight focus:ring-offset-2",
            selectedGenres.length === 0 || isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-book-highlight"
          )}
        >
          {isSubmitting ? "Personalizing..." : "Continue"}
        </button>
        <p className="mt-4 text-muted-foreground text-sm">
          {selectedGenres.length > 0
            ? `You've selected ${selectedGenres.length} ${
                selectedGenres.length === 1 ? "genre" : "genres"
              }`
            : "Select at least one genre to continue"}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default GenreSelector;
