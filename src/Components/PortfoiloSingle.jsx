import React from 'react'
import { Navbar } from './Navbar'
import { FooterBottom, FooterTop } from './Footer'

export const PortfoiloSingle = (port) => {
  console.log(port);
  const data = JSON.parse(localStorage.getItem("portfoilo"))
  console.log(data);
  
  return (
    <>
    <Navbar />
    {/* <img src="" alt="" /> */}
    <FooterTop />
    <FooterBottom />
    </>
  )
}
