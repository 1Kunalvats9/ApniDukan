import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '../../../../lib/connectDb';
import BackupInventory from '../../../../models/BackupInventory';

export async function POST(request) {
  try {
    await connectDb();
    const { email, password, products, customers, sales } = await request.json();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const backup = new BackupInventory({
      email,
      password: hashedPassword,
      products,
      customers,
      sales
    });

    await backup.save();

    return NextResponse.json({ message: 'Backup created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}