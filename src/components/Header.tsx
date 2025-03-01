
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserData } from "../services/api";
import { motion } from "framer-motion";

const Header = () => {
  const [hasPreferences, setHasPreferences] = useState(false);
  
  useEffect(() => {
    const user = getUserData();
    setHasPreferences(user.preferences.genres.length > 0);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10"
    >
      <div className="container py-4 mx-auto flex items-center justify-between">
        <Link to="/">
          <h1 className="text-2xl font-bold">BookBuddies</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {hasPreferences && (
            <Link 
              to="/preferences" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              My Preferences
            </Link>
          )}
          
          <Link 
            to="/explore" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
