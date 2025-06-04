import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '../../../../lib/connectDb';
import BackupInventory from '../../../../models/BackupInventory';

export async function POST(request) {
  try {
    await connectDb();
    const { email, password } = await request.json();

    const backup = await BackupInventory.findOne({ email });
    
    if (!backup) {
      return NextResponse.json({ message: 'No backup found for this email' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, backup.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const backupData = {
      products: backup.products,
      customers: backup.customers,
      sales: backup.sales
    };

    await BackupInventory.deleteOne({ _id: backup._id });

    return NextResponse.json(backupData, { status: 200 });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}