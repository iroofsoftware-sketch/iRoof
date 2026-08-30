import { Route, Routes } from 'react-router-dom'
import AddnewClients from '../../AdminDasboard/pages/AddnewClients'
import AdminDashboard from '../../AdminDasboard/Dashboard/AdminDashboard'
import Customers from '../../AdminDasboard/pages/Customers'
import Employees from '../../AdminDasboard/pages/Employees'
import AddNewEmployee from '../../AdminDasboard/pages/AddnewEmployee'
import Projects from '../../AdminDasboard/pages/Projects'
import Estimate from '../../AdminDasboard/pages/Estimate'
import Rates from '../../AdminDasboard/pages/Rates'
import ProductsAdding from '../../AdminDasboard/pages/ProductsAdding'
import CostAdding from '../../AdminDasboard/pages/CostAdding'
import Settings from '../../AdminDasboard/pages/Settings'
import ForgotPassword from "../../common/ForgotPassword"
import ResetPassword from "../../common/ResetPassword"
import CustomerDetailpage from '../../AdminDasboard/pages/CustomerDetailpage'
import AdminExistingMaterial from '../../AdminDasboard/pages/AdminExistingMaterial'
import CustomMeasurement from "../../AdminDasboard/pages/CustomMeasurement"
import FindProductView from '../../AdminDasboard/pages/FindProductView'

const AdminRoutes = () => {
    return (

            <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="customers" element={<Customers />} />
                <Route path="addnewclient" element={<AddnewClients />} />
                <Route path="employees" element={<Employees />} />
                <Route path="addnewemployee" element={<AddNewEmployee />} />
                <Route path="projects" element={<Projects />} />
                <Route path="estimate" element={<Estimate />} />
                <Route path="rates" element={<Rates />} />
                <Route path="productsadding" element={<ProductsAdding />} />
                <Route path="costadding" element={<CostAdding />} />
                <Route path="settings" element={<Settings />} />
                <Route path="customerDetailPage" element={<CustomerDetailpage />} />
                <Route path="adminexistingMaterial" element={<AdminExistingMaterial />} />
                <Route path="custommeasurement" element={<CustomMeasurement/>} />
                <Route path="findproductview" element={<FindProductView/>} />
         
            </Routes>

    )
}

export default AdminRoutes
