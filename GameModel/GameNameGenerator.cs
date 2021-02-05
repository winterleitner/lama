using System;
using System.Collections.Generic;

namespace lama.Model
{
    public class GameNameGenerator
    {
        private static Random _random = new Random();
        private List<string> Parts1 = new List<string>()
        {
            "Drunk", "Dead", "Alive", "Gay", "Happy", "Sad", "Awesome", "Imprisoned", "Aggressive",
            "Peaceful", "Smart", "Dumb", "Illegal", "Confused", "Cooperative", "Vicious", "Determined",
            "Infected", "Mighty", "Vaccined"
        };

        private List<string> Parts2 = new List<string>()
        {
            "Lama", "Hero", "Doge", "Homo", "Fritzl", "Huchen", "Fish", "LeBron", "Pornhub",
            "Idiot", "Nazi", "Leftist", "Hedgefunds", "Broker", "Crocodile", "Redneck", "Alabama", "Missouri", "Kansas", "Ischgl",
            "Covid", "Corona", "2020", "Salmon", "Megalodon", "Godzilla", "Godjira"

        };

        private List<string> Parts3 = new List<string>()
        {
            "Gathering", "Meeting", "Colonoscopy", "MatingRitual", "Ritus", "Orgy", "Congress", "Conference", "Funeral",
            "HipReplacementSurgery", "Destruction", "Fireprobe", "BirthdayParty", "CTScan", "ProstateBiopsy", "Mammography", "Race", "Slalom",
            "Vaccination"
        };

        public string GetRandomName()
        {
            var idx1 = _random.Next(0, Parts1.Count - 1);
            var idx2 = _random.Next(0, Parts2.Count - 1);
            var idx3 = _random.Next(0, Parts3.Count - 1);
            return Parts1[idx1] + Parts2[idx2] + Parts3[idx3];
        }
    }
}