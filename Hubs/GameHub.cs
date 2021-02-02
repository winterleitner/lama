using System;
using System.Collections.Generic;
using System.Linq;
using lama.Controllers;
using lama.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Task = System.Threading.Tasks.Task;

namespace lama.Hubs
{
    [Authorize]
    public class GameHub : Hub
    {
        private readonly LamaContext _context;
        private readonly UserManager<User> _userManager;
        private static readonly ConnectionMapper<string> Connections = new ConnectionMapper<string>();

        public static IEnumerable<string> GetConnections(string user) => Connections.GetConnections(user);

        public static IEnumerable<string> GetConnections(IEnumerable<string> users) =>
            Connections.GetConnections(users);

        public GameHub(LamaContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public override async Task OnConnectedAsync()
        {
            var user = await _userManager.GetUserAsync(Context.User);
            Connections.Add(user.Id, Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            var user = await _userManager.GetUserAsync(Context.User);
            Connections.Remove(user.Id, Context.ConnectionId);
            await base.OnDisconnectedAsync(ex);
        }

        /// <summary>
        /// SignalR endpoint for sending chat messages.
        /// </summary>
        /// <param name="game"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public async Task SendMessage(int game, string message)
        {
            var g = GamesController.FindGame(game);
            if (g is null) return;
            var user = await _userManager.GetUserAsync(Context.User);
            var msg = g.AddChatMessage(user, message);
            await Clients.Users(g.Players.Select(p => p.GetUser().Id).ToList()).SendAsync("OnNewChatMessage", msg);
        }
    }

    public class ConnectionMapper<T>
    {
        private readonly Dictionary<T, HashSet<string>> _connections =
            new Dictionary<T, HashSet<string>>();

        public int Count
        {
            get { return _connections.Count; }
        }

        public void Add(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    connections = new HashSet<string>();
                    _connections.Add(key, connections);
                }

                lock (connections)
                {
                    connections.Add(connectionId);
                }
            }
        }

        public IEnumerable<string> GetConnections(T key)
        {
            HashSet<string> connections;
            if (_connections.TryGetValue(key, out connections))
            {
                return connections;
            }

            return Enumerable.Empty<string>();
        }

        public IEnumerable<string> GetConnections(IEnumerable<T> keys)
        {
            HashSet<string> connections = new HashSet<string>();
            foreach (var key in keys)
            {
                HashSet<string> curr;
                if (_connections.TryGetValue(key, out curr))
                {
                    connections.UnionWith(curr);
                }
            }
            return connections;
        }

        public void Remove(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    return;
                }

                lock (connections)
                {
                    connections.Remove(connectionId);

                    if (connections.Count == 0)
                    {
                        _connections.Remove(key);
                    }
                }
            }
        }
    }
}