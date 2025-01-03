import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddProduct from './UserComponet/AddProduct';
import UpdateProduct from './UserComponet/UpdateProduct';
import Login from './UserComponet/Login';
import Register from './UserComponet/Register';
import Protected from './UserComponet/Protected';
import ProductList from './UserComponet/ProductList';
import PageNotFound from './UserComponet/PageNotFound'; // Import PageNotFound
import ProfilePopup from './UserComponet/ProfilePopup';
import About from './UserComponet/About';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Protected Routes */}
          <Route path="/add-product" element={<Protected Cmp={AddProduct} />} />
          <Route path="/update-product/:id" element={<Protected Cmp={UpdateProduct} />} />
          <Route path="/" element={<Protected Cmp={ProductList} />} />
          <Route path='/about' element={<Protected Cmp={About}/>} />

          {/* Profile Route */}
          <Route path="/profile" element={<Protected Cmp={ProfilePopup} />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Catch-All Route for 404 Page */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
