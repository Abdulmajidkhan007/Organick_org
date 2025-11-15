import React from 'react'
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'

import { ScrollIndicator } from './ScrollIndicator'

export const Navbar = () => {
    const navigate = useNavigate()
    return (
        <>
        <ScrollIndicator /> 
    <nav className='navbar w-full h-[20vh] bg-white text-[#274C5B] font-bold flex items-center justify-between px-16 sticky top-0  z-10 shadow-lg '>
        <div className="left-panel w-[60%]  flex items-center gap-10 ">
            <div className="logo flex items-center" onClick={()=> navigate('/')}>
                <img src={logo} alt="" className='w-[25%] h-[50px] ' />
                <h1 className='text-3xl cursor-pointer '>Organick</h1>
            </div>
            <ul className='flex items-center gap-4  '>
                <li className='hoverEffect1'><button onClick={()=> navigate('/home')}>Home</button></li>
                <li className='hoverEffect1'><button onClick={()=> navigate('/about')}>About</button></li>
                <li className='hoverEffect1'><button onClick={()=> navigate('/shop')}>Shop</button></li>
                <li className='hoverEffect1'><button onClick={()=> navigate('/service')}>Service</button></li>
                <li className='hoverEffect1'><button onClick={()=> navigate('/contact')}>Contact</button></li>
                <li className='hoverEffect1'><button onClick={()=> navigate('/blog')}>Blog</button></li>
                <li className='hoverEffect1'><button onClick={()=> navigate('/team')}>Team</button></li>                  
                <li className='hoverEffect1'><button onClick={()=> navigate('/portfoilo')}>Portfoilo</button></li>       
            </ul>
        </div>
        <div className="right-panel w-[40%] flex justify-between gap-4 ">
            <div className="search w-[35%] h-[40px] relative rounded-2xl  ">
                <input type="text" placeholder="Search..."
                       className='absolute w-full h-full bg-[#F9F8F8] rounded-[inherit] pl-2 '  />
                <button className='absolute right-0 top-0 w-[40px] h-full rounded-full bg-[#7EB693] text-white 
                                   flex items-center justify-center'><i className="fas fa-search"></i></button>
            </div>
            <button className="cart relative w-[40px] h-[40px] rounded-full bg-[#F9F8F8] flex items-center justify-center">
                <i className="fas fa-shopping-cart text-[#274C5B]"></i>
                <span className='absolute top-[-10px] right-[-10px] bg-[#7EB693] text-white text-xs w-[20px] h-[20px] rounded-full flex items-center justify-center'>0</span>
            </button>
        </div>
    </nav>
    </>
  )
}