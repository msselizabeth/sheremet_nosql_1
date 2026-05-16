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
const partyTracks = db.tracks.find(partyQuery).toArray();

// Consle results
console.log("Part 2 -> Task 1\n")
console.log(`Found ${partyTracks.length} tracks for the party!`);
console.log("Party sample track:");
console.log(JSON.stringify(partyTracks[0], null, 2), "\n\n");

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
  { $limit: 20 },
  // Project output
  {
    $project: {
      _id: 0,
      artist: "$_id",
      track_count: 1,
      min_popularity: 1,
      avg_popularity: { $round: ["$avg_popularity", 1] },
    },
  },
];

// Execute the aggregation
const topArtists = db.tracks.aggregate(popularArtistsPipeline).toArray();

// Console results
console.log("Part 2 -> Task 2\n")
console.log("Top 20 Popular Artists:");
console.log(JSON.stringify(topArtists, null, 2), "\n\n");

// 2.3 Non-typicAL tracks
const nonTypicaltracksPipeline = [
  {
    $group: {
      _id: "$track_genre",
      avg_tempo: { $avg: "$audio_features.tempo" },
      std_tempo: { $stdDevPop: "$audio_features.tempo" },
      all_tracks: {
        $push: {
          _id: "$_id",
          track_name: "$track_name",
          popularity: "$popularity",
          artists: "$artists",
          audio_features: { tempo: "$audio_features.tempo" },
        },
      },
    },
  },
  {
    $addFields: {
      outlier_threshold: {
        $add: ["$avg_tempo", { $multiply: [2, "$std_tempo"] }],
      },
    },
  },
  {
    $project: {
      _id: 0,
      genre: "$_id",
      avg_tempo: { $round: ["$avg_tempo", 1] },
      outlier_threshold: { $round: ["$outlier_threshold", 1] },
      outlier_tracks: {
        $filter: {
          input: "$all_tracks",
          as: "track",
          cond: { $gt: ["$$track.audio_features.tempo", "$outlier_threshold"] },
        },
      },
    },
  },
];

const outlierResults = db.tracks.aggregate(nonTypicaltracksPipeline).toArray();

// Console res
console.log("Part 2 -> Task 3\n")
console.log("Outlier Tracks Analysis:");
console.log(JSON.stringify(outlierResults.slice(0, 2), null, 2), "\n\n");

// 2.4 Background Tracks
// Background query
const backgroundQuery = {
  "audio_features.loudness": { $lt: -10 },
  "audio_features.speechiness": { $lt: 0.1 },
  "audio_features.instrumentalness": { $gt: 0.5 },
  explicit: false,
};

const backgroundTracks = db.tracks.find(backgroundQuery).toArray();

// Results
console.log("Part 2 -> Task 4\n")
console.log(`Found ${backgroundTracks.length} tracks for background work.`);

if (backgroundTracks.length > 0) {
  console.log("Sample background track:");
  console.log(JSON.stringify(backgroundTracks[0], null, 2));
}
