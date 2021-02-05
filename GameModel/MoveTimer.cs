using System;
using System.Timers;

namespace lama.Model
{
    public class MoveTimer
    {
        private int _maxTime;
        private Timer _timer;
        private Player _player;
        private int _remainingTime;
        public event EventHandler<Player> Elapsed;
            
        public MoveTimer(int seconds)
        {
            _maxTime = seconds;
            _timer = new Timer()
            {
                AutoReset = true,
                Interval = 1000
            };
            _timer.Elapsed += TimerElapsed;
            _timer.Start();
        }

        private void TimerElapsed(object sender, ElapsedEventArgs args)
        {
            _remainingTime = _remainingTime - 1;
            if (_remainingTime == 0 && _player is not null) Elapsed?.Invoke(this, _player);
        }


        public void Reset(Player p)
        {
            _player = p;
            _remainingTime = _maxTime;
        }
        public int RemainingTime
        {
            get => _remainingTime >= 1 ? _remainingTime : 0;
            private set => _remainingTime = value;
        }
    }
}