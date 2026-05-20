// ─── Site Configuration ───────────────────────────────────────────────────────

export const siteConfig = {
  name: "Dapur Umi",
  tagline: "Dari Dapur, Sampai Ke Hati",
  description:
    "Luxury homemade bakery crafting premium handcrafted desserts with love. Every bite tells a story of tradition, passion, and artistry.",
  url: "https://dapurumi.com",
  ogImage: "https://dapurumi.com/og.jpg",
  locale: "ms-MY",
  currency: "MYR",
  phone: "+60123456789",
  email: "hello@dapurumi.com",
  address: "No. 12, Jalan Manis, Taman Indah, 47301 Petaling Jaya, Selangor",
  operatingHours: {
    weekdays: "9:00 AM - 8:00 PM",
    weekends: "8:00 AM - 9:00 PM",
    closed: "Isnin (Monday)",
  },
  links: {
    instagram: "https://instagram.com/dapurumi",
    facebook: "https://facebook.com/dapurumi",
    tiktok: "https://tiktok.com/@dapurumi",
    whatsapp: "https://wa.me/60123456789",
  },
  social: {
    instagram: "@dapurumi",
    facebook: "Dapur Umi",
    tiktok: "@dapurumi",
  },
} as const;

// ─── Navigation ───────────────────────────────────────────────────────────────

export const navLinks = [
  { label: "Utama", href: "#home" },
  { label: "Tentang", href: "#about" },
  { label: "Produk", href: "#products" },
  { label: "Galeri", href: "#gallery" },
  { label: "Testimoni", href: "#testimonials" },
  { label: "Soalan Lazim", href: "#faq" },
  { label: "Hubungi", href: "#contact" },
] as const;

export const adminNavLinks = [
  { label: "Papan Pemuka", href: "/admin", icon: "LayoutDashboard" },
  { label: "Produk", href: "/admin/products", icon: "Package" },
  { label: "Kategori", href: "/admin/categories", icon: "Grid3X3" },
  { label: "Galeri", href: "/admin/gallery", icon: "Image" },
  { label: "Testimoni", href: "/admin/testimonials", icon: "MessageSquare" },
  { label: "Soalan Lazim", href: "/admin/faqs", icon: "HelpCircle" },
  { label: "Muat Naik", href: "/admin/uploads", icon: "Upload" },
  { label: "Tetapan", href: "/admin/settings", icon: "Settings" },
] as const;

// ─── Design Tokens ────────────────────────────────────────────────────────────

export const designTokens = {
  colors: {
    cream: "#EFE9E3",
    sand: "#D9CFC7",
    camel: "#C9B59C",
    rose: "#F7A5A5",
    dark: "#1A1614",
    white: "#FDFCFB",
  },
  gradients: {
    luxury: "linear-gradient(135deg, #EFE9E3 0%, #D9CFC7 50%, #C9B59C 100%)",
    warm: "linear-gradient(135deg, #F7A5A5 0%, #C9B59C 100%)",
    cream: "linear-gradient(180deg, #EFE9E3 0%, #FDFCFB 100%)",
    dark: "linear-gradient(180deg, #1A1614 0%, #2D2522 100%)",
    overlay: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)",
  },
  spacing: {
    section: "6rem",
    sectionLg: "8rem",
    sectionXl: "10rem",
    container: "80rem",
    navbarHeight: "4.5rem",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  transitions: {
    fast: "150ms",
    base: "250ms",
    slow: "400ms",
    slower: "600ms",
  },
  borderRadius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    full: "9999px",
  },
} as const;

// ─── Product Categories ───────────────────────────────────────────────────────

export const productCategories = [
  {
    id: "kek",
    name: "Kek & Cake",
    nameEn: "Cakes",
    icon: "🎂",
    description: "Kek premium buatan tangan dengan cita rasa istimewa",
    color: "from-rose-400 to-pink-500",
  },
  {
    id: "pastri",
    name: "Pastri & Tart",
    nameEn: "Pastries & Tarts",
    icon: "🥐",
    description: "Pastri rangup dan tart berkrim yang memikat selera",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "cookies",
    name: "Biskut & Cookies",
    nameEn: "Cookies",
    icon: "🍪",
    description: "Biskut artisan dengan pelbagai perisa unik",
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: "roti",
    name: "Roti & Bread",
    nameEn: "Breads",
    icon: "🍞",
    description: "Roti segar dipanggang setiap hari dengan penuh kasih",
    color: "from-orange-400 to-red-500",
  },
  {
    id: "kuih",
    name: "Kuih Tradisional",
    nameEn: "Traditional Kuih",
    icon: "🧁",
    description: "Kuih warisan Melayu yang dimasak dengan penuh tradisi",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "minuman",
    name: "Minuman",
    nameEn: "Beverages",
    icon: "☕",
    description: "Minuman istimewa untuk melengkapi setiap hidangan",
    color: "from-cyan-400 to-blue-500",
  },
] as const;

