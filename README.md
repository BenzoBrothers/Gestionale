# Gestionale Magazzino (Warehouse Management System)

A simple warehouse management system built with Flask and SQLite for the backend, and HTML/CSS/JavaScript for the frontend.

## Features

- Add new products with details (name, code, quantity, category, unit price)
- View all products in a table format
- Edit existing products
- Delete products
- Search products by name or category
- Responsive design

## Prerequisites

- Python 3.x
- pip (Python package installer)

## Installation

1. Clone or download this repository

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the Flask backend server:
   ```
   python app.py
   ```
   The server will start at `http://localhost:5000`

2. Open `index.html` in your web browser to access the frontend interface

## API Endpoints

- `GET /prodotti` - Get all products
- `POST /prodotti` - Add a new product
- `PUT /prodotti/<id>` - Update a product
- `DELETE /prodotti/<id>` - Delete a product
- `GET /prodotti/search` - Search products by name or category

## Database

The application uses SQLite as the database, which will be automatically created as `warehouse.db` when you first run the application.

## Technologies Used

- Backend:
  - Flask (Python web framework)
  - SQLAlchemy (ORM)
  - SQLite (Database)

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (Fetch API for AJAX calls)