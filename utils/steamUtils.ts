import type { Game, ProcessedGame } from "@/types/steam"
import type { SteamUser } from "@/types/steam"

export function findCommonGames(usersGames: { user: SteamUser; games: Game[] }[]): ProcessedGame[] {
  const gameMap = new Map<number, ProcessedGame>()

  usersGames.forEach(({ games }) => {
    games.forEach((game) => {
      if (gameMap.has(game.appid)) {
        gameMap.get(game.appid)!.ownedBy++
      } else {
        gameMap.set(game.appid, { ...game, ownedBy: 1 })
      }
    })
  })

  return Array.from(gameMap.values())
    .filter((game) => game.ownedBy > 1)
    .sort((a, b) => b.ownedBy - a.ownedBy)
}

export function sortGames(games: ProcessedGame[], sortOrder: "asc" | "desc"): ProcessedGame[] {
  return [...games].sort((a, b) => (sortOrder === "asc" ? a.ownedBy - b.ownedBy : b.ownedBy - a.ownedBy))
}

