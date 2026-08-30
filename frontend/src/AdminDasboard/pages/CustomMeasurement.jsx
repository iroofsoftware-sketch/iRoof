import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { getClient } from '../../api/admin/client/getClient';
import { getAllProjectType } from '../../api/sales/project/project';
import { getAllCategories } from '../../api/sales/project/project';
import { getSitevisitor } from '../../api/admin/employee/sitevistor';
import Header from "../../AdminDasboard/components/Header";
import Sidebar from "../../AdminDasboard/components/SideNav";
import { finalEstimate } from "../../api/admin/estimate/createEstimate";
import { getAllMaterialItem } from '../../api/admin/product/getAllCategories';

const CustomMeasurement = () => {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    
  // State Management
  const [areas, setAreas] = useState([
    { 
      id: 1, 
      clientId: '', 
      projectType: '', 
      roofModel: '', 
      roofPreference: '',
      span: '',
      length: '',
      height: '',
      typeOfPanel:'',
      offset:'',
      sheetThickness:'',
      numberofbay:'',
      extrapanel:'',
      materials: [{ material: '', quantity: '' }]
    }
  ]);

  const [clients, setClients] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [roofModels, setRoofModels] = useState([]);
  const [siteVisitors, setSiteVisitors] = useState([]);

  // Form States
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedSiteVisitor, setSelectedSiteVisitor] = useState('');

  // Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          clientResponse, 
          projectTypeResponse, 
          roofModelResponse, 
          siteVisitorResponse
        ] = await Promise.all([
          getClient(),
          getAllProjectType(),
          getAllCategories(),
          getSitevisitor()
        ]);

        setClients(clientResponse.data?.clients || []);
        setProjectTypes(projectTypeResponse.projectTypes || []);
        setRoofModels(roofModelResponse.categories || []);
        setSiteVisitors(siteVisitorResponse.data || []);
      } catch (error) {
        toast.error('Failed to fetch initial data');
        console.error('Data fetch error:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Client Search Functionality
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients([]);
      return;
    }

    const filtered = clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // Area Management Functions
  const addNewArea = () => {
    const newArea = {
      id: areas.length + 1,
      clientId: '',
      projectType: '',
      roofModel: '',
      roofPreference: '',
      span: '',
      length: '',
      height: '',
      typeOfPanel:'',
      offset:'',
      sheetThickness:'',
      numberofbay:'',
      extrapanel:'',
      materials: [{ material: '', quantity: '' }]
      
    };
    setAreas([...areas, newArea]);
  };

  const removeArea = (id) => {
    setAreas(areas.filter((area) => area.id !== id));
  };

  const updateAreaField = (areaId, field, value) => {
    const updatedAreas = areas.map((area) =>
      area.id === areaId ? { ...area, [field]: value } : area
    );
    setAreas(updatedAreas);
  };

  
  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate form data
    const isValid = areas.every((area) => 
      area.clientId && area.projectType && area.roofModel
    );
  
    if (!isValid) {
      toast.error('Please fill in all required fields for each area');
      return;
    }
    try {
      // Prepare submission data
      const submissionData = {
        siteVisitorId: selectedSiteVisitor,
        areas: areas.map((area) => ({
          clientId: area.clientId,
          projectType: area.projectType,
          roofModel: area.roofModel,
          roofPreference: area.roofPreference,
          dimensions: {
            span: area.span,
            length: area.length,
            height: area.height
          },
          typeOfPanel: area.typeOfPanel,
          offset: area.offset,
          sheetThickness: area.sheetThickness,
          numberofbay: area.numberofbay,
          extrapanel: area.extrapanel,
          materials: area.materials
        }))
      };
      
      // Call finalEstimate API with submission data
      const response = await finalEstimate(submissionData);
      
      if (response.success) {
        toast.success('Custom Measurement submitted successfully!');;
      } else {
        toast.error(response.message || 'Failed to submit custom measurement');
      }
    } catch (error) {
      toast.error('Failed to submit custom measurement');
      console.error('Submission error:', error);
    }
  };
  useEffect(() => {
    
      fetchRoofModels();
     
    }, []);
   const fetchRoofModels = async () => {
      try {
        const response = await getAllCategories();
        setRoofModels(response.categories || []);
      } catch (error) {
        console.error("Error fetching roof models:", error);
      }
    };

    const [showDropdown, setShowDropdown] = useState(null);
    const [allMaterials, setAllMaterials] = useState([]);
  
    useEffect(() => {
      const getAllMaterialItems = async () => {
        try {
          const response = await getAllMaterialItem();
          console.log('Fetched material items:', response);
          setAllMaterials(response.items || []);
        } catch (error) {
          console.error('Error fetching materials:', error);
        }
      };
      getAllMaterialItems();
    }, []);
  
    const selectMaterial = (index, material) => {
      const selectedMaterial = {
        itemId: material._id,
        itemName: material.item,
        unit: 1,
      };
  
      setItemForm((prevState) => {
        const updatedMaterials = [...prevState.materials];
        updatedMaterials[index] = selectedMaterial;
        return { ...prevState, materials: updatedMaterials };
      });
  
      setShowDropdown(null);
    };
  
