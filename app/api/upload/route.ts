import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filepath = path.join(process.cwd(), "public", "uploads", filename);

    await writeFile(filepath, buffer);
    const url = `/uploads/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
