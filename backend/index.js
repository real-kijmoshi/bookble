const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Book, Collection, Review, initDatabase } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      req.isAuthenticated = false;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error();

    const collections = await Collection.find({ user: user._id });
    req.isAuthenticated = true;
    req.user = { ...user.toObject(), password: undefined, collection: collections};

    next();
  } catch (error) {
    req.isAuthenticated = false;
    next();
  }
};

const protected = (req, res, next) => {
  if (req.isAuthenticated) return next();
  res.status(401).json({ message: 'Unauthorized' });
};

app.use(auth);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { name: identifier }]
    });


    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const collection = await Collection.find({ user: user._id });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({ 
      token, 
      user: { ...user.toObject(), password: undefined, collection } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({
      $or: [{ email }, { name: username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name: username, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      message: 'User created',
      token,
      user: { ...user.toObject(), password: undefined, collection: [] }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/profile', protected, (req, res) => {
  res.json({ user: req.user });
});

app.post('/collection', protected, async (req, res) => {
  try {
    const { isbn, provider } = req.body;
    const existingCollection = await Collection.findOne({
      user: req.user._id,
      book: isbn
    });

    if (existingCollection) {
      return res.status(400).json({ message: 'Book already in collection' });
    }

    await Collection.create({
      user: req.user._id,
      book: isbn,
      provider,
      read: false,
      rating: 0
    });

    res.json({ message: 'Collection updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/collection/:isbn', protected, async (req, res) => {
  try {
    const { isbn } = req.params;
    const { read, rating } = req.body;
    
    const collection = await Collection.findOneAndUpdate(
      { user: req.user._id, book: isbn },
      { ...(read !== undefined && { read }), ...(rating !== undefined && { rating }) },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ message: 'Book not found in collection' });
    }

    res.json({ message: 'Collection updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/collection/:isbn', protected, async (req, res) => {
  try {
    const result = await Collection.findOneAndDelete({
      user: req.user._id,
      book: req.params.isbn
    });

    if (!result) {
      return res.status(404).json({ message: 'Book not found in collection' });
    }

    res.json({ message: 'Collection updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/search', async (req, res) => {
  try {
    const {
      query,
      limit = 20,
      offset = 0,
      sort = 'title',
      order = 'asc'
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const filter = {
      $or: [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
        { isbn: searchRegex }
      ]
    };

    const [books, total] = await Promise.all([
      Book.find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(Number(offset))
        .limit(Number(limit)),
      Book.countDocuments(filter)
    ]);

    res.json({
      books,
      total,
      hasMore: offset + books.length < total,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/books', protected, async (req, res) => {
  try {
    const {title, author, cover, description, isbn } = req.body;
    //check if user didn't add max number of books (env.MAX_BOOKS or 10)
    const userBooks = await Collection.find({ user: req.user._id });
    if(!title || !author || !cover || !description || !isbn) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (userBooks.length >= (process.env.MAX_BOOKS || 10)) {
      return res.status(400).json({ message: 'Max number of books reached' });
    }

    const book = await Book.create({ title, author, cover, description, isbn });

    res.json({ message: 'Book created', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.error(error);
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});