// Update the material management functions
const addNewMaterial = (areaId) => {
  const updatedAreas = areas.map((area) =>
    area.id === areaId
      ? {
          ...area,
          materials: [...area.materials, { material: '', quantity: '' }]
        }
      : area
  );
  setAreas(updatedAreas);
};

const updateMaterial = (areaId, materialIndex, field, value) => {
  const updatedAreas = areas.map((area) =>
    area.id === areaId
      ? {
          ...area,
          materials: area.materials.map((material, index) =>
            index === materialIndex ? { ...material, [field]: value } : material
          )
        }
      : area
  );
  setAreas(updatedAreas);
};

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Header toggleSidebar={toggleSidebar} />
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">
          Custom Measurement Form
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Visitor Selection */}
          {/* Areas Section */}
          {areas.map((area, index) => (
            <div 
              key={area.id} 
              className="bg-white shadow-md rounded-lg p-6 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-700">
                  Area {area.id}
                </h2>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeArea(area.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              {/* Client Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Client"
                    className="w-full border border-gray-300 rounded-md p-2 pl-8"
                  />
                  <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
                  {filteredClients.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <li
                          key={client._id}
                          onClick={() => {
                            updateAreaField(area.id, 'clientId', client._id);
                            setSearchTerm(client.name);
                            setFilteredClients([]);
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {client.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* Project Details */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    value={area.projectType}
                    onChange={(e) => updateAreaField(area.id, 'projectType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select Project Type</option>
                    {projectTypes.map((type) => (
                      <option key={type._id} value={type.projectType}>
                        {type.projectType}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roof Model
                  </label>
                  <select
                    value={area.roofModel}
                    onChange={(e) => updateAreaField(area.id, 'roofModel', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select Roof Model</option>
                    {roofModels.map((model) => (
                      <option key={model._id} value={model.roofModel}>
                        {model.roofModel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roof Preference
                  </label>
                  <select
                    value={area.roofPreference}
                    onChange={(e) => updateAreaField(area.id, 'roofPreference', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select Preference</option>
                    <option value="double-parking">custom</option>
            
                  </select>
                </div>
              </div>
           {/* Dimensions */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Span
                  </label>
                  <input
                    type="text"
                    value={area.span}
                    onChange={(e) => updateAreaField(area.id, 'span', e.target.value)}
                    placeholder="Enter Span"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <input
                    type="text"
                    value={area.length}
                    onChange={(e) => updateAreaField(area.id, 'length', e.target.value)}
                    placeholder="Enter Length"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="text"
                    value={area.height}
                    onChange={(e) => updateAreaField(area.id, 'height', e.target.value)}
                    placeholder="Enter Height"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4 mb-4'>
                         <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type of Panel</label>
                      <input
                        type="text"
                        value={area.typeOfPanel}
                        onChange={(e) => updateAreaField(area.id, 'typeOfPanel', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Offset</label>
                      <input
                        type="text"
                        value={area.offset}
                        onChange={(e) => updateAreaField(area.id, 'offset', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sheet Thickness</label>
                      <input
                        type="text"
                        value={area.sheetThickness}
                        onChange={(e) => updateAreaField(area.id, 'sheetThickness', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    </div>
{/* -------------------------------------------------------- */}
                      <div className='grid grid-cols-2 gap-4 mb-4'>
                         <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">No.of bay</label>
                      <input
                        type="text"
                        value={area.numberofbay}
                        onChange={(e) => updateAreaField(area.id, 'numberofbay', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">extra panels</label>
                      <input
                        type="text"
                        value={area.extrapanel}
                        onChange={(e) => updateAreaField(area.id, 'extrapanel', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div> 
                    </div>
              {/* Materials Section */}
              {area.materials.map((material, materialIndex) => (
  <div key={materialIndex} className="grid grid-cols-2 gap-4 mb-4">
    <div className="flex flex-col gap-2 relative">
      <label className="text-sm font-medium text-[#15164A]">Material</label>
      <select
        value={material.material}
        onChange={(e) => updateMaterial(area.id, materialIndex, 'material', e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2"
      >
        <option value="">Select Material</option>
        {allMaterials.map((mat) => (
          <option key={mat._id} value={mat._id}>
            {mat.item}
          </option>
        ))}
      </select>
    </div>
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#15164A]">Quantity</label>
      <input
        type="text"
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Quantity"
        value={material.quantity}
        onChange={(e) => updateMaterial(area.id, materialIndex, 'quantity', e.target.value)}
      />
    </div>
  </div>
))}
             <button
                type="button"
                onClick={() => addNewMaterial(area.id)}
                className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </button>
            </div>
          ))}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addNewArea}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Area
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Site Visitor
            </label>
            <select
              value={selectedSiteVisitor}
              onChange={(e) => setSelectedSiteVisitor(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Site Visitor</option>
              {siteVisitors.map((visitor) => (
                <option key={visitor._id} value={visitor._id}>
                  {visitor.name}
                </option>
              ))}
            </select>
          </div>
          <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Square Feet
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 font-semibold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Cost
                  </label>
                  <input
                    type="text"
                     className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 font-semibold text-gray-800"
                  />
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button type='submit'
                  className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors">
                  Create Estimate
                </button>
              </div>
            </div>
        </form>
      </div>
    </div>
    </div>
    </div>
  );
};

export default CustomMeasurement;