// ─── Placeholder Images ───────────────────────────────────────────────────────

export const placeholderImages = {
  hero: [
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1920&q=80",
    "https://images.unsplash.com/photo-1486427944544-d2c246c4df14?w=1920&q=80",
    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80",
  ],
  products: [
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
    "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800&q=80",
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
  ],
  gallery: [
    "https://images.unsplash.com/photo-1486427944544-d2c246c4df14?w=600&q=80",
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80",
    "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=600&q=80",
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80",
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80",
    "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80",
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
  ],
  about: "https://images.unsplash.com/photo-1556217477-d325251ece38?w=1200&q=80",
  bakery: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&q=80",
  testimonials: [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  ],
} as const;

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

export const faqData = [
  {
    question: "Bagaimana cara membuat tempahan?",
    answer:
      "Anda boleh membuat tempahan melalui WhatsApp kami atau terus melalui laman web ini. Kami memerlukan sekurang-kurangnya 3 hari notis untuk tempahan kek khas dan 1 hari untuk item biasa.",
  },
  {
    question: "Adakah penghantaran tersedia?",
    answer:
      "Ya! Kami menyediakan penghantaran ke seluruh Lembah Klang. Caj penghantaran bermula dari RM10 bergantung kepada lokasi. Penghantaran percuma untuk pesanan melebihi RM150.",
  },
  {
    question: "Bolehkah saya menyesuaikan kek saya?",
    answer:
      "Sudah tentu! Kami pakar dalam kek tersuai. Beritahu kami tema, warna, dan perisa pilihan anda, dan kami akan mencipta sesuatu yang istimewa untuk anda.",
  },
  {
    question: "Apakah bahan-bahan yang digunakan?",
    answer:
      "Kami hanya menggunakan bahan-bahan premium dan segar. Mentega Anchor, coklat Belgium Callebaut, tepung organik, dan buah-buahan segar tempatan. Tiada pengawet tiruan.",
  },
  {
    question: "Berapa lama kek boleh disimpan?",
    answer:
      "Kek kami paling sedap dimakan dalam masa 3 hari. Simpan dalam peti sejuk pada suhu 4°C. Keluarkan 30 minit sebelum dihidangkan untuk rasa yang optimum.",
  },
  {
    question: "Adakah pilihan untuk alahan makanan?",
    answer:
      "Ya, kami menyediakan pilihan bebas gluten, bebas kacang, dan vegan. Sila maklumkan kepada kami tentang sebarang alahan semasa membuat tempahan.",
  },
] as const;

// ─── Testimonials Data ────────────────────────────────────────────────────────

export const testimonialData = [
  {
    id: "1",
    name: "Siti Nurhaliza",
    role: "Pelanggan Setia",
    avatar: placeholderImages.testimonials[0],
    content:
      "Kek Red Velvet Dapur Umi memang terbaik! Lembut, moist, dan cream cheese frosting dia perfect. Setiap kali ada celebration, mesti order dari sini.",
    rating: 5,
  },
  {
    id: "2",
    name: "Ahmad Faizal",
    role: "Food Blogger",
    avatar: placeholderImages.testimonials[1],
    content:
      "Sebagai food blogger, saya dah cuba banyak bakery. Tapi Dapur Umi memang stand out dari segi kualiti dan presentation. Setiap kek macam karya seni!",
    rating: 5,
  },
  {
    id: "3",
    name: "Nurul Aisyah",
    role: "Wedding Planner",
    avatar: placeholderImages.testimonials[2],
    content:
      "Saya selalu recommend Dapur Umi untuk wedding cake. Design cantik, rasa sedap, dan servis sangat profesional. Client saya semua puas hati!",
    rating: 5,
  },
  {
    id: "4",
    name: "Rizal Ibrahim",
    role: "Corporate Client",
    avatar: placeholderImages.testimonials[3],
    content:
      "Untuk corporate events kami, Dapur Umi sentiasa deliver on time dengan kualiti yang konsisten. Pastri dan petit fours mereka memang premium class.",
    rating: 5,
  },
] as const;

// ─── Featured Products ────────────────────────────────────────────────────────

