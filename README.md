# Steam Library Tool

A Next.js web application for comparing Steam game libraries and tracking playtime across multiple users.

## Features

### Library Compare
- Add multiple Steam users by ID or username
- Compare game libraries to find common games
- Filter games by number of owners
- Sort and visualize shared games across friend groups
- Persistent user storage in browser

### Playtime Tracker
- View total playtime statistics for any Steam user
- Display top most-played games ranked by hours
- Convert playtime to hours and days
- Expandable game list for detailed viewing

## Setup

### 1. Get a Steam API Key

1. Visit [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Log in with your Steam account
3. Register for a Steam Web API key (use any domain name, e.g., `localhost`)
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
STEAM_API_KEY=your_api_key_here
```

### 3. Install and Run

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Support

Build and run with Docker:

```bash
docker build -t steamtool .
docker run -p 3000:3000 steamtool
```

## Note

Requires Steam profiles to be public to fetch game data.
