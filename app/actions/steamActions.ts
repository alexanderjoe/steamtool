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
    `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=1&include_played_free_games=1`,
  )
  const data = await response.json()

  if (data.response && data.response.games) {
    return data.response.games.map((game: any) => ({
      appid: game.appid,
      name: game.name,
      img_icon_url: game.img_icon_url,
      playtime_forever: game.playtime_forever || 0,
      has_community_visible_stats: game.has_community_visible_stats || false,
      playtime_windows_forever: game.playtime_windows_forever || 0,
      playtime_mac_forever: game.playtime_mac_forever || 0,
      playtime_linux_forever: game.playtime_linux_forever || 0,
      playtime_deck_forever: game.playtime_deck_forever || 0,
      rtime_last_played: game.rtime_last_played || 0,
      playtime_disconnected: game.playtime_disconnected || 0,
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

export async function fetchUserPlaytime(identifier: string): Promise<{ totalGames: number; totalPlaytime: number; games: Game[] }> {
  const steamId = await getSteamId(identifier)
  const games = await getOwnedGames(steamId)

  const totalPlaytime = games.reduce((total, game) => total + (game.playtime_forever || 0), 0)

  return {
    totalGames: games.length,
    totalPlaytime: totalPlaytime / 60, // Convert from minutes to hours
    games: games.sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
  }
}

