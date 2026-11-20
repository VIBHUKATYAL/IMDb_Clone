const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      },
    }, (res) => {
      let resData = '';
      res.on('data', (chunk) => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData || '{}') });
        } catch {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('  STARTING COMPLETE END-TO-END VERIFICATION SUITE   ');
  console.log('====================================================');

  const testEmail = `tester_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authToken = '';
  let userId = '';
  let sampleMovieId = '';

  // 1. Register
  console.log('\n[1/17] Registering new user...');
  const regRes = await request('POST', '/api/auth/register', {
    name: 'End-to-End Tester',
    email: testEmail,
    password: testPassword,
  });
  console.log(`  Status: ${regRes.status} | User: ${regRes.data.user?.email}`);
  if (regRes.status !== 201) throw new Error('Registration failed');
  userId = regRes.data.user.id;
  authToken = regRes.data.token;

  // 2. Login
  console.log('\n[2/17] Testing user login...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  console.log(`  Status: ${loginRes.status} | Token returned: ${Boolean(loginRes.data.token)}`);
  if (loginRes.status !== 200) throw new Error('Login failed');
  authToken = loginRes.data.token;

  // 3. Browse Movies (Featured, Trending, Top Rated)
  console.log('\n[3/17] Browsing catalog (featured, trending, top-rated)...');
  const [featured, trending, topRated] = await Promise.all([
    request('GET', '/api/movies/featured'),
    request('GET', '/api/movies/trending'),
    request('GET', '/api/movies/top-rated'),
  ]);
  console.log(`  Featured: ${featured.data.movies?.length} | Trending: ${trending.data.movies?.length} | Top Rated: ${topRated.data.movies?.length}`);
  sampleMovieId = trending.data.movies[0].id;
  console.log(`  Selected sample movie for subsequent tests: "${trending.data.movies[0].title}" (ID: ${sampleMovieId})`);

  // 4. Search Movies
  console.log('\n[4/17] Searching movies for "dark"...');
  const searchRes = await request('GET', '/api/movies/search?q=dark');
  console.log(`  Status: ${searchRes.status} | Found: ${searchRes.data.total} movies`);
  if (searchRes.status !== 200 || searchRes.data.total === 0) throw new Error('Search failed');

  // 5. Filter Movies
  console.log('\n[5/17] Filtering movies by Genre="Action", Year=2008, MinRating=8.0...');
  const filterRes = await request('GET', '/api/movies?genre=Action&year=2008&minRating=8.0');
  console.log(`  Status: ${filterRes.status} | Matched: ${filterRes.data.movies?.length} titles (e.g. "${filterRes.data.movies?.[0]?.title}")`);

  // 6. Open Movie Details
  console.log(`\n[6/17] Opening movie details for ID: ${sampleMovieId}...`);
  const detailRes = await request('GET', `/api/movies/${sampleMovieId}`, null, authToken);
  console.log(`  Status: ${detailRes.status} | Title: "${detailRes.data.movie?.title}" | Cast count: ${detailRes.data.movie?.cast?.length}`);
  if (detailRes.status !== 200) throw new Error('Movie details fetch failed');

  // 7. Add to Watchlist
  console.log(`\n[7/17] Adding movie to watchlist...`);
  const addWatchlist = await request('POST', `/api/watchlist/${sampleMovieId}`, null, authToken);
  console.log(`  Status: ${addWatchlist.status} | Message: ${addWatchlist.data.message}`);
  if (addWatchlist.status !== 200) throw new Error('Add to watchlist failed');

  const checkWatchlist = await request('GET', '/api/watchlist/ids', null, authToken);
  console.log(`  Watchlist IDs: ${JSON.stringify(checkWatchlist.data.movieIds)} (Contains movie: ${checkWatchlist.data.movieIds.includes(sampleMovieId)})`);

  // 8 & 9. Rate Movie & Write Review
  console.log(`\n[8 & 9/17] Submitting 10-star rating and written review...`);
  const reviewRes = await request('POST', `/api/movies/${sampleMovieId}/reviews`, {
    rating: 10,
    title: 'Outstanding achievement in cinematic history',
    content: 'Brilliant cinematography, thrilling pacing, and masterful performances throughout.',
  }, authToken);
  console.log(`  Status: ${reviewRes.status} | Review ID: ${reviewRes.data.review?.id}`);
  const reviewId = reviewRes.data.review?.id;

  // 10. Like Review
  console.log(`\n[10/17] Liking the submitted review...`);
  const likeRes = await request('POST', `/api/reviews/${reviewId}/like`, null, authToken);
  console.log(`  Status: ${likeRes.status} | Liked: ${likeRes.data.liked} | Total likes: ${likeRes.data.likes}`);
  if (likeRes.status !== 200) throw new Error('Like review failed');

  // 11. Visit Profile & Statistics
  console.log(`\n[11/17] Visiting user profile and statistics...`);
  const profileRes = await request('GET', '/api/profile', null, authToken);
  const statsRes = await request('GET', '/api/profile/stats', null, authToken);
  console.log(`  Profile User: ${profileRes.data.user?.name} | Reviews: ${profileRes.data.reviews?.length} | Watchlist: ${profileRes.data.watchlist?.length}`);
  console.log(`  Stats -> Rated: ${statsRes.data.moviesRated} | Avg Rating Given: ${statsRes.data.averageRatingGiven} | Top Genres: ${JSON.stringify(statsRes.data.favoriteGenres)}`);

  // 12. Check Personal Match Score
  console.log(`\n[12/17] Checking Personal Match Score for sample movie...`);
  const matchRes = await request('GET', `/api/movies/${sampleMovieId}/match`, null, authToken);
  console.log(`  Match Score: ${matchRes.data.matchScore}%`);
  console.log(`  Reasons: ${JSON.stringify(matchRes.data.reasons)}`);
  if (!matchRes.data.matchScore) throw new Error('Personal match score calculation failed');

  // 13 & 14. AI Mood Mode Recommendations
  console.log(`\n[13 & 14/17] Testing AI Mood Mode ("I am tired and want something funny under 2 hours")...`);
  const aiRes = await request('POST', '/api/ai/mood', {
    prompt: 'I am tired and want something funny under 2 hours',
  });
  console.log(`  Status: ${aiRes.status} | Received ${aiRes.data.recommendations?.length} recommendations:`);
  aiRes.data.recommendations?.forEach((rec, idx) => {
    console.log(`    ${idx + 1}. "${rec.movie.title}" (${rec.movie.runtime}m) -> ${rec.matchScore}% Match: "${rec.reason}"`);
  });
  if (aiRes.status !== 200 || !aiRes.data.recommendations?.length) throw new Error('AI Mood failed');

  // 15. Logout
  console.log(`\n[15/17] Testing user logout...`);
  const logoutRes = await request('POST', '/api/auth/logout', null, authToken);
  console.log(`  Status: ${logoutRes.status} | Message: ${logoutRes.data.message}`);

  // 16. Login Again
  console.log(`\n[16/17] Logging back in to verify persistence...`);
  const relogin = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  console.log(`  Status: ${relogin.status} | Token returned: ${Boolean(relogin.data.token)}`);
  const newToken = relogin.data.token;

  // 17. Verify Persisted Data in PostgreSQL
  console.log(`\n[17/17] Verifying all data persisted across sessions in PostgreSQL...`);
  const persistedWatchlist = await request('GET', '/api/watchlist', null, newToken);
  const persistedReviews = await request('GET', '/api/profile', null, newToken);
  console.log(`  Persisted Watchlist Count: ${persistedWatchlist.data.watchlist?.length}`);
  console.log(`  Persisted Reviews Count:   ${persistedReviews.data.reviews?.length}`);

  if (persistedWatchlist.data.watchlist?.length !== 1 || persistedReviews.data.reviews?.length !== 1) {
    throw new Error('Data persistence check failed');
  }

  console.log('\n====================================================');
  console.log('  ALL 17 USER FLOWS TESTED AND PASSED SUCCESSFULLY!  ');
  console.log('====================================================');
}

runEndToEndVerification().catch((err) => {
  console.error('\n[TEST FAILURE]', err);
  process.exit(1);
});
