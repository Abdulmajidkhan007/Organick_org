export const ContactForm = () => {
  return (
    <div className="w-[80%] h-full px-4 p-8 space-y-6 ">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block py-3 text-sm font-medium text-[#274C5B] ">Full Name*</label>
            <input type="text" id="fullName" placeholder="Your Email Address" className="inpHover w-full h-[50px] "/>
          </div>
          <div>
            <label htmlFor="email" className="block py-3 text-sm font-medium text-[#274C5B] ">Your Email*</label>
            <input type="email" id="email" placeholder="example@yourmail.com" className="inpHover w-full h-[50px] "/>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="company" className="block py-3 text-sm font-medium text-[#274C5B] ">Company*</label>
            <input type="text" id="company" placeholder="yourcompany name here" className="inpHover w-full h-[50px] "/>
          </div>
          <div>
            <label htmlFor="subject" className="block py-3 text-sm font-medium text-[#274C5B] ">Subject*</label>
            <input type="text" id="subject" placeholder="how can we help" className="inpHover w-full h-[50px] "/>
          </div>
        </div>
        <div>
          <label htmlFor="message" className="block py-3 text-sm font-medium text-[#274C5B] ">Message*</label>
          <textarea id="message" rows="5" placeholder="hello there, i would like to talk about how to..." className="inpHover w-full "></textarea>
        </div>
        <div className="pt-2">
        <button type="button" className="w-[170px] h-[60px] rounded-2xl bg-[#274C5B] text-white font-medium  ">Send Message</button>
        </div>
    </div>
  )};