import { NextResponse } from 'next/server';
import connectDb from '../../../lib/connectDb';
import { Bill } from '../../../models/Party';
import { uploadToCloudinary } from '../../../lib/cloudinary';
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

    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId');

    let query = { userId: user.id };
    if (partyId) {
      query.partyId = partyId;
    }

    const bills = await Bill.find(query)
      .populate('partyId', 'name phoneNumber')
      .sort({ billDate: -1 });
    
    return NextResponse.json(bills, { status: 200 });
  } catch (error) {
    console.error('Error fetching bills:', error);
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

    const formData = await request.formData();
    const partyId = formData.get('partyId');
    const billNumber = formData.get('billNumber');
    const billDate = formData.get('billDate');
    const totalAmount = formData.get('totalAmount');
    const dueDate = formData.get('dueDate');
    const items = JSON.parse(formData.get('items') || '[]');
    const notes = formData.get('notes');
    const billImage = formData.get('billImage');

    if (!partyId || !billNumber || !billDate || !totalAmount) {
      return NextResponse.json({ 
        message: 'Party ID, bill number, bill date, and total amount are required' 
      }, { status: 400 });
    }

    // Check if bill number already exists for this party
    const existingBill = await Bill.findOne({ 
      userId: user.id, 
      partyId, 
      billNumber 
    });
    
    if (existingBill) {
      return NextResponse.json({ 
        message: 'Bill number already exists for this party' 
      }, { status: 409 });
    }

    let billImageUrl = null;
    let billImagePublicId = null;

    // Upload image to Cloudinary if provided
    if (billImage && billImage.size > 0) {
      const bytes = await billImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${billImage.type};base64,${buffer.toString('base64')}`;
      
      const uploadResult = await uploadToCloudinary(base64Image, 'party-bills');
      billImageUrl = uploadResult.url;
      billImagePublicId = uploadResult.publicId;
    }

    const newBill = new Bill({
      userId: user.id,
      partyId,
      billNumber,
      billDate: new Date(billDate),
      totalAmount: parseFloat(totalAmount),
      dueDate: dueDate ? new Date(dueDate) : null,
      billImageUrl,
      billImagePublicId,
      items,
      notes
    });

    await newBill.save();
    
    const populatedBill = await Bill.findById(newBill._id)
      .populate('partyId', 'name phoneNumber');
    
    return NextResponse.json(populatedBill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}