import { NextResponse } from 'next/server';
import connectDb from '../../../../lib/connectDb';
import Bill from '../../../../models/Bill';
import jwt from 'jsonwebtoken';
import { deleteFromCloudinary } from '../../../../lib/cloudinary';

const JWT_SECRET = process.env.JWT_SECRET || 'kst_apnidukaan';

// Helper function to get user from token
const getUserFromToken = (request) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// PATCH function to update a specific bill
export async function PATCH(request, { params }) {
    try {
        await connectDb();

        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params; // Get bill ID from the URL
        const { status } = await request.json(); // Get new status from the request body

        // Validate the incoming status
        const validStatuses = ['Pending', 'Partially Paid', 'Paid'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
        }

        // Find the bill and update it
        // We also check for the userId to make sure a user can only update their own bills
        const updatedBill = await Bill.findOneAndUpdate(
            { _id: id, userId: user.id },
            { paymentStatus: status },
            { new: true } // This option returns the updated document
        ).populate('partyId', 'name phoneNumber');

        if (!updatedBill) {
            return NextResponse.json({ message: 'Bill not found or you do not have permission to update it' }, { status: 404 });
        }

        return NextResponse.json(updatedBill, { status: 200 });
    } catch (error) {
        console.error('Error updating bill:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE function to delete a specific bill
export async function DELETE(request, { params }) {
    try {
        await connectDb();

        const user = getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Find the bill first to get image info for cleanup
        const bill = await Bill.findOne({ _id: id, userId: user.id });
        
        if (!bill) {
            return NextResponse.json({ message: 'Bill not found or you do not have permission to delete it' }, { status: 404 });
        }

        // Delete image from Cloudinary if it exists
        if (bill.billImagePublicId) {
            try {
                await deleteFromCloudinary(bill.billImagePublicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
                // Continue with bill deletion even if image deletion fails
            }
        }

        // Delete the bill
        await Bill.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Bill deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting bill:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}