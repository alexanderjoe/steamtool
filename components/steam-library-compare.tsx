"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchUserGames } from "../app/actions/steamActions"
import { findCommonGames } from "../utils/steamUtils"
import type { SteamUser, ProcessedGame, Game } from "../types/steam"
import { X, SortAsc, SortDesc, Users, UserPlus, Loader2, Swords, Gamepad2 } from "lucide-react"

const AVATAR_COLORS = [
  "from-steam-blue to-blue-600",
  "from-purple-500 to-fuchsia-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
]

function avatarGradient(seed: string) {
  const idx = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function SteamLibraryCompare() {
  const [users, setUsers] = useState<SteamUser[]>([])
  const [newUser, setNewUser] = useState({ id: "", username: "" })
  const [commonGames, setCommonGames] = useState<ProcessedGame[]>([])
  const [userGames, setUserGames] = useState<{ user: SteamUser; games: Game[] }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterOwners, setFilterOwners] = useState<number | "all">("all")

  useEffect(() => {
    const savedUsers = localStorage.getItem("steamUsers")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("steamUsers", JSON.stringify(users))
  }, [users])

  const addUser = () => {
    if (newUser.id && newUser.username && !users.some((user) => user.id === newUser.id)) {
      setUsers([...users, newUser])
      setNewUser({ id: "", username: "" })
    }
  }

  const removeUser = (idToRemove: string) => {
    setUsers(users.filter((user) => user.id !== idToRemove))
  }

  const compareGames = async () => {
    setIsLoading(true)
    try {
      const userGamesData = await fetchUserGames(users)
      const common = findCommonGames(userGamesData)
      setCommonGames(common)
      setUserGames(userGamesData)
      setHasSearched(true)
    } catch (error) {
      console.error("Error fetching games:", error)
    }
    setIsLoading(false)
  }

  const sortedAndFilteredGames = commonGames
    .filter((game) => filterOwners === "all" || game.ownedBy === filterOwners)
    .sort((a, b) => {
      return sortOrder === "asc" ? a.ownedBy - b.ownedBy : b.ownedBy - a.ownedBy;
    });

  const gamesByOwnerCount = sortedAndFilteredGames.reduce(
    (acc, game) => {
      const key = game.ownedBy.toString()
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(game)
      return acc
    },
    {} as Record<string, ProcessedGame[]>,
  )

  const sortedOwnerCounts = Object.keys(gamesByOwnerCount).sort((a, b) => {
    const aCount = parseInt(a)
    const bCount = parseInt(b)
    return sortOrder === "asc" ? aCount - bCount : bCount - aCount
  })

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-steam-blue to-purple-500 shadow-lg shadow-steam-blue/20">
          <Swords size={26} className="text-steam-darkest" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Compare Steam Libraries
        </h1>
        <p className="mt-2 text-slate-400">
          Add your friends&apos; Steam IDs and find out what games you all have in common.
        </p>
      </div>

      <Card className="mx-auto mb-10 max-w-2xl border-steam-border/60 bg-steam-panel/70 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Users size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Steam ID or Username"
                value={newUser.id}
                onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addUser()}
                className="border-steam-border bg-steam-darkest/60 pl-9 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="relative flex-1">
              <UserPlus size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Display Name"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addUser()}
                className="border-steam-border bg-steam-darkest/60 pl-9 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              onClick={addUser}
              className="bg-gradient-to-r from-steam-blue to-blue-600 text-steam-darkest font-semibold hover:opacity-90"
            >
              Add
            </Button>
          </div>

          {users.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {users.map((user) => (
                <span
                  key={user.id}
                  className="group inline-flex items-center gap-2 rounded-full border border-steam-border/70 bg-steam-darkest/60 py-1 pl-1 pr-3 text-sm font-medium text-slate-200"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white ${avatarGradient(user.username)}`}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  {user.username}
                  <button
                    onClick={() => removeUser(user.id)}
                    className="text-slate-500 transition-colors hover:text-red-400"
                    aria-label={`Remove ${user.username}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button
            onClick={compareGames}
            disabled={users.length < 2 || isLoading}
            className="mt-5 w-full bg-gradient-to-r from-steam-green to-emerald-600 font-semibold text-steam-darkest hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Comparing libraries...
              </>
            ) : (
              <>
                <Swords size={16} />
                Compare Games
              </>
            )}
          </Button>
          {users.length < 2 && (
            <p className="mt-2 text-center text-xs text-slate-500">Add at least 2 users to compare</p>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-shimmer rounded-xl border border-steam-border/60" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && hasSearched && commonGames.length === 0 && (
        <div className="mx-auto max-w-md rounded-xl border border-steam-border/60 bg-steam-panel/50 py-12 text-center">
          <Gamepad2 size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No shared games found between these users.</p>
        </div>
      )}

      {!isLoading && commonGames.length > 0 && (
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-white">
              {sortedAndFilteredGames.length} Common Game{sortedAndFilteredGames.length !== 1 ? "s" : ""}
            </h2>

            <div className="flex items-center gap-2">
              <Select
                value={filterOwners.toString()}
                onValueChange={(value) => setFilterOwners(value === "all" ? "all" : Number.parseInt(value))}
              >
                <SelectTrigger className="w-[160px] border-steam-border bg-steam-panel text-white">
                  <SelectValue placeholder="Filter by owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All owners</SelectItem>
                  {Array.from({ length: users.length - 1 }, (_, i) => i + 2).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} owners
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                variant="outline"
                size="icon"
                className="border-steam-border bg-steam-panel text-white hover:bg-steam-panelLight"
              >
                {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </Button>
            </div>
          </div>

          {sortedOwnerCounts.map((ownerCount) => (
            <div key={ownerCount} className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-steam-blue">
                <span className="h-px flex-1 bg-steam-border/60" />
                Owned by {ownerCount} user{Number.parseInt(ownerCount) !== 1 ? "s" : ""}
                <span className="h-px flex-1 bg-steam-border/60" />
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {gamesByOwnerCount[ownerCount].map((game) => (
                  <Card
                    key={game.appid}
                    className="group overflow-hidden border-steam-border/60 bg-steam-panel/70 transition-all hover:-translate-y-0.5 hover:border-steam-blue/50 hover:shadow-lg hover:shadow-steam-blue/10"
                  >
                    <div className="relative h-20 w-full overflow-hidden bg-steam-darkest">
                      <img
                        src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_616x353.jpg`}
                        alt={game.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-steam-panel via-transparent to-transparent" />
                    </div>
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="line-clamp-1 text-base font-semibold text-white">
                        {game.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {users
                          .filter((user) =>
                            userGames.find(
                              (ug) => ug.user.id === user.id && ug.games.some((g) => g.appid === game.appid),
                            ),
                          )
                          .map((user) => (
                            <span
                              key={user.id}
                              className="inline-flex items-center gap-1 rounded-full bg-steam-darkest/70 px-2 py-0.5 text-xs font-medium text-slate-300"
                            >
                              <span
                                className={`h-3.5 w-3.5 rounded-full bg-gradient-to-br ${avatarGradient(user.username)}`}
                              />
                              {user.username}
                            </span>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
