export interface SeedMovie {
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  runtime: number;
  language: string;
  country: string;
  imdbRating: number;
  popularity: number;
  voteCount: number;
  trailerUrl: string;
  genres: string[];
  directors: string[];
  cast: { name: string; character: string; photoUrl?: string }[];
}

export const SEED_MOVIES: SeedMovie[] = [
  {
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "1994-09-23T00:00:00.000Z",
    runtime: 142,
    language: "English",
    country: "United States",
    imdbRating: 9.3,
    popularity: 98.5,
    voteCount: 2800000,
    trailerUrl: "https://www.youtube.com/watch?v=PLl99DlL6b4",
    genres: ["Drama", "Crime"],
    directors: ["Frank Darabont"],
    cast: [
      { name: "Tim Robbins", character: "Andy Dufresne" },
      { name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding" },
      { name: "Bob Gunton", character: "Warden Norton" }
    ]
  },
  {
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "1972-03-24T00:00:00.000Z",
    runtime: 175,
    language: "English",
    country: "United States",
    imdbRating: 9.2,
    popularity: 96.2,
    voteCount: 2000000,
    trailerUrl: "https://www.youtube.com/watch?v=sY1S34973zA",
    genres: ["Crime", "Drama"],
    directors: ["Francis Ford Coppola"],
    cast: [
      { name: "Marlon Brando", character: "Don Vito Corleone" },
      { name: "Al Pacino", character: "Michael Corleone" },
      { name: "James Caan", character: "Sonny Corleone" }
    ]
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "2008-07-18T00:00:00.000Z",
    runtime: 152,
    language: "English",
    country: "United States",
    imdbRating: 9.0,
    popularity: 99.4,
    voteCount: 2900000,
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    genres: ["Action", "Crime", "Drama", "Thriller"],
    directors: ["Christopher Nolan"],
    cast: [
      { name: "Christian Bale", character: "Bruce Wayne / Batman" },
      { name: "Heath Ledger", character: "Joker" },
      { name: "Aaron Eckhart", character: "Harvey Dent" },
      { name: "Michael Caine", character: "Alfred" },
      { name: "Gary Oldman", character: "Jim Gordon" }
    ]
  },
  {
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "1994-10-14T00:00:00.000Z",
    runtime: 154,
    language: "English",
    country: "United States",
    imdbRating: 8.9,
    popularity: 95.8,
    voteCount: 2200000,
    trailerUrl: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
    genres: ["Crime", "Drama"],
    directors: ["Quentin Tarantino"],
    cast: [
      { name: "John Travolta", character: "Vincent Vega" },
      { name: "Samuel L. Jackson", character: "Jules Winnfield" },
      { name: "Uma Thurman", character: "Mia Wallace" },
      { name: "Bruce Willis", character: "Butch Coolidge" }
    ]
  },
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "2010-07-16T00:00:00.000Z",
    runtime: 148,
    language: "English",
    country: "United States",
    imdbRating: 8.8,
    popularity: 98.9,
    voteCount: 2500000,
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    genres: ["Action", "Sci-Fi", "Adventure"],
    directors: ["Christopher Nolan"],
    cast: [
      { name: "Leonardo DiCaprio", character: "Dom Cobb" },
      { name: "Joseph Gordon-Levitt", character: "Arthur" },
      { name: "Elliot Page", character: "Ariadne" },
      { name: "Tom Hardy", character: "Eames" },
      { name: "Ken Watanabe", character: "Saito" }
    ]
  },
  {
    title: "Interstellar",
    description: "When Earth becomes increasingly uninhabitable, a team of explorers undertakes the most important mission in human history: traveling beyond this galaxy to discover whether mankind has a future among the stars.",
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "2014-11-07T00:00:00.000Z",
    runtime: 169,
    language: "English",
    country: "United States",
    imdbRating: 8.7,
    popularity: 99.1,
    voteCount: 2100000,
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    directors: ["Christopher Nolan"],
    cast: [
      { name: "Matthew McConaughey", character: "Cooper" },
      { name: "Anne Hathaway", character: "Brand" },
      { name: "Jessica Chastain", character: "Murph" },
      { name: "Michael Caine", character: "Professor Brand" }
    ]
  },
  {
    title: "Parasite",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    posterUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "2019-05-30T00:00:00.000Z",
    runtime: 132,
    language: "Korean",
    country: "South Korea",
    imdbRating: 8.5,
    popularity: 94.7,
    voteCount: 950000,
    trailerUrl: "https://www.youtube.com/watch?v=5xH0RzeSojI",
    genres: ["Drama", "Thriller", "Comedy"],
    directors: ["Bong Joon-ho"],
    cast: [
      { name: "Song Kang-ho", character: "Kim Ki-taek" },
      { name: "Lee Sun-kyun", character: "Park Dong-ik" },
      { name: "Cho Yeo-jeong", character: "Park Yeon-kyo" },
      { name: "Choi Woo-shik", character: "Kim Ki-woo" }
    ]
  },
  {
    title: "Spirited Away",
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches and spirits, where humans are changed into beasts.",
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "2001-07-20T00:00:00.000Z",
    runtime: 125,
    language: "Japanese",
    country: "Japan",
    imdbRating: 8.6,
    popularity: 91.3,
    voteCount: 840000,
    trailerUrl: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    genres: ["Animation", "Adventure", "Family", "Fantasy"],
    directors: ["Hayao Miyazaki"],
    cast: [
      { name: "Rumi Hiiragi", character: "Chihiro (voice)" },
      { name: "Miyu Irino", character: "Haku (voice)" },
      { name: "Mari Natsuki", character: "Yubaba (voice)" }
    ]
  },
  {
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "2023-07-21T00:00:00.000Z",
    runtime: 180,
    language: "English",
    country: "United States",
    imdbRating: 8.9,
    popularity: 97.4,
    voteCount: 780000,
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    genres: ["Biography", "Drama", "History"],
    directors: ["Christopher Nolan"],
    cast: [
      { name: "Cillian Murphy", character: "J. Robert Oppenheimer" },
      { name: "Emily Blunt", character: "Katherine 'Kitty' Oppenheimer" },
      { name: "Matt Damon", character: "Leslie Groves" },
      { name: "Robert Downey Jr.", character: "Lewis Strauss" },
      { name: "Florence Pugh", character: "Jean Tatlock" }
    ]
  },
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    posterUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80",
    releaseDate: "2024-03-01T00:00:00.000Z",
    runtime: 166,
    language: "English",
    country: "United States",
    imdbRating: 8.6,
    popularity: 99.8,
    voteCount: 520000,
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    genres: ["Action", "Adventure", "Drama", "Sci-Fi"],
    directors: ["Denis Villeneuve"],
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides" },
      { name: "Zendaya", character: "Chani" },
      { name: "Rebecca Ferguson", character: "Lady Jessica" },
      { name: "Javier Bardem", character: "Stilgar" },
      { name: "Austin Butler", character: "Feyd-Rautha" }
    ]
  }
];
