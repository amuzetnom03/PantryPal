import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { storeName, items, paymentMethod, deliveryAddress, totalAmount } = await req.json();

    // Simulate dispatching order query to local store backend API gateway & payment verification
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const estimatedDeliveryMinutes = Math.floor(25 + Math.random() * 35);

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        storeName: storeName || 'Local Fresh Mart',
        items: items || [],
        totalAmount: totalAmount || 0,
        paymentMethod: paymentMethod || 'Stripe',
        deliveryAddress: deliveryAddress || '123 Main Street',
        status: 'Dispatched',
        estimatedDeliveryMinutes,
        createdAt: new Date().toISOString()
      },
      message: `Order successfully dispatched to ${storeName || 'Local Fresh Mart'}. Delivery expected in ~${estimatedDeliveryMinutes} minutes!`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Order processing failed" }, { status: 500 });
  }
}
