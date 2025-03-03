
import { useState, useEffect } from "react";
import { getAllBooks } from "../services/api";
import { getBooksByGenre } from "../services/recommendationEngine";
import { Book } from "../types";
import { genres } from "../data/mockData";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookGrid from "../components/BookGrid";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Explore = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBooks();
  }, [selectedGenre]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching books for Explore page");
      
      // Get books filtered by genre if one is selected
      let fetchedBooks: Book[];
      
      if (selectedGenre) {
        console.log(`Fetching books for genre: ${selectedGenre}`);
        fetchedBooks = await getBooksByGenre(selectedGenre);
      } else {
        console.log("Fetching all books");
        fetchedBooks = await getAllBooks();
      }
      
      console.log(`Successfully fetched ${fetchedBooks.length} books`);
      
      if (fetchedBooks.length === 0) {
        setError("No books found in the database. Please add books to see content.");
        toast.error("No books found in database");
      } else {
        setBooks(fetchedBooks);
      }
    } catch (error) {
      console.error("Error loading books:", error);
      setError("Failed to load books. Please try again later.");
      toast.error("Failed to connect to database. Check your connection.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenreClick = (genre: string) => {
    setSelectedGenre(currentGenre => currentGenre === genre ? null : genre);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter books by search query
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Explore Books</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover books by genre or search for your favorites
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-3 pl-10 rounded-full border border-input focus:outline-none focus:ring-2 focus:ring-book-highlight"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all duration-300",
                  selectedGenre === genre
                    ? "bg-book-highlight text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {genre}
              </button>
            ))}
          </div>
          
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => loadBooks()}
              className="px-4 py-2 bg-book-primary text-white rounded-lg hover:bg-book-highlight flex items-center gap-2"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              Refresh Books
            </button>
          </div>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-book-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => loadBooks()}
              className="px-4 py-2 bg-book-primary text-white rounded-lg hover:bg-book-highlight"
            >
              Try Again
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-amber-500 mb-4">
              {searchQuery 
                ? `No books found matching "${searchQuery}". Try a different search.` 
                : "No books found to display. Please check your database connection."}
            </p>
            <button
              onClick={() => loadBooks()}
              className="px-4 py-2 bg-book-primary text-white rounded-lg hover:bg-book-highlight"
            >
              Reload Books
            </button>
          </div>
        ) : (
          <BookGrid 
            books={filteredBooks}
            title={selectedGenre ? `${selectedGenre} Books` : "All Books"}
            subtitle={
              searchQuery 
                ? `Search results for "${searchQuery}"` 
                : `${filteredBooks.length} books available`
            }
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Explore;
