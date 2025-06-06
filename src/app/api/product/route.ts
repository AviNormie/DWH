import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { Product } from "@/models/Product";

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

// GET: Fetch all products
export async function GET() {
  await connectDB();

  try {
    const products = await Product.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

// POST: Create a new product
export async function POST(req: NextRequest) {
  await connectDB();
  
  try {
    const body = await req.json();
    const { name, description, type = "none", imageBase64, pricing } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json({ message: "Name and description are required" }, { status: 400 });
    }

    // Validate pricing
    if (!pricing || !Array.isArray(pricing) || pricing.length === 0) {
      return NextResponse.json({ message: "At least one pricing option is required" }, { status: 400 });
    }

    // Validate each pricing option
    for (const price of pricing) {
      if (!price.quantity || price.quantity <= 0) {
        return NextResponse.json({ message: "All pricing options must have a valid quantity greater than 0" }, { status: 400 });
      }
      if (!price.price || price.price <= 0) {
        return NextResponse.json({ message: "All pricing options must have a valid price greater than 0" }, { status: 400 });
      }
      if (!['gm', 'kg', 'piece', 'dozen'].includes(price.unit)) {
        return NextResponse.json({ message: "Invalid unit. Must be 'gm', 'kg', 'piece', or 'dozen'" }, { status: 400 });
      }
    }

    let imageUrl = "";
    if (imageBase64?.startsWith("data:image")) {
      try {
        const uploaded = await cloudinary.uploader.upload(imageBase64, {
          folder: "products",
        });
        imageUrl = uploaded.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
      }
    }

    const product = await Product.create({
      name,
      description,
      type,
      image: imageUrl,
      pricing: pricing.map((p: Pricing) => ({
        quantity: Number(p.quantity),
        unit: p.unit,
        price: Number(p.price)
      }))
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}

// DELETE: Delete product by ID (using query parameter)
export async function DELETE(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing product ID" }, { status: 400 });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ message: "Invalid product ID format" }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Delete image from Cloudinary
    if (product.image) {
      try {
        const urlParts = product.image.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `products/${publicIdWithExtension.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (imageDeleteError) {
        console.error("Failed to delete image from Cloudinary:", imageDeleteError);
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}