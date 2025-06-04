import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDb from '../../../lib/connectDb';

const connectDb2 = async () => {
  try {
    const conn = await mongoose.createConnection(process.env.MONGODB_URI2);
    console.log('Connected to second database');
    return conn;
  } catch (error) {
    console.error('Error connecting to second database:', error);
    throw error;
  }
};

export async function POST(request) {
  try {
    await connectDb();
    const db2 = await connectDb2();

    const Inventory = db2.model('Inventory', new mongoose.Schema({
      inventory: [{
        itemName: String,
        quantity: Number,
        originalPrice: Number,
        discountedPrice: Number,
        barcode: Number
      }]
    }));

    const OrderHistory = db2.model('OrderHistory', new mongoose.Schema({
      customerPhoneNumber: String,
      products: [{
        itemName: String,
        quantity: Number,
        price: Number
      }],
      orderTime: Date,
      totalAmount: Number
    }));

    const inventoryData = await Inventory.find();
    const orderHistoryData = await OrderHistory.find();

    const transformedProducts = inventoryData[0]?.inventory.map(item => ({
      name: item.itemName,
      barcode: item.barcode.toString(),
      originalPrice: item.originalPrice,
      discountedPrice: item.discountedPrice,
      quantity: item.quantity,
      createdAt: new Date(),
      updatedAt: new Date()
    })) || [];

    const transformedSales = orderHistoryData.map(order => ({
      customerId: '',
      customerPhone: order.customerPhoneNumber || 'Walk-in',
      items: order.products.map(product => ({
        name: product.itemName,
        cartQuantity: product.quantity,
        discountedPrice: product.price
      })),
      total: order.totalAmount,
      date: order.orderTime
    }));

    const uniqueCustomers = [...new Set(orderHistoryData
      .map(order => order.customerPhoneNumber)
      .filter(phone => phone))]
      .map(phone => ({
        id: new mongoose.Types.ObjectId().toString(),
        phoneNumber: phone,
        purchases: []
      }));

    return NextResponse.json({
      products: transformedProducts,
      sales: transformedSales,
      customers: uniqueCustomers
    }, { status: 200 });

  } catch (error) {
    console.error('Data transfer error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}