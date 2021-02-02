#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using lama.Database;

namespace lama.Model
{
    public class Game
    {
        public Game(int id, string name, GameConfiguration configuration)
        {
            Id = id;
            Name = name;
            _configuration = configuration;
            CreateTime = DateTime.UtcNow;
            Started = false;
            Round = 0;
            Turns = new Queue<Player>();
            Stack = new Stack<Card>();
            Players = new HashSet<Player>();
            Winners = new HashSet<Player>();
            Messages = new LinkedList<ChatMessage>();
        }

        private GameConfiguration _configuration;

        private LinkedList<ChatMessage> Messages { get; set; }

        public event EventHandler GameEnded;
        public event EventHandler StatusChanged;
        public int Id { get; set; }
        
        public string Name { get; set; }
        
        public DateTime CreateTime { get; private set; }
        public DateTime StartTime { get; private set; }
        public bool Started { get; private set; }

        public bool Ended { get; private set; }
        
        public bool Aborted { get; private set; }
        
        public DateTime LastMoveTime { get; private set; }
        
        public int Round { get; private set; }
        public bool DrawingAllowed => !Ended && Players is not null && (Players.Count(pl => !pl.HasFolded) >= 2);
        public HashSet<Player> Players { get; set; }
        public Queue<Player> Turns { get; set; }
        
        public HashSet<Player> Winners { get; private set; }

        public Player? NextTurn
        {
            get
            {
                if (Turns.TryPeek(out var p)) return p;
                return null;
            }
        }
        
        private Stack<Card> Stack { get; set; }
        
        public Card TopCard { get; set; }


        public bool StartGame()
        {
            if (Started || Players.Count < 2) return false;
            Started = true;
            StartTime = DateTime.UtcNow;
            InitRound();
            return true;
        }

        public bool TryStartTurn(Player p)
        {
            if (Turns.Peek() != p) return false;
            LastMoveTime = DateTime.UtcNow;
            Turns.Dequeue();
            return true;
        }
        public Card? DrawCard(Player p)
        {
            if (!DrawingAllowed) return null;
            if (!TryStartTurn(p)) return null;
            var card = Stack.Pop();
            p.Cards.Add(card);
            if (Stack.Count == 0) ReshuffleCards();
            Turns.Enqueue(p);
            EndTurn(p);
            return card;
        }

        public bool PlayCard(Player p, int cardId)
        {
            if (p.Cards.All(c => c.Id != cardId)) return false;
            if (!TopCard.CardIsAllowed(new Card(cardId))) return false;
            if (!TryStartTurn(p)) return false;
            var card = p.Cards.First(c => c.Id == cardId);
            p.Cards.Remove(card);
            TopCard = card;
            Turns.Enqueue(p);
            EndTurn(p);
            return true;
        }

        public bool Fold(Player p)
        {
            if (!TryStartTurn(p)) return false;
            p.HasFolded = true;
            EndTurn(p);
            return true;
        }

        public void EndTurn(Player p)
        {
            if (p.Cards.Count == 0) EndRound(p);
            // if only one player remains and he cannot play a card -> end game
            if (!DrawingAllowed && !Players.Any(p => !p.HasFolded && p.CanPlayAnyCard(TopCard))) EndRound(null);
            StatusChanged?.Invoke(this, EventArgs.Empty);
        }

        /// <summary>
        /// Ends a game round.
        /// </summary>
        /// <param name="winner"></param>
        private void EndRound(Player? winner)
        {
            foreach (var p in Players.Where(p => p != winner))
            {
                p.Lose();
            }
            winner?.Win();
            if (Players.Any(p => p.Points >= 40))
            {
                Ended = true;
                foreach (var p in Players.Where(p => p.Points == Players.Min(p => p.Points)))
                    Winners.Add(p);
                GameEnded?.Invoke(this, EventArgs.Empty);
            }
            else
            {
                InitRound();
            }
        }

        /// <summary>
        /// Ends (aborts) the Game.
        /// </summary>
        public void EndGame()
        {
            EndRound(null);
            Ended = true;
            Aborted = true;
            GameEnded?.Invoke(this, EventArgs.Empty);
        }

        
        /// <summary>
        /// Initializes a round.
        /// </summary>
        private void InitRound()
        {
            Round++;
            ReshuffleCards();
            foreach (var p in Players)
            {
                p.HasFolded = false;
                for (int i = 0; i < _configuration.StartCards; i++)
                {
                    p.Cards.Add(Stack.Pop());
                }
            }
            TopCard = Stack.Pop();
            Turns = new();
            foreach (var p in Players.OrderBy(p => p.Points).ThenBy(p => p.Elo).ToList())
            {
                Turns.Enqueue(p);
            }
        }

        /// <summary>
        /// Reshuffles the card deck.
        /// </summary>
        private void ReshuffleCards()
        {
            Stack = new Stack<Card>();
            var temp = new List<Card>();
            for (int i = 0; i <= _configuration.HighestCard; i++)
            {
                for (int j = 0; j <= _configuration.CardsPerType; j++)
                {
                    temp.Add(new Card(i));
                }
            }

            if (_configuration.UseNegativeCards)
            {
                for (int i = 1; i <= _configuration.HighestCard; i++)
                {
                    for (int j = 0; j <= _configuration.NegativeCardsPerType; j++)
                    {
                        temp.Add(new Card(-i));
                    }
                }
            }
            var shuffled = temp.OrderBy(a => Guid.NewGuid()).ToList();
            foreach (var card in shuffled)
            {
                Stack.Push(card);
            }
        }

        public void AddPlayer(Player p)
        {
            Players.Add(p);
        }

        public void RemovePlayer(User user)
        {
            if (Players.All(p => p.UserName == user.UserName)) return;
            foreach (var p in Players.Where(p => p.UserName == user.UserName))
                Players.Remove(p);
        }

        public ChatMessage AddChatMessage(User u, string m)
        {
            var message = new ChatMessage(Id, u, m);
            Messages.AddLast(message);
            return message;
        }

        public LinkedList<ChatMessage> GetChatMessages()
        {
            return Messages;
        }
    }
}