import { redirect } from "next/navigation";
import { protectServer } from "@/features/auth/utils";

import { Banner } from "./banner";
import { ProjectsSection } from "./projects-section";
import { TemplatesSection } from "./templates-section";

export default async function Home() {
  try {
    await protectServer();
  } catch (error) {
    console.error("Auth error:", error);
    // If auth fails, redirect to sign-in
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <TemplatesSection />
      <ProjectsSection />
    </div>
  );
};

