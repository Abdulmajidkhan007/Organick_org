import { Navbar } from "./Navbar";
import { FooterBottom } from "./Footer";

import NotFoundback from "../assets/NotFoundback.png";
import NotFoundfront from "../assets/NotFoundfront.png";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {

  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main style={{ backgroundImage: `url(${NotFoundback})` }}
            className="back w-full h-[80vh] bg-cover bg-center ">
        <div style={{ backgroundImage: `url(${NotFoundfront})` }}
             className="front w-full h-[80vh] bg-cover bg-center flex justify-end ">
          <div className="w-[700px] h-full flex flex-col items-start gap-4 pl-30 ">
            <span>
            <h1 className="text-[180px] text-[#8FA8A8] font-bold">404</h1>
            <p className="text-4xl text-[#274C5B] font-bold">Page Not Found</p>
            <p className="text-lg text-[#274C5B] ">The page you are looking for doesn't exist or has been moved</p>
            </span>
            <button type="button" onClick={()=> navigate('/')}
                    className="w-[200px] h-[70px] rounded-2xl bg-[#274C5B] text-white flex items-center justify-center gap-2 ">
              <b>Go to Homepage</b>
              <i className="fas fa-arrow-right bg-[#335B6B] rounded-full text-white text-[12px] p-1 "></i>
            </button>
          </div>
        </div>
      </main>
      <FooterBottom />
    </>
  );
};
