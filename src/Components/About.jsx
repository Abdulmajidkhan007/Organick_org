import React from "react";
import { Navbar } from "./Navbar";
import { FooterBottom, FooterTop } from "./Footer";
import { useSelector } from "react-redux";

import aboutUsBack from "../assets/about/aboutUsBack.png";
import aboutUsFront from "../assets/about/aboutUsFront.png";
import aboutUs2Left from "../assets/about/aboutUs2Left.png";
import traktor from "../assets/about/traktor.svg";
import traktorRight from "../assets/about/traktorRight.svg";
import aboutUs3Right from "../assets/about/aboutUs3Right.png";
// import { useNavigate } from "react-router-dom";

export const About = () => {
  // const navigate = useNavigate()
  // const dispatch = useDispatch()
  const teams = useSelector(state => state.teams.teams)
  const products = useSelector((state) => state.products.products);


  const B = [
    {
      icon: 'fa-solid fa-cart-shopping',
      heading: 'Return Policy',
      paragraph: 'Simply dummy text of the printintypesetting industry.'
    },
    {
      icon: 'fa-solid fa-leaf',
      heading: '100% Fresh',
      paragraph: 'Simply dummy text of the printintypesetting industry.'
    },
    {
      icon: 'fa-solid fa-clock ',
      heading: 'Support 24/7',
      paragraph: 'Simply dummy text of the printintypesetting industry.'
    },
    {
      icon: 'fa-solid fa-credit-card',
      heading: 'Secured Policy',
      paragraph: 'Simply dummy text of the printintypesetting industry.'
    },
  ]

  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${aboutUsBack})` }} className="headerBack w-full h-[50vh] bg-cover ">
        <div style={{ backgroundImage: `url(${aboutUsFront})` }} className="headeFront w-full h-full bg-cover Ajustify-center ">
          <h1 className="text-[#274C5B] font-bold text-5xl ">About Us</h1>
        </div>
      </header>

      <main className="aboutUs w-full h-screen flex  ">
        <div className="aboutUs2Left w-[50%] Ajustify-center "><img src={aboutUs2Left} alt="aboutUs2Left Alt" /></div>
        
        <div className="aboutUsRight w-[50%] p-8 ">
          <h3 className="font-[YellowTail] text-[#7EB693] text-2xl ">About Us</h3>
          <h1 className="text-[#274C5B] font-bold text-4xl ">We do Creative <br /> Things for Success</h1>
          <p className="text-[#274C5B] mt-2 "> Simply dummy text of the printing and typesetting industry. Lorem had ceased to been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley. <br /> <br /> Simply dummy text of the printing and typesetting industry. Lorem had ceased to been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
        
          <div className="cards w-full h-[120px] flex justify-between items-center  ">
            <div className="card w-full h-[80px] flex items-center gap-6 ">
              <div className="icon w-[30%] h-full flex items-center justify-center p-2  "><img src={traktor} alt="" className="w-full h-full " /></div>
              <div className="texts"><h3 className="text-[#274C5B] font-bold text-lg ">Modern Agriculture Equipment</h3>
              </div>
            </div>
        
            <div className="card w-full h-[80px] flex items-center gap-6 ">
            <div className="icon w-[30%] h-full flex items-center justify-center p-2 "><img src={traktorRight} alt="" className="w-full h-full " /></div>
              <div className="texts"><h3 className="text-[#274C5B] font-bold text-lg ">No growth <br /> hormones are used</h3></div>
            </div>
          </div>

          <button type="button" className="w-[180px] h-[60px] rounded-2xl bg-[#274C5B] text-white flex items-center justify-center gap-2 " >
            <b>Explore More</b>
            <i className="fas fa-arrow-right bg-[#335b6b] rounded-full  text-[12px] p-1 "></i>
          </button>
        </div>
      </main>
      <article className="chooseUs w-full h-[170vh] bg-[#F1F1F1] flex justify-center items-center flex-wrap px-30 py-20 gap-y-10  ">
        <div className="artLeft w-[50%] h-[60%] ">
          <h3 className="font-[YellowTail] text-[#7EB693] text-4xl ">Why Choose us?</h3>
          <h1 className="text-[#274C5B] font-bold text-4xl py-5 w-[80%] ">We do not buy from the open market & traders.</h1>
          <p className="text-[#274C5B] text-[15px] w-[95%]  ">Simply dummy text of the printing and typesetting industry. Lorem had ceased to been the industry's standard  the 1500s, when an unknown</p>
          <div className="cards">
            <i className="fa-solid card-shopping"></i>
          </div>
        </div>
        <div className="artRight w-[50%] h-[60%]  ">
          <img src={aboutUs3Right} alt="aboutUs3Right.png" className=" rounded-4xl " />
        </div>
        <div className="foot w-full h-[35%] grid grid-cols-4 gap-10 pt-10 ">{
          B.map((card, index)=>{
            return(
              <div className="card text-[#274C5B] rounded-2xl Ajustify-center-col bg-[white]  " key={index}>
                <div className="icon Ajustify-center w-[80px] h-[80px] text-2xl bg-[#F9F8F8] rounded-2xl "><i className={card.icon}></i></div>
                <h1 className="font-bold py-2  ">{card.heading}</h1>
                <p className="text-center  ">{card.paragraph}</p>
              </div>
            )            
          })
          }
        </div>
      </article>
      <div className="TeamsFrame w-full h-[110vh] Ajustify-center-col  ">
        <h1 className='font-[YellowTail] text-[#7EB693] text-3xl '>Team</h1>
        <h1 className="text-[#274C5B] text-5xl font-bold my-3 ">Our Organic Experts</h1>
        <p className="w-[55%] text-center text-[#274C5B] mb-4 ">Simply dummy text of the printing and typesetting industry. Lorem had ceased to been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
        <div className="Teams w-[75%] h-[65vh] grid grid-cols-3 gap-2 mt-4  ">
            {teams.map((team, index)=>{
              return(
                <figure key={index} className="card w-[300px] h-[400px] overflow-hidden  bg-[#F9F9F9] rounded-2xl 
                                               hover:shadow-2xl hover:scale-105 duration-300
                ">
                <img src={team.team} alt="" />
                <figcaption className="p-3 ">
                  <h1 className="text-[#274C5B] font-bold ">{team.name}</h1>
                  <div className="w-full flex justify-between items-center ">
                    <h3 className="font-[YellowTail] text-[#7EB693] ">{team.job}</h3>
                    <div className="icons text-[#274C5B] flex items-center gap-2 ">
                      { team.isInstagram ? <i className="fa-brands fa-instagram cursor-pointer hover:text-[#11323f] "></i> : '' }
                      { team.isFacebook ? <i className="fa-brands fa-facebook  cursor-pointer hover:text-[#11323f] "></i>  : '' }
                      { team.isTwitter ? <i className="fa-brands fa-twitter   cursor-pointer hover:text-[#11323f] "></i> : '' }
                    </div>
                  </div>
                </figcaption>
              </figure>   
              )
            }).slice(0,3)}
          </div>
      </div>
      <article className="w-full h-screen Ajustify-center-col text-white bg-[#274C5B] border  ">
        <h3 className="font-[YellowTail] text-3xl text-[#7EB693] ">About Us</h3>
        <h1 className="text-5xl font-bold pb-10 ">What We Offer for You</h1>
        <div className="aboutUs w-[80%] h-[50vh] grid grid-cols-4 grid-rows-5 gap-x-10 ">
          {products.map((product, index) => {
              return (
                <>
                <div key={index} className=" bg-[#fff] shadow-lg row-[1/5] rounded-2xl Ajustify-center-col">
                    <div className=" w-full h-[60%]  Ajustify-center "><img src={product.img} alt="" className="w-35  " /></div>
                </div>
          <div className="category Ajustify-center row-[5/6] font-semibold ">{product.category}</div>
                </>
                )}).slice(16, 20)}
        </div>
      </article>
      <FooterTop />
      <FooterBottom />
    </>
  );
};
