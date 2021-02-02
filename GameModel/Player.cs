using System.Collections.Generic;
using System.Linq;
using lama.Database;
using Microsoft.AspNetCore.Routing.Matching;

namespace lama.Model
{
    public class Player
    {
        public Player(User user)
        {
            _user = user;
            Cards = new List<Card>();
            HasFolded = false;
        }

        private User _user;

        public string UserName => _user.UserName;

        public double Elo => _user.Elo;
        
        internal List<Card> Cards { get; set; }

        public int NumberOfCards => Cards.Count;
        public int Points { get; set; }
        
        public bool HasFolded { get; set; }
        
        public bool HasLeftGame { get; set; }

        public void Win()
        {
            Cards = new List<Card>();
            if (Points == 0) return;
            if (Points < 10) Points -= 1;
            else Points -= 10;
        }

        public void Lose()
        {
            Points += Cards.GroupBy(c => c.Id).ToDictionary(g => g.Key, group => group.ToList()).Sum(x => x.Value.First().Points);
            if (Points < 0) Points = 0;
            Cards = new List<Card>();
        }

        /// <summary>
        /// Returns true if the player can play any hand card.
        /// </summary>
        /// <param name="topCard"></param>
        /// <returns></returns>
        public bool CanPlayAnyCard(Card topCard)
        {
            return Cards.Any(topCard.CardIsAllowed);
        }

        public User GetUser()
        {
            return _user;
        }
    }
}