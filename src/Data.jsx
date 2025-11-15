import { createSlice } from "@reduxjs/toolkit";

import img1 from "./assets/shop/CalabreseBroccoli.png";
import img2 from "./assets/shop/FreshBananaFruites.png";
import img3 from "./assets/shop/WhiteNuts.png";
import img4 from "./assets/shop/VeganRedTomato.png";
import img5 from "./assets/shop/MungBean.png";
import img6 from "./assets/shop/BrownHazelnut.png";
import img7 from "./assets/shop/Eggs.png";
import img8 from "./assets/shop/ZelcoSujiElaichiRusk.png";
import img9 from "./assets/shop/Cucumber.png";
import img10 from "./assets/shop/WhiteHazelnut.png";
import img11 from "./assets/shop/FreshCorn.png";
import img12 from "./assets/shop/OrganicAlmonds.png";
import img13 from "./assets/shop/Cauliflower.png";
import img14 from "./assets/shop/Cucumber.webp";
import img15 from "./assets/shop/Onion.png";
import img16 from "./assets/shop/Cabbace.png";
import img17 from "./assets/about/Food1.png";
import img18 from "./assets/about/Undefined.png";
import img19 from "./assets/about/Pomegranate.png";
import img20 from "./assets/about/Potato.png";
import team1 from "./assets/Team/team1.png";
import team2 from "./assets/Team/team2.png";
import team3 from "./assets/Team/team3.png";
import team4 from "./assets/Team/team4.png";
import team5 from "./assets/Team/team5.png";
import team6 from "./assets/Team/team6.png";
import portfoilo1 from './assets/portfoilo/portfoilo1.png'
import portfoilo2 from './assets/portfoilo/portfoilo2.png'
import portfoilo3 from './assets/portfoilo/portfoilo3.png'
import portfoilo4 from './assets/portfoilo/portfoilo4.png'
import portfoilo5 from './assets/portfoilo/portfoilo5.png'
import portfoilo6 from './assets/portfoilo/portfoilo6.png'
import blog1 from './assets/blog/blog1.png'
import blog2 from './assets/blog/blog2.png'
import blog3 from './assets/blog/blog3.png'
import blog4 from './assets/blog/blog4.png'
import blog5 from './assets/blog/blog5.png'
import blog6 from './assets/blog/blog6.png'

