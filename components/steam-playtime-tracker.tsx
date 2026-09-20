"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { fetchUserPlaytime } from "../app/actions/steamActions"
import type { Game } from "../types/steam"
import { Search, Loader2, AlertCircle, Clock, Library, CalendarDays, Trophy, ChevronDown, ChevronUp } from "lucide-react"

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
      setDisplayLimit(10)
    } catch (err) {
      setError("Error fetching playtime data. Please check the Steam ID and try again.")
      console.error("Error fetching playtime:", err)
    }
    setIsLoading(false)
  }

  const totalDays = playtimeData ? playtimeData.totalPlaytime / 24 : 0
  const topPlaytime = playtimeData?.games[0]?.playtime_forever || 1

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-steam-blue to-purple-500 shadow-lg shadow-steam-blue/20">
          <Clock size={26} className="text-steam-darkest" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Playtime Tracker
        </h1>
        <p className="mt-2 text-slate-400">
          See how many hours you&apos;ve really sunk into your library.
        </p>
      </div>

      <Card className="mx-auto mb-10 max-w-2xl border-steam-border/60 bg-steam-panel/70 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Enter Steam ID or Username"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPlaytime()}
                className="border-steam-border bg-steam-darkest/60 pl-9 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              onClick={fetchPlaytime}
              disabled={isLoading}
              className="bg-gradient-to-r from-steam-blue to-blue-600 font-semibold text-steam-darkest hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                "Get Playtime"
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/50 px-4 py-3 text-sm text-red-200">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="h-24 animate-shimmer rounded-xl border border-steam-border/60" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-shimmer rounded-xl border border-steam-border/60" />
          ))}
        </div>
      )}

      {!isLoading && playtimeData && (
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-steam-border/60 bg-steam-panel/70">
              <CardContent className="flex items-center gap-3 pt-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-steam-blue/15 text-steam-blue">
                  <Library size={18} />
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">{playtimeData.totalGames}</p>
                  <p className="text-xs text-slate-400">Games owned</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-steam-border/60 bg-steam-panel/70">
              <CardContent className="flex items-center gap-3 pt-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-steam-green/15 text-steam-green">
                  <Clock size={18} />
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">{playtimeData.totalPlaytime.toFixed(0)}</p>
                  <p className="text-xs text-slate-400">Total hours</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-steam-border/60 bg-steam-panel/70">
              <CardContent className="flex items-center gap-3 pt-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">{totalDays.toFixed(1)}</p>
                  <p className="text-xs text-slate-400">Days played</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-steam-border/60 bg-steam-panel/70">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-steam-blue">
                <Trophy size={15} />
                Most Played Games
              </div>

              <div className="space-y-1.5">
                {playtimeData.games.slice(0, displayLimit).map((game, index) => {
                  const hours = (game.playtime_forever || 0) / 60
                  const pct = Math.max(4, ((game.playtime_forever || 0) / topPlaytime) * 100)
                  return (
                    <div
                      key={game.appid}
                      className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-steam-border/60 hover:bg-steam-darkest/40"
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-steam-blue/10 to-transparent"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                      />
                      <span
                        className={`relative z-10 w-6 shrink-0 text-center text-sm font-bold ${
                          index < 3 ? "text-steam-blue" : "text-slate-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {game.img_icon_url ? (
                        <img
                          src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                          alt=""
                          className="relative z-10 h-8 w-8 shrink-0 rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.visibility = "hidden"
                          }}
                        />
                      ) : (
                        <div className="relative z-10 h-8 w-8 shrink-0 rounded bg-steam-darkest" />
                      )}
                      <span className="relative z-10 flex-1 truncate text-sm font-medium text-slate-200">
                        {game.name}
                      </span>
                      <span className="relative z-10 shrink-0 text-sm font-semibold text-slate-300">
                        {hours.toFixed(1)}h
                      </span>
                    </div>
                  )
                })}
              </div>

              {playtimeData.games.length > displayLimit && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={() => setDisplayLimit(displayLimit + 10)}
                    variant="outline"
                    className="border-steam-border bg-steam-darkest/50 text-white hover:bg-steam-panelLight"
                  >
                    <ChevronDown size={14} />
                    Show More ({displayLimit} of {playtimeData.games.length})
                  </Button>
                </div>
              )}

              {displayLimit > 10 && (
                <div className="mt-2 text-center">
                  <Button
                    onClick={() => setDisplayLimit(10)}
                    variant="outline"
                    className="border-steam-border bg-steam-darkest/50 text-white hover:bg-steam-panelLight"
                  >
                    <ChevronUp size={14} />
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
