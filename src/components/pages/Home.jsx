
import axios from "axios";
import React, { useState } from "react";
import { useQuery } from "react-query";

import {
  LIST_BLOGS_URL,
} from "../../util/constants";
import Blogs from "./Blogs";
import Card from "../ui/Card";
import BlogsList from "./BlogsList";

  async function getBlogs() {
  
    const { data } = await axios.get(LIST_BLOGS_URL);

  return data;
  }
const Home = () => {
  const {
    status: blogsFetchingStatus,
    data: blogs,
   
    isFetching: isBlogsFetching,
  } = useQuery("blogs", getBlogs, { refetchOnWindowFocus: false });
  
 
  return <div className="flex flex-col m-4">
  
    <div className="grid grid-cols-1 gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden relative">
      <div>
      <h2  className=" text-2xl tracking-tight font-bold text-left text-sky-700  dark:text-sky-500">Blogs Uploaded</h2>
      </div>
     

    </div>
    
   
  <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
    <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
      <div className="overflow-hidden">
        <BlogsList/>
      </div>
    </div>
  </div>
  <div className="m-auto ">
  <div className="mt-4 w-full max-w-md m-auto pb-5">
      <h2  className=" text-2xl tracking-tight font-bold text-left text-sky-700  dark:text-sky-500">Upload Blog</h2>
      </div>
     
      <div className="w-full max-w-md m-auto pb-10">
        <div >
        <Blogs/>
        </div>
        <div>
      
        </div>
      </div>
 
  
      </div>
  
</div>
};
export default Home;
