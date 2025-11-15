import React from "react";
import { Navbar } from "./Navbar";
import { FooterBottom, FooterTop } from "./Footer";
import { useSelector } from "react-redux";

export const ShopSingle = () => {

  const shopSingle = useSelector((state)=> state)

  console.log(shopSingle);

  return (
    <>
      <Navbar />
      <div className="w-full  h-[100vh] relative z-30 ">
        {/* <div className="productCard w-[300px] h-[500px]   bg-[#F9F8F8] shadow-lg rounded-2xl Ajustify-center-col">
          <div className="productNav w-full h-[20%] flex  justify-start items-start p-4  ">
            <p className="text-white bg-[#274C5B] inline px-3 py-1 rounded-lg ">
              {product.category}
            </p>
          </div>
          <div className="productImage w-full h-[60%]  Ajustify-center ">
            <img src={product.img} alt="" className="w-35  " />
          </div>
          <div className="productFooter w-full h-[20%]  ">
            <h2 className="text-xl text-start pl-3 font-semibold text-[#274C5B]">
              {product.name}
            </h2>
            <hr className="border-gray-400 w-[90%] ml-2 " />
            <div className="price-rating flex items-center justify-between px-2 gap-2 mt-2">
              <div className="price flex gap-2 items-center ">
                <span className="line-through text-gray-400">
                  ${product.oldPrice}.00
                </span>
                <span className="text-lg font-bold text-[#274C5B] ">
                  ${product.price}.00
                </span>
              </div>
              <div className="rating text-yellow-400 ">
                {"★".repeat(product.rating)}
              </div>
            </div>
          </div>
        </div> */}
      </div>

      <FooterTop />
      <FooterBottom />
    </>
  );
};
