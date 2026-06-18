import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { title, genre, bpm, price } = data;
    
    const updatedBeat = await prisma.beat.update({
      where: { id: params.id },
      data: {
        title,
        genre,
        bpm: Number(bpm),
        price: Number(price)
      }
    });
    
    return NextResponse.json(updatedBeat);
  } catch (error) {
    console.error("Error updating beat:", error);
    return NextResponse.json({ error: "Failed to update beat" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.beat.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting beat:", error);
    return NextResponse.json({ error: "Failed to delete beat" }, { status: 500 });
  }
}
