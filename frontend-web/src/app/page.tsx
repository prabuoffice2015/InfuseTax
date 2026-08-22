import React from "react";
import HeaderTwo from "@/components/header/HeaderTwo";
import HeroTwo from "@/components/hero/HeroTwo";
import ServiceGrid from "@/components/services/ServiceGrid";
import AICopilotBadge from "@/components/ai/AICopilotBadge";
import PricingTable from "@/components/pricing/PricingTable";
import Footer from "@/components/footer/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <HeaderTwo />
      <HeroTwo />
      <ServiceGrid />
      <AICopilotBadge />
      <PricingTable />
      <Footer />
    </main>
  );
}
