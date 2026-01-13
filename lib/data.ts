// lib/data.ts
import pool from "./db";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: Date;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: number;
  featured: boolean;
  stock: number;
  images: string[];
  length: string[];
  texture: string | null;
  hair_type: string | null;
  color: string[];
  created_at: Date;
  updated_at: Date;
  category_name?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  length: string;
  color: string;
  price: number;
  stock: number;
  sku: string | null;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  rating: number;
  comment: string;
  helpful: number;
  verified_purchase: boolean;
  created_at: Date;
  updated_at: Date;
  display_name?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

// Get product reviews with stats
export async function getProductReviews(productId: number): Promise<{
  reviews: Review[];
  stats: ReviewStats;
}> {
  const client = await pool.connect();
  try {
    // Get reviews
    const reviewsResult = await client.query(
      `SELECT r.*, 
              COALESCE(u.name, r.user_name) as display_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY 
         r.helpful DESC,
         r.verified_purchase DESC,
         r.created_at DESC`,
      [productId]
    );

    // Get review statistics
    const statsResult = await client.query(
      `
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews 
      WHERE product_id = $1
    `,
      [productId]
    );

    const statsRow = statsResult.rows[0];
    const totalReviews = parseInt(statsRow.total_reviews) || 0;

    // Calculate rating distribution
    const ratingDistribution = [
      { rating: 5, count: parseInt(statsRow.five_star) || 0 },
      { rating: 4, count: parseInt(statsRow.four_star) || 0 },
      { rating: 3, count: parseInt(statsRow.three_star) || 0 },
      { rating: 2, count: parseInt(statsRow.two_star) || 0 },
      { rating: 1, count: parseInt(statsRow.one_star) || 0 },
    ].map((item) => ({
      ...item,
      percentage:
        totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0,
    }));

    return {
      reviews: reviewsResult.rows,
      stats: {
        average_rating: parseFloat(statsRow.average_rating) || 0,
        total_reviews: totalReviews,
        rating_distribution: ratingDistribution,
      },
    };
  } finally {
    client.release();
  }
}

// Add a new review
export async function addReview({
  productId,
  userId,
  userName,
  userEmail,
  rating,
  comment,
}: {
  productId: number;
  userId?: number | null;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
}) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO reviews 
       (product_id, user_id, user_name, user_email, rating, comment, verified_purchase)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        productId,
        userId || null,
        userName,
        userEmail || null,
        rating,
        comment,
        !!userId,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Mark review as helpful
export async function markReviewHelpful(reviewId: number) {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE reviews SET helpful = helpful + 1 WHERE id = $1",
      [reviewId]
    );
  } finally {
    client.release();
  }
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM categories ORDER BY name");
    return result.rows;
  } finally {
    client.release();
  }
}

