using System;
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
                .Select(u => new {u.UserName, u.Elo, games = u.Games.Count})
                .OrderByDescending(o => o.Elo)
                .ToList();
            return Ok(users);
            /*// Ra and Rb are current ELO ratings 
            float Ra = 1200, Rb = 1000; 
           
            int K = 30; 
            bool d = false; 
            var res = EloRating(Ra, Rb, K, d); 
            return Ok(res);*/
        }
        
        private double Probability(double rating1,  
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
        private Tuple<double, double> EloRating(double Ra, double Rb, 
            int K, bool d) 
        {   
       
            // To calculate the Winning 
            // Probability of Player B 
            var Pb = Probability(Ra, Rb); 
       
            // To calculate the Winning 
            // Probability of Player A 
            var Pa = Probability(Rb, Ra); 
       
            // Case -1 When Player A wins 
            // Updating the Elo Ratings 
            if (d == true) { 
                Ra = Ra + K * (1 - Pa); 
                Rb = Rb + K * (0 - Pb); 
            } 
       
            // Case -2 When Player B wins 
            // Updating the Elo Ratings 
            else { 
                Ra = Ra + K * (0 - Pa); 
                Rb = Rb + K * (1 - Pb); 
            }
            
            return new Tuple<double, double>(Math.Round(Ra * 1000000.0) / 1000000.0, Math.Round(Rb * 1000000.0) / 1000000.0); 
        } 
        
        
        
    }
}