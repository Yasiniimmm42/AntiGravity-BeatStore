import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    const beats = await prisma.beat.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(beats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch beats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    let slug = generateSlug(data.title);
    let existing = await prisma.beat.findUnique({ where: { slug } });
    let counter = 1;
    while(existing) {
        slug = `${generateSlug(data.title)}-${counter}`;
        existing = await prisma.beat.findUnique({ where: { slug } });
        counter++;
    }

    const beat = await prisma.beat.create({ 
      data: { ...data, slug } 
    });
    
    return NextResponse.json(beat, { status: 201 });
  } catch (error) {
    console.error("Error creating beat:", error);
    return NextResponse.json({ error: "Failed to create beat" }, { status: 500 });
  }
}
