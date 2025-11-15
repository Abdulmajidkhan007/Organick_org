import "./Fonts.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { store } from "./Store";
import { Provider } from "react-redux";
import { Home } from "./Components/Home";
import { About } from "./Components/About";
import { Shop } from "./Components/Shop";
import { ShopSingle } from "./Components/ShopSingle";
import { Service } from "./Components/Service";
import { Team } from "./Components/Team";
import { Contact } from "./Components/Contact";
import { NotFound } from "./Components/NotFound";
import { Blog } from "./Components/Blog";
import { Portfoilo } from "./Components/Portfoilo";
import { PortfoiloSingle } from "./Components/PortfoiloSingle";

export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shopsingle" element={<ShopSingle />} />
            <Route path="/service" element={<Service />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/team" element={<Team />} />
            <Route path="/portfoilo" element={<Portfoilo />} />
            <Route path="/portfoilosingle" element={<PortfoiloSingle />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Provider>
      </BrowserRouter>
    </>
  );
};

// ()=> window.open('https://instagram.com', "_blank")
