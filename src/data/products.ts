
import type { Product } from '@/types';

// Renamed to initialProducts for clarity, primarily used for seeding now.
export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Stealth Drone X1',
    description: 'Advanced stealth drone with 4K camera and 30-min flight time. Perfect for professional aerial photography and surveillance.',
    price: 499.99,
    imageUrl: 'https://placehold.co/600x401.png', // Changed
    dataAiHint: 'black drone',
    category: 'Drones',
    featured: true,
    stock: 10,
  },
  {
    id: '2',
    name: 'Racing Drone Propellers (4-pack)',
    description: 'High-performance carbon fiber propellers for FPV racing drones. Durable and lightweight for maximum speed.',
    price: 24.99,
    imageUrl: 'https://placehold.co/601x400.png', // Changed
    dataAiHint: 'drone propellers',
    category: 'Drone Parts',
    featured: true,
    stock: 50,
  },
  {
    id: '3',
    name: 'Explorer Drone Z5',
    description: 'Long-range explorer drone with GPS and return-to-home functionality. Up to 5km range and 45-min flight time.',
    price: 799.50,
    imageUrl: 'https://placehold.co/601x401.png', // Changed
    dataAiHint: 'white drone',
    category: 'Drones',
    featured: false,
    stock: 5,
  },
  {
    id: '4',
    name: 'Drone Battery Charger Hub',
    description: 'Intelligent battery charging hub capable of charging up to 4 drone batteries simultaneously. Supports various models.',
    price: 59.99,
    imageUrl: 'https://placehold.co/600x402.png', // Changed
    dataAiHint: 'battery charger',
    category: 'Drone Parts',
    featured: false,
    stock: 20,
  },
  {
    id: '5',
    name: 'Mini Drone Spark',
    description: 'Compact and agile mini drone, great for beginners and indoor flying. Features altitude hold and one-key takeoff/landing.',
    price: 89.99,
    imageUrl: 'https://placehold.co/602x400.png', // Changed
    dataAiHint: 'small drone',
    category: 'Drones',
    featured: true,
    stock: 15,
  },
  {
    id: '6',
    name: 'FPV Goggles Pro',
    description: 'Immersive FPV goggles with dual HD screens and low latency transmission. Experience flight like never before.',
    price: 299.00,
    imageUrl: 'https://placehold.co/602x402.png', // Changed
    dataAiHint: 'fpv goggles',
    category: 'Drone Accessories',
    featured: false,
    stock: 8,
  },
  {
    id: '7',
    name: 'Drone Landing Pad',
    description: 'Portable and waterproof drone landing pad (75cm). Protects your drone during takeoff and landing on various terrains.',
    price: 19.99,
    imageUrl: 'https://placehold.co/600x403.png', // Changed
    dataAiHint: 'landing pad',
    category: 'Drone Accessories',
    featured: false,
    stock: 30,
  },
  {
    id: '8',
    name: 'Brushless Motor Set (4pcs)',
    description: 'High-torque brushless motors for custom drone builds or upgrades. Includes 2 CW and 2 CCW motors.',
    price: 75.00,
    imageUrl: 'https://placehold.co/603x400.png', // Changed
    category: 'Drone Parts',
    featured: true,
    stock: 12,
  }
];

// getProductById is removed as this will be handled by productService.ts
