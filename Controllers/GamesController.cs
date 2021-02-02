using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using lama.Database;
using lama.Model;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;


namespace lama.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GamesController : Controller
    {
        private static readonly List<Game> Games = new List<Game>();
        private static int currentGameIndex = 0;

        private static readonly string USERID = "UserId";
        private static readonly string USERNAME = "UserName";

        private static readonly HashSet<string> Users = new HashSet<string>();
        
        private UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        private LamaContext _context;

        private static GameNameGenerator NameGen = new GameNameGenerator();

        [NonAction]
        public static Game? FindGame(int id)
        {
            return Games.FirstOrDefault(g => g.Id == id);
        }

        public GamesController(UserManager<User> umg, SignInManager<User> smg, LamaContext context)
        {
            _userManager = umg;
            _signInManager = smg;
            _context = context;
        }
        [HttpGet]
        public IActionResult GetGamesList()
        {
            return Ok(Games.Select(g => new
                {g.Id, g.Name, players = g.Players.Select(p => new {p.UserName, p.Elo}), g.Started, g.Ended}));
        }
        
        [HttpGet]
        [Route("{id}")]
        public IActionResult GetGame(int id)
        {
            var game = Games.Find(g => g.Id == id);
            if (game is null) return NotFound();
            return Ok(game);
        }

        [Authorize]
        [HttpPost]
        public IActionResult CreateGame(int? configuration)
        {
            currentGameIndex++;
            var config = GameConfiguration.DefaultLama;
            if (configuration.HasValue && configuration.Value == 1) config = GameConfiguration.NegativeLama;
            var g = new Game(currentGameIndex, NameGen.GetRandomName(), config);
            Games.Add(g);
            return Ok(g.Id);
        }

        [Authorize]
        [HttpPost]
        [Route("{gameId}/join")]
        public async Task<IActionResult> JoinGame(int gameId)
        {
            var user = await _userManager.GetUserAsync(this.User);
            if (user is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (game.Players.Any(p => p.UserName == user.UserName)) return BadRequest("Already joined that game");
            if (game.Started) return BadRequest("Game already started");
            game.AddPlayer(new Player(user));
            return Ok();
        }
        
        [Authorize]
        [HttpPost]
        [Route("{gameId}/leave")]
        public async Task<IActionResult> LeaveGame(int gameId)
        {
            var user = await _userManager.GetUserAsync(this.User);
            if (user is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (game.Started) return BadRequest("Cannot leave already started game");
            game.RemovePlayer(user);
            return Ok();
        }

        [Authorize]
        [HttpPost]
        [Route("{gameId}/start")]
        public async Task<IActionResult> StartGame(int gameId)
        {
            var user = await _userManager.GetUserAsync(this.User);
            if (user is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (game.Started) return BadRequest("Game already started");
            if (game.Players.All(p => p.UserName != user.UserName)) return BadRequest("Cannot start game without joining");
            if (game.Players.Count < 2) return BadRequest("Not enough players");
            if (game.StartGame()) return Ok();
            return StatusCode(500);
        }

        [Authorize]
        [HttpGet]
        [Route("{gameId}/cards")]
        public async Task<IActionResult> GetHandCards(int gameId)
        {
            var user = await _userManager.GetUserAsync(this.User);
            if (user is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (!game.Started) return BadRequest("Game not started");
            var player = game.Players.FirstOrDefault(p => p.UserName == user.UserName);
            if (player is null) return BadRequest("You are not in that game!");
            return Ok(player.Cards);
        }
        
        [Authorize]
        [HttpGet]
        [Route("{gameId}/chat")]
        public async Task<IActionResult> GetChatMessages(int gameId)
        {
            var user = await _userManager.GetUserAsync(this.User);
            if (user is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            var player = game.Players.FirstOrDefault(p => p.UserName == user.UserName);
            if (player is null) return BadRequest("You are not in that game!");
            return Ok(game.GetChatMessages());
        }

        [Authorize]
        [HttpPost]
        [Route("{gameId}/move")]
        public async Task<IActionResult> Move(int gameId, [FromBody] Move move)
        {
            var user = await _userManager.GetUserAsync(this.User);
            if (user is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (!game.Started) return BadRequest("Game not started");
            if (move is null) return BadRequest("Bad Move");
            var player = game.Players.FirstOrDefault(p => p.UserName == user.UserName);
            if (player is null) return BadRequest("You are not in that game!");
            if (game.NextTurn is null || game.NextTurn.UserName != user.UserName) return BadRequest("Not your turn");
            switch (move.Type)
            {
                case MoveType.Fold: game.Fold(player); return Ok();
                case MoveType.DrawCard: var card = game.DrawCard(player);
                        if (card is null) return BadRequest("Could not draw card");
                        return Ok(card);
                case MoveType.PlayCard:
                    if (move.CardId < 0 || move.CardId > 6) return BadRequest("Invalid card specified");
                    if (player.Cards.All(c => c.Id != move.CardId)) return BadRequest("You do not have this card");
                    if (!game.TopCard.CardIsAllowed(new Card(move.CardId))) return BadRequest("Card cannot be played");
                    if (game.PlayCard(player, move.CardId)) return Ok();
                    return StatusCode(500);
            }

            return BadRequest("Invalid move");
        }
    }
}