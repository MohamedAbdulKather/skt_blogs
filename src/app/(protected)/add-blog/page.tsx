'use client';

import AddBlogPage from "@/app/Components/User/add-blog/add-blog";
import Navbar from "@/app/Components/User/navbar";


export default function HomePage() {
  return (
    <div className="bg-white">
         <Navbar />
     <AddBlogPage />
    </div>
  );
}
