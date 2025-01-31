import { Route, Routes, BrowserRouter,Navigate } from "react-router-dom";
import Category from "./Page/MasterFood/Category";
import Ingredients from "./Page/MasterFood/Ingredients";
import Unit_of_Measurement from "./Page/MasterFood/Unit_of_Measurement";
import NewPurchase from "./Page/Purchase/NewPurchase";
import Navbar from "./Components/Navbar";
import PurchaseHistory from "./Page/Purchase/PurchaseHistory";
import ApprovPurchase from "./Page/Purchase/ApprovPurchase";
import NewRecipe from "./Page/Recipe/NewRecipe";

function App() {

  return (
    <BrowserRouter basename="ingredients">
      <div className="flex">
        <Navbar />
        <div className="flex-1 ml-52 p-14"> 
          <Routes>
            <Route path="/Recipe/New" element={<NewRecipe/>} />
            <Route path="/Purchase/Approve" element={<ApprovPurchase/>}/>
            <Route path="/Purchase/New" element={<NewPurchase />} />
            <Route path="/Purchase/History" element={<PurchaseHistory/>}/>
            <Route path="/" element={<Navigate to="/Purchase/New" />} />
            <Route path="/MasterFood/Ingredients" element={<Ingredients />} />
            <Route path="/MasterFood/Unit_of_Measurement" element={<Unit_of_Measurement />} />
            <Route path="/MasterFood/Category" element={<Category />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
