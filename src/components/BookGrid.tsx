
import { useEffect, useState } from "react";
import { Book } from "../types";
import BookCard from "./BookCard";
import { motion } from "framer-motion";

interface BookGridProps {
  books: Book[];
  title?: string;
  subtitle?: string;
}

const BookGrid = ({ books, title, subtitle }: BookGridProps) => {
  // Track loading state for staggered animation
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="mb-12">
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold"
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
            }}
          >
            <BookCard 
              book={book} 
              priority={index < 4} // Load first 4 images eagerly
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default BookGrid;
