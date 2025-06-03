import React from 'react'
import Navbar from './components/Navbar'
import { Routes ,Route, useLocation} from 'react-router-dom'
import Home from './pages/Home'
import {Toaster, toast} from "react-hot-toast"
import Footer from './components/Footer'

function App() {
   
  const isSellerPath = useLocation().pathname.includes("seller");

  return (
    <div>
      {isSellerPath ? null : <Navbar/>} 

      <Toaster/>

      <div className={`${isSellerPath ? "" :"px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home/>}/>
        </Routes>
      </div>
      {!isSellerPath && <Footer/>}
    </div>
  )
}

export default App