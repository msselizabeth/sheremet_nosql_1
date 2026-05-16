
const db = db.getSiblingDB("spotify");

db.tracks.drop();

db.tracks_raw.aggregate([
  {
    $project: {
      track_id: 1,
      track_name: 1,
      album_name: 1,
      explicit: 1,
      popularity: 1,
      duration_ms: 1,
      track_genre: 1,
      artists_raw: "$artists",
      audio_features: {
        danceability: "$danceability",
        energy: "$energy",
        loudness: "$loudness",
        speechiness: "$speechiness",
        acousticness: "$acousticness",
        instrumentalness: "$instrumentalness",
        liveness: "$liveness",
        valence: "$valence",
        tempo: "$tempo",
        key: "$key",
        mode: "$mode",
        time_signature: "$time_signature",
      },
      duration_sec: {
        $round: [{ $divide: ["$duration_ms", 1000] }, 1],
      },
      popularity_tier: {
        $cond: {
          if: { $gte: ["$popularity", 70] },
          then: "high",
          else: {
            $cond: {
              if: { $gte: ["$popularity", 40] },
              then: "medium",
              else: "low",
            },
          },
        },
      },
    },
  },
  {
    $addFields: {
      artists: { $split: ["$artists_raw", ";"] },
    },
  },
  {
    $unset: "artists_raw",
  },
  {
    $out: "tracks",
  },
]);

// Total
console.log(
  `Transformation complete! Total tracks: ${db.tracks.countDocuments({})}`,
);

//  Example
const sampleDoc = db.tracks.findOne({ track_id: "1iJBSr7s7jYXzM8EGcbK5b" });
console.log(JSON.stringify(sampleDoc, null, 2));
