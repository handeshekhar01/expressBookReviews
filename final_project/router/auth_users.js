const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];

const isValid = (username) => !users.some(u => u.username === username);
const authenticatedUser = (u, p) => users.some(x => x.username === u && x.password === p);

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing credentials" });
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: "Invalid login" });
  const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 3600 });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "Login successful!" });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  book.reviews[req.session.authorization.username] = req.query.review;
  return res.status(200).json({ message: "Review added/updated", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  delete book.reviews[req.session.authorization.username];
  return res.status(200).json({ message: "Review for ISBN " + req.params.isbn + " deleted", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
