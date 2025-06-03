import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/bestSeller'
import BottomBanner from '../components/BottomBanner'

export default function Home() {
  return (
    <div className='mt-10'>
      <MainBanner/>
      <Categories/>
      <BestSeller/>
      <BottomBanner/>
    </div>
  )
}
