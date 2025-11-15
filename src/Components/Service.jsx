import React from 'react'
import { Navbar } from './Navbar'
import { FooterBottom } from './Footer'

import ServiceHeaderBack from '../assets/service/ServiceHeaderBack.png'
import ServiceHeaderFront from '../assets/service/ServiceHeaderFront.png'
import Service3 from '../assets/Service/Service3.png'
export const Service = () => {
  return (
    <>
    <Navbar />
    <header style={{backgroundImage: `url(${ServiceHeaderBack})`}}
            className="w-full h-[50vh] bg-cover ">
        <div style={{backgroundImage : `url(${ServiceHeaderFront})`}} 
        className="w-full h-full bg-cover Ajustify-center  ">
          <h1 className="font-bold text-[#274C5B] text-5xl ">Services</h1>
        </div>
    </header>
    <article className="w-full h-[200vh]  ">
      <div className="texts w-full h-[50vh] border text-center ">
        <h3 className="font-[YellowTail] text-[#7EB693] ">What we Grow</h3>
        <h1 className="font-bold text-[#274C5B] text-5xl ">Better Agriculture for Better Future</h1>
      </div>

    </article>
    <article className="video w-full h-screen bg-cover " style={{backgroundImage: `url(${Service3})`}}>
      <div className="texts w-full h-[70vh] Ajustify-center-col text-center pt-20  ">
        <h3 className="font-[YellowTail] text-[#7EB693] text-4xl ">Organic Only</h3>
        <h1 className="text-[#274C5B] font-bold text-5xl py-5 ">Everyday Fresh & Clean</h1>
        <p className="text-[#274C5B] w-[42%] py-5 ">Simply dummy text of the printing and typesetting industry. Lorem had ceased to been the industry's standard dummy text ever since the </p>
        <div className="videoIcon w-[100px] h-[100px] cursor-pointer rounded-full Ajustify-center text-white text-2xl bg-[#7EB693] " onClick={()=> window.open('https://t.me/Abdullohworlds/167')}><i className="fa-solid fa-play"></i></div>
      </div>
    </article>
    <FooterBottom />
    </>
  )
}
