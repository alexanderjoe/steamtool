"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchUserGames } from "../app/actions/steamActions"
import { findCommonGames } from "../utils/steamUtils"
import type { SteamUser, ProcessedGame, Game } from "../types/steam"
import { X, SortAsc, SortDesc } from "lucide-react"

export default function SteamLibraryCompare() {
  const [users, setUsers] = useState<SteamUser[]>([])
  const [newUser, setNewUser] = useState({ id: "", username: "" })
  const [commonGames, setCommonGames] = useState<ProcessedGame[]>([])
  const [userGames, setUserGames] = useState<{ user: SteamUser; games: Game[] }[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">Steam Games Comparison</h1>

      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Steam ID or Username"
            value={newUser.id}
            onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
            className="bg-gray-800 text-white"
          />
          <Input
            placeholder="Display Name"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="bg-gray-800 text-white"
          />
          <Button onClick={addUser} className="bg-purple-600 hover:bg-purple-700">
            Add User
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {users.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center bg-gray-800 rounded-full px-3 py-1 text-sm font-semibold text-gray-200"
            >
              {user.username}
              <button onClick={() => removeUser(user.id)} className="ml-2 text-gray-400 hover:text-gray-200">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <Button
          onClick={compareGames}
          disabled={users.length < 2 || isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? "Comparing..." : "Compare Games"}
        </Button>
      </div>

      {commonGames.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-400">Common Games</h2>

          <div className="flex justify-between items-center mb-4">
            <Select
              value={filterOwners.toString()}
              onValueChange={(value) => setFilterOwners(value === "all" ? "all" : Number.parseInt(value))}
            >
              <SelectTrigger className="w-[180px] bg-gray-800 text-white">
                <SelectValue placeholder="Filter by owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
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
              className="bg-gray-800 text-white"
            >
              {sortOrder === "asc" ? <SortAsc /> : <SortDesc />}
            </Button>
          </div>

          {sortedOwnerCounts.map((ownerCount) => (
            <div key={ownerCount} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">
                Owned by {ownerCount} user{Number.parseInt(ownerCount) !== 1 ? "s" : ""}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gamesByOwnerCount[ownerCount].map((game) => (
                  <Card key={game.appid} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-purple-300">{game.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {users
                          .filter((user) =>
                            userGames.find(
                              (ug) => ug.user.id === user.id && ug.games.some((g) => g.appid === game.appid),
                            ),
                          )
                          .map((user) => (
                            <span
                              key={user.id}
                              className="text-xs bg-purple-800 text-purple-200 rounded-full px-2 py-1"
                            >
                              {user.username}
                            </span>
                          ))}
                      </div>
                      {game.img_icon_url && (
                        <img
                          src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                          alt={game.name}
                          className="mt-2 w-16 h-16"
                        />
                      )}
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