export const Data = createSlice({
  name: "Organick",
  initialState: {
    products: [
      {
        category: "Vegetable",
        img: img1,
        name: "Calabrese Broccoli",
        oldPrice: 20,
        price: 13,
        rating: 5,
      },
      {
        category: "Fresh",
        img: img2,
        name: "Fresh Banana Fruites",
        oldPrice: 20,
        price: 14,
        rating: 5,
      },
      {
        category: "Millets",
        img: img3,
        name: "White Nuts",
        oldPrice: 20,
        price: 15,
        rating: 5,
      },
      {
        category: "Vegetable",
        img: img4,
        name: "Vegan Red Tomato",
        oldPrice: 20,
        price: 17,
        rating: 5,
      },
      {
        category: "Health",
        img: img5,
        name: "Mung Bean",
        oldPrice: 20,
        price: 11,
        rating: 5,
      },
      {
        category: "Nuts",
        img: img6,
        name: "Brown Hazelnut",
        oldPrice: 20,
        price: 12,
        rating: 5,
      },
      {
        category: "Fresh",
        img: img7,
        name: "Eggs",
        oldPrice: 20,
        price: 17,
        rating: 5,
      },
      {
        category: "Fresh",
        img: img8,
        name: "Zelco Suji Elaichi Rusk",
        oldPrice: 20,
        price: 15,
        rating: 5,
      },
      {
        category: "Health",
        img: img9,
        name: "Cucumber",
        oldPrice: 20,
        price: 11,
        rating: 5,
      },
      {
        category: "Nuts",
        img: img10,
        name: "White Hazelnut",
        oldPrice: 20,
        price: 12,
        rating: 5,
      },
      {
        category: "Fresh",
        img: img11,
        name: "Fresh Corn",
        oldPrice: 20,
        price: 17,
        rating: 5,
      },
      {
        category: "Fresh",
        img: img12,
        name: "Organic Almonds",
        oldPrice: 20,
        price: 15,
        rating: 5,
      },
      {
        category: "Vegetable",
        img: img13,
        name: "Cauliflower",
        oldPrice: 20,
        price: 11,
        rating: 5,
      },
      {
        category: "Vegetable",
        img: img14,
        name: "Cucumber",
        oldPrice: 20,
        price: 12,
        rating: 5,
      },
      {
        category: "Vegetable",
        img: img15,
        name: "Onion",
        oldPrice: 20,
        price: 17,
        rating: 5,
      },
      {
        category: "Vegetable",
        img: img16,
        name: "Cabbace",
        oldPrice: 20,
        price: 17,
        rating: 5,
      },
      {
        category: 'Spicy',
        img: img17,
        name: 'Food',
        oldPrice: 20,
        price: 15,
        rating: 5,
      },
      {
        category: 'Nuts & Feedsd',
        img: img18,
        name: 'Undefined',
        oldPrice: 20,
        price: 15,
        rating: 5,
      },
      {
        category: 'Fruits',
        img: img19,
        name: 'Pomegranate',
        oldPrice: 20,
        price: 15,
        rating: 5,
      },
      {
        category: 'Vegetable',
        img: img20,
        name: 'Potato',
        oldPrice: 20,
        price: 15,
        rating: 5,
      },
    ],
    teams: [
      {
        team: team1,
        name: "Giovani Bacardo",
        job: "Fermer",
        isInstagram: false,
        isFacebook: true,
        isTwitter: true,
      },
      {
        team: team2,
        name: "Marianne Loreno",
        job: "Designer",
        isInstagram: true,
        isFacebook: true,
        isTwitter: true,
      },
      {
        team: team3,
        name: "Riga Pelore",
        job: "Fermer",
        isInstagram: true,
        isFacebook: true,
        isTwitter: true,
      },
      {
        team: team4,
        name: "Keira Knightley",
        job: "Fermer",
        isInstagram: false,
        isFacebook: true,
        isTwitter: true,
      },
      {
        team: team5,
        name: "Scott Lawrence",
        job: "Designer",
        isInstagram: true,
        isFacebook: true,
        isTwitter: true,
      },
      {
        team: team6,
        name: "Karen Allen",
        job: "Fermer",
        isInstagram: true,
        isFacebook: true,
        isTwitter: true,
      },
    ],
    portfoilos: [
      {
        img: portfoilo1,
        name: 'Green & Tasty Lemon',
        job: 'Fruits'
      },
      {
        img: portfoilo2,
        name: 'Organic Carrot',
        job: 'Fermer'
      },
      {
        img: portfoilo3,
        name: 'Organic Betel Leaf',
        job: 'Leaf'
      },
      {
        img: portfoilo4,
        name: 'Natural Tomato',
        job: 'Fruits'
      },
      {
        img: portfoilo5,
        name: 'Black Raspberry',
        job: 'Fermer'
      },
      {
        img: portfoilo6,
        name: 'Honey Orange',
        job: 'Fermer'
      }
    ],

    blogs: [
      {
        date: '25 Now',
        img: blog1,
        user: 'By Rachi Card',
        title: 'The Benefits of Vitamin D & How to Get It',
        description: 'Simply dummy text of the printing and typesetting industry. Lorem Ipsum'
      },
      {
        date: '25 Now',
        img: blog2,
        user: 'By Rachi Card',
        title: 'Our Favorite Summertime Tomato',
        description: 'Simply dummy text of the printing and typesetting industry. Lorem Ipsum'
      },
      {
        date: '25 Now',
        img: blog3,
        user: 'By Rachi Card',
        title: 'Benefits of Vitamin C & How to Get It',
        description: 'Simply dummy text of the printing and typesetting industry. Lorem Ipsum'
      },
      {
        date: '25 Now',
        img: blog4,
        user: 'By Rachi Card',
        title: 'Research More Organic Foods',
        description: 'Simply dummy text of the printing and typesetting industry. Lorem Ipsum'
      },
      {
        date: '25 Now',
        img: blog5,
        user: 'By Rachi Card',
        title: 'Everyday Fresh Fruites',
        description: 'Simply dummy text of the printing and typesetting industry. Lorem Ipsum'
      },
      {
        date: '25 Now',
        img: blog6,
        user: 'By Rachi Card',
        title: 'Don’t Use Plastic Product! it’s Kill Nature',
        description: 'Simply dummy text of the printing and typesetting industry. Lorem Ipsum'
      },
    ],
    shopSingle: {}
  },
  reducers: {},
});