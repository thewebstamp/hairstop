/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { verifyAdmin } from "@/lib/admin-auth";

// GET: Fetch all products
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const offset = (page - 1) * limit;
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

      if (search) {
        paramCount++;
        query += ` AND (
          p.name ILIKE $${paramCount} OR 
          p.description ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
      }

      if (featured) {
        paramCount++;
        query += ` AND p.featured = $${paramCount}`;
        params.push(featured === "true");
      }

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total ${query}`,
        params
      );
      const total = parseInt(countResult.rows[0]?.total) || 0;

      // Get products with pagination
      params.push(limit);
      params.push(offset);

      const productsResult = await client.query(
        `SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug
         ${query}
         ORDER BY p.created_at DESC
         LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
        params
      );

      return NextResponse.json({
        success: true,
        products: productsResult.rows || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new product
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category_id = parseInt(formData.get("category_id") as string);
    const stock = parseInt(formData.get("stock") as string);
    const featured = formData.get("featured") === "true";
    const texture = formData.get("texture") as string;
    const hair_type = formData.get("hair_type") as string;

    // Parse arrays
    const lengths = JSON.parse((formData.get("lengths") as string) || "[]");
    const colors = JSON.parse((formData.get("colors") as string) || "[]");

    // Get images
    const images: string[] = [];
    const imageFiles = formData.getAll("images") as File[];

    // Validate required fields
    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Generate slug
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if slug exists
      const slugCheck = await client.query(
        "SELECT id FROM products WHERE slug = $1",
        [slug]
      );

      let finalSlug = slug;
      if (slugCheck.rows.length > 0) {
        finalSlug = `${slug}-${Date.now()}`;
      }

      // Upload images to Cloudinary
      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const uploadResult = await uploadToCloudinary(
            buffer,
            `hair-stop/products/${finalSlug}`
          );
          images.push(uploadResult.secure_url);
        }
      }

      // Create product
      const productResult = await client.query(
        `INSERT INTO products (
          name, slug, description, price, category_id,
          stock, featured, images, length, texture, hair_type, color
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          name,
          finalSlug,
          description,
          price,
          category_id,
          stock,
          featured,
          images,
          lengths,
          texture,
          hair_type,
          colors,
        ]
      );

      const product = productResult.rows[0];

      // Create variants if provided
      const variantsData = formData.get("variants");
      if (variantsData) {
        const variants = JSON.parse(variantsData as string);

        for (const variant of variants) {
          await client.query(
            `INSERT INTO product_variants (
              product_id, length, color, price, stock, sku
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              product.id,
              variant.length,
              variant.color,
              variant.price || price,
              variant.stock || stock,
              variant.sku || null,
            ]
          );
        }
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating product:", error);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in product creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update Product
export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const productId = parseInt(formData.get("id") as string);

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get existing product
      const existingProduct = await client.query(
        "SELECT * FROM products WHERE id = $1",
        [productId]
      );

      if (existingProduct.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      const product = existingProduct.rows[0];

      // Build update query for product
      const updates: string[] = [];
      const params: any[] = [];
      let paramCount = 1;

      // Fields that can be updated (excluding lengths and colors - handled separately)
      const fields = [
        "name",
        "description",
        "price",
        "category_id",
        "stock",
        "featured",
        "texture",
        "hair_type",
      ];

      for (const field of fields) {
        const value = formData.get(field);

        if (value !== null && value !== "") {
          if (field === "featured") {
            updates.push(`${field} = $${paramCount}`);
            params.push(value === "true");
            paramCount++;
          } else if (field === "price") {
            const numValue = parseFloat(value as string);
            if (!isNaN(numValue)) {
              updates.push(`${field} = $${paramCount}`);
              params.push(numValue);
              paramCount++;
            }
          } else if (field === "stock") {
            const numValue = parseInt(value as string);
            if (!isNaN(numValue)) {
              updates.push(`${field} = $${paramCount}`);
              params.push(numValue);
              paramCount++;
            }
          } else if (field === "category_id") {
            const numValue = parseInt(value as string);
            if (!isNaN(numValue)) {
              updates.push(`${field} = $${paramCount}`);
              params.push(numValue);
              paramCount++;
            }
          } else {
            updates.push(`${field} = $${paramCount}`);
            params.push(value);
            paramCount++;
          }
        }
      }

      // Handle images
      const newImages = formData.getAll("new_images") as File[];
      const imagesToRemoveStr = formData.get("remove_images");

      let currentImages = product.images || [];

      // Remove specified images
      if (imagesToRemoveStr && imagesToRemoveStr !== "[]") {
        try {
          const imagesToRemove = JSON.parse(imagesToRemoveStr as string);
          if (Array.isArray(imagesToRemove)) {
            currentImages = currentImages.filter(
              (img: string) => !imagesToRemove.includes(img)
            );
          }
        } catch (e) {
          console.error("API: Error parsing images to remove:", e);
        }
      }

      // Add new images
      if (newImages.length > 0) {
        for (const imageFile of newImages) {
          if (imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResult = await uploadToCloudinary(
              buffer,
              `hair-stop/products/${product.slug}`
            );
            currentImages.push(uploadResult.secure_url);
          }
        }
      }

      // Update images if changed
      if (
        newImages.length > 0 ||
        (imagesToRemoveStr && imagesToRemoveStr !== "[]")
      ) {
        updates.push(`images = $${paramCount}`);
        params.push(currentImages);
        paramCount++;
      }

      // Handle variants
      const variantsData = formData.get("variants");
      let variantLengths: string[] = [];
      let variantColors: string[] = [];

      if (variantsData !== null && variantsData !== "") {
        try {
          const newVariants = JSON.parse(variantsData as string);

          if (Array.isArray(newVariants) && newVariants.length > 0) {
            // Extract unique lengths and colors from variants
            const lengthSet = new Set<string>();
            const colorSet = new Set<string>();

            for (const variant of newVariants) {
              if (variant.length) lengthSet.add(variant.length);
              if (variant.color) colorSet.add(variant.color);
            }

            variantLengths = Array.from(lengthSet);
            variantColors = Array.from(colorSet);

            // Get existing variants
            const existingVariants = await client.query(
              "SELECT id FROM product_variants WHERE product_id = $1",
              [productId]
            );

            const existingVariantIds = existingVariants.rows.map(
              (v: any) => v.id
            );

            const newVariantIds = newVariants
              .map((v: any) => v.id)
              .filter((id: any) => id && id !== undefined);

            // Delete variants that were removed
            const variantsToDelete = existingVariantIds.filter(
              (id: number) => !newVariantIds.includes(id)
            );

            if (variantsToDelete.length > 0) {
              await client.query(
                `DELETE FROM product_variants WHERE id = ANY($1::int[]) AND product_id = $2`,
                [variantsToDelete, productId]
              );
            }

            // Update or insert variants
            for (const variant of newVariants) {
              // Validate required fields
              if (!variant.length || !variant.color) {
                throw new Error(
                  `Variant missing required fields: ${JSON.stringify(variant)}`
                );
              }

              const price = parseFloat(variant.price);
              const stock = parseInt(variant.stock);

              if (variant.id) {
                // Update existing variant
                await client.query(
                  `UPDATE product_variants 
                   SET length = $1, color = $2, price = $3, stock = $4, sku = $5
                   WHERE id = $6 AND product_id = $7`,
                  [
                    variant.length,
                    variant.color,
                    isNaN(price) ? 0 : price,
                    isNaN(stock) ? 0 : stock,
                    variant.sku || null,
                    variant.id,
                    productId,
                  ]
                );
              } else {
                // Insert new variant
                await client.query(
                  `INSERT INTO product_variants 
                   (product_id, length, color, price, stock, sku, created_at)
                   VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
                  [
                    productId,
                    variant.length,
                    variant.color,
                    isNaN(price) ? 0 : price,
                    isNaN(stock) ? 0 : stock,
                    variant.sku || null,
                  ]
                );
              }
            }
          }
        } catch (e) {
          console.error("API: Error processing variants:", e);
          throw new Error(
            `Invalid variants data: ${e instanceof Error ? e.message : "Unknown error"}`
          );
        }
      } else {
        // If variants are disabled, delete all existing variants
        await client.query(
          "DELETE FROM product_variants WHERE product_id = $1",
          [productId]
        );
      }

      // Handle product-level lengths and colors
      // If variants exist, use variant-derived lengths and colors
      // Otherwise, use the ones from formData
      let finalLengths: string[] = [];
      let finalColors: string[] = [];

      if (variantsData !== null && variantsData !== "") {
        try {
          const parsedVariants = JSON.parse(variantsData as string);
          if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
            // Use variant-derived lengths and colors
            finalLengths = variantLengths;
            finalColors = variantColors;
          } else {
            // If variants array is empty, use form data
            const formLengths = formData.get("lengths");
            const formColors = formData.get("colors");

            if (formLengths) {
              try {
                finalLengths = JSON.parse(formLengths as string);
              } catch (e) {
                console.error("API: Error parsing form lengths:", e);
              }
            }

            if (formColors) {
              try {
                finalColors = JSON.parse(formColors as string);
              } catch (e) {
                console.error("API: Error parsing form colors:", e);
              }
            }
          }
        } catch (e) {
          // If parsing variants fails, use form data
          const formLengths = formData.get("lengths");
          const formColors = formData.get("colors");

          if (formLengths) {
            try {
              finalLengths = JSON.parse(formLengths as string);
            } catch (e) {
              console.error("API: Error parsing form lengths:", e);
            }
          }

          if (formColors) {
            try {
              finalColors = JSON.parse(formColors as string);
            } catch (e) {
              console.error("API: Error parsing form colors:", e);
            }
          }
        }
      } else {
        // No variants, use form data
        const formLengths = formData.get("lengths");
        const formColors = formData.get("colors");

        if (formLengths) {
          try {
            finalLengths = JSON.parse(formLengths as string);
          } catch (e) {
            console.error("API: Error parsing form lengths:", e);
          }
        }

        if (formColors) {
          try {
            finalColors = JSON.parse(formColors as string);
          } catch (e) {
            console.error("API: Error parsing form colors:", e);
          }
        }
      }

      // Ensure we have arrays
      if (!Array.isArray(finalLengths)) finalLengths = [];
      if (!Array.isArray(finalColors)) finalColors = [];

      // Add lengths and colors to updates
      updates.push(`length = $${paramCount}`);
      params.push(finalLengths);
      paramCount++;

      updates.push(`color = $${paramCount}`);
      params.push(finalColors);
      paramCount++;

      // Update product if there are updates
      if (updates.length > 0) {
        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `
          UPDATE products 
          SET ${updates.join(", ")}
          WHERE id = $${paramCount}
          RETURNING *
        `;
        params.push(productId);

        await client.query(query, params);
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("API: Error in transaction:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to update product",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("API: Error in product update:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete product
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdmin();

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check if product exists
      const productCheck = await client.query(
        "SELECT * FROM products WHERE id = $1",
        [productId]
      );

      if (productCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Check if product has orders
      const orderCheck = await client.query(
        "SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1",
        [productId]
      );

      if (orderCheck.rows.length > 0) {
        // Soft delete - mark as inactive instead
        await client.query(
          "UPDATE products SET stock = 0, featured = false WHERE id = $1",
          [productId]
        );

        await client.query("COMMIT");

        return NextResponse.json({
          success: true,
          message:
            "Product has existing orders. Stock set to 0 and removed from featured.",
        });
      }

      // Hard delete - product has no orders
      await client.query("DELETE FROM product_variants WHERE product_id = $1", [
        productId,
      ]);
      await client.query("DELETE FROM reviews WHERE product_id = $1", [
        productId,
      ]);
      await client.query("DELETE FROM products WHERE id = $1", [productId]);

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting product:", error);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
