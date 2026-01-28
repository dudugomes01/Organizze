import { NextResponse } from "next/server";
import { canUserAddTransaction } from "@/app/_data/can-user-add-transaction";

export async function GET() {
  try {
    const canAdd = await canUserAddTransaction();
    return NextResponse.json({ canAddTransaction: canAdd });
  } catch (error) {
    return NextResponse.json({ canAddTransaction: false }, { status: 401 });
  }
}

