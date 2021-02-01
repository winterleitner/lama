#nullable enable
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace lama.Database
{
    public class StoredGame
    {
        [Key]
        public int Id { get; set; }
        
        public string Name { get; set; }
        public virtual User CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime EndedTime { get; set; }
        public bool Completed { get; set; }
        public virtual User? Winner { get; set; }
        
        public virtual ICollection<StoredGamePlayers> Players { get; set; }
    }
}