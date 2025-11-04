"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { fetchUserPlaytime } from "../app/actions/steamActions"
import type { Game } from "../types/steam"

export default function SteamPlaytimeTracker() {
  const [steamId, setSteamId] = useState("")
  const [playtimeData, setPlaytimeData] = useState<{
    totalGames: number
    totalPlaytime: number
    games: Game[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayLimit, setDisplayLimit] = useState(10)

  const fetchPlaytime = async () => {
    if (!steamId.trim()) {
      setError("Please enter a Steam ID")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchUserPlaytime(steamId)
      setPlaytimeData(data)
    } catch (err) {
      setError("Error fetching playtime data. Please check the Steam ID and try again.")
      console.error("Error fetching playtime:", err)
    }
    setIsLoading(false)
  }

  const totalDays = playtimeData ? playtimeData.totalPlaytime / 24 : 0

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">Steam Playtime Tracker</h1>

      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Enter Steam ID or Username"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPlaytime()}
            className="bg-gray-800 text-white border-gray-700"
          />
          <Button
            onClick={fetchPlaytime}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Loading..." : "Get Playtime"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      {playtimeData && (
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="pt-6">
              <pre className="font-mono text-sm text-green-400 whitespace-pre">
{`============================================================
STEAM PLAYTIME SUMMARY
============================================================

Total Games in Library: ${playtimeData.totalGames}
Total Playtime: ${playtimeData.totalPlaytime.toFixed(2)} hours (${totalDays.toFixed(2)} days)

------------------------------------------------------------
TOP ${Math.min(displayLimit, playtimeData.games.length)} MOST PLAYED GAMES
------------------------------------------------------------
${playtimeData.games
  .slice(0, displayLimit)
  .map((game, index) => {
    const hours = (game.playtime_forever || 0) / 60
    const position = `${index + 1}.`.padEnd(3)
    const gameName = game.name.length > 42
      ? game.name.substring(0, 39) + "..."
      : game.name
    const paddedName = gameName.padEnd(45)
    const hoursStr = `${hours.toFixed(2)} hours`
    return ` ${position} ${paddedName} ${hoursStr}`
  })
  .join("\n")}
============================================================`}
              </pre>

              {playtimeData.games.length > displayLimit && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={() => setDisplayLimit(displayLimit + 10)}
                    variant="outline"
                    className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    Show More ({displayLimit} of {playtimeData.games.length})
                  </Button>
                </div>
              )}

              {displayLimit > 10 && (
                <div className="mt-2 text-center">
                  <Button
                    onClick={() => setDisplayLimit(10)}
                    variant="outline"
                    className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    Show Less
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
