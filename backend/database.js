const db = require("better-sqlite3")("database.db");

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      isbn TEXT NOT NULL,
      read BOOLEAN NOT NULL,
      rating INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isbn TEXT NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        cover TEXT NOT NULL,
        description TEXT NOT NULL
      );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      review TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );
  `);
};

const getUser = (id) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (user) {
    delete user.password;
  }

  const collection = getCollectionsByUser(id);

  return { ...user, collection };
};

const getUserByEmail = (email) => {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
};

const getUserByName = (name) => {
  return db.prepare("SELECT * FROM users WHERE name = ?").get(name);
};

const createUser = (name, password, email) => {
  return db
    .prepare("INSERT INTO users (name, password, email) VALUES (?, ?, ?)")
    .run(name, password, email);
};

const updateUser = (id, name, password, email) => {
  return db
    .prepare("UPDATE users SET name = ?, password = ?, email = ? WHERE id = ?")
    .run(name, password, email, id);
};

const deleteUser = (id) => {
  return db.prepare("DELETE FROM users WHERE id = ?").run(id);
};

const getCollections = () => {
  return db.prepare("SELECT * FROM collections").all();
};

const getCollection = (id) => {
  return db.prepare("SELECT * FROM collections WHERE id = ?").get(id);
};

const getCollectionsByUser = (user_id) => {
  return db.prepare("SELECT * FROM collections WHERE user_id = ?").all(user_id);
};

const getCollectionByUserAndIsbn = (user_id, isbn) => {
  return db
    .prepare("SELECT * FROM collections WHERE user_id = ? AND isbn = ?")
    .get(user_id, isbn);
};

const updateCollection = (user_id, isbn, read, rating) => {
  return db
    .prepare(
      "UPDATE collections SET read = ?, rating = ? WHERE user_id = ? AND isbn = ?",
    )
    .run(read ? 1 : 0, rating, user_id, isbn);
};

const deleteCollection = (user_id, isbn) => {
  return db
    .prepare("DELETE FROM collections WHERE user_id = ? AND isbn = ?")
    .run(user_id, isbn);
};

const createCollection = (user_id, provider, isbn, read, rating) => {
  return db
    .prepare(
      "INSERT INTO collections (user_id, provider, isbn, read, rating) VALUES (?, ?, ?, ?, ?)",
    )
    .run(user_id, provider, isbn, read ? 1 : 0, rating);
};

const getBooks = () => {
  return db.prepare("SELECT * FROM books").all();
}

const getBook = (id) => {
  return db.prepare("SELECT * FROM books WHERE id = ?").get(id);
}

const getBooksByIsbn = (isbn) => {
  return db.prepare("SELECT * FROM books WHERE isbn = ?").all(isbn);
}


if (process.argv.includes("--init")) {
  createTables();
  const bcrypt = require("bcrypt");

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync("test", salt);
  createUser("test", hash, salt, "a@a.a");

  createCollection(1, "openlibrary.org", "9780547928241", true, 5); // The Hobbit
  createCollection(1, "openlibrary.org", "9780547928203", true, 4); // The Fellowship of the Ring
  createCollection(1, "openlibrary.org", "9780553382563", true, 4); // Heir to the Empire
  createCollection(1, "openlibrary.org", "9780345428547", false, null); // Dark Tide I: Onslaught
}

createTables();

module.exports = {
  createTables,
  getUser,
  getUserByEmail,
  getUserByName,
  createUser,
  updateUser,
  deleteUser,
  getCollections,
  getCollection,
  updateCollection,
  getCollectionsByUser,
  deleteCollection,
  getCollectionByUserAndIsbn,
  createCollection,

  getBooks,
  getBook,
  getBooksByIsbn
};
