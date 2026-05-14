// mongosh "mongodb+srv://elizabethsheremet_db_user:X9rICOiM65zySQ5P@nosql-hw-1.zi9kla4.mongodb.net/" queries/part2_queries.js

// Use spotify db
const db = db.getSiblingDB("spotify");

// 2.1 Party Query
const partyQuery = {
  "audio_features.danceability": { $gt: 0.7 },
  "audio_features.energy": { $gt: 0.7 },
  duration_ms: { $gte: 180000, $lte: 300000 },
};

// Execure the party query
// const partyTracks = db.tracks.find(partyQuery).toArray();

// Consle results
// console.log(`Found ${partyTracks.length} tracks for the party!`);
// console.log("Party sample track:");
// console.log(JSON.stringify(partyTracks[0], null, 2));

// 2.2 Popular Artists
const popularArtistsPipeline = [
  { $unwind: "$artists" },
  // group by artist and count tracks
  {
    $group: {
      _id: "$artists",
      track_count: { $sum: 1 },
      min_popularity: { $min: "$popularity" }, 
      avg_popularity: { $avg: "$popularity" }, 
    },
  },
  // match
  {
    $match: {
      track_count: { $gte: 3 },
      min_popularity: { $gte: 60 },
    },
  },
  // sort by AVG DESC
  {
    $sort: { avg_popularity: -1 },
  },
  { $limit: 20},
  // Project output 
  {
    $project: {
      _id: 0, 
      artist: "$_id", 
      track_count: 1,
      min_popularity: 1,
      avg_popularity: { $round: ["$avg_popularity", 1] }
    }
  }
];

// Execute the aggregation
const topArtists = db.tracks.aggregate(popularArtistsPipeline).toArray();

// Console results
console.log("Top 20 Popular Artists:");
console.log(JSON.stringify(topArtists, null, 2));
