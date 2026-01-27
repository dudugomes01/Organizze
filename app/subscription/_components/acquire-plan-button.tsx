"use client";

import { Button } from "@/app/_components/ui/button";
import { createStripeCheckout } from "../_actions/create-stripe-checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const AcquirePlanButton = () => {
  const { user } = useUser();
  const handleAcquirePlanClick = async () => {
    const { sessionId } = await createStripeCheckout();
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error("Stripe publishable key not found");
    }
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    );
    if (!stripe) {
      throw new Error("Stripe not found");
    }
    await stripe.redirectToCheckout({ sessionId });
  };
  const hasPremiumPlan = user?.publicMetadata.subscriptionPlan == "premium";
  if (hasPremiumPlan) {
    return (
      <Button 
        className="w-full h-12 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold text-base rounded-xl border border-gray-600 transition-all duration-300"
        variant="outline"
      >
        <Link
          href={`${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL as string}?prefilled_email=${user.emailAddresses[0].emailAddress}`}
          className="w-full"
        >
          Gerenciar plano
        </Link>
      </Button>
    );
  }
  return (
    <Button
      className="w-full h-12 bg-gradient-to-r from-[#55B02E] to-emerald-600 hover:from-emerald-600 hover:to-[#55B02E] text-white font-semibold text-base rounded-xl shadow-lg shadow-[#55B02E]/20 hover:shadow-[#55B02E]/40 transition-all duration-300 transform hover:scale-[1.02]"
      onClick={handleAcquirePlanClick}
    >
      Adquirir plano Premium
    </Button>
  );
};

export default AcquirePlanButton;