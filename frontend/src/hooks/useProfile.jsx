import { useState, useEffect } from "react";
import fetchBooks from "../utils/fetchBooks";

const API_URL = import.meta.env.VITE_API_BASE;


export default function useProfile() {
  // Safely parse initial state with default empty values
  const offlineProfileStorage = localStorage.getItem("profile");
  const initialProfile = offlineProfileStorage && offlineProfileStorage !== "undefined" 
    ? JSON.parse(offlineProfileStorage)
    : { collection: [] };

  const [profile, setProfile] = useState(initialProfile);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token provided");
      return;
    }

    setIsLoading(true);
    fetch(`${API_URL}/profile`, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(async (data) => {
        if (data.message) {
          throw new Error(data.message);
        }
        const books = await fetchBooks(data.user.collection);
        const updatedUser = {
          ...data.user,
          collection: books
        };
        setProfile(updatedUser);
        localStorage.setItem("profile", JSON.stringify(updatedUser));
      })
      .catch((err) => {
        setError(err.message);
        console.error("Profile fetch error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const addBookToCollection = async (book, provider) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token available");

      const response = await fetch(`${API_URL}/collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ isbn: book, provider }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // refresh page to get updated collection
      window.location.reload();

    } catch (err) {
      setError(err.message);
      console.error("Add book error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBookFromCollection = async (book) => {
    setIsLoading(true);
    console.log(book);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token available");

      const response = await fetch(`${API_URL}/collection/${book}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setProfile(prev => ({
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
  };

  const onRatingChange = async (book, rating) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token available");

      const response = await fetch(`${API_URL}/collection/${book}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setProfile(prev => ({
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
  };

  const onReadToggle = async (book) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token available");

      const currentBook = profile.collection.find(b => b.isbn === book);
      if (!currentBook) throw new Error("Book not found in collection");

      const response = await fetch(`${API_URL}/collection/${book}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ read: !currentBook.read }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setProfile(prev => ({
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
  };

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