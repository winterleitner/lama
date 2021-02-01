namespace lama.Model
{
    public class Move
    {
        public MoveType Type { get; set; }
        public int CardId { get; set; } 
    }
    
    public enum MoveType {
        Fold, DrawCard, PlayCard
    }
}