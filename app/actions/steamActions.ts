"use server"

import type { SteamUser, Game } from "../../types/steam"

const STEAM_API_KEY = process.env.STEAM_API_KEY

if (!STEAM_API_KEY) {
  throw new Error("STEAM_API_KEY is not set in environment variables")
}

async function getSteamId(identifier: string): Promise<string> {
  if (/^\d+$/.test(identifier)) {
    return identifier // It's already a Steam ID
  }

  const response = await fetch(
    `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${identifier}`,
  )
  const data = await response.json()

  if (data.response.success === 1) {
    return data.response.steamid
  } else {
    throw new Error("Could not resolve vanity URL to Steam ID")
  }
}

async function getOwnedGames(steamId: string): Promise<Game[]> {
  const response = await fetch(
    `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=1`,
  )
  const data = await response.json()

  if (data.response && data.response.games) {
    return data.response.games.map((game: any) => ({
      appid: game.appid,
      name: game.name,
      img_icon_url: game.img_icon_url,
    }))
  } else {
    throw new Error("Could not fetch owned games")
  }
}

export async function fetchUserGames(users: SteamUser[]): Promise<{ user: SteamUser; games: Game[] }[]> {
  const userGamesPromises = users.map(async (user) => {
    const steamId = await getSteamId(user.id)
    const games = await getOwnedGames(steamId)
    return { user, games }
  })

  return Promise.all(userGamesPromises)
}

