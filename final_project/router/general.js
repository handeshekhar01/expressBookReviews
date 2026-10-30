const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  if (users.some(u => u.username === username)) return res.status(409).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

public_users.get('/', (req, res) => res.status(200).send(JSON.stringify(books, null, 4)));

public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book) : res.status(404).json({ message: "Book not found" });
});

public_users.get('/author/:author', (req, res) => {
  const result = Object.entries(books)
    .filter(([id, b]) => b.author.toLowerCase() === req.params.author.toLowerCase())
    .map(([id, b]) => ({ isbn: id, ...b }));
  return res.status(200).json({ booksbyauthor: result });
});

public_users.get('/title/:title', (req, res) => {
  const result = Object.entries(books)
    .filter(([id, b]) => b.title.toLowerCase() === req.params.title.toLowerCase())
    .map(([id, b]) => ({ isbn: id, ...b }));
  return res.status(200).json({ booksbytitle: result });
});

public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book.reviews) : res.status(404).json({ message: "Book not found" });
});

// Axios functions (async/await and promise callbacks)
const BASE = 'http://localhost:5000';
const getAllBooks = async () => (await axios.get(`${BASE}/`)).data;
const getBookByISBN = (isbn) => axios.get(`${BASE}/isbn/${isbn}`).then(r => r.data).catch(e => console.error(e.message));
const getBooksByAuthor = async (author) => (await axios.get(`${BASE}/author/${encodeURIComponent(author)}`)).data;
const getBooksByTitle = (title) => axios.get(`${BASE}/title/${encodeURIComponent(title)}`).then(r => r.data).catch(e => console.error(e.message));

module.exports.general = public_users;
module.exports.axiosFns = { getAllBooks, getBookByISBN, getBooksByAuthor, getBooksByTitle };
