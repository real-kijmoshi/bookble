/**
 * Standardizes book data from different providers
 * @typedef {Object} BookCover
 * @property {string} small - Small cover image URL
 * @property {string} medium - Medium cover image URL
 * @property {string} large - Large cover image URL
 * 
 * @typedef {Object} BookAuthor
 * @property {string} name - Author name
 * @property {string} url - Author profile URL
 * 
 * @typedef {Object} StandardizedBookData
 * @property {BookCover} cover - Book cover images
 * @property {string} title - Book title
 * @property {string} description - Book description
 * @property {BookAuthor[]} authors - Book authors
 * @property {string} isbn - Book ISBN
 * @property {number} number_of_pages - Number of pages
 * @property {string} publish_date - Publication date
 */

const API_ENDPOINTS = {
  OPENLIBRARY: 'https://openlibrary.org/api/books.json',
  GOOGLEBOOKS: 'https://www.googleapis.com/books/v1/volumes',
  BOOKBLE: import.meta.env.VITE_API_BASE + '/books'
};

const DEFAULT_BOOK_DATA = {
  title: "Unknown Title",
  description: "No description available.",
  authors: [],
  number_of_pages: 0,
  publish_date: "Unknown Date",
  cover: { small: "", medium: "", large: "" }
};

/**
 * Fetches and standardizes book data from a provider
 * @param {Object} bookData - Input book data with provider and book ID
 * @returns {Promise<Object>} Standardized book data
 */
const fetchBook = async (bookData) => {
  try {
    const { provider, book } = bookData;
    let data = { ...DEFAULT_BOOK_DATA };

    switch (provider) {
      case "openlibrary.org":
        data = await fetchOpenLibraryBook(book);
        break;
      case "googlebooks.com":
        data = await fetchGoogleBook(book);
        break;
      case "bookble":
        data = await fetchBookbleBook(book);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return {
      ...bookData,
      isbn: book,
      bookData: {
        ...data,
      }
    };
  } catch (error) {
    console.error(`Error fetching book data: ${error.message}`);
    return { ...bookData, bookData: { ...DEFAULT_BOOK_DATA, isbn: bookData.book } };
  }
};

/**
 * Fetches book data from OpenLibrary
 * @param {string} isbn - Book ISBN
 * @returns {Promise<Object>} Standardized book data
 */
const fetchOpenLibraryBook = async (isbn) => {
  const response = await fetch(
    `${API_ENDPOINTS.OPENLIBRARY}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
  );
  
  if (!response.ok) {
    throw new Error(`OpenLibrary API error: ${response.status}`);
  }

  const fetchedData = (await response.json())[`ISBN:${isbn}`];
  if (!fetchedData) {
    return DEFAULT_BOOK_DATA;
  }

  return {
    title: fetchedData.title || DEFAULT_BOOK_DATA.title,
    description: fetchedData.description || DEFAULT_BOOK_DATA.description,
    authors: fetchedData.authors?.map((author) => ({
      name: author.name || "Unknown Author",
      url: author.url || `https://openlibrary.org/search?q=${encodeURIComponent(author.name || "")}`
    })) || DEFAULT_BOOK_DATA.authors,
    number_of_pages: parseInt(fetchedData.pagination) || DEFAULT_BOOK_DATA.number_of_pages,
    publish_date: fetchedData.publish_date || DEFAULT_BOOK_DATA.publish_date,
    cover: {
      small: fetchedData.cover?.small || DEFAULT_BOOK_DATA.cover.small,
      medium: fetchedData.cover?.medium || DEFAULT_BOOK_DATA.cover.medium,
      large: fetchedData.cover?.large || DEFAULT_BOOK_DATA.cover.large
    },
    isbn: isbn
  };
};

/**
 * Fetches book data from Google Books
 * @param {string} isbn - Book ISBN
 * @returns {Promise<Object>} Standardized book data
 */
const fetchGoogleBook = async (isbn) => {
  const response = await fetch(
    `${API_ENDPOINTS.GOOGLEBOOKS}?q=isbn:${isbn}`
  );

  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.status}`);
  }

  const responseJson = await response.json();
  if (responseJson.totalItems === 0) {
    return DEFAULT_BOOK_DATA;
  }

  const fetchedData = responseJson.items[0].volumeInfo;
  return {
    title: fetchedData.title || DEFAULT_BOOK_DATA.title,
    description: fetchedData.description || DEFAULT_BOOK_DATA.description,
    authors: fetchedData.authors?.map((author) => ({
      name: author,
      url: `https://www.google.com/search?q=${encodeURIComponent(author)}`
    })) || DEFAULT_BOOK_DATA.authors,
    number_of_pages: fetchedData.pageCount || DEFAULT_BOOK_DATA.number_of_pages,
    publish_date: fetchedData.publishedDate || DEFAULT_BOOK_DATA.publish_date,
    cover: {
      small: fetchedData.imageLinks?.smallThumbnail || DEFAULT_BOOK_DATA.cover.small,
      medium: fetchedData.imageLinks?.thumbnail || DEFAULT_BOOK_DATA.cover.medium,
      large: fetchedData.imageLinks?.large || DEFAULT_BOOK_DATA.cover.large
    },
    isbn: fetchedData.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier || isbn
  };
};

/**
 * Fetches book data from Bookble
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Standardized book data
 */
const fetchBookbleBook = async (bookId) => {
  const response = await fetch(
    `${API_ENDPOINTS.BOOKBLE}/${bookId}`
  );

  if (!response.ok) {
    throw new Error(`Bookble API error: ${response.status}`);
  }

  const {book: fetchedData} = await response.json();
  console.log(fetchedData);
  return {
    title: fetchedData.title || DEFAULT_BOOK_DATA.title,
    description: fetchedData.description || DEFAULT_BOOK_DATA.description,
    authors: [{
      name: fetchedData.author || "Unknown Author",
      url: `https://www.google.com/search?q=${encodeURIComponent(fetchedData.author ||
        "Unknown Author")}`
    }],
    number_of_pages: fetchedData.number_of_pages || DEFAULT_BOOK_DATA.number_of_pages,
    publish_date: fetchedData.publish_date || DEFAULT_BOOK_DATA.publish_date,
    cover: {
      small: fetchedData.cover?.small || DEFAULT_BOOK_DATA.cover.small,
      medium: fetchedData.cover?.medium || DEFAULT_BOOK_DATA.cover.medium,
      large: fetchedData.cover?.large || DEFAULT_BOOK_DATA.cover.large
    },
    isbn: fetchedData.isbn || bookId
  };
}

/**
 * Fetches multiple books data in parallel
 * @param {Array<Object>} books - Array of book data objects
 * @returns {Promise<Array<Object>>} Array of standardized book data
 */
const fetchBooks = (books) => {
  return Promise.all(books.map(fetchBook));
};

export default fetchBooks;
export { fetchBook };