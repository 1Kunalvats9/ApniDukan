import { NextResponse } from 'next/server';
import connectDb from '../../../../lib/connectDb';
import Party from '../../../../models/Party';
import Bill from '../../../../models/Bill';
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

export async function DELETE(request, { params }) {
  try {
    await connectDb();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // First, delete all bills associated with this party
    await Bill.deleteMany({ partyId: id, userId: user.id });

    // Then delete the party
    const deletedParty = await Party.findOneAndDelete({ _id: id, userId: user.id });

    if (!deletedParty) {
      return NextResponse.json({ message: 'Party not found or you do not have permission to delete it' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Party and associated bills deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting party:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}