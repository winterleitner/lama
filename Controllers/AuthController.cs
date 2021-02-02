using System.Linq;
using System.Threading.Tasks;
using lama.Database;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lama.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : Controller
    {
        private UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        private LamaContext _context;

        public AuthController(UserManager<User> umg, SignInManager<User> smg, LamaContext context)
        {
            _userManager = umg;
            _signInManager = smg;
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userManager.GetUserAsync(this.User);
            user.Games = _context.GamePlayers.Include(p => p.Game).Where(g => g.Player == user).ToList();
            return Ok(new {user.UserName, user.Email, user.Elo, Games = user.Games.Select(g => new {g.Game.Id, g.Rank})});
        }

        [HttpGet]
        [Route("{userName}")]
        public async Task<IActionResult> GetUserProfile(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user is null) return NotFound();
            return Ok(new {user.Elo, user.Games, user.UserName});
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromForm] string username, [FromForm] string password)
        {
            var result = await _signInManager.PasswordSignInAsync(username, password, true, false);

            if (result.Succeeded)
            {
                return Ok();
            }

            return Unauthorized();
        }

        [HttpDelete]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok();
        }

        [HttpGet]
        [Authorize]
        [Route("delete")]
        public async Task<IActionResult> GetDeleteId()
        {
            var user = await _userManager.GetUserAsync(this.User);
            return Ok(new {user.Id});
        }

        [HttpDelete]
        [Route("{userId}")]
        public async Task<IActionResult> DeleteAccount(string userId)
        {
            var res = await _userManager.DeleteAsync(await _userManager.FindByIdAsync(userId));
            if (res.Succeeded) return Ok();
            return BadRequest();
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromForm] string email, [FromForm] string username,
            [FromForm] string password)
        {
            var user = new User
            {
                UserName = username,
                Email = email,
                Elo = 1200
            };

            var result = await _userManager.CreateAsync(user, password);

            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);

                return Ok();
            }

            return BadRequest("Invalid Registering Attempt");
        }
    }
}