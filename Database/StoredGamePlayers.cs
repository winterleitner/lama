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
        
        public bool LeftBeforeEnd { get; set; }
        
        public int Rank { get; set; }
        
        public int Points { get; set; }
        
        public double EloChange { get; set; }
    }
}