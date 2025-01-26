import { useState, useEffect } from "react";
import fetchBooks, { fetchBook } from "../utils/fetchBooks";

const API_URL = import.meta.env.VITE_API_BASE;

export default function useProfile() {
  const offlineProfileStorage = localStorage.getItem("profile");
  const offlineProfile =
    offlineProfileStorage != "undefined" ? offlineProfileStorage : null;

  const [profile, setProfile] = useState(
    JSON.parse(offlineProfile ? offlineProfile : null),
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token provided");
      return;
    }

    fetch(`${API_URL}/profile`, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.message) {
          setError(data.message);
          console.error(data.message);
        } else {
          const books = await fetchBooks(data.user.collection);
          data.user.collection = books;
          setProfile(data.user);
          localStorage.setItem("profile", JSON.stringify(data.user));
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const addBookToCollection = (book, provider) => {
    return fetch(`${API_URL}/collection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ isbn: book, provider }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setProfile(async (prev) => ({
          ...prev,
          collection: [
            ...prev.collection,
            await fetchBook({ isbn: book, provider }),
          ],
        }));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onRatingChange = (book, rating) => {
    fetch(`${API_URL}/collection/${book}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ rating }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setProfile((prev) => ({
          ...prev,
          collection: prev.collection.map((b) =>
            b.isbn === book ? { ...b, rating } : b,
          ),
        }));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onReadToggle = (book) => {
    
    fetch(`${API_URL}/collection/${book}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ read: !profile.collection.find(b => b.isbn === book).read }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setProfile((prev) => ({
          ...prev,
          collection: prev.collection.map((b) =>
            b.isbn === book ? { ...b, read: !b.read } : b,
          ),
        }));
      })
      .catch((err) => {
        console.error(err);
      });
  };



  return { profile, addBookToCollection, onRatingChange, onReadToggle, error };
}
