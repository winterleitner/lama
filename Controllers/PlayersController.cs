using System;
using System.Collections.Generic;
using System.Linq;
using lama.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lama.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlayersController : ControllerBase
    {
        private UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        private LamaContext _context;

        public PlayersController(UserManager<User> umg, SignInManager<User> smg, LamaContext context)
        {
            _userManager = umg;
            _signInManager = smg;
            _context = context;
        }

        [HttpGet]
        public IActionResult GetPlayersList()
        {
            var users = _userManager.Users
                .Include(u => u.Games)
                .ThenInclude(g => g.Game)
                .Select(u => new {u.UserName, u.Elo, games = u.Games.Count, wins = u.Games.Count(g => g.Game.WinnerId == u.Id)})
                .OrderByDescending(o => o.Elo)
                .ToList();
            return Ok(users);
        }

        [NonAction]
        public static void CalculateNewEloRating(List<StoredGamePlayers> players)
        {
            // Ra and Rb are current ELO ratings 
            float Ra = 1200, Rb = 1000;
            int K = 10;
            bool d = true;

            var before = new Dictionary<StoredGamePlayers, double>();

            foreach (var p in players)
            {
                before.Add(p, p.Player.Elo);
            }

            var list = players.OrderBy(p => p.Rank).ToList();
            for (var i = 0; i < list.Count - 1; i++)
            {
                var winner = list.ElementAt(i);
                for (var j = i+1; j < list.Count; j++)
                {
                    var modifier = K + (j - i) * 10;
                    var loser = list.ElementAt(j);
                    var nRatings = EloRating(winner.Player.Elo, loser.Player.Elo, modifier, true);
                    winner.Player.Elo = nRatings.Item1;
                    loser.Player.Elo = nRatings.Item2;
                }
            }
            
            foreach (var p in list)
            {
                p.EloChange = p.Player.Elo - before[p];
            }
        }

        private static double Probability(double rating1,
            double rating2)
        {
            return 1.0f * 1.0f / (1 + 1.0f *
                Math.Pow(10, 1.0f *
                    (rating1 - rating2) / 400));
        }

        // Function to calculate Elo rating 
        // K is a constant. 
        // d determines whether Player A wins or 
        // Player B.  
        private static Tuple<double, double> EloRating(double Ra, double Rb,
            int K, bool aIsWinner)
        {
            // To calculate the Winning 
            // Probability of Player B 
            var Pb = Probability(Ra, Rb);

            // To calculate the Winning 
            // Probability of Player A 
            var Pa = Probability(Rb, Ra);

            // Case -1 When Player A wins 
            // Updating the Elo Ratings 
            if (aIsWinner == true)
            {
                Ra = Ra + K * (1 - Pa);
                Rb = Rb + K * (0 - Pb);
            }

            // Case -2 When Player B wins 
            // Updating the Elo Ratings 
            else
            {
                Ra = Ra + K * (0 - Pa);
                Rb = Rb + K * (1 - Pb);
            }

            return new Tuple<double, double>(Math.Round(Ra * 1000000.0) / 1000000.0,
                Math.Round(Rb * 1000000.0) / 1000000.0);
        }
    }
}