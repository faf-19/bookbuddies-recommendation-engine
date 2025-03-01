
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookById, recordBookView, recordTimeSpent, recordBookRating } from "../services/api";
import { Book } from "../types";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { toast } from "sonner";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewStartTime, setViewStartTime] = useState<number>(Date.now());
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const loadBook = () => {
      setLoading(true);
      const foundBook = getBookById(id);
      
      if (foundBook) {
        setBook(foundBook);
        recordBookView(id);
        setViewStartTime(Date.now());
      } else {
        navigate("/not-found");
      }
      
      setLoading(false);
    };

    loadBook();

    // Clean up on unmount
    return () => {
      // Record time spent when leaving
      if (id && viewStartTime) {
        const timeSpent = Date.now() - viewStartTime;
        recordTimeSpent(id, timeSpent);
      }
    };
  }, [id, navigate]);

  const handleRateBook = (rating: number) => {
    if (!book) return;
    
    setUserRating(rating);
    recordBookRating(book.id, rating);
    toast.success("Thanks for rating this book!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-book-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            Back
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-4"
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-8"
            >
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 font-medium">{book.rating.toFixed(1)}</span>
                </div>
                
                <span className="mx-3 text-muted-foreground">•</span>
                
                <span className="text-muted-foreground">{book.pages} pages</span>
                
                <span className="mx-3 text-muted-foreground">•</span>
                
                <span className="text-muted-foreground">
                  Published {new Date(book.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {book.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Rate this book</h2>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRateBook(rating)}
                      className="p-2 focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          (userRating && rating <= userRating) || (!userRating && rating <= book.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookDetail;
