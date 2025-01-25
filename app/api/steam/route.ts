import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { steamIds, friendNames } = await request.json();
  const API_KEY = process.env.STEAM_API_KEY;

  try {
    const gamesPromises = steamIds.map(async (steamId: string, index: number) => {
      const response = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${API_KEY}&steamid=${steamId}&include_appinfo=1`
      );
      const data = await response.json();
      return {
        friendName: friendNames[index],
        games: data.response.games || []
      };
    });

    const libraries = await Promise.all(gamesPromises);

    const gameMap: LibraryMap = {};

    libraries.forEach(({ friendName, games }) => {
      games.forEach((game: SteamGame) => {
        if (!gameMap[game.appid]) {
          gameMap[game.appid] = {
            game,
            owners: [friendName]
          };
        } else {
          gameMap[game.appid].owners.push(friendName);
        }
      });
    });

    const gameList = Object.values(gameMap)
      .sort((a, b) => b.owners.length - a.owners.length);

    return NextResponse.json({ games: gameList });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}