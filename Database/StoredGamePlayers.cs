using System;
using lama.Model;

namespace lama.Database
{
    public class StoredGamePlayers
    {
        public string PlayerId { get; set; }
        public virtual User Player { get; set; }
        
        public int GameId { get; set; }
        public virtual StoredGame Game { get; set; }
        
        public int Rank { get; set; }
        
        public string Points { get; set; }
    }
}