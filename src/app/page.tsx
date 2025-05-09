'use client';

import { ViewBlogPage } from "./Components/User/content";
import Dashboard from "./Components/User/Dashboard";
import Footer from "./Components/User/footer";
import Navbar from "./Components/User/navbar";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <Dashboard />
      <ViewBlogPage />
      <Footer />
    </div>
  );
}
 //commit
//just for commit