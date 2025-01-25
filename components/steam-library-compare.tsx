'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function SteamLibraryCompare() {
  const [friends, setFriends] = useState<FriendEntry[]>([{ id: '', name: '' }]);
  const [gamesList, setGamesList] = useState<GameEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedFriends = localStorage.getItem('steamFriends');
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('steamFriends', JSON.stringify(friends));
  }, [friends]);

  const addFriend = () => setFriends([...friends, { id: '', name: '' }]);

  const updateFriend = (index: number, field: keyof FriendEntry, value: string) => {
    const newFriends = [...friends];
    newFriends[index] = { ...newFriends[index], [field]: value };
    setFriends(newFriends);
  };

  const removeFriend = (index: number) => {
    setFriends(friends.filter((_, i) => i !== index));
  };

  const findCommonGames = async () => {
    setLoading(true);
    setError('');

    try {
      const steamIds = friends.map(f => f.id);
      const friendNames = friends.map(f => f.name || f.id);

      if (steamIds.some(id => !id.trim())) {
        throw new Error('Please fill in all Steam IDs');
      }

      const response = await fetch('/api/steam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamIds, friendNames })
      });

      if (!response.ok) throw new Error('Failed to fetch games');

      const data = await response.json();
      setGamesList(data.games);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderGamesList = () => {
    if (!gamesList.length) return null;

    const totalFriends = friends.length;
    return (
      <div className="space-y-6">
        {[...Array(totalFriends)].map((_, i) => {
          const count = totalFriends - i;
          const gamesForCount = gamesList.filter(g => g.owners.length === count);

          if (!gamesForCount.length) return null;

          return (
            <div key={count} className="space-y-2">
              <h3 className="text-lg font-semibold">
                {count === totalFriends ?
                  'Games owned by everyone ' :
                  `Games owned by ${count} friends `}
                ({gamesForCount.length})
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {gamesForCount.map(({ game, owners }) => (
                  <div
                    key={game.appid}
                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    <div className="font-medium">{game.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Owned by: {owners.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Steam Library Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {friends.map((friend, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Friend Name"
                  value={friend.name}
                  onChange={(e) => updateFriend(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Enter Steam ID"
                  value={friend.id}
                  onChange={(e) => updateFriend(index, 'id', e.target.value)}
                  className="flex-1"
                />
                {friends.length > 1 && (
                  <Button
                    variant="destructive"
                    onClick={() => removeFriend(index)}
                    className="w-10"
                  >
                    X
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={addFriend} variant="outline" className="w-full">
            Add Friend
          </Button>

          <Button
            onClick={findCommonGames}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing Libraries...
              </>
            ) : (
              'Compare Libraries'
            )}
          </Button>

          {error && (
            <div className="flex items-center text-red-500 gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {gamesList.length > 0 && (
            <div className="mt-4">
              {renderGamesList()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}