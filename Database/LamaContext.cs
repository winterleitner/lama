using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace lama.Database
{
    public partial class LamaContext : ApiAuthorizationDbContext<User>
    {
        public virtual DbSet<StoredGame> Games { get; set; }
        public virtual DbSet<StoredGamePlayers> GamePlayers { get; set; }
        
        public LamaContext(DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions) : base(options, operationalStoreOptions)
        {
        }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<StoredGamePlayers>(entity =>
            {
                entity.HasKey(e => new {e.GameId, e.PlayerId});
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}