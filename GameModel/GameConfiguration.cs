using System;

namespace lama.Model
{
    public class GameConfiguration
    {
        public int CardsPerType { get; private set; }
        public int HighestCard { get; private set; }
        public int StartCards { get; private set; }
        public bool UseNegativeCards { get; private set; }
        
        public decimal NegativeCardRatio { get; private set; }

        public int NegativeCardsPerType => (int) Math.Ceiling(CardsPerType * NegativeCardRatio);

        public static GameConfiguration DefaultLama => new GameConfiguration()
            {CardsPerType = 6, HighestCard = 6, StartCards = 6, UseNegativeCards = false, NegativeCardRatio = 0m};

        public static GameConfiguration NegativeLama => new GameConfiguration()
            {CardsPerType = 6, HighestCard = 6, StartCards = 6, UseNegativeCards = true, NegativeCardRatio = 0.1m};
    }
}