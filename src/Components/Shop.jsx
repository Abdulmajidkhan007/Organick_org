import { Navbar } from "./Navbar";
import { FooterBottom, FooterTop } from "./Footer";

import shopfront from "../assets/shop/shopfront.png";
import shopback from "../assets/shop/shopback.png";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShopSingle } from "./ShopSingle";

export const Shop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.products);

  return (
    <>
      <Navbar />
      <header className="w-full h-[300px] bg-cover " style={{ backgroundImage: `url(${shopback})` }}>
        <div className="w-full h-full bg-cover Ajustify-center " style={{ backgroundImage: `url(${shopfront})` }}>
          <h1 className="font-bold text-[#274C5B] text-5xl ">Shop</h1>
        </div>
      </header>

      <div className="products w-full h-[250vh] mt-10 grid grid-cols-4 gap-6 px-40 
                      max-[480px]:grid-cols-1
                      max-md:grid-cols-2  ">
        {products.map((product, index) => {
          return (
            <div key={index} onClick={() => {navigate(`/shopsingle`); dispatch({type : '', shopSingle: product})  }}
            className="productCard   bg-[#F9F8F8] shadow-lg rounded-2xl Ajustify-center-col">
                <div className="productNav w-full h-[20%] flex  justify-start items-start p-4  "><p className="text-white bg-[#274C5B] inline px-3 py-1 rounded-lg ">{product.category}</p></div>
                <div className="productImage w-full h-[60%]  Ajustify-center "><img src={product.img} alt="" className="w-35  " /></div>
                <div className="productFooter w-full h-[20%]  ">
                  <h2 className="text-xl text-start pl-3 font-semibold text-[#274C5B]">{product.name}</h2>
                  <hr className="border-gray-400 w-[90%] ml-2 " />
                  <div className="price-rating flex items-center justify-between px-2 gap-2 mt-2">
                    <div className="price flex gap-2 items-center ">
                      <span className="line-through text-gray-400">${product.oldPrice}.00</span>
                      <span className="text-lg font-bold text-[#274C5B] ">${product.price}.00</span>
                    </div>
                    <div className="rating text-yellow-400 ">{"★".repeat(product.rating)}</div>
                  </div>
                </div>
            </div>
            )}).slice(0, 16)}
      </div>
      <FooterTop />
      <FooterBottom />
    </>
  );
};
