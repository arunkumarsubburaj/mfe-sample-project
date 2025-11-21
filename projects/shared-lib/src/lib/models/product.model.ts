export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 79.99,
    description: 'High-quality wireless headphones with noise cancellation',
    image: 'https://placehold.co/300x200/4A90E2/ffffff?text=Headphones',
    category: 'Electronics'
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    description: 'Feature-rich smartwatch with fitness tracking',
    image: 'https://placehold.co/300x200/7B68EE/ffffff?text=Smart+Watch',
    category: 'Electronics'
  },
  {
    id: '3',
    name: 'Laptop Stand',
    price: 49.99,
    description: 'Ergonomic laptop stand for better posture',
    image: 'https://placehold.co/300x200/50C878/ffffff?text=Laptop+Stand',
    category: 'Accessories'
  },
  {
    id: '4',
    name: 'USB-C Hub',
    price: 39.99,
    description: 'Multi-port USB-C hub with HDMI and card readers',
    image: 'https://placehold.co/300x200/FF6B6B/ffffff?text=USB-C+Hub',
    category: 'Accessories'
  },
  {
    id: '5',
    name: 'Mechanical Keyboard',
    price: 129.99,
    description: 'RGB mechanical keyboard with blue switches',
    image: 'https://placehold.co/300x200/FFA07A/ffffff?text=Keyboard',
    category: 'Electronics'
  },
  {
    id: '6',
    name: 'Wireless Mouse',
    price: 29.99,
    description: 'Ergonomic wireless mouse with adjustable DPI',
    image: 'https://placehold.co/300x200/9370DB/ffffff?text=Mouse',
    category: 'Electronics'
  },
  {
    id: '7',
    name: 'Monitor 27"',
    price: 299.99,
    description: '4K UHD monitor with HDR support',
    image: 'https://placehold.co/300x200/20B2AA/ffffff?text=Monitor',
    category: 'Electronics'
  },
  {
    id: '8',
    name: 'Desk Lamp',
    price: 34.99,
    description: 'LED desk lamp with adjustable brightness',
    image: 'https://placehold.co/300x200/FFD700/ffffff?text=Desk+Lamp',
    category: 'Accessories'
  }
];
