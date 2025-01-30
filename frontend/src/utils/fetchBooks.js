/*
  Produce standardized book data from different book providers.

  - cover: {
      small: string,
      medium: string,
      large: string,
    }

  - title: string
  - description: string
  - authors: [{ name: string, url: string }]
  - isbn: string
  - number_of_pages: number
  - publish_date: string
*/

const fetchBook = async (bookData) => {
  let data = {};

  if (bookData.provider === "openlibrary.org") {
    const res = await fetch(
      `https://openlibrary.org/api/books.json?bibkeys=ISBN:${bookData.isbn}&format=json&jscmd=data`,
    );
    const fetchedData = (await res.json())[`ISBN:${bookData.isbn}`];

    if (!fetchedData) return { ...bookData, bookData: data };

    data.title = fetchedData.title || "Unknown Title";
    data.description = fetchedData.description || "No description available.";
    data.authors = fetchedData.authors?.map((author) => ({
      name: author.name || "Unknown Author",
      url: author.url || `https://openlibrary.org/search?q=${encodeURIComponent(author.name || "")}`,
    })) || [];
    data.isbn = bookData.isbn;
    data.number_of_pages = parseInt(fetchedData.pagination) || 0;
    data.publish_date = fetchedData.publish_date || "Unknown Date";
    data.cover = {
      small: fetchedData.cover?.small || "",
      medium: fetchedData.cover?.medium || "",
      large: fetchedData.cover?.large || "",
    };
  } else if (bookData.provider === "googlebooks.com") {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookData.isbn}`,
    );
    const responseJson = await res.json();

    if (responseJson.totalItems === 0) {
      return { ...bookData, bookData: data };
    }

    const fetchedData = responseJson.items[0].volumeInfo;

    data.title = fetchedData.title || "Unknown Title";
    data.description = fetchedData.description || "No description available.";
    data.authors = fetchedData.authors?.map((author) => ({
      name: author,
      url: `https://www.google.com/search?q=${encodeURIComponent(author)}`,
    })) || [];
    data.isbn = bookData.isbn;
    data.number_of_pages = fetchedData.pageCount || 0;
    data.publish_date = fetchedData.publishedDate || "Unknown Date";
    data.cover = {
      small: fetchedData.imageLinks?.smallThumbnail || "",
      medium: fetchedData.imageLinks?.thumbnail || "",
      large: fetchedData.imageLinks?.large || "",
    };
  }

  return { ...bookData, bookData: data };
};

const fetchBooks = (books) => {
  return Promise.all(books.map(fetchBook));
};

export default fetchBooks;
export { fetchBook };
