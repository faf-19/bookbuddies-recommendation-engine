
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-book-primary">404</h1>
        <p className="text-2xl text-muted-foreground mt-4 mb-8">
          Oops! We couldn't find the page you're looking for.
        </p>
        <Link 
          to="/"
          className="px-6 py-3 rounded-full bg-book-primary text-white font-medium transition-all duration-300 hover:bg-book-highlight"
        >
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
