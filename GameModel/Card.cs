using System.Collections.Generic;

namespace lama.Model
{
    public class Card
    {
        public int Id { get;}
        public string Name { get; set; }
        public int Points { get; set; }
        
        public int Next { get; set; }

        /// <summary>
        /// Returns true if the card with cardId can be played on this.
        /// </summary>
        /// <param name="cardId"></param>
        /// <returns></returns>
        public bool CardIsAllowed(int cardId)
        {
            return cardId == Id || cardId == Next;
        }
        
        /// <summary>
        /// Returns true if the card t can be played on this.
        /// </summary>
        /// <param name="t"></param>
        /// <returns></returns>
        public bool CardIsAllowed(Card t)
        {
            return t.Id == Id || t.Id == Next;
        }

        public Card(int id)
        {
            Id = id;
            Name = id == 0 ? "Lama" : id.ToString();
            Points = id == 0 ? 10 : id;
            Next = id == 6 ? 0 : id + 1;
        }

    }
}