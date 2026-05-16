
// Use spotify db
const db = db.getSiblingDB("spotify");

// 3.1 Top artist
const topArtistPipeline = [
  { $unwind: "$artists" },
  {
    $group: {
      _id: "$artists",
      track_count: { $sum: 1 },
      avg_pop: { $avg: "$popularity" },
    },
  },
  {
    $match: {
      track_count: { $gte: 5 },
    },
  },
  {
    $sort: { avg_pop: -1 },
  },
  { $limit: 10 },
  {
    $project: {
      _id: 0,
      artist: "$_id",
      avg_pop: { $round: ["$avg_pop", 1] },
    },
  },
];

const topArtists = db.tracks.aggregate(topArtistPipeline).toArray();
// Results
console.log("Part 3 -> Task 1\n");
console.log("Top 10 Artists by popularity and more than 5 tracks:");
console.log(JSON.stringify(topArtists, null, 2), "\n\n");


// 3.2 Distibute by mood
const moodPipeline = [
  {
    $project: {
      mood: {
        $switch: {
          branches: [
            { 
              case: { $and: [ { $gte: ["$audio_features.valence", 0.5] }, { $gte: ["$audio_features.energy", 0.5] } ] }, 
              then: "happy" 
            },
            { 
              case: { $and: [ { $lt: ["$audio_features.valence", 0.5] }, { $gte: ["$audio_features.energy", 0.5] } ] }, 
              then: "angry" 
            },
            { 
              case: { $and: [ { $gte: ["$audio_features.valence", 0.5] }, { $lt: ["$audio_features.energy", 0.5] } ] }, 
              then: "calm" 
            },
            { 
              case: { $and: [ { $lt: ["$audio_features.valence", 0.5] }, { $lt: ["$audio_features.energy", 0.5] } ] }, 
              then: "sad" 
            }
          ],
          default: "neutral"
        }
      }
    }
  },
  {
    $group: {
      _id: "$mood",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
];

const moodDistribution = db.tracks.aggregate(moodPipeline).toArray();
// Results
console.log("Part 3 -> Task 2\n")
console.log("Mood Distribution:");
console.table(moodDistribution);


// 3.3 Dance genre
const danceableGenrePipeline = [
  {
    $group: {
      _id: "$track_genre",
      avg_danceability: { $avg: "$audio_features.danceability" },
      avg_energy: { $avg: "$audio_features.energy" },
      avg_valence: { $avg: "$audio_features.valence" },
      track_count: { $sum: 1 }
    }
  },
  { $match: { track_count: { $gte: 100 } } },
  { $sort: { avg_danceability: -1 } },
  { $limit: 10 },
  {
    $project: {
      _id: 0,
      genre: "$_id",
      avg_danceability: { $round: ["$avg_danceability", 3] },
      avg_energy: { $round: ["$avg_energy", 3] },
      avg_valence: { $round: ["$avg_valence", 3] },
      track_count: 1
    }
  }
];

const bestGenres = db.tracks.aggregate(danceableGenrePipeline).toArray();
// Results
console.log("\n\nPart 3 -> task 3")
console.log("Most Danceable Genres:");
console.log(JSON.stringify(bestGenres, null, 2));
