import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryDefinitions = [
  { name: 'Home Decor', slug: 'home-decor', description: 'Warm, considered pieces for calm and personal spaces.', image: 'photo-1616486338812-3dadae4b4ace' },
  { name: 'Pantry & Food', slug: 'pantry-food', description: 'Pantry staples, snacks, breakfast and everyday groceries.', image: 'photo-1542838132-92c53300491e' },
  { name: 'Toiletries & Personal Care', slug: 'personal-care', description: 'Everyday grooming, bath and personal-care essentials.', image: 'photo-1608248543803-ba4f8c70ae0b' },
  { name: 'Cleaning & Laundry', slug: 'cleaning-laundry', description: 'Useful basics for a cleaner, more organised home.', image: 'photo-1585421514284-efb74c2b69ba' },
  { name: 'Stationery & Office', slug: 'stationery-office', description: 'Pens, paper, desk tools and study essentials.', image: 'photo-1455390582262-044cdead277a' },
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Thoughtful kitchen tools, tableware and storage.', image: 'photo-1556911220-bff31c812dba' },
  { name: 'Tech Accessories', slug: 'tech-accessories', description: 'Cables, chargers, stands and everyday tech add-ons.', image: 'photo-1498049794561-7780e7231661' },
  { name: 'Fitness & Wellness', slug: 'fitness-wellness', description: 'Simple gear for movement, recovery and everyday wellbeing.', image: 'photo-1517836357463-d25dfeac3438' },
  { name: 'Fashion & Accessories', slug: 'fashion-accessories', description: 'Easy everyday accessories and wardrobe basics.', image: 'photo-1483985988355-763728e1935b' },
  { name: 'Pet Care & Toys', slug: 'pet-care', description: 'Useful supplies and enrichment for four-legged friends.', image: 'photo-1450778869180-41d0601e046e' },
];

