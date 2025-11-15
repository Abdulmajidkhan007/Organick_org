import React from 'react'
import { useSelector } from 'react-redux'

export const Redux = () => {


    const value = useSelector(state=>state.products.products)
    console.log(value);
    
  return (
    <div>Redux</div>
  )
}
