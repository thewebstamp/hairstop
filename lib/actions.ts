// app/lib/actions.ts
"use server";

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getCartItemsByUser,
  getCartItemsBySession,
  getCategories,
  getProducts,
  getProductBySlug,
  getProductVariants,
  addToCart as addToCartDb,
} from "@/lib/data";

// Get cart items for the current user
export async function getCartItems() {
  // First, try to get logged-in user
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    // User is logged in - use user_id
    const userId = parseInt(session.user.id);
    try {
      const items = await getCartItemsByUser(userId);
      return items;
    } catch (error) {
      console.error("Error fetching user cart items:", error);
      return [];
    }
  } else {
    // User is not logged in - check for session cart (guest)
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return [];
    }

    try {
      const items = await getCartItemsBySession(sessionId);
      return items;
    } catch (error) {
      console.error("Error fetching session cart items:", error);
      return [];
    }
  }
}

// Get shop data (categories and products) with filters
export async function getShopData(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}) {
  const itemsPerPage = 12;
  const page = filters.page || 1;

  try {
    const [categories, { products, total }] = await Promise.all([
      getCategories(),
      getProducts({
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      }),
    ]);

    return {
      categories,
      products,
      total,
      page,
      totalPages: Math.ceil(total / itemsPerPage),
    };
  } catch (error) {
    console.error("Error fetching shop data:", error);
    return {
      categories: [],
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

// Add to cart action - UPDATED TO USE undefined instead of null
export async function addToCart({
  productId,
  variantId,
  quantity = 1,
  selectedLength,
  selectedColor,
}: {
  productId: number;
  variantId?: number;
  quantity?: number;
  selectedLength?: string;
  selectedColor?: string;
}) {
  // Get the user session FIRST
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { 
      success: false, 
      error: "You must be logged in to add items to cart",
      requiresLogin: true
    };
  }

  const userId = parseInt(session.user.id);
  
  try {
    // Use undefined for sessionId instead of null
    await addToCartDb({
      userId, // Pass the user ID
      sessionId: undefined, // Use undefined instead of null
      productId,
      variantId,
      quantity,
      selectedLength,
      selectedColor,
    });

    return { success: true, message: "Product added to cart" };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: "Failed to add product to cart" };
  }
}

// Get product details
export async function getProductData(slug: string) {
  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      return null;
    }

    const variants = await getProductVariants(product.id);

    return {
      product,
      variants,
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
}