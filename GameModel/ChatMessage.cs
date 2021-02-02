using System;
using lama.Database;

namespace lama.Model
{
    public class ChatMessage
    {
        public DateTime Sent { get; set; }
        private User _user;
        
        public int GameId { get; private set; }
        public string UserName => _user.UserName;
        public string Message { get; set; }

        public ChatMessage(int gameId, User u, string message)
        {
            GameId = gameId;
            Sent = DateTime.UtcNow;
            _user = u;
            Message = message;
        }
    }
}