// Get featured products
export async function getFeaturedProducts(
  limit: number = 8
): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      SELECT p.*, c.name as category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC 
      LIMIT $1
    `,
      [limit]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// Get products with filters
export async function getProducts({
  category,
  minPrice,
  maxPrice,
  limit = 20,
  offset = 0,
}: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<{ products: Product[]; total: number }> {
  const client = await pool.connect();
  try {
    let query = `
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND c.slug = $${paramCount}`;
      params.push(category);
    }

    if (minPrice !== undefined) {
      paramCount++;
      query += ` AND p.price >= $${paramCount}`;
      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      paramCount++;
      query += ` AND p.price <= $${paramCount}`;
      params.push(maxPrice);
    }

    // Get total count
    const countResult = await client.query(`SELECT COUNT(*) ${query}`, params);
    const total = parseInt(countResult.rows[0].count);

    // Get products with pagination
    paramCount++;
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const productsResult = await client.query(
      `SELECT p.*, c.name as category_name ${query}`,
      params
    );

    return { products: productsResult.rows, total };
  } finally {
    client.release();
  }
}

// Get single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Get product variants
export async function getProductVariants(
  productId: number
): Promise<ProductVariant[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM product_variants WHERE product_id = $1 ORDER BY length, color",
      [productId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// Get cart items by session
export async function getCartItems(userId?: number, sessionId?: string) {
  const client = await pool.connect();
  try {
    let query = `
      SELECT ci.*, p.name, p.images[1] as image, p.price as base_price,
             COALESCE(v.price, p.price) as final_price, p.slug as product_slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants v ON ci.variant_id = v.id
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];

    if (userId) {
      query += ` WHERE ci.user_id = $1`;
      params.push(userId);
    } else if (sessionId) {
      query += ` WHERE ci.session_id = $1`;
      params.push(sessionId);
    } else {
      return []; // Return empty if no user or session
    }

    query += ` ORDER BY ci.created_at DESC`;

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Add to cart
export async function addToCart({
  userId,
  sessionId, // This should be string | undefined
  productId,
  variantId,
  quantity = 1,
  selectedLength,
  selectedColor,
}: {
  userId?: number;
  sessionId?: string; // Remove | null, keep as string | undefined
  productId: number;
  variantId?: number;
  quantity?: number;
  selectedLength?: string;
  selectedColor?: string;
}) {
  const client = await pool.connect();
  try {
    // CRITICAL: For logged-in users, we MUST use user_id, not session_id
    if (userId) {
      // Check if item already exists in user's cart
      const existing = await client.query(
        `SELECT id, quantity FROM cart_items 
         WHERE user_id = $1 AND product_id = $2 AND variant_id = $3
         AND selected_length = $4 AND selected_color = $5`,
        [
          userId,
          productId,
          variantId || null,
          selectedLength || null,
          selectedColor || null,
        ]
      );

      if (existing.rows.length > 0) {
        // Update quantity for existing item
        await client.query(
          `UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2`,
          [quantity, existing.rows[0].id]
        );
      } else {
        // Insert new item with user_id
        await client.query(
          `INSERT INTO cart_items 
           (user_id, session_id, product_id, variant_id, quantity, selected_length, selected_color)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userId,
            null, // session_id is null for logged-in users
            productId,
            variantId || null,
            quantity,
            selectedLength || null,
            selectedColor || null,
          ]
        );
      }
    } else if (sessionId) {
      // Only for guests (not logged in)
      // Check if item already exists in session cart
      const existing = await client.query(
        `SELECT id, quantity FROM cart_items 
         WHERE session_id = $1 AND product_id = $2 AND variant_id = $3
         AND selected_length = $4 AND selected_color = $5`,
        [
          sessionId,
          productId,
          variantId || null,
          selectedLength || null,
          selectedColor || null,
        ]
      );

      if (existing.rows.length > 0) {
        // Update quantity
        await client.query(
          `UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2`,
          [quantity, existing.rows[0].id]
        );
      } else {
        // Insert new item
        await client.query(
          `INSERT INTO cart_items 
           (user_id, session_id, product_id, variant_id, quantity, selected_length, selected_color)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            null, // user_id is null for guests
            sessionId,
            productId,
            variantId || null,
            quantity,
            selectedLength || null,
            selectedColor || null,
          ]
        );
      }
    } else {
      throw new Error("Either user_id or session_id is required");
    }
  } finally {
    client.release();
  }
}

// Get product by ID (for fallback)
export async function getProductById(id: number): Promise<Product | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Get products with proper category filtering
export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE c.slug = $1
       ORDER BY p.created_at DESC`,
      [categorySlug]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT slug FROM products");
    return result.rows;
  } finally {
    client.release();
  }
}

export async function transferSessionCartToUser(
  sessionId: string,
  userId: number
) {
  const client = await pool.connect();
  try {
    // Get all session cart items
    const sessionItems = await client.query(
      "SELECT * FROM cart_items WHERE session_id = $1 AND user_id IS NULL",
      [sessionId]
    );

    for (const item of sessionItems.rows) {
      // Check if user already has this item
      const existing = await client.query(
        `SELECT id, quantity FROM cart_items 
         WHERE user_id = $1 AND product_id = $2 AND variant_id = $3
         AND selected_length = $4 AND selected_color = $5`,
        [
          userId,
          item.product_id,
          item.variant_id,
          item.selected_length,
          item.selected_color,
        ]
      );

      if (existing.rows.length > 0) {
        // Merge quantities
        await client.query(
          "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2",
          [item.quantity, existing.rows[0].id]
        );
        // Delete the session item
        await client.query("DELETE FROM cart_items WHERE id = $1", [item.id]);
      } else {
        // Transfer the session item to user
        await client.query(
          "UPDATE cart_items SET user_id = $1, session_id = NULL WHERE id = $2",
          [userId, item.id]
        );
      }
    }
  } finally {
    client.release();
  }
}

export async function getCartItemsBySession(sessionId: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ci.*, p.name, p.images[1] as image, p.price as base_price,
             COALESCE(v.price, p.price) as final_price, p.slug as product_slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants v ON ci.variant_id = v.id
      WHERE ci.session_id = $1
      ORDER BY ci.created_at DESC`,
      [sessionId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// New function for getting cart items by user ID (logged-in users)
export async function getCartItemsByUser(userId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ci.*, p.name, p.images[1] as image, p.price as base_price,
             COALESCE(v.price, p.price) as final_price, p.slug as product_slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants v ON ci.variant_id = v.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC`,
      [userId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}