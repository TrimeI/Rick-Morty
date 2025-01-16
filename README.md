# Ricky-Morty Characters App

A fun and interactive web application built with React, Apollo Client, and GraphQL, allowing users to explore and interact with characters from the Rick and Morty universe.

# Features

1. Character List (Displays key details for each character), including:
  - Name
  - Status (formatted as "Alive," "Dead," or "Unknown")
  - Species
  - Gender
  - Origin
2. Filters:
  - Filter characters by *Status* (Alive, Dead, Unknown)
  - Filter characters by *Species* (Human, Alien)
3. Sorting:
  - Sort characters by *Name* and *Origin*
4. Pagination:
  - Paginate through results to display a limited number of characters per page.
  - Option to use *Infinite Scrolling* for dynamic data loading as the user scrolls.
5. Error and Loading States:
  - Gracefully handle API errors and display loading indicators.
6. Language Switcher:
  - Toggle between multiple languages (e.g., English and German) from the footer.

# Getting Started

Follow these steps to set up and run the application locally:

## Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Apollo Client](https://www.apollographql.com/docs/react/) (integrated within the project)


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TrimeI/Ricky-Morty.git
   cd Ricky-Morty

2. Install dependencies:
   ```bash
   npm install

## Available Scripts

In the project directory, you can run:

 `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

