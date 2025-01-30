
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchBooks from "../utils/fetchBooks";

const API_URL = import.meta.env.VITE_API_BASE;
const STORAGE_KEY = "profile";

const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not signed in");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("Unauthorized: Invalid token");
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default function useProfile() {
  const queryClient = useQueryClient();
  
  const { data: profile, error, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const data = await makeAuthenticatedRequest(`${API_URL}/profile`);
        const books = await fetchBooks(data.user.collection);
        return { ...data.user, collection: books };
      } catch (err) {
        console.error("Profile fetch error:", err);
        throw err;
      }
    },
    initialData: () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      try {
        return stored && stored !== "undefined" ? JSON.parse(stored) : { collection: [] };
      } catch (e) {
        console.error("Error parsing stored profile:", e);
        return { collection: [] };
      }
    },
    onSuccess: (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)),
    onError: (err) => {
      console.error("Error fetching profile:", err.message);
    },
  });

  const addBookMutation = useMutation({
    mutationFn: async ({ book, provider }) => {
      return makeAuthenticatedRequest(`${API_URL}/collection`, {
        method: "POST",
        body: JSON.stringify({ isbn: book, provider }),
      });
    },
    onSuccess: async (_, { book }) => {
      const updatedBook = await fetchBooks([book]);
      queryClient.setQueryData(["profile"], (prev) => ({
        ...prev,
        collection: [...prev.collection, ...updatedBook],
      }));
    },
    onError: (err) => {
      console.error("Add book error:", err.message);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (book) => {
      return makeAuthenticatedRequest(`${API_URL}/collection/${book}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, book) => {
      queryClient.setQueryData(["profile"], (prev) => ({
        ...prev,
        collection: prev.collection.filter((b) => b.isbn !== book),
      }));
    },
    onError: (err) => {
      console.error("Delete book error:", err.message);
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({ book, updates }) => {
      return makeAuthenticatedRequest(`${API_URL}/collection/${book}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (_, { book, updates }) => {
      queryClient.setQueryData(["profile"], (prev) => ({
        ...prev,
        collection: prev.collection.map((b) => (b.isbn === book ? { ...b, ...updates } : b)),
      }));
    },
    onError: (err) => {
      console.error("Update book error:", err.message);
    },
  });

  return {
    profile,
    error,
    isLoading,
    addBookToCollection: (book, provider) => addBookMutation.mutateAsync({ book, provider }),
    deleteBookFromCollection: (book) => deleteBookMutation.mutateAsync(book),
    onRatingChange: (book, rating) => updateBookMutation.mutateAsync({ book, updates: { rating } }),
    onReadToggle: (book) => {
      const currentBook = profile?.collection.find((b) => b.isbn === book);
      if (!currentBook) throw new Error("Book not found in collection");
      return updateBookMutation.mutateAsync({ book, updates: { read: !currentBook.read } });
    },
  };
}
