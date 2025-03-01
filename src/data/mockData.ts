
import { Book } from "../types";

export const genres = [
  "Fiction",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Horror",
  "Thriller",
  "Historical Fiction",
  "Biography",
  "Self-Help",
  "Business",
  "Science",
  "Philosophy",
  "Poetry",
  "Children's",
  "Young Adult",
  "Travel",
  "Cooking",
  "Art",
  "History"
];

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582759969i/40097951.jpg",
    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
    genres: ["Mystery", "Thriller", "Fiction"],
    rating: 4.5,
    releaseDate: "2019-02-05",
    pages: 336
  },
  {
    id: "2",
    title: "Dune",
    author: "Frank Herbert",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange, a drug capable of extending life and enhancing consciousness.",
    genres: ["Science Fiction", "Fantasy", "Fiction"],
    rating: 4.7,
    releaseDate: "1965-08-01",
    pages: 412
  },
  {
    id: "3",
    title: "The Midnight Library",
    author: "Matt Haig",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices...",
    genres: ["Fiction", "Fantasy", "Science Fiction"],
    rating: 4.3,
    releaseDate: "2020-08-13",
    pages: 304
  },
  {
    id: "4",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    genres: ["Self-Help", "Business", "Science"],
    rating: 4.8,
    releaseDate: "2018-10-16",
    pages: 320
  },
  {
    id: "5",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582135294i/36809135.jpg",
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl.",
    genres: ["Fiction", "Mystery", "Historical Fiction"],
    rating: 4.6,
    releaseDate: "2018-08-14",
    pages: 379
  },
  {
    id: "6",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1603206535i/54120408.jpg",
    description: "From her place in the store, Klara, an Artificial Friend with outstanding observational qualities, watches carefully the behavior of those who come in to browse, and of those who pass on the street outside.",
    genres: ["Science Fiction", "Fiction", "Literary Fiction"],
    rating: 4.1,
    releaseDate: "2021-03-02",
    pages: 303
  },
  {
    id: "7",
    title: "The Four Winds",
    author: "Kristin Hannah",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1607697326i/53138081.jpg",
    description: "Texas, 1934. Millions are out of work and a drought has broken the Great Plains. Farmers are fighting to keep their land and their livelihoods as the crops are failing, the water is drying up, and dust threatens to bury them all.",
    genres: ["Historical Fiction", "Fiction", "Romance"],
    rating: 4.4,
    releaseDate: "2021-02-02",
    pages: 454
  },
  {
    id: "8",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg",
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the Earth itself will perish. Except that right now, he doesn't know that. He can't even remember his own name, let alone the nature of his assignment or how to complete it.",
    genres: ["Science Fiction", "Fiction", "Thriller"],
    rating: 4.7,
    releaseDate: "2021-05-04",
    pages: 496
  },
  {
    id: "9",
    title: "The Vanishing Half",
    author: "Brit Bennett",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1577090827i/51791252.jpg",
    description: "The Vignes twin sisters will always be identical. But after growing up together in a small, southern black community and running away at age sixteen, it's not just the shape of their daily lives that is different as adults, it's everything: their families, their communities, their racial identities.",
    genres: ["Fiction", "Historical Fiction", "Mystery"],
    rating: 4.2,
    releaseDate: "2020-06-02",
    pages: 343
  },
  {
    id: "10",
    title: "Educated",
    author: "Tara Westover",
    coverImage: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg",
    description: "Tara Westover was 17 the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she prepared for the end of the world by stockpiling home-canned peaches and sleeping with her 'head-for-the-hills' bag.",
    genres: ["Biography", "Memoir", "Non-Fiction"],
    rating: 4.5,
    releaseDate: "2018-02-20",
    pages: 334
  }
];
