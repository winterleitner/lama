using System;
using System.Collections.Generic;

namespace lama.Model
{
    public class GameNameGenerator
    {
        private List<string> Parts1 = new List<string>()
        {
            "Drunk", "Dead", "Alive", "Gay", "Happy", "Sad", "Awesome", "Imprisoned", "Aggressive",
            "Peaceful", "Smart", "Dumb", "Illegal", "Confused", "Cooperative", "Vicious", "Determined"
        };

        private List<string> Parts2 = new List<string>()
        {
            "Lama", "Hero", "Doge", "Homo", "Fritzl", "Vuggmar", "Huchen", "Fish", "LeBron", "Pornhub",
            "Idiot", "Nazi", "Leftist", "Hedgefunds", "Broker", "Crocodile", "Redneck"

        };

        private List<string> Parts3 = new List<string>()
        {
            "Gathering", "Meeting", "Versammlung", "MatingRitual", "Ritus", "Orgy", "Congress", "Conference", "Funeral",
            "Kaiserschnitt", "Slaughtering", "Destruction", "Fireprobe", "BirthdayParty"
        };

        public string GetRandomName()
        {
            var rdm = new Random();
            var idx1 = rdm.Next(0, Parts1.Count - 1);
            var idx2 = rdm.Next(0, Parts2.Count - 1);
            var idx3 = rdm.Next(0, Parts3.Count - 1);
            return Parts1[idx1] + Parts2[idx2] + Parts3[idx3];
        }
    }
}