using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace lama.Database
{
    public class User : IdentityUser
    {
        public double Elo { get; set; }
        
        public virtual ICollection<StoredGamePlayers> Games { get; set; }
    }
}