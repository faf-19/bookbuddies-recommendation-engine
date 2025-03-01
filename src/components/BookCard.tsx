
import { useState, useEffect, useRef } from "react";
import { Book } from "../types";
import { recordBookView, recordTimeSpent } from "../services/api";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  className?: string;
  priority?: boolean;
}

const BookCard = ({ book, className, priority = false }: BookCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Record view when component mounts
  useEffect(() => {
    recordBookView(book.id);
  }, [book.id]);

  // Track time spent viewing this book
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Book card came into view
          if (entry.isIntersecting) {
            setViewStartTime(Date.now());
          } 
          // Book card went out of view
          else if (viewStartTime !== null) {
            const timeSpent = Date.now() - viewStartTime;
            if (timeSpent > 500) { // Only record if user spent over 500ms
              recordTimeSpent(book.id, timeSpent);
            }
            setViewStartTime(null);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of card is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }

      // Record time spent if component unmounts while still being viewed
      if (viewStartTime !== null) {
        const timeSpent = Date.now() - viewStartTime;
        if (timeSpent > 500) {
          recordTimeSpent(book.id, timeSpent);
        }
      }
    };
  }, [book.id, viewStartTime]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "book-card group cursor-pointer h-full flex flex-col bg-white dark:bg-card",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={book.coverImage}
          alt={book.title}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "book-card-image object-cover h-[280px] w-full transition-all duration-500",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg line-clamp-1 mb-1">{book.title}</h3>
        <p className="text-muted-foreground text-sm mb-2">{book.author}</p>
        
        <div className="flex items-center mt-auto">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-medium">{book.rating.toFixed(1)}</span>
          </div>
          <div className="flex ml-auto space-x-1">
            {book.genres.slice(0, 1).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-secondary text-xs rounded-full text-muted-foreground"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
