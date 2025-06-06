"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { IProduct } from "../models/Product";
import { useCart } from '../app/context/CartContext';
import Image from "next/image";

interface INamkeen {
  _id?: string;
  name: string;
  description: string;
  image: string;
  type: string;
  pricing: Array<{
    quantity: number;
    unit: 'gm' | 'kg' | 'piece' | 'dozen';
    price: number;
  }>;
}

// Combined type for both products and namkeens
interface CombinedItem {
  _id?: string;
  name: string;
  description: string;
  image: string;
  type: string;
  pricing?: Array<{
    quantity: number;
    unit: 'gm' | 'kg' | 'piece' | 'dozen';
    price: number;
  }>;
  price?: number;
  itemType: 'product' | 'namkeen';
}

export default function LatestProduct() {
  const [items, setItems] = useState<CombinedItem[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchLatestItems = async () => {
      try {
        // Fetch both products and namkeens
        const [productsRes, namkeensRes] = await Promise.all([
          axios.get("/api/product"),
          axios.get("/api/namkeen")
        ]);

        // Filter latest products
        const latestProducts = productsRes.data
          .filter((p: IProduct) => p.type === "latest")
          .map((p: IProduct) => ({
            ...p,
            itemType: 'product' as const
          }));

        // Filter latest namkeens
        const latestNamkeens = namkeensRes.data
          .filter((n: INamkeen) => n.type === "latest")
          .map((n: INamkeen) => ({
            ...n,
            itemType: 'namkeen' as const
          }));

        // Combine both arrays
        const combinedItems = [...latestProducts, ...latestNamkeens];
        setItems(combinedItems);
      } catch (error) {
        console.error("Error fetching latest items:", error);
      }
    };

    fetchLatestItems();
  }, []);

  const handleAddToCart = (item: CombinedItem) => {
    if (!item._id) return;

    if (item.itemType === 'product') {
      // For products, use the existing addToCart function
      addToCart(item._id, 1);
    } else {
      // For namkeens, use the first pricing option or handle as needed
      // You might want to modify your cart context to handle namkeens differently
      addToCart(item._id, 1);
    }
  };

  const getItemPrice = (item: CombinedItem) => {
    if (item.itemType === 'product' && item.price) {
      return `₹${item.price}`;
    } else if (item.itemType === 'namkeen' && item.pricing && item.pricing.length > 0) {
      const firstPricing = item.pricing[0];
      return `₹${firstPricing.price} per ${firstPricing.quantity}${firstPricing.unit}`;
    }
    return 'Price not available';
  };

  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500">No latest products found.</div>;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Latest Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src={item.image || "/placeholder-image.jpg"}
                alt={item.name}
                fill
                className="object-cover"
              />
              {/* Badge to show item type */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  item.itemType === 'product' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {item.itemType === 'product' ? 'Sweet' : 'Namkeen'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  {getItemPrice(item)}
                </span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}