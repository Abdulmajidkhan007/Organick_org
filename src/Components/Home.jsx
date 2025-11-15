import { Navbar } from "./Navbar";
import { FooterBottom, FooterTop } from "./Footer";

import back from "../assets/home/back.png";
import card1 from "../assets/home/card1.png";
import card2 from "../assets/home/card2.png";
import aboutUs from "../assets/home/aboutUs.png";
import veganFood from "../assets/home/veganFood.png";
import mailboxQuality from "../assets/home/mailboxQuality.png";
import Testimonialbackground from "../assets/home/TestimonialBackground.png";
import TestimonialHuman from "../assets/home/TestimonialHuman.png";

import ecoFriendly from '../assets/home/ecoFriendly.png'

import OrganicJuice from '../assets/home/OrganicJuice.png'
import OrganicFood from '../assets/home/OrganicFood.png'
import NutsCookis from '../assets/home/NutsCookis.png'

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const Home = () => {

  const navigate = useNavigate();
  const products = useSelector((state) => state.products.products);
  const blogs = useSelector((state) => state.blogs.blogs);


  const A = [
    {
      img : OrganicJuice,
      name: 'Organic Juice'
    },
    {
      img : OrganicFood,
      name: 'Organic Food'
    },
    {
      img : NutsCookis,
      name: 'Nuts Cookis'
    }
  ]


  return (
    <>
      <Navbar />
      <main style={{ backgroundImage: `url(${back})` }}
            className="w-full h-[80vh] bg-cover bg-[1vh] bg-no-repeat flex items-center pl-44 ">
        <article className="w-[500px] h-[300px] flex flex-col gap-4 ">
          <h3 className="text-[#7EB693] font-[YellowTail] text-3xl ">100% Natural Food</h3>
          <h1 className="text-5xl font-bold text-[#274C5B]">Choose the best <br /> healthier way <br /> of life</h1>
          <button type="button"
                  className="w-[170px] h-[50px] rounded-2xl text-[#274C5B] bg-[#EFD372] Ajustify-center gap-2 ">
            <b>Explore Now</b>
            <div className="icon w-[25px] h-[25px] Ajustify-center bg-[#274C5B] rounded-full text-white text-[15px] "><i className="fas fa-arrow-right"></i></div>
          </button>
        </article>
      </main>

      <article className="cards w-full h-[65vh] Ajustify-center gap-8  ">
        <div style={{ backgroundImage: `url(${card1})` }}
             className="card w-[500px] h-[300px] bg-cover bg-center bg-no-repeat rounded-4xl flex items-center pl-10 ">
          <div className="texts text-white">
            <h3 className="font-[YellowTail] text-3xl ">Natural!!</h3>
            <h1 className="font-bold text-3xl">Get Garden <br /> Fresh Fruits</h1>
          </div>
        </div>
        <div style={{ backgroundImage: `url(${card2})` }}
             className="card w-[500px] h-[300px] bg-cover bg-center bg-no-repeat rounded-4xl flex items-center pl-10  ">
          <div className="texts">
            <h3 className="text-[#7EB693] font-[YellowTail] text-2xl ">Offer!!</h3>
            <h1 className="text-[#274C5B] font-bold text-3xl ">Get 10% off <br /> on Vegetables</h1>
          </div>
        </div>
      </article>

      <article className="aboutUs w-full h-[110vh] bg-[#EFF6F1] flex items-center ">
        <div className="artLeft w-full h-screen Ajustify-center "><img src={aboutUs} alt="" /></div>
        <div className="artRight w-full h-screen flex flex-col justify-center gap-4 ">
          <h3 className="text-[#7EB693] font-[YellowTail] text-2xl ">About Us</h3>
          <h1 className="text-4xl font-bold text-[#274C5B]">We Believe in Working <br /> Accredited Farmers</h1>
          <p className="text-[#274C5B] w-[86%] ">Simply dummy text of the printing and typesetting industry. Lorem
            had ceased to been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
          <div className="cards w-[50%] h-[180px] flex flex-col justify-between  ">
            
            <div className="card w-full h-[80px] flex items-center gap-6 ">
              <div className="icon w-[30%] h-full rounded-lg flex items-center justify-center bg-white ">
                <img src={veganFood} alt="" className="w-[40px] h-[40px] " />
              </div>
              <div className="texts">
                <h3 className="text-[#274C5B] font-bold text-2xl">Vegan Food</h3>
                <p className="text-[#274C5B]">We provide organic vegan food. Lorem, ipsum dolor sit.</p>
              </div>
            </div>

            <div className="card w-full h-[80px] flex items-center gap-6 ">
              <div className="icon w-[30%] h-full rounded-lg flex items-center justify-center bg-white ">
                <img src={mailboxQuality} alt="" className="w-[40px] h-[40px] "/>
              </div>
              <div className="texts">
                <h3 className="text-[#274C5B] font-bold text-2xl">Quality Standards</h3>
                <p className="text-[#274C5B]">We ensure the highest quality standards in our products.</p>
              </div>
            </div>
          </div>
          <button type="button"
                  className="w-[150px] h-[50px] rounded-2xl bg-[#274C5B] text-white flex items-center justify-center gap-2 ">
            <b>Shop Now</b>
            <div className="icon w-[25px] h-[25px] Ajustify-center bg-[#335b6b] rounded-full text-white text-[15px] "><i className="fas fa-arrow-right"></i></div>
          </button>
        </div>
      </article>

      <article className="categoreis w-full h-[200vh] text-center 
                          max-[480px]:h-[780vh]
                          max-md:h-[280vh]
                          ">
        <h3 className="font-[YellowTail] text-3xl text-[#7EB693] mt-20 ">Categories</h3>
        <h1 className="font-bold text-[#274C5B] text-4xl ">Our Products</h1>
        <div className="products w-full h-[135vh] mt-10 grid grid-cols-4 gap-6 px-40 
                        max-[480px]:grid-cols-1
                        max-md:grid-cols-2
                        ">
          {products.map((product, index) => (
              <div key={index}
                   className="productCard   bg-[#F9F8F8] shadow-lg rounded-2xl Ajustify-center-col">
                <div className="productNav w-full h-[20%] flex  justify-start items-start p-4  "><p className="text-white bg-[#274C5B] inline px-3 py-1 rounded-lg ">{product.category}</p></div>
                <div className="productImage w-full h-[60%]  Ajustify-center "><img src={product.img} alt="" className="w-35  " /></div>
                <div className="productFooter w-full h-[20%]  ">
                  <h2 className="text-xl text-start pl-3 font-semibold text-[#274C5B]">{product.name}</h2>
                  <hr className="border-gray-400 w-[90%] ml-2 " />
                  <div className="price-rating flex items-center justify-between px-2 gap-2 mt-2">
                    <div className="price flex gap-2 items-center ">
                      <span className="line-through text-gray-400">${product.oldPrice}.00</span>
                      <span className="text-lg font-bold text-[#274C5B] ">${product.price}.00</span>
                    </div>
                    <div className="rating text-yellow-400 ">{"★".repeat(product.rating)}</div>
                  </div>
                </div>
              </div>
            )).slice(0, 8)}
        </div>
        <div className="btn w-full Ajustify-center ">
          <button type="button" onClick={()=> navigate('/shop')}
                  className="w-[150px] h-[60px] rounded-lg bg-[#274C5B] text-white Ajustify-center gap-2 mt-16 ">
            <b>Load More</b>
            <div className="icon w-[25px] h-[25px] Ajustify-center bg-[#335b6b] rounded-full text-white text-[15px] "><i className="fas fa-arrow-right"></i></div>
          </button>
        </div>
      </article>

      <article style={{ backgroundImage: `url(${Testimonialbackground})` }}
               className="testimonial w-full h-[120vh] bg-cover Ajustify-center ">
        <div className="w-[80%] h-full Ajustify-center-col gap-4 ">
          <div className="content w-[70%] h-[60vh] text-[#274C5B]  Ajustify-center-col ">
            <h3 className="text-[#7EB693] font-[YellowTail] text-2xl ">Testimonials</h3>
            <h1 className="text-4xl font-bold  ">What Our Customer Saying?</h1>
            <img src={TestimonialHuman} alt="TestimonialHuman" className="rounded-full  " />
            <span className="rating text-yellow-400 text-lg ">{"★".repeat(5)}</span>
            <p className="w-[85%] text-center"> Simply dummy text of the printing and typesetting industry. Lorem Ipsum simply dummy text of the printing and typesetting industry. Lorem Ipsum has been.</p>
            <h1 className="text-2xl font-bold ">Sara Taylor</h1>
            <p className="">Consumer</p>
          </div>
          <hr className="border-[#E0E0E0] w-[75%] " />
          <div className="counterest w-[80%] h-[50vh] flex justify-evenly items-center ">
            <div className="counter Ajustify-center-col  w-[150px] h-[150px] border-3 border-[#7EB693] rounded-full bg-[#F1F1F1] text-[#274C5B] "><h1 className="font-bold text-5xl ">100%</h1><p className="font-medium">Organic</p></div>
            <div className="counter Ajustify-center-col  w-[150px] h-[150px] border-3 border-[#7EB693] rounded-full bg-[#F1F1F1] text-[#274C5B] "><h1 className="font-bold text-5xl ">285</h1><p className="font-medium">Active Product</p></div>
            <div className="counter Ajustify-center-col  w-[150px] h-[150px] border-3 border-[#7EB693] rounded-full bg-[#F1F1F1] text-[#274C5B] "><h1 className="font-bold text-5xl ">350+</h1><p className="font-medium">Organic Orchads</p></div>
            <div className="counter Ajustify-center-col  w-[150px] h-[150px] border-3 border-[#7EB693] rounded-full bg-[#F1F1F1] text-[#274C5B] "><h1 className="font-bold text-5xl ">25+</h1><p className="font-medium ">Years of Farming</p></div>
          </div>
        </div>
      </article>

      <article className="offer w-full h-screen bg-[#274C5B] Ajustify-center-col  ">
        <div className="texts w-[75%] h-[25vh] relative pt-20 ">
          <h1 className=" font-[YellowTail] text-3xl text-[#7EB693] ">Offer</h1>
          <h1 className="text-white text-4xl font-bold  ">We Offer Organic For You</h1>
          <button type="button"
                  className="w-[150px] h-[60px] rounded-lg bg-[#EFD372] text-white Ajustify-center gap-2 mt-16 absolute right-0 bottom-0 ">
            <b>Load More</b>
            <div className="icon w-[25px] h-[25px] Ajustify-center bg-[#274C5B] rounded-full text-white text-[15px] "><i className="fas fa-arrow-right"></i></div>
          </button>
        </div>
        <div className="products w-full h-[50vh] mt-10 grid grid-cols-4 gap-6 px-40 
                        max-md:grid-cols-2
                        max-[480px]:grid-cols-1
                        ">
          {products.map((product, index) =>{ 
            return (
            <div key={index}
                 className="productCard   bg-[#F9F8F8] shadow-lg rounded-2xl Ajustify-center-col">
              <div className="productNav w-full h-[20%] flex  justify-start items-start p-4  "><p className="text-white bg-[#274C5B] inline px-3 py-1 rounded-lg ">{product.category}</p></div>
              <div className="productImage w-full h-[60%]  Ajustify-center "><img src={product.img} alt="" className="w-35  " /></div>
              <div className="productFooter w-full h-[20%]  ">
                <h2 className="text-xl text-start pl-3 font-semibold text-[#274C5B]">{product.name}</h2>
                <hr className="border-gray-400 w-[90%] ml-2 " />
                <div className="price-rating flex items-center justify-between px-2 gap-2 mt-2">
                  <div className="price flex gap-2 items-center ">
                    <span className="line-through text-gray-400">${product.oldPrice}.00</span>
                    <span className="text-lg font-bold text-[#274C5B] ">${product.price}.00</span>
                  </div>
                  <div className="rating text-yellow-400 ">{"★".repeat(product.rating)}</div>
                </div>
              </div>
            </div>
            )}).slice(12, 16)}
        </div>
      </article>

      <article className="EcoFriendly w-full h-screen flex ">
        <div className='artLeft bg-cover w-[50%] h-full  ' style={{backgroundImage : `url(${ecoFriendly})`}}></div>
        <div className='artRight w-[50%] h-full flex items-center  '>
          <div className="texts w-full h-[78%] text-[#274C5B] rounded-2xl ml-[-70px] pl-[70px] pt-[30px] bg-white ">
            <h3 className="font-[YellowTail] text-[#7EB693] text-3xl ">Eco Friendly</h3>
            <h1 className="font-bold text-4xl py-5 ">Econis is a Friendly <br /> Organic Store</h1>
            <div className="textGroup py-2 ">
              <h1 className="font-bold text-xl">Start with Our Company First</h1>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptat accusantium doloremque laudantium. Sed ut perspiciatis.</p>
            </div>
            <div className="textGroup py-2 ">
              <h1 className="font-bold text-xl">Learn How to Grow Yourself</h1>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptat accusantium doloremque laudantium. Sed ut perspiciatis.</p>
            </div>
            <div className="textGroup py-2 ">
              <h1 className="font-bold text-xl">Farming Strategies of Today</h1>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptat accusantium doloremque laudantium. Sed ut perspiciatis.</p>
            </div>
          </div>
        </div>
      </article>

      <article className='w-full h-[80vh] bg-[#F1F8F4] flex items-center  '>
        <div className="row w-full h-[60%] grid grid-rows-1 grid-cols-3 gap-4 ">
        {A.map((img, index)=>{
          return (
              <div className="col Ajustify-center " style={{backgroundImage: `url(${img.img})`}} key={index}>
                  <h1 className="inline px-10 py-4 font-semibold rounded-lg text-[#274C5B] bg-white ">{img.name}</h1>
              </div>
          )})}
        </div>
      </article>

      <article className="NewsContainer w-full h-[150vh] pt-[100px] flex flex-col items-center ">
        <nav className="News w-[80%] Ajustify-between  ">
          <div className="r w-[80%] ">
            <h3 className="text text-[#7EB693] font-[YellowTail] text-3xl  ">News</h3>
            <h1 className="text text-[#274C5B] font-bold text-5xl ">Discover weekly content about organic food, & more</h1>
          </div>
          <div className="l w-[20%] flex justify-end ">
          <button type="button" onClick={()=> navigate('/blog')}
                  className="w-[150px] h-[60px] rounded-lg  text-[#274C5B] Ajustify-center gap-2 mt-16 border-2 border-[#274C5B]  ">
            <b>More News</b>
            <div className="icon w-[25px] h-[25px] Ajustify-center bg-[#274C5B] rounded-full text-white text-[15px] "><i className="fas fa-arrow-right"></i></div>
          </button>
          </div>
        </nav>
        <article className="News w-[80%] h-full grid grid-cols-2 grid-rows-10 gap-10 pt-20  ">
          {blogs.map((blog, index) => {
            return (
              <div key={index} className="New bg-cover row-[1/8] rounded-2xl flex flex-col items-center justify-end relative    " 
                   style={{ backgroundImage: `url(${blog.img})` }}>
                <h1 className="date bg-white rounded-full w-[70px] h-[70px] font-bold text-[#274C5B] text-xl flex items-center text-center absolute top-2 left-2  ">{blog.date}</h1>
                <div className="info w-[90%] h-[200px] rounded-2xl -mb-12 bg-[#fff] shadow-2xl pl-10 pt-6 text-[#274C5B]  ">
                  <h3 className="user font-semibold "><i className="fa-solid fa-user text-[#EFD372]"></i> {blog.user}</h3>
                  <h1 className="title font-bold text-lg ">{blog.title}</h1>
                  <p className="description w-[85%] ">{blog.description}</p>
                  <h1 className="readMore font-bold w-[180px] h-[60px] rounded-lg bg-[#EFD372]  Ajustify-center gap-2">Read More <button type="button" className="Ajustify-center rounded-full text-white bg-[#274C5B] p-1"><i className="fa-solid fa-arrow-right"></i></button></h1>
                </div>
              </div>
            );
          }).slice(0, 2)}
        </article>
      </article>
      <FooterTop />
      <FooterBottom />
    </>
)}