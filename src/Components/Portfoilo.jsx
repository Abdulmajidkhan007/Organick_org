import { Navbar } from "./Navbar";

import { FooterBottom, FooterTop } from "./Footer";

import { useSelector } from "react-redux";

import PortfoiloHeaderBack from "../assets/portfoilo/PortfoiloHeaderBack.png";
import PortfoiloHeaderFront from "../assets/portfoilo/PortfoiloHeaderFront.png";
import { useNavigate } from "react-router-dom";
import { PortfoiloSingle } from "./PortfoiloSingle";
import { useState } from "react";

export const Portfoilo = () => {

  const navigate = useNavigate();
  
  const portfoilos = useSelector((state) => state.portfoilos.portfoilos);
  
   const [port, setPort] = useState()
  
  const sendData = () => {
    navigate("/portfoilosingle");
    // setPort(portfoilo)
    setPort('Salom')
    // localStorage.setItem("portfoilo", JSON.stringify(portfoilo));
  };
  // console.log(port);

  <PortfoiloSingle portfoilo={ port } />

  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${PortfoiloHeaderBack})` }}
              className="w-full h-[50vh] bg-cover ">
        <div style={{ backgroundImage: `url(${PortfoiloHeaderFront})` }}
             className="w-full h-full bg-cover Ajustify-center  "><h1 className="font-bold text-[#274C5B] text-5xl ">Portfoilo Standard</h1>
        </div>
      </header>
      <div className="portfoilo w-full h-[135vh] mt-10 grid grid-cols-3 gap-6 px-40 
                      max-md:grid-cols-2 
                      max-[480px]:grid-cols-1
                      ">
        {portfoilos.map((portfoilo, index) => {
          return (
            <div key={index} role="portfoiloCard"
              className="portfoiloCard gap-2 shadow-lg p-1 roounded-2xl Ajustify-center-col">
              <div className="portfoiloImage w-full h-[80%] relative overflow-hidden Ajustify-center   ">
                <img src={portfoilo.img} alt="" className="w-full h-full absolute rounded-2xl object-cover "/>
                <div role="portfoiloNavigate"
                     className="navigate w-[85%] h-[85%] rounded-2xl absolute z-3  bg-[#ffffffd8] Ajustify-center opacity-0  ">
                  <button type="button" role="portfoiloNavigateButton" onClick={() => sendData(portfoilo,index)}
                    className="w-10 h-10 bg-[#7EB693] text-white rounded-full Ajustify-center  ">
                    <i role="portfoiloNavigateButtonIcon" className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div className="portfoiloFooter w-full h-[20%]  ">
                <h2 className="text-xl text-start pl-3 font-bold text-[#274C5B]">{portfoilo.name}</h2>
                <h2 className="text-xl text-start pl-3 font-[YellowTail] font-bold text-[#7EB693]">{portfoilo.job}</h2>
              </div>
            </div>
          )})}
      </div>

      <FooterTop />
      <FooterBottom />
    </>
  );
};
