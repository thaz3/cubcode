export const READING_LIST_CATEGORIES = [
  "Early Childhood & Picture Books",
  "Early Chapter Books & Transitional Readers",
  "Middle Grade Fiction",
  "Young Adult & Crossover Literature",
  "Graphic Novels & Visual Narratives",
  "Historical Fiction",
  "Biographies & Primary Narratives",
] as const;

export type ReadingListCategory = (typeof READING_LIST_CATEGORIES)[number];

export type FrederickDouglassReadingBook = {
  slug: string;
  title: string;
  author: string;
  category: ReadingListCategory;
  ageRange: string;
  whyRead: string;
  coverUrl?: string;
  isbn?: string;
};

export const OTHER_READING_CHOICE = "Other / My own choice";

const CATEGORY_AGE_RANGES: Record<ReadingListCategory, string> = {
  "Early Childhood & Picture Books": "Ages 3–8",
  "Early Chapter Books & Transitional Readers": "Ages 6–10",
  "Middle Grade Fiction": "Ages 8–12",
  "Young Adult & Crossover Literature": "Ages 12+",
  "Graphic Novels & Visual Narratives": "Ages 10+",
  "Historical Fiction": "Ages 12+",
  "Biographies & Primary Narratives": "Ages 12+",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type BookSeed = {
  title: string;
  author: string;
  category: ReadingListCategory;
  whyRead: string;
  ageRange?: string;
  coverUrl?: string;
  isbn?: string;
};

const BOOK_SEEDS: BookSeed[] = [
  {
    title: "The Snowy Day",
    author: "Ezra Jack Keats",
    category: "Early Childhood & Picture Books",
    whyRead: "A classic picture book about wonder, play, and seeing the world with fresh eyes.",
    isbn: "9780140501827",
  },
  {
    title: "Hair Love",
    author: "Matthew A. Cherry",
    category: "Early Childhood & Picture Books",
    whyRead: "A father and daughter story about care, confidence, and loving your identity.",
    isbn: "9780525553366",
  },
  {
    title: "Crown: An Ode to the Fresh Cut",
    author: "Derrick Barnes",
    category: "Early Childhood & Picture Books",
    whyRead: "Celebrates barbershop culture, pride, and the power of presentation.",
    isbn: "9781572842243",
  },
  {
    title: "Sulwe",
    author: "Lupita Nyong'o",
    category: "Early Childhood & Picture Books",
    whyRead: "Explores beauty, self-worth, and learning to shine in your own way.",
    isbn: "9781534425361",
  },
  {
    title: "Amazing Grace",
    author: "Mary Hoffman",
    category: "Early Childhood & Picture Books",
    whyRead: "Grace imagines herself into any story — a lesson in voice and possibility.",
    isbn: "9780803710405",
  },
  {
    title: "Firebird",
    author: "Misty Copeland",
    category: "Early Childhood & Picture Books",
    whyRead: "Encouragement to dream big and persist through doubt and hard work.",
    isbn: "9780399166150",
  },
  {
    title: "Jabari Jumps",
    author: "Gaia Cornwall",
    category: "Early Childhood & Picture Books",
    whyRead: "A gentle story about courage, family support, and trying something new.",
    isbn: "9780763678388",
  },
  {
    title: "Meet Danitra Brown",
    author: "Nikki Grimes",
    category: "Early Childhood & Picture Books",
    whyRead: "Poetry about friendship, city life, and Black girl joy.",
    isbn: "9780688164158",
  },
  {
    title: "Zoey and Sassafras: Dragons and Marshmallows",
    author: "Asia Citro",
    category: "Early Chapter Books & Transitional Readers",
    whyRead: "Science, magic, and problem-solving for early independent readers.",
    isbn: "9781943147130",
  },
  {
    title: "The King of Kindergarten",
    author: "Derrick Barnes",
    category: "Early Chapter Books & Transitional Readers",
    whyRead: "A confident start to school with warmth, humor, and pride.",
    isbn: "9780525516286",
  },
  {
    title: "Ways to Make Sunshine",
    author: "Renée Watson",
    category: "Middle Grade Fiction",
    whyRead: "Ryan Hart finds light and resilience through family and community.",
    isbn: "9781547600564",
  },
  {
    title: "Mia Mayhem Is a Superhero!",
    author: "Kara West",
    category: "Early Chapter Books & Transitional Readers",
    whyRead: "A fun early chapter series about discovering hidden strengths.",
    isbn: "9781481487604",
  },
  {
    title: "Jaden Toussaint, the Greatest Episode 1: The Quest for Screen Time",
    author: "Marti Dumas",
    category: "Early Chapter Books & Transitional Readers",
    whyRead: "Smart, funny hero who uses reasoning and creativity to solve problems.",
    isbn: "9780995451707",
  },
  {
    title: "Planet Omar: Accidental Trouble Magnet",
    author: "Zanib Mian",
    category: "Early Chapter Books & Transitional Readers",
    whyRead: "Humor and heart while navigating school, identity, and belonging.",
    isbn: "9781444950402",
  },
  {
    title: "The Watsons Go to Birmingham – 1963",
    author: "Christopher Paul Curtis",
    category: "Middle Grade Fiction",
    whyRead: "Family road trip meets Civil Rights history through a kid’s eyes.",
    isbn: "9780440228004",
  },
  {
    title: "Ghost",
    author: "Jason Reynolds",
    category: "Middle Grade Fiction",
    whyRead: "A runner confronts trauma, anger, and what it means to belong on a team.",
    isbn: "9781481450157",
  },
  {
    title: "Amari and the Night Brothers",
    author: "B.B. Alston",
    category: "Middle Grade Fiction",
    whyRead: "Fantasy adventure rooted in loyalty, mystery, and self-belief.",
    isbn: "9780062975169",
  },
  {
    title: "From the Desk of Zoe Washington",
    author: "Janae Marks",
    category: "Middle Grade Fiction",
    whyRead: "Justice, family secrets, and baking your way toward the truth.",
    isbn: "9780062875858",
  },
  {
    title: "One Crazy Summer",
    author: "Rita Williams-Garcia",
    category: "Middle Grade Fiction",
    whyRead: "Three sisters discover Black Power movement history and their own voices.",
    isbn: "9780060760885",
  },
  {
    title: "Tristan Strong Punches a Hole in the Sky",
    author: "Kwame Mbalia",
    category: "Middle Grade Fiction",
    whyRead: "African American folk heroes and myths reimagined as epic adventure.",
    isbn: "9781368039932",
  },
  {
    title: "The Stars Beneath Our Feet",
    author: "David Barclay Moore",
    category: "Middle Grade Fiction",
    whyRead: "Grief, community, and art as survival in urban America.",
    isbn: "9781524701276",
  },
  {
    title: "The Crossover",
    author: "Kwame Alexander",
    category: "Young Adult & Crossover Literature",
    whyRead: "Novel in verse about basketball, brotherhood, and growing up.",
    isbn: "9780544107717",
  },
  {
    title: "The Hate U Give",
    author: "Angie Thomas",
    category: "Young Adult & Crossover Literature",
    whyRead: "A powerful story about police violence, activism, and finding your voice.",
    isbn: "9780062498533",
  },
  {
    title: "Pet",
    author: "Akwaeke Emezi",
    category: "Young Adult & Crossover Literature",
    whyRead: "A speculative tale about justice, monsters, and protecting the vulnerable.",
    isbn: "9780525647072",
  },
  {
    title: "Legendborn",
    author: "Tracy Deonn",
    category: "Young Adult & Crossover Literature",
    whyRead: "Arthurian legend meets Southern Black magic and secret societies.",
    isbn: "9781534441606",
  },
  {
    title: "Brown Girl Dreaming",
    author: "Jacqueline Woodson",
    category: "Young Adult & Crossover Literature",
    whyRead: "Memoir in verse about childhood, Jim Crow, and becoming a writer.",
    isbn: "9780147515827",
  },
  {
    title: "The Fire Next Time",
    author: "James Baldwin",
    category: "Young Adult & Crossover Literature",
    whyRead: "Essential essays on race, faith, and freedom in America.",
    isbn: "9780679744726",
  },
  {
    title: "March Trilogy",
    author: "John Lewis, Andrew Aydin, and Nate Powell",
    category: "Graphic Novels & Visual Narratives",
    whyRead: "Congressman John Lewis’s Civil Rights journey in graphic memoir form.",
    isbn: "9781603093958",
  },
  {
    title: "Kindred Graphic Novel Adaptation",
    author: "Octavia Butler, adapted by Damian Duffy and John Jennings",
    category: "Graphic Novels & Visual Narratives",
    whyRead: "Time-travel story that forces a confrontation with slavery’s legacy.",
    isbn: "9781419709470",
  },
  {
    title: "The Underground Railroad",
    author: "Colson Whitehead",
    category: "Historical Fiction",
    whyRead: "Reimagines the Underground Railroad as a literal escape network.",
    isbn: "9780345804327",
  },
  {
    title: "Copper Sun",
    author: "Sharon Draper",
    category: "Historical Fiction",
    whyRead: "Unflinching story of survival from capture through enslavement.",
    isbn: "9781416953484",
  },
  {
    title: "The Moor's Account",
    author: "Laila Lalami",
    category: "Historical Fiction",
    whyRead: "Reclaims a silenced voice from the era of colonial exploration.",
    isbn: "9780804170620",
  },
  {
    title: "Narrative of the Life of Frederick Douglass, an American Slave",
    author: "Frederick Douglass",
    category: "Biographies & Primary Narratives",
    whyRead: "Douglass’s own account of literacy, resistance, and escape.",
    isbn: "9780486284996",
  },
  {
    title: "Incidents in the Life of a Slave Girl",
    author: "Harriet Jacobs",
    category: "Biographies & Primary Narratives",
    whyRead: "A firsthand narrative of courage, family, and freedom seeking.",
    isbn: "9780486410609",
  },
  {
    title: "Harriet Tubman: The Road to Freedom",
    author: "Catherine Clinton",
    category: "Biographies & Primary Narratives",
    whyRead: "Biography of Tubman’s strategy, faith, and leadership on the road to freedom.",
    isbn: "9780316155943",
  },
];

export const frederickDouglassReadingList: FrederickDouglassReadingBook[] = BOOK_SEEDS.map(
  (book) => ({
    slug: slugify(book.title),
    title: book.title,
    author: book.author,
    category: book.category,
    ageRange: book.ageRange ?? CATEGORY_AGE_RANGES[book.category],
    whyRead: book.whyRead,
    ...(book.coverUrl ? { coverUrl: book.coverUrl } : {}),
    ...(book.isbn ? { isbn: book.isbn } : {}),
  }),
);

export function readingListBooksByCategory(
  category: ReadingListCategory,
): FrederickDouglassReadingBook[] {
  return frederickDouglassReadingList.filter((book) => book.category === category);
}

export function getReadingListBookBySlug(slug: string): FrederickDouglassReadingBook | undefined {
  return frederickDouglassReadingList.find((book) => book.slug === slug);
}