export const featuredProducts = [
  {
    id: "1",
    name: "Red Velvet Dream",
    description: "Kek red velvet lembut dengan cream cheese frosting yang mewah",
    price: 120,
    image: placeholderImages.products[0],
    category: "kek",
    isBestSeller: true,
    isNew: false,
  },
  {
    id: "2",
    name: "Chocolate Ganache Tower",
    description: "Tiga lapisan kek coklat Belgium dengan ganache premium",
    price: 150,
    image: placeholderImages.products[1],
    category: "kek",
    isBestSeller: true,
    isNew: false,
  },
  {
    id: "3",
    name: "Butter Croissant",
    description: "Croissant mentega Perancis yang rangup dan berlapis-lapis",
    price: 8,
    image: placeholderImages.products[2],
    category: "pastri",
    isBestSeller: false,
    isNew: true,
  },
  {
    id: "4",
    name: "Matcha Burnt Cheesecake",
    description: "Cheesecake matcha Jepun dengan permukaan caramel yang sempurna",
    price: 95,
    image: placeholderImages.products[3],
    category: "kek",
    isBestSeller: true,
    isNew: false,
  },
  {
    id: "5",
    name: "Salted Caramel Tart",
    description: "Tart karamel masin dengan pastri mentega yang rapuh",
    price: 12,
    image: placeholderImages.products[4],
    category: "pastri",
    isBestSeller: false,
    isNew: true,
  },
  {
    id: "6",
    name: "Artisan Cookie Box",
    description: "Set 12 biskut artisan dengan pelbagai perisa premium",
    price: 45,
    image: placeholderImages.products[5],
    category: "cookies",
    isBestSeller: true,
    isNew: false,
  },
] as const;

// ─── About Content ────────────────────────────────────────────────────────────

export const aboutContent = {
  title: "Kisah Kami",
  subtitle: "Dari Dapur Kecil, Lahir Impian Besar",
  story: [
    "Dapur Umi bermula dari sebuah dapur kecil di rumah, di mana seorang ibu memanggang kek untuk keluarganya dengan penuh kasih sayang. Setiap adunan diadun dengan tangan, setiap hiasan diletakkan dengan teliti.",
    "Hari ini, semangat yang sama masih menjadi teras setiap ciptaan kami. Kami percaya bahawa setiap kek bukan sekadar makanan — ia adalah ungkapan kasih sayang, perayaan kehidupan, dan kenangan yang akan diingati.",
    "Dengan menggunakan bahan-bahan premium dan teknik artisan, kami mencipta hidangan yang bukan sahaja memanjakan lidah, tetapi juga menyentuh hati.",
  ],
  stats: [
    { value: "5000+", label: "Kek Dihasilkan" },
    { value: "3000+", label: "Pelanggan Gembira" },
    { value: "8", label: "Tahun Pengalaman" },
    { value: "50+", label: "Resipi Unik" },
  ],
  values: [
    {
      title: "Buatan Tangan",
      description: "Setiap produk dibuat dengan tangan, bukan mesin",
      icon: "Heart",
    },
    {
      title: "Bahan Premium",
      description: "Hanya bahan berkualiti tinggi yang dipilih",
      icon: "Sparkles",
    },
    {
      title: "Resipi Warisan",
      description: "Gabungan tradisi dan inovasi moden",
      icon: "BookOpen",
    },
  ],
} as const;

// ─── Contact Info ─────────────────────────────────────────────────────────────

export const contactInfo = {
  phone: "+60 12-345 6789",
  email: "hello@dapurumi.com",
  address: "No. 12, Jalan Manis, Taman Indah,\n47301 Petaling Jaya, Selangor",
  mapUrl: "https://maps.google.com/?q=Petaling+Jaya+Selangor",
  hours: [
    { day: "Selasa - Jumaat", time: "9:00 AM - 8:00 PM" },
    { day: "Sabtu - Ahad", time: "8:00 AM - 9:00 PM" },
    { day: "Isnin", time: "Tutup" },
  ],
} as const;

// ─── Supabase Tables ──────────────────────────────────────────────────────────

export const TABLES = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  GALLERY: "gallery",
  TESTIMONIALS: "testimonials",
  SETTINGS: "settings",
  ADMINS: "admins",
  ACTIVITY_LOGS: "activity_logs",
  UPLOADS: "uploads",
  FEATURED_SECTIONS: "featured_sections",
} as const;

// ─── Storage Buckets ──────────────────────────────────────────────────────────

export const BUCKETS = {
  PRODUCT_IMAGES: "product-images",
  GALLERY_IMAGES: "gallery-images",
  HERO_IMAGES: "hero-images",
  TESTIMONIAL_IMAGES: "testimonial-images",
  BRANDING_ASSETS: "branding-assets",
  CMS_ASSETS: "cms-assets",
} as const;
