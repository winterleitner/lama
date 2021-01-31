using System.Collections.Generic;
using System.Linq;
using lama.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


namespace lama.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GamesController : Controller
    {
        private static readonly List<Game> Games = new List<Game>();
        private static int currentGameIndex = 0;
        private static int currentUserIndex = 0;

        private static readonly string USERID = "UserId";
        private static readonly string USERNAME = "UserName";

        private static readonly HashSet<string> Users = new HashSet<string>();

        [HttpGet]
        public IActionResult GetGamesList()
        {
            return Ok(Games);
        }
        
        [HttpGet]
        [Route("{id}")]
        public IActionResult GetGame(int id)
        {
            var game = Games.Find(g => g.Id == id);
            if (game is null) return NotFound();
            return Ok(game);
        }

        [HttpPost]
        public IActionResult CreateGame()
        {
            currentGameIndex++;
            var g = new Game(currentGameIndex);
            Games.Add(g);
            return Ok(g.Id);
        }

        [HttpPost]
        [Route("/join")]
        public IActionResult JoinServer([FromBody] string name)
        {
            var id = currentUserIndex++;
            HttpContext.Session.SetInt32(USERID, id);
            HttpContext.Session.SetString(USERNAME, name);
            Users.Add(name);
            return Ok(new {id, name});
        }

        [HttpPost]
        [Route("{gameId}/join")]
        public IActionResult JoinGame(int gameId)
        {
            var user = HttpContext.Session.GetInt32(USERID);
            var name = HttpContext.Session.GetString(USERNAME);
            if (user is null || name is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (game.Players.Any(p => p.Id == user.Value)) return BadRequest("Already joined that game");
            if (game.Started) return BadRequest("Game already started");
            game.AddPlayer(new Player(user.Value, name));
            return Ok();
        }
        
        [HttpPost]
        [Route("{gameId}/leave")]
        public IActionResult LeaveGame(int gameId)
        {
            var user = HttpContext.Session.GetInt32(USERID);
            var name = HttpContext.Session.GetString(USERNAME);
            if (user is null || name is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (game.Started) return BadRequest("Cannot leave already started game");
            game.RemovePlayer(user.Value);
            return Ok();
        }

        [HttpPost]
        [Route("{gameId}/start")]
        public IActionResult StartGame(int gameId)
        {
            var user = HttpContext.Session.GetInt32(USERID);
            var name = HttpContext.Session.GetString(USERNAME);
            if (user is null || name is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (game.Players.Count < 2) return BadRequest("Not enough players");
            if (game.StartGame()) return Ok();
            return StatusCode(500);
        }

        [HttpGet]
        [Route("{gameId}/cards")]
        public IActionResult GetHandCards(int gameId)
        {
            var user = HttpContext.Session.GetInt32(USERID);
            var name = HttpContext.Session.GetString(USERNAME);
            if (user is null || name is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (!game.Started) return BadRequest("Game not started");
            var player = game.Players.FirstOrDefault(p => p.Id == user.Value);
            if (player is null) return BadRequest("You are not in that game!");
            return Ok(player.Cards);
        }

        [HttpPost]
        [Route("{gameId}/move")]
        public IActionResult Move(int gameId, [FromBody] Move move)
        {
            var user = HttpContext.Session.GetInt32(USERID);
            var name = HttpContext.Session.GetString(USERNAME);
            if (user is null || name is null) return BadRequest("Please join server first");
            var game = Games.Find(g => g.Id == gameId);
            if (game is null) return NotFound("Game not found");
            if (!game.Started) return BadRequest("Game not started");
            if (move is null) return BadRequest("Bad Move");
            var player = game.Players.FirstOrDefault(p => p.Id == user.Value);
            if (player is null) return BadRequest("You are not in that game!");
            if (game.NextTurn is null || game.NextTurn.Id != user.Value) return BadRequest("Not your turn");
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

        [HttpGet]
        [Route("/user")]
        public IActionResult GetUser()
        {
            var user = HttpContext.Session.GetInt32(USERID);
            var name = HttpContext.Session.GetString(USERNAME);
            if (user is null || name is null) return BadRequest("Please join server first");
            return Ok(new {id = user.Value, name = name});
        }

        [HttpGet]
        [Route("/users")]
        public IActionResult ListUsers()
        {
            return Ok(Users);
        }
    }
}