const groups = [
  { category: 'home-decor', base: 249, images: ['photo-1616486338812-3dadae4b4ace','photo-1618221195710-dd6b41faaea6','photo-1616486029423-aaa4789e8c9a'], items: ['Linen Cushion Cover Set of 2','Textured Ceramic Bud Vase','Minimal Table Lamp','Cotton Throw Blanket','Framed Botanical Wall Art','Rattan Storage Basket','Scented Soy Candle','Stoneware Planter Pot','Woven Table Runner','Abstract Desk Sculpture','Soft Cotton Area Rug','Wall-Mounted Key Holder','Glass Flower Vase','Decorative Mirror Tray','Warm LED Fairy Lights'] },
  { category: 'pantry-food', base: 59, images: ['photo-1542838132-92c53300491e','photo-1547592180-85f173990554','photo-1490645935967-10de6ba17061'], items: ['Rolled Oats 500 g','Whole Wheat Pasta 500 g','Roasted Makhana 100 g','Peanut Butter 340 g','Dark Chocolate 70% 100 g','Masala Chai Tea Bags 25 count','Basmati Rice 1 kg','Mixed Nuts 200 g','Granola Breakfast Mix 400 g','Organic Jaggery Powder 500 g','Instant Coffee 100 g','Chickpeas 500 g','Multigrain Crackers 200 g','Cocoa Powder 100 g','Dried Cranberries 150 g'] },
  { category: 'personal-care', base: 79, images: ['photo-1608248543803-ba4f8c70ae0b','photo-1556228720-195a672e8a03','photo-1608571423902-eed4a5ad8108'], items: ['Daily Hydrating Face Wash 100 ml','Gentle Body Wash 250 ml','Moisturising Hand Cream 75 ml','Aloe Vera Body Lotion 200 ml','Mint Toothpaste Twin Pack','Soft Bristle Toothbrush Set of 4','Fluoride Mouthwash 250 ml','Rose Water Toner 100 ml','Lip Balm Duo','Nourishing Hair Conditioner 180 ml','Everyday Shampoo 200 ml','Sunscreen SPF 50 50 g','Cotton Face Towels Set of 3','Bamboo Hair Brush','Gentle Makeup Remover 100 ml'] },
  { category: 'cleaning-laundry', base: 69, images: ['photo-1585421514284-efb74c2b69ba','photo-1563453392212-326f5e854473','photo-1528740561666-dc2479dc08ab'], items: ['Concentrated Dishwash Liquid 500 ml','Laundry Detergent 1 kg','Microfiber Cleaning Cloth Set','Multi-Surface Cleaner 500 ml','Reusable Kitchen Sponge Set','Toilet Cleaning Gel 500 ml','Fabric Freshener 250 ml','Lint Roller with 2 Refills','Floor Cleaner 1 L','Dish Scrub Brush','Garbage Bags Medium 30 count','Glass Cleaner Spray 500 ml','Laundry Mesh Wash Bags Set','Rubber Cleaning Gloves','Drain Freshener Blocks'] },
  { category: 'stationery-office', base: 29, images: ['photo-1455390582262-044cdead277a','photo-1517842645767-c639042777db','photo-1453738773917-9c3eff1db985'], items: ['Hardcover Ruled Notebook A5','Pastel Highlighter Set of 6','Black Gel Pens Pack of 5','Mechanical Pencil 0.5 mm','Weekly Desk Planner','Sticky Notes Multi-Pack','Fine-Liner Pen Set of 10','Document Folder Set of 3','Grid Journal A5','Desk Organiser Tray','Watercolour Pencils Set of 12','Correction Tape Twin Pack','Index Tabs Set','Minimalist Bookmark Set','Study Flash Cards Pack'] },
  { category: 'kitchen-dining', base: 99, images: ['photo-1556911220-bff31c812dba','photo-1556911220-e15b29be8c8f','photo-1556912172-45b7abe8b7e1'], items: ['Glass Food Storage Set of 3','Stainless Steel Water Bottle 750 ml','Ceramic Mug Pair','Silicone Spatula Set','Bamboo Cutting Board','Measuring Cup and Spoon Set','Cotton Kitchen Towel Set','Airtight Pantry Jar Set','Stainless Steel Lunch Box','Oil Dispenser Bottle','Manual Citrus Juicer','Reusable Food Wrap Set','Minimal Dinner Plate Set of 2','Tea Infuser with Mug','Stackable Fridge Organiser'] },
  { category: 'tech-accessories', base: 149, images: ['photo-1498049794561-7780e7231661','photo-1519389950473-47ba0277781c','photo-1517336714731-489689fd1ca8'], items: ['Braided USB-C Cable 2 m','65 W USB-C Wall Charger','Adjustable Laptop Stand','Foldable Phone Stand','Wireless Mouse','Compact Bluetooth Keyboard','Laptop Sleeve 14 inch','USB-C Multiport Hub','Cable Organiser Clips','Screen Cleaning Kit','Magnetic Charging Cable','Webcam Privacy Cover Set','Universal Travel Adapter','Desk Headphone Stand','Portable SSD Case'] },
  { category: 'fitness-wellness', base: 199, images: ['photo-1517836357463-d25dfeac3438','photo-1579758629938-03607ccdbaba','photo-1544367567-0f2fcb009e0b'], items: ['Resistance Bands Set of 5','Yoga Mat 6 mm','Stainless Steel Shaker Bottle','Foam Roller 30 cm','Jump Rope Adjustable','Cotton Gym Towel','Ankle Weights Pair 1 kg','Yoga Block Pair','Grip Strength Trainer','Running Waist Belt','Stretching Strap','Massage Ball Duo','Lightweight Sports Water Bottle','Workout Log Notebook','Cooling Microfiber Towel'] },
  { category: 'fashion-accessories', base: 129, images: ['photo-1483985988355-763728e1935b','photo-1490481651871-ab68de25d43d','photo-1515886657613-9f3515b0c78f'], items: ['Everyday Canvas Tote Bag','Minimal Gold-Tone Hoop Earrings','Cotton Crew Socks 3-Pack','Classic Baseball Cap','Slim Card Holder','Soft Knit Beanie','Everyday Hair Claw Clip Set','Neutral Cotton Scarf','Adjustable Fabric Belt','Compact Travel Jewellery Case','Canvas Pencil Pouch','Classic Sunglasses','Foldable Shopping Bag','Minimal Pendant Necklace','Everyday Crossbody Pouch'] },
  { category: 'pet-care', base: 89, images: ['photo-1450778869180-41d0601e046e','photo-1548199973-03cce0bbc87b','photo-1583337130417-3346a1be7dee'], items: ['Rope Tug Dog Toy','Cat Teaser Wand','Stainless Steel Pet Bowl','Soft Pet Grooming Brush','Training Treat Pouch','Catnip Plush Mouse Set','Pet Waste Bag Rolls','Adjustable Pet Collar','Slow Feeder Bowl','Washable Pet Blanket','Lint Remover for Pet Hair','Rubber Fetch Ball Set','Pet Shampoo 250 ml','Collapsible Travel Water Bowl','Interactive Treat Puzzle'] },
  { category: 'home-kitchen', base: 149, images: ['photo-1556911220-e15b29be8c8f','photo-1556911220-bff31c812dba','photo-1556912172-45b7abe8b7e1'], items: ['Non-Stick Frying Pan 24 cm','Compact Electric Kettle 1.5 L','Stainless Steel Tongs','Stackable Storage Containers','Manual Vegetable Chopper','Reusable Silicone Baking Mat','Insulated Lunch Tote','Dish Drying Rack','Digital Kitchen Scale','French Press Coffee Maker','Cotton Apron with Pockets','Spice Jar Set of 6','Over-Sink Colander','Reusable Ice Cube Tray','Compact Sandwich Maker'] },
];

