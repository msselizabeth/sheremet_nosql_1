
// Use spotify db
const db = db.getSiblingDB("spotify");

// 4.1 Analyse Query
const explainBefore = db.tracks.find({ 
  track_genre: "pop", 
  "audio_features.danceability": { $gte: 0.7 } 
}).sort({ popularity: -1 }).explain("executionStats");

console.log("Part 4 -> Task 1\n")
console.log("Before Index:")
console.log(JSON.stringify(explainBefore.executionStats, null, 2), "\n");

// Craete index 
db.tracks.createIndex({ 
  track_genre: 1, 
  popularity: -1, 
  "audio_features.danceability": 1 
});

// Analyse after index
const explainAfter = db.tracks.find({ 
  track_genre: "pop", 
  "audio_features.danceability": { $gte: 0.7 } 
}).sort({ popularity: -1 }).explain("executionStats");


console.log("After Index:")
console.log(JSON.stringify(explainAfter.executionStats, null, 2), "\n\n")


// 4.2 
db.tracks.createIndex({
  "explicit": 1,
  "audio_features.instrumentalness": 1,
  "audio_features.speechiness": 1
});

const explainBackground = db.tracks.find({
  "audio_features.instrumentalness": { $gt: 0.5 },
  "audio_features.speechiness": { $lt: 0.1 },
  "explicit": false
}).explain("executionStats");

console.log("Background Query Analysis:");
console.log(JSON.stringify(explainBackground.executionStats, null, 2), "\n\n");