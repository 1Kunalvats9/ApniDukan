import { NextResponse } from 'next/server';
import connectDb from '../../../lib/connectDb';
import { Party } from '../../../models/Party';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kst_apnidukaan';

const getUserFromToken = (request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

export async function GET(request) {
  try {
    await connectDb();
    
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const parties = await Party.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json(parties, { status: 200 });
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDb();
    
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, contactPerson, phoneNumber, address, gstNumber } = await request.json();

    if (!name || !phoneNumber) {
      return NextResponse.json({ message: 'Name and phone number are required' }, { status: 400 });
    }

    const existingParty = await Party.findOne({ userId: user.id, phoneNumber });
    if (existingParty) {
      return NextResponse.json({ message: 'Party with this phone number already exists' }, { status: 409 });
    }

    const newParty = new Party({
      userId: user.id,
      name,
      contactPerson,
      phoneNumber,
      address,
      gstNumber
    });

    await newParty.save();
    return NextResponse.json(newParty, { status: 201 });
  } catch (error) {
    console.error('Error creating party:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}