import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import footer from "../assets/footer.png";

export const FooterTop = () => {
  // const navigate = useNavigate();

  const botToken = '8411922705:AAE-EJmBpTr7bls_52HEnyBqELq_0j2j2Zw'
  const groupToken = '-1003179963312'
  const groupToken_Feedback = 13
  // const groupToken_Contact = 23

  const [message, setMessage] = useState()


  const postingMessage = ()=>{
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${groupToken}`,{
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        chat_id: groupToken,
        message_thread_id: groupToken_Feedback,
        text: message
      })
    })
  }
  
  //   alert('Subscribed successfully!')



  return (
    <footer className="footer-top w-full h-[75vh] Ajustify-center">
      <div
        style={{ backgroundImage: `url(${footer})` }}
        className="formback rounded-2xl w-[95%] h-[45vh] Ajustify-center bg-cover bg-center "
      >
        <div className="w-[80%] h-[150px] flex justify-between text-white items-center ">
          <h1 className="text-5xl font-bold ">
            Subscribe to <br /> our Newsletter
          </h1>
          <div className="form w-[450px] h-max flex gap-2 ">
            <input type="text" placeholder="Your email address" onInput={(e)=> setMessage(e.target.value)}
              className="w-[60%] h-[70px] bg-white text-gray-500 outline-0 border-0 rounded-2xl pl-2 "
            />
            <button type="button" onClick={() => {postingMessage()}}
              className="w-[40%] h-[70px] bg-[#274C5B] rounded-2xl text-white text-lg font-bold"
              >Subscribe</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const FooterBottom = () => {
  const navigate = useNavigate();
  return (
    <footer className="w-full h-[55vh] bg-white pt-6 ">
      <div className="footer-bottom w-full h-[55vh] text-[#274C5B] grid grid-cols-3 grid-rows-10 ">
        <div className="card row-[1/9] border-r border-[#ccccccad]  flex flex-col items-end pr-10 gap-2   ">
          <h1 className="text-3xl font-bold ">Contact Us</h1>
          <h3 className="font-bold ">Email</h3>
          <p className="font-[400] ">abdullohdevlc@gmail.com</p>
          <h3 className="font-bold ">Phone</h3>
          <p className="font-[400] ">+998 90 854 56 03</p>
          <h3 className="font-bold ">Addrees</h3>
          <p className="font-[400] ">88 road, borklyn street, USA</p>
        </div>
        <div className="card row-[1/9] border-r border-[#ccccccad] text-center flex flex-col gap-6 justify-center items-center ">
          <div className="logo flex items-center" onClick={() => navigate("/")}>
            <img src={logo} alt="" className="w-[30px] h-[50px] " />
            <h1 className="text-3xl font-bold cursor-pointer ">Organick</h1>
          </div>
          <p>
            Simply dummy text of the printing and typesetting industry. Lorem
            Ipsum simply dummy text of the printing{" "}
          </p>
          <ul className="icons flex gap-2 ">
            <li className="icon w-[50px] h-[50px] bg-gray-300 rounded-full text-2xl  ">
              <a href="https://www.instagram.com/organick/" target="_blank" className='iconHover Ajustify-center relative'><i className="fa-brands fa-instagram"></i>
              </a>
            </li>
            <li className="icon w-[50px] h-[50px] bg-gray-300 rounded-full text-2xl  ">
              <a href="https://www.instagram.com/Abdulloh.o7l" target="_blank" className='iconHover Ajustify-center relative'><i className="fa-brands fa-facebook"></i>
              </a>
            </li>
            <li className="icon w-[50px] h-[50px] bg-gray-300 rounded-full text-2xl  ">
              <a href="https://www.instagram.com/Abdulloh.o7l" target="_blank" className='iconHover Ajustify-center relative'><i className="fa-brands fa-twitter"></i>
              </a>
            </li>
            <li className="icon w-[50px] h-[50px] bg-gray-300 rounded-full text-2xl  ">
              <a href="https://t.me/organick_org" target="_blank" className='iconHover Ajustify-center relative'><i className="fa-brands fa-telegram"></i>
              </a>
            </li>
          </ul>
        </div>
        <div className="card row-[1/9] pl-10 ">
          <h1 className="font-bold text-3xl ">Utility Pages</h1>
          <ul className="flex flex-col gap-4 mt-4 ">
            <li><button onClick={()=> navigate('/')}>Style Guide</button></li>
            <li><button onClick={()=> navigate('NotFound')}>404 Not Found</button></li>
            <li><button onClick={()=> navigate('/')}>Password Protected</button></li>
            <li><button onClick={()=> navigate('/')}>Licences</button></li>
            <li><button onClick={()=> navigate('/')}>Changelog</button></li>
          </ul>
        </div>
        <div className="footer row-[9/11] col-[1/4] flex flex-col justify-center items-center border-t-2 border-[#ccccccad] ">
          <p>
            Copyright © Organick | Designed by VictorFlow Templates - Powered by{" "}
            <a target="_blank" href="https://t.me/Abdulloh_77700">
              Abdulloh
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
