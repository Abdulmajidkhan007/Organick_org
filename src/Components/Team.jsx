import { FooterBottom, FooterTop } from "./Footer";
import { Navbar } from "./Navbar";

import TeamHeaderBack from "../assets/Team/TeamHeaderBack.png";
import TeamHeaderFront from "../assets/Team/TeamHeaderFront.png";
import { useSelector } from "react-redux";



// figure.cardborder>img.+figcaption.>h1.font-boldtext-274C5B+.w-fullflexjustify-betweenitems-center>h3.font-YellowTailtext-7EB693+.icons.text-7EB693flexitems-centergap-2>i.fa-brands*3

export const Team = () => {

  const teams = useSelector((state) => state.teams.teams);
  console.log(teams);
  
  
  return (
    <>
      <Navbar />
      <header style={{ backgroundImage: `url(${TeamHeaderBack})` }}
              className="w-full h-[318px] bg-center bg-contain bg-no-repeat  ">
        <div style={{backgroundImage: `url(${TeamHeaderFront})`}}
             className="w-full h-[318px] bg-center bg-contain bg-no-repeat  Ajustify-center ">
                <h1 className="text-[#274C5B] font-bold text-5xl mb-10 ">Our Team</h1>
        </div>
      </header>
      <article className="teams w-full h-[180vh] Ajustify-center-col ">
        <h1 className="font-[YellowTail] text-[#7EB693] text-5xl  ">Team</h1>
        <h1 className="text-[#274C5B] text-5xl font-bold my-3 ">Our Organic Experts</h1>
        <p className="w-[55%] text-center text-[#274C5B] mb-4 ">Simply dummy text of the printing and typesetting industry. Lorem had ceased to been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
        <div className="Teams w-[75%] h-[135vh] grid grid-cols-3 gap-2  ">
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
          })}
        </div>
      </article>
        
      <FooterTop />
      <FooterBottom />
    </>
  );
};
