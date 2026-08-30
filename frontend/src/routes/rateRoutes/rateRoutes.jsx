import { Route, Routes } from 'react-router-dom'
import Materials from '../../RatesDashboard/pages/Materials'
import ThicknessRate from '../../RatesDashboard/pages/ThicknessRate'
import EditThicknessRate from '../../RatesDashboard/pages/EditThicknessRate'
import Transportation from '../../RatesDashboard/pages/Transportation'
import SettingsRate from '../../RatesDashboard/pages/SettingsRate'
import ExistingMaterial from '../../RatesDashboard/pages/ExistingMaterial'

const rateRoutes = () => {
    return (
        <>
            <Routes>
                <Route path="/materials" element={<Materials />} />
                <Route path="/thicknessrate" element={<ThicknessRate />} />
                <Route path="/editthicknessrate" element={<EditThicknessRate />} />
                <Route path="/transportation" element={<Transportation />} />
                <Route path="/ratesettings" element={<SettingsRate />} />
                <Route path="/existingmaterial" element={<ExistingMaterial />} />
               
            </Routes>
        </>
    )
}

export default rateRoutes


