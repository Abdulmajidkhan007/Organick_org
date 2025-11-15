import { FooterBottom, FooterTop } from "./Footer";
import { Navbar } from "./Navbar";

import BlogHeaderBack from "../assets/blog/BlogHeaderBack.png";
import BlogHeaderFront from "../assets/blog/BlogHeaderFront.png";
import { useSelector } from "react-redux";

export const Blog = () => {
  const blogs = useSelector((state) => state.blogs.blogs);

  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${BlogHeaderBack})` }} className="w-full h-[50vh] bg-cover ">
        <div style={{ backgroundImage: `url(${BlogHeaderFront})` }} className="w-full h-full bg-cover Ajustify-center  ">
          <h1 className="font-bold text-[#274C5B] text-5xl ">Recent News</h1>
        </div>
      </header>

      <section className="NewsContainer w-full h-[220vh] flex justify-center  ">
        <article className="News w-[80%] h-full grid grid-cols-2 grid-rows-3 gap-y-20 gap-x-10 pt-20  ">
          {blogs.map((blog, index) => {
            return (
              <div key={index} className="New bg-cover rounded-2xl flex flex-col items-center justify-end relative    " 
                   style={{ backgroundImage: `url(${blog.img})` }}>
                <h1 className="date bg-white rounded-full w-[70px] h-[70px] font-bold text-[#274C5B] text-xl flex items-center text-center absolute top-2 left-2  ">{blog.date}</h1>
                <div className="info w-[90%] h-[200px] rounded-2xl -mb-12 bg-[#fff] shadow-2xl pl-10 pt-6 text-[#274C5B]  ">
                  <h3 className="user font-semibold "><i className="fa-solid fa-user text-[#7EB693]"></i> {blog.user}</h3>
                  <h1 className="title font-bold text-lg ">{blog.title}</h1>
                  <p className="description w-[85%] ">{blog.description}</p>
                  <h1 className="readMore flex gap-4 font-bold ">Read More <button type="button" className="Ajustify-center rounded-full text-white bg-[#274C5B] p-1"><i className="fa-solid fa-arrow-right"></i></button></h1>
                </div>
              </div>
            );
          })}
        </article>
      </section>
      <FooterTop />
      <FooterBottom />
    </>
    );};
