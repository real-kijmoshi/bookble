/*
  Produce standarized book data from different book providers.

  - cover: {
      small: string,
      medium: string,
      large: string,
    }

  - title: string
  - description: string
  - author: string
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
    const featchedData = (await res.json())[`ISBN:${bookData.isbn}`];

    data.title = featchedData.title;
    data.description = featchedData.description;
    data.authors = featchedData.authors;
    data.isbn = featchedData.isbn;
    data.number_of_pages = featchedData.pagination;
    data.publish_date = featchedData.publish_date;
    data.cover = {
      small: featchedData.cover?.small,
      medium: featchedData.cover?.medium,
      large: featchedData.cover?.large,
    };
  } else if (bookData.provider === "googlebooks.com") {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookData.isbn}`,
    );
    const responseJson = await res.json();

    if(responseJson.totalItems === 0) {
      return {
        ...bookData,
        bookData: data,
      };
    }

    const fetchedData = responseJson.items[0].volumeInfo;


    data.title = fetchedData.title;
    data.description = fetchedData.description;
    data.authors = fetchedData.authors.map((author) => ({
      name: author,
      url: "https://www.google.com/search?q=" + author,
    }));
    data.isbn = fetchedData.industryIdentifiers[0].identifier;
    data.number_of_pages = fetchedData.pageCount;
    data.publish_date = fetchedData.publishedDate;
    data.cover = {
      small: fetchedData.imageLinks?.smallThumbnail,
      medium: fetchedData.imageLinks?.thumbnail,
      large: fetchedData.imageLinks?.large,
    };
  }

  return {
    ...bookData,
    bookData: data,
  };
};

const fetchBooks = (books) => {
  return Promise.all(books.map(fetchBook));
};

export default fetchBooks;
export { fetchBook };