async function main() {
  console.log('Adding the expanded NexStore demo catalog without deleting existing records...');
  const categories = new Map<string, { id: string }>();
  for (const item of categoryDefinitions) {
    const category = await prisma.category.upsert({
      where: { slug: item.slug },
      update: { name: item.name, description: item.description, image: `https://images.unsplash.com/${item.image}?w=700&auto=format&fit=crop&q=80` },
      create: { name: item.name, slug: item.slug, description: item.description, image: `https://images.unsplash.com/${item.image}?w=700&auto=format&fit=crop&q=80` },
      select: { id: true },
    });
    categories.set(item.slug, category);
  }
  const homeKitchen = await prisma.category.findUnique({ where: { slug: 'home-kitchen' }, select: { id: true } });
  if (homeKitchen) categories.set('home-kitchen', homeKitchen);

  const vendorSlugs = ['electrohub-direct', 'gadgetworld-superstore', 'ecoliving-earth-essentials'];
  const vendors = await Promise.all(vendorSlugs.map((slug) => prisma.vendor.findUnique({ where: { slug }, select: { id: true, slug: true } })));
  if (vendors.some((vendor) => !vendor)) {
    throw new Error('Demo vendors are missing. Create/approve the three demo vendors before running this catalog seed.');
  }
  const validVendors = vendors as Array<{ id: string; slug: string }>;
  let added = 0;
  let skipped = 0;
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];
    const category = categories.get(group.category);
    if (!category) throw new Error(`Required category is missing: ${group.category}`);
    for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
      const title = group.items[itemIndex];
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + groupIndex + '-' + itemIndex;
      const exists = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
      if (exists) { skipped++; continue; }
      const price = group.base + ((itemIndex * 137 + groupIndex * 83) % Math.max(180, group.base * 4));
      const compareAtPrice = Math.round(price * (1.12 + ((itemIndex + groupIndex) % 4) * 0.06));
      const image = group.images[itemIndex % group.images.length];
      await prisma.product.create({ data: {
        vendorId: validVendors[(groupIndex + itemIndex) % validVendors.length].id,
        categoryId: category.id,
        title,
        slug,
        description: `${title} — a practical everyday pick selected for quality, useful design and easy daily use. Check the product details and seller information before ordering.`,
        price,
        compareAtPrice,
        discountPercent: Math.round((1 - price / compareAtPrice) * 100),
        stock: 8 + ((groupIndex * 11 + itemIndex * 7) % 73),
        images: JSON.stringify([`https://images.unsplash.com/${image}?w=800&auto=format&fit=crop&q=80`]),
        sku: `NX-${String(groupIndex + 1).padStart(2, '0')}-${String(itemIndex + 1).padStart(3, '0')}`,
        catalogGroup: null,
        isEcoFriendly: false,
        rating: Number((4.1 + ((groupIndex + itemIndex) % 9) / 10).toFixed(1)),
        numReviews: (groupIndex * 7 + itemIndex * 3) % 38,
        isActive: true,
        isFeatured: itemIndex < 2 && groupIndex < 5,
      }});
      added++;
    }
  }
  console.log(`Catalog seed complete. Added: ${added}; already present: ${skipped}; target: 150 sample listings.`);
}

main().catch((error) => {
  console.error('Expanded catalog seed failed:', error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
