import { FooterBottom, FooterTop } from "./Footer"
import { Navbar } from "./Navbar"

import ContactHeader from '../assets/contact/ContactHeader.png'
import Contact2 from '../assets/contact/Contact2.png'
import card1 from '../assets/contact/card1.png'
import card2 from '../assets/contact/card2.png'
import Contact3 from '../assets/contact/Contact3.png'
import { ContactForm } from "./ContactForm"

export const Contact = () => {
  return (
    <>
    <Navbar />
    <header style={{backgroundImage: `url(${ContactHeader})`}}
            className="w-full h-[50vh] bg-cover Ajustify-center ">
      <h1 className="font-bold text-[#274C5B] text-5xl ">Contact Us</h1>
    </header>
    <section className="w-full h-max Ajustify-center-col ">
      <article className="sect1 w-[90%] h-screen flex ">
        <div className="sectRight w-[50%] h-full p-10 "><img src={Contact2} alt="Contact2.png" className="object-cover w-full h-full rounded-2xl " /></div>
        
        <div className="sectLeft  w-[50%] h-full text-[#274C5B] p-10 ">
          <h1 className="font-bold text-[36px]  ">We'd love to talk about how we can work together.</h1>
          <p className="text py-4 ">Simply dummy text of the printing and typesetting industry. Lorem had ceased to  been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
          <div className="cards w-[300px] h-[200px] Ajustify-center-col gap-4  ">
          <figure className="card w-full h-[50%] border border-[#ccc] bg-white rounded-2xl p-2 flex gap-2 ">
            <div className="img w-[30%] bg-[#F9F8F9] rounded-2xl Ajustify-center  "><img src={card1} alt="card1" className="w-[50%]  " /></div>
            <figcaption className="w-[70%] Ajustify-start-col ">
              <h1 className="font-bold ">Message</h1>
              <p className="">support@organic.com</p>
            </figcaption>
          </figure>
          <figure className="card w-full h-[50%] border border-[#ccc] bg-white rounded-2xl p-2 flex gap-2 ">
            <div className="img w-[30%] bg-[#F9F8F9] rounded-2xl Ajustify-center  "><img src={card2} alt="card2" className="w-[50%] " /></div>
            <figcaption className="w-[70%] Ajustify-start-col ">
              <h1 className="font-bold ">Contact</h1>
              <p className="">+01 123 456 789</p>
            </figcaption>
          </figure>
          </div>
          <ul className="icons w-[250px] pt-10 flex gap-3 ">
            <li className="icon w-[50px] h-[50px] bg-gray-100 rounded-full text-2xl  ">
              <a href="https://www.instagram.com/organick/" target="_blank" className='iconHover Ajustify-center relative'><i className="fa-brands fa-instagram"></i>
              </a>
            </li>
            <li className="icon w-[50px] h-[50px] bg-gray-100 rounded-full text-2xl  ">
              <a href="https://www.instagram.com/Abdulloh.o7l" target="_blank" className='iconHover Ajustify-center relative'><i className="fa-brands fa-facebook"></i>
              </a>
            </li>
            <li className="icon w-[50px] h-[50px] bg-gray-100 rounded-full text-2xl  ">
              <a href="https://www.instagram.com/Abdulloh.o7l" target="_blank" className='iconHover Ajustify-center relative'><i className="fa-brands fa-twitter"></i>
              </a>
            </li>
            <li className="icon w-[50px] h-[50px] bg-gray-100 rounded-full text-2xl  ">
              <a href="https://t.me/organick_org" target="_blank" className='iconHover Ajustify-center relative'><i className="fa-brands fa-telegram"></i>
              </a>
            </li>
          </ul>
        </div>
      </article>
      <article className="sect2 w-[90%] h-screen Ajustify-center ">
        <div className="img w-[94%] h-[94%] bg-cover rounded-2xl flex justify-end pr-20 py-20 " style={{backgroundImage: `url(${Contact3})`}}>
          <div className="texts w-[500px] h-[500px] bg-white text-[#274C5B] rounded-2xl p-10 ">
            <h3 className="text-[#7EB693] font-[YellowTail] text-4xl ">Location</h3>
            <h1 className="font-bold text-[40px] ">Our Farms</h1>
            <p className="text-lg ">Established fact that a reader will be distracted <br /> by the readable content of a page when looking <br /> a layout. The point of using.</p>
            <div className="cards w-[230px] h-[200px] Ajustify-center-col ">

              <figure className="card w-full h-[50%] flex gap-2 ">
                <div className="icon w-[30%] text-[#7EB693] Ajustify-center text-4xl  "><i className="fa-solid fa-location-dot" ></i></div>
                <figcaption className="w-[70%] Ajustify-start-col ">
                  <h1 className="font-bold ">New York, USA:</h1>
                  <p className="">299 Park Avenue New York, New York 10171</p>
                </figcaption>
              </figure>

              <figure className="card w-full h-[50%] p-2 flex gap-2 ">
                <div className="img w-[30%] text-[#7EB693] text-4xl Ajustify-center  "><i className="fa-solid fa-location-dot"></i></div>
                <figcaption className="w-[70%] Ajustify-start-col ">
                  <h1 className="font-bold ">London, UK</h1>
                  <p className="">30 Stamford Street, London SE1 9LQ</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

      </article>

      <article className="sect3 w-[90%] h-screen Ajustify-center  ">
        <ContactForm/>
      </article>
    </section>

    <FooterTop />
    <FooterBottom />
    </>
  )
}
