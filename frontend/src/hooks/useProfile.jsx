import { useState, useEffect, useCallback } from "react";
import fetchBooks from "../utils/fetchBooks";

const API_URL = import.meta.env.VITE_API_BASE;

const STORAGE_KEY = "profile";

export default function useProfile() {
  // Helper function to safely get profile from localStorage
  const getStoredProfile = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
      return stored && stored !== "undefined" ? JSON.parse(stored) : { collection: [] };
    } catch (e) {
      console.error("Error parsing stored profile:", e);
      return { collection: [] };
    }
  };

  const [profile, setProfile] = useState(getStoredProfile);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to update profile state and localStorage
  const updateProfile = useCallback((newProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
  }, []);

  // Helper for API calls
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token available");

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, []);

  // Fetch initial profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await makeAuthenticatedRequest(`${API_URL}/profile`);
        
        if (data.message) {
          throw new Error(data.message);
        }

        const books = await fetchBooks(data.user.collection);
        const updatedUser = {
          ...data.user,
          collection: books,
        };
        
        updateProfile(updatedUser);
      } catch (err) {
        setError(err.message);
        console.error("Profile fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [makeAuthenticatedRequest, updateProfile]);

  const addBookToCollection = useCallback(async (book, provider) => {
    setIsLoading(true);
    try {
      const data = await makeAuthenticatedRequest(`${API_URL}/collection`, {
        method: "POST",
        body: JSON.stringify({ isbn: book, provider }),
      });

      if (data.error) throw new Error(data.error);
      
      // Instead of page reload, fetch updated book data
      const updatedBook = await fetchBooks([book]);
      updateProfile(prev => ({
        ...prev,
        collection: [...prev.collection, ...updatedBook],
      }));

      return data;
    } catch (err) {
      setError(err.message);
      console.error("Add book error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest, updateProfile]);

  const deleteBookFromCollection = useCallback(async (book) => {
    setIsLoading(true);
    try {
      const data = await makeAuthenticatedRequest(`${API_URL}/collection/${book}`, {
        method: "DELETE",
      });

      updateProfile(prev => ({
        ...prev,
        collection: prev.collection.filter(b => b.isbn !== book),
      }));

      return data;
    } catch (err) {
      setError(err.message);
      console.error("Delete book error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest, updateProfile]);

  const onRatingChange = useCallback(async (book, rating) => {
    setIsLoading(true);
    try {
      const data = await makeAuthenticatedRequest(`${API_URL}/collection/${book}`, {
        method: "PUT",
        body: JSON.stringify({ rating }),
      });

      updateProfile(prev => ({
        ...prev,
        collection: prev.collection.map(b =>
          b.isbn === book ? { ...b, rating } : b
        ),
      }));

      return data;
    } catch (err) {
      setError(err.message);
      console.error("Rating change error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest, updateProfile]);

  const onReadToggle = useCallback(async (book) => {
    setIsLoading(true);
    try {
      const currentBook = profile.collection.find(b => b.isbn === book);
      if (!currentBook) throw new Error("Book not found in collection");

      const data = await makeAuthenticatedRequest(`${API_URL}/collection/${book}`, {
        method: "PUT",
        body: JSON.stringify({ read: !currentBook.read }),
      });

      updateProfile(prev => ({
        ...prev,
        collection: prev.collection.map(b =>
          b.isbn === book ? { ...b, read: !b.read } : b
        ),
      }));

      return data;
    } catch (err) {
      setError(err.message);
      console.error("Read toggle error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest, updateProfile, profile.collection]);

  return {
    profile,
    error,
    isLoading,
    addBookToCollection,
    deleteBookFromCollection,
    onRatingChange,
    onReadToggle,
  };
}