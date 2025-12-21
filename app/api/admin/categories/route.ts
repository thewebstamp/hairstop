// app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import pool from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { verifyAdmin } from "@/lib/admin-auth";

// GET: Fetch all categories
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

    const client = await pool.connect();

    try {
      const url = new URL(request.url);
      const categoryId = url.searchParams.get("id");

      // If category ID is provided, fetch single category
      if (categoryId) {
        const result = await client.query(
          `SELECT * FROM categories WHERE id = $1`,
          [categoryId]
        );

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: "Category not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          category: result.rows[0],
        });
      }

      // Otherwise fetch all categories with product counts
      const result = await client.query(
        `SELECT c.*, 
                COALESCE(COUNT(p.id), 0) as product_count
         FROM categories c
         LEFT JOIN products p ON c.id = p.category_id
         GROUP BY c.id
         ORDER BY c.name`
      );

      // Convert product_count from string to number
      const categories = result.rows.map((category) => ({
        ...category,
        product_count: parseInt(category.product_count) || 0,
      }));

      return NextResponse.json({
        success: true,
        categories,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new category
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
    const imageFile = formData.get("image") as File;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const client = await pool.connect();

    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadToCloudinary(
          buffer,
          "hair-stop/categories"
        );
        imageUrl = uploadResult.secure_url;
      }

      // Create category
      const result = await client.query(
        `INSERT INTO categories (name, slug, description, image_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, slug, description, imageUrl]
      );

      return NextResponse.json({
        success: true,
        message: "Category created successfully",
        category: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT: Update category
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
    const categoryId = parseInt(formData.get("id") as string);

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Build update query
      const updates: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any[] = [];
      let paramCount = 1;

      const fields = ["name", "description"];
      for (const field of fields) {
        const value = formData.get(field);
        if (value !== null) {
          updates.push(`${field} = $${paramCount}`);
          params.push(value);
          paramCount++;
        }
      }

      // Handle image update
      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadToCloudinary(
          buffer,
          "hair-stop/categories"
        );
        updates.push(`image_url = $${paramCount}`);
        params.push(uploadResult.secure_url);
        paramCount++;
      } else if (formData.get("remove_image") === "true") {
        updates.push(`image_url = $${paramCount}`);
        params.push(null);
        paramCount++;
      }

      if (updates.length > 0) {
        // If name changed, update slug
        const name = formData.get("name");
        if (name) {
          const slug = (name as string)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          updates.push(`slug = $${paramCount}`);
          params.push(slug);
          paramCount++;
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `
          UPDATE categories 
          SET ${updates.join(", ")}
          WHERE id = $${paramCount}
          RETURNING *
        `;
        params.push(categoryId);

        await client.query(query, params);
      }

      return NextResponse.json({
        success: true,
        message: "Category updated successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE: Delete category
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

    const { categoryId } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Check if category has products
      const productsCheck = await client.query(
        "SELECT COUNT(*) as product_count FROM products WHERE category_id = $1",
        [categoryId]
      );

      const productCount = parseInt(productsCheck.rows[0]?.product_count) || 0;

      if (productCount > 0) {
        return NextResponse.json(
          {
            error: "Cannot delete category with products",
            productCount,
          },
          { status: 400 }
        );
      }

      // Delete category
      await client.query("DELETE FROM categories WHERE id = $1", [categoryId]);

      return NextResponse.json({
        success: true,
        message: "Category deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
