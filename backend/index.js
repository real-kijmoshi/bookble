const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./database");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
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

  if(!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (bycrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.json({ token, user });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/profile", protected, (req, res) => {
  if (req.isAuthenticated) {
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

  if(read !== undefined) {
    collection.read = read;
  }

  if(rating !== undefined) {
    collection.rating = rating;
  }

  db.updateCollection(req.user.id, isbn, collection.read, collection.rating);

  res.json({ message: "Collection updated" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
