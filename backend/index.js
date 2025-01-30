const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./database");
const bycrypt = require("bcrypt");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use((req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { id } = decoded;
      req.user = db.getUser(id);
      req.isAuthenticated = true;
    });
  } else {
    req.isAuthenticated = false;
  }

  next();
});

const protected = (req, res, next) => {
  if (req.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  const user = db.getUserByEmail(identifier) || db.getUserByName(identifier);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const collection = db.getCollectionsByUser(user.id);

  user.collection = collection;

  if (bycrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token, user: { ...user, password: undefined } });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  const user = db.getUserByEmail(email) || db.getUserByName(username);

  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hash = bycrypt.hashSync(password, 10);

  db.createUser(username, hash, email);

  const newUser = db.getUserByEmail(email);

  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const collection = db.getCollectionsByUser(newUser.id);

  newUser.collection = collection;

  res.json({
    message: "User created",
    token,
    user: { ...newUser, password: undefined },
  });
});

app.get("/profile", protected, (req, res) => {
  if (req.isAuthenticated) {
    console.log("user: ", req.user);
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.post("/collection", protected, (req, res) => {
  const { isbn, provider } = req.body;

  const collection = db.getCollectionByUserAndIsbn(req.user.id, isbn);

  if (collection) {
    return res.status(400).json({ message: "Book already in collection" });
  }

  db.createCollection(req.user.id, provider, isbn, false, 0);

  res.json({ message: "Collection updated" });
});

app.put("/collection/:isbn", protected, (req, res) => {
  const { isbn } = req.params;
  const { read, rating } = req.body;

  const collection = db.getCollectionByUserAndIsbn(req.user.id, isbn);

  if (!collection) {
    return res.status(404).json({ message: "Book not found in collection" });
  }

  console.log("updating collection");
  console.log("user id: ", req.user.id);
  console.log("isbn: ", isbn);
  console.log("read: ", collection.read, "new read: ", read);
  console.log("rating: ", collection.rating, "new rating: ", rating);

  if (read !== undefined) {
    collection.read = read;
  }

  if (rating !== undefined) {
    collection.rating = rating;
  }

  db.updateCollection(req.user.id, isbn, collection.read, collection.rating);

  res.json({ message: "Collection updated" });
});

app.delete("/collection/:isbn", protected, (req, res) => {
  const { isbn } = req.params;

  const collection = db.getCollectionByUserAndIsbn(req.user.id, isbn);

  if (!collection) {
    return res.status(404).json({ message: "Book not found in collection" });
  }

  db.deleteCollection(req.user.id, isbn);

  res.json({ message: "Collection updated" });
});

app.get("/search", (req, res) => {
  const {
    query,
    limit = 20,
    offset = 0,
    sort = "title",
    order = "asc",
  } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      error: "Search query must be at least 2 characters long",
    });
  }

  const allowedSortFields = ["title", "author", "published_date", "rating"];
  const sanitizedSort = allowedSortFields.includes(sort) ? sort : "title";
  const sanitizedOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  const searchQuery = `
    SELECT * FROM books 
    WHERE title LIKE ? 
    OR author LIKE ? 
    OR description LIKE ?
    OR isbn LIKE ?
    ORDER BY ${sanitizedSort} ${sanitizedOrder}
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total FROM books 
    WHERE title LIKE ? 
    OR author LIKE ? 
    OR description LIKE ?
    OR isbn LIKE ?
  `;

  const searchTerm = `%${query}%`;

  const books = db.db
    .prepare(searchQuery)
    .all(searchTerm, searchTerm, searchTerm, searchTerm, limit, offset);

  const { total } = db.db
    .prepare(countQuery)
    .get(searchTerm, searchTerm, searchTerm, searchTerm);

  const hasMore = offset + books.length < total;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  res.json({ books, total, hasMore, totalPages, currentPage });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
