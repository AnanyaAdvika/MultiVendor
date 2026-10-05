import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing tables in reverse relation order
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.vendorOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Pooja Verma (Admin)',
      phone: '+91 9999900001',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: hashedPassword,
      name: 'Priya Sharma',
      phone: '+91 9876543210',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      email: 'vendor1@example.com',
      password: hashedPassword,
      name: 'Rajesh Kumar',
      phone: '+91 9811122233',
      role: 'VENDOR',
      isActive: true,
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      email: 'vendor2@example.com',
      password: hashedPassword,
      name: 'Aarav Patel',
      phone: '+91 9822233344',
      role: 'VENDOR',
      isActive: true,
    },
  });

  const vendorUser3 = await prisma.user.create({
    data: {
      email: 'vendor3@example.com',
      password: hashedPassword,
      name: 'Dr. Sunita Rao',
      phone: '+91 9833344455',
      role: 'VENDOR',
      isActive: true,
    },
  });

  // 2. Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      storeName: 'ElectroHub Direct',
      slug: 'electrohub-direct',
      description: 'Authorized retailer for premium consumer electronics, audio, and personal computers.',
      logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
      phone: '+91 9811122233',
      address: 'Suite 401, Tech Park, Electronics City, Bengaluru',
      status: 'APPROVED',
      trustScore: 94.5,
      rating: 4.8,
      totalReviews: 48,
      successfulOrders: 142,
      cancelledOrders: 2,
      onTimeDeliveries: 138,
      isEcoFriendlyCertified: false,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      storeName: 'GadgetWorld Superstore',
      slug: 'gadgetworld-superstore',
      description: 'Best wholesale-direct pricing on top tier gadgets, smartphones, and wearables with express delivery.',
      logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200&auto=format&fit=crop&q=80',
      phone: '+91 9822233344',
      address: 'Unit 12, Cyber Gateway, Hitech City, Hyderabad',
      status: 'APPROVED',
      trustScore: 89.0,
      rating: 4.5,
      totalReviews: 35,
      successfulOrders: 98,
      cancelledOrders: 4,
      onTimeDeliveries: 92,
      isEcoFriendlyCertified: false,
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendorUser3.id,
      storeName: 'EcoLiving Earth Essentials',
      slug: 'ecoliving-earth-essentials',
      description: '100% Certified sustainable, plastic-free living goods, fair-trade coffee, and eco gadgets.',
      logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80',
      phone: '+91 9833344455',
      address: '15 Lotus Eco Enclave, Auroville, Pondicherry',
      status: 'APPROVED',
      trustScore: 98.2,
      rating: 4.95,
      totalReviews: 82,
      successfulOrders: 215,
      cancelledOrders: 1,
      onTimeDeliveries: 212,
      isEcoFriendlyCertified: true,
    },
  });

  // 3. Create Categories
  const catElectronics = await prisma.category.create({
    data: {
      name: 'Electronics & Mobiles',
      slug: 'electronics',
      description: 'Laptops, smartphones, smartwatches, and latest personal computing gadgets.',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=80',
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      name: 'Audio & Headphones',
      slug: 'audio',
      description: 'Audiophile grade wireless headphones, earbuds, and spatial audio speakers.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    },
  });

  const catEco = await prisma.category.create({
    data: {
      name: 'Eco-Friendly Living',
      slug: 'eco-friendly',
      description: 'Sustainable, zero-waste, plastic-free everyday lifestyle products.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80',
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Modern cookware, smart organizers, and energy-saving kitchen appliances.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
    },
  });

  // 4. Create Products
  // Best Deal Group 1: Sony WH-1000XM5
  // Vendor 1 sells for ₹26,990. Vendor 2 sells for ₹24,990 (Cheaper by ₹2,000!)
  const pSonyV1 = await prisma.product.create({
    data: {
      vendorId: vendor1.id,
      categoryId: catAudio.id,
      title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones (Midnight Black)',
      slug: 'sony-wh1000xm5-black-electrohub',
      description: 'Industry-leading noise cancellation with two processors and 8 microphones. Up to 30-hour battery life with quick charge. Ultra-comfortable lightweight design.',
      price: 26990,
      compareAtPrice: 34990,
      discountPercent: 23,
      stock: 22,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'AUDIO-SONY-XM5-BLK',
      catalogGroup: 'sony-wh1000xm5',
      isEcoFriendly: false,
      rating: 4.8,
      numReviews: 24,
      isActive: true,
      isFeatured: true,
    },
  });

  const pSonyV2 = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      categoryId: catAudio.id,
      title: 'Sony WH-1000XM5 Premium Noise-Cancelling Headphones (Silver Edition)',
      slug: 'sony-wh1000xm5-silver-gadgetworld',
      description: 'Sony WH-1000XM5 flagship headphones in pristine Platinum Silver. Superlative sound fidelity, crystal-clear hands-free calling, Multipoint connection.',
      price: 24990,
      compareAtPrice: 34990,
      discountPercent: 29,
      stock: 14,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'AUDIO-SONY-XM5-SLV',
      catalogGroup: 'sony-wh1000xm5',
      isEcoFriendly: false,
      rating: 4.7,
      numReviews: 18,
      isActive: true,
      isFeatured: true,
    },
  });

  // Best Deal Group 2: Apple iPhone 15 Pro 128GB
  // Vendor 1 sells for ₹124,900. Vendor 2 sells for ₹121,999 (Cheaper by ₹2,901!)
  const pIphoneV1 = await prisma.product.create({
    data: {
      vendorId: vendor1.id,
      categoryId: catElectronics.id,
      title: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium',
      slug: 'apple-iphone-15-pro-128gb-electrohub',
      description: 'Forged in aerospace-grade titanium with the groundbreaking A17 Pro chip. 48MP main camera system with 3x optical telephoto lens and USB-C speed.',
      price: 124900,
      compareAtPrice: 134900,
      discountPercent: 7,
      stock: 8,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'TECH-IPHONE-15PRO-NAT',
      catalogGroup: 'apple-iphone-15-pro-128',
      isEcoFriendly: false,
      rating: 4.9,
      numReviews: 31,
      isActive: true,
      isFeatured: true,
    },
  });

  const pIphoneV2 = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      categoryId: catElectronics.id,
      title: 'Apple iPhone 15 Pro (128 GB) - Blue Titanium',
      slug: 'apple-iphone-15-pro-128gb-gadgetworld',
      description: 'Apple iPhone 15 Pro in stunning Blue Titanium. A17 Pro GPU for next-level gaming. Action button, 4K Pro-Res recording.',
      price: 121999,
      compareAtPrice: 134900,
      discountPercent: 10,
      stock: 12,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'TECH-IPHONE-15PRO-BLU',
      catalogGroup: 'apple-iphone-15-pro-128',
      isEcoFriendly: false,
      rating: 4.8,
      numReviews: 19,
      isActive: true,
      isFeatured: true,
    },
  });

  // Best Deal Group 3: Apple MacBook Air M3
  // Vendor 1 sells for ₹104,900 (Cheaper by ₹2,600!). Vendor 2 sells for ₹107,500.
  const pMacV1 = await prisma.product.create({
    data: {
      vendorId: vendor1.id,
      categoryId: catElectronics.id,
      title: 'Apple MacBook Air 13" M3 Chip (8-Core CPU, 8GB RAM, 256GB SSD) - Starlight',
      slug: 'apple-macbook-air-m3-electrohub',
      description: 'Supercharged by M3 chip. Strikingly thin design with up to 18 hours battery life. Liquid Retina display supports 1 billion colors.',
      price: 104900,
      compareAtPrice: 114900,
      discountPercent: 9,
      stock: 10,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'TECH-MAC-AIR-M3-STAR',
      catalogGroup: 'apple-macbook-air-m3',
      isEcoFriendly: false,
      rating: 4.9,
      numReviews: 15,
      isActive: true,
      isFeatured: true,
    },
  });

  const pMacV2 = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      categoryId: catElectronics.id,
      title: 'Apple MacBook Air 13" M3 Chip 256GB SSD - Space Gray Edition',
      slug: 'apple-macbook-air-m3-gadgetworld',
      description: 'MacBook Air M3 with MagSafe charging, two Thunderbolt ports, backlit Magic Keyboard with Touch ID.',
      price: 107500,
      compareAtPrice: 114900,
      discountPercent: 6,
      stock: 7,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'TECH-MAC-AIR-M3-GRAY',
      catalogGroup: 'apple-macbook-air-m3',
      isEcoFriendly: false,
      rating: 4.7,
      numReviews: 9,
      isActive: true,
      isFeatured: false,
    },
  });

  // Eco-Friendly Products from Vendor 3 (EcoLiving Essentials)
  const pEcoCutlery = await prisma.product.create({
    data: {
      vendorId: vendor3.id,
      categoryId: catEco.id,
      title: 'Zero-Waste Organic Bamboo Cutlery & Straw Travel Kit',
      slug: 'zero-waste-organic-bamboo-cutlery-kit',
      description: 'Handcrafted portable set includes bamboo fork, spoon, knife, chopsticks, and straw with organic cotton cleaning pouch. 100% plastic-free, washable, and compostable.',
      price: 499,
      compareAtPrice: 899,
      discountPercent: 44,
      stock: 65,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'ECO-BAMBOO-SET-01',
      catalogGroup: 'bamboo-cutlery-kit',
      isEcoFriendly: true,
      ecoDetails: '🌿 100% FSC-Certified Organic Bamboo, Plastic-Free Biodegradable Packaging, Carbon-Neutral Shipping',
      rating: 4.9,
      numReviews: 42,
      isActive: true,
      isFeatured: true,
    },
  });

  const pEcoCoffee = await prisma.product.create({
    data: {
      vendorId: vendor3.id,
      categoryId: catEco.id,
      title: 'Artisan Fair-Trade Shade-Grown Arabica Whole Bean Coffee (500g)',
      slug: 'artisan-fair-trade-shade-grown-coffee',
      description: 'Single-origin estate beans harvested in Western Ghats under native canopy trees. Packaged in 100% backyard-compostable barrier pouch.',
      price: 699,
      compareAtPrice: 950,
      discountPercent: 26,
      stock: 45,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'ECO-COFFEE-ARABICA-500',
      catalogGroup: 'fair-trade-coffee-500',
      isEcoFriendly: true,
      ecoDetails: '🌿 Rainforest Alliance Certified, Fair-Trade Guaranteed, Zero Plastic Jute Packaging',
      rating: 5.0,
      numReviews: 28,
      isActive: true,
      isFeatured: true,
    },
  });

  const pEcoSolar = await prisma.product.create({
    data: {
      vendorId: vendor3.id,
      categoryId: catElectronics.id,
      title: 'Solar-Powered 20,000mAh Rugged Outdoor Power Bank with Dual USB-C PD',
      slug: 'solar-powered-rugged-powerbank-20000mah',
      description: 'High efficiency monocrystalline solar panels with 20W PD fast charging. Enclosure crafted from 85% ocean-bound recycled polymers.',
      price: 2399,
      compareAtPrice: 3499,
      discountPercent: 31,
      stock: 25,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1609592424367-27b61fbe24ba?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'ECO-TECH-SOLAR-PB20',
      catalogGroup: 'solar-powerbank-20000',
      isEcoFriendly: true,
      ecoDetails: '🌿 85% Recycled Ocean Plastic Body, Solar Energy Harnessing, Eco-Friendly Recycled Packaging',
      rating: 4.8,
      numReviews: 36,
      isActive: true,
      isFeatured: true,
    },
  });

  const pEcoBottle = await prisma.product.create({
    data: {
      vendorId: vendor3.id,
      categoryId: catHome.id,
      title: 'Stainless Steel Insulated Temperature-Display Smart Flask 750ml',
      slug: 'smart-insulated-stainless-steel-flask-750ml',
      description: 'Keeps beverages icy cold for 24 hours or piping hot for 12 hours. Touch LCD temperature display on cap. Zero sweat, zero single-use cups.',
      price: 999,
      compareAtPrice: 1599,
      discountPercent: 38,
      stock: 40,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      ]),
      sku: 'ECO-FLASK-750-SLV',
      catalogGroup: 'smart-flask-750',
      isEcoFriendly: true,
      ecoDetails: '🌿 Food Grade 304 Stainless Steel, Eliminates 300+ Single-Use Cups Annually',
      rating: 4.9,
      numReviews: 50,
      isActive: true,
      isFeatured: true,
    },
  });

  // 5. Create Customer Address
  const customerAddress = await prisma.address.create({
    data: {
      userId: customerUser.id,
      fullName: 'Priya Sharma',
      phone: '+91 9876543210',
      street: 'Flat 402, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      country: 'India',
      isDefault: true,
    },
  });

  // 6. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: 'Get 10% off on your first marketplace order!',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 1000,
        maxDiscount: 500,
        isActive: true,
        isEcoOnly: false,
      },
      {
        code: 'ECOSAVE',
        description: 'Special 15% discount for Eco-Friendly green living orders!',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 500,
        maxDiscount: 1000,
        isActive: true,
        isEcoOnly: true,
      },
      {
        code: 'MEGA500',
        description: 'Flat ₹500 instant discount on orders exceeding ₹5,000.',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderAmount: 5000,
        maxDiscount: 500,
        isActive: true,
        isEcoOnly: false,
      },
      {
        code: 'DEAL20',
        description: 'Celebrate Best Deals with 20% off up to ₹1,500.',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 2000,
        maxDiscount: 1500,
        isActive: true,
        isEcoOnly: false,
      },
    ],
  });

  // 7. Create Sample Reviews
  await prisma.review.create({
    data: {
      userId: customerUser.id,
      productId: pSonyV2.id,
      rating: 5,
      comment: 'Saved ₹2,000 by picking GadgetWorld over the other seller! Authentic product, sealed pack, and active noise cancellation is pure magic.',
    },
  });

  await prisma.review.create({
    data: {
      userId: customerUser.id,
      productId: pEcoCutlery.id,
      rating: 5,
      comment: 'Top quality bamboo cutlery. Very smooth, no splinters, and the pouch fits easily into my office bag. Proud to go plastic free!',
    },
  });

  // 8. Create a pre-existing Sample Multi-Vendor Order for Priya to show tracking & splitting
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-9042',
      userId: customerUser.id,
      addressId: customerAddress.id,
      subtotal: 25489,
      discount: 500,
      couponCode: 'MEGA500',
      tax: 0,
      shippingFee: 0,
      totalAmount: 24989,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      orderStatus: 'PARTIALLY_SHIPPED',
      notes: 'Please ring the doorbell upon delivery.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  // Sub-order 1 for GadgetWorld (Sony Headphones)
  const vendorSubOrder1 = await prisma.vendorOrder.create({
    data: {
      orderId: sampleOrder.id,
      vendorId: vendor2.id,
      subtotal: 24990,
      shippingFee: 0,
      commission: 1249.5, // 5% marketplace commission
      vendorEarnings: 23740.5,
      status: 'SHIPPED',
      trackingNumber: 'TRK-GW-982143',
      shippingCarrier: 'BlueDart Express',
      shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      vendorOrderId: vendorSubOrder1.id,
      productId: pSonyV2.id,
      vendorId: vendor2.id,
      title: pSonyV2.title,
      price: pSonyV2.price,
      quantity: 1,
      subtotal: 24990,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      isEcoFriendly: false,
    },
  });

  // Sub-order 2 for EcoLiving (Bamboo Cutlery)
  const vendorSubOrder2 = await prisma.vendorOrder.create({
    data: {
      orderId: sampleOrder.id,
      vendorId: vendor3.id,
      subtotal: 499,
      shippingFee: 0,
      commission: 24.95,
      vendorEarnings: 474.05,
      status: 'DELIVERED',
      trackingNumber: 'TRK-ECO-112233',
      shippingCarrier: 'Delhivery Green',
      shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      vendorOrderId: vendorSubOrder2.id,
      productId: pEcoCutlery.id,
      vendorId: vendor3.id,
      title: pEcoCutlery.title,
      price: pEcoCutlery.price,
      quantity: 1,
      subtotal: 499,
      image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&auto=format&fit=crop&q=80',
      isEcoFriendly: true,
    },
  });

  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      amount: 24989,
      provider: 'UPI',
      transactionId: 'UPI-TXN-2026-9042',
      status: 'COMPLETED',
    },
  });

  // 9. Pre-populate customer Cart with an item to demonstrate Smart Cart Savings
  // We add Sony Headphones from Vendor 1 (₹26,990), so the Smart Savings badge triggers:
  // "You can save ₹2,000 by buying from GadgetWorld Superstore!"
  const customerCart = await prisma.cart.create({
    data: {
      userId: customerUser.id,
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: customerCart.id,
      productId: pSonyV1.id, // ElectroHub at 26,990
      quantity: 1,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS:');
  console.log('Customer : customer@example.com / password123');
  console.log('Vendor 1 : vendor1@example.com / password123 (ElectroHub)');
  console.log('Vendor 2 : vendor2@example.com / password123 (GadgetWorld)');
  console.log('Vendor 3 : vendor3@example.com / password123 (EcoLiving Essentials)');
  console.log('Admin    : admin@example.com / password123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
