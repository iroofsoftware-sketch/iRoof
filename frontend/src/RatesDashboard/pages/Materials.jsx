import { useState ,useEffect} from "react";
import Header from "../../RatesDashboard/components/Header";
import Sidebar from "../../RatesDashboard/components/Sidebar";
import { useNavigate } from "react-router-dom";
import { addMaterial } from "../../api/admin/materials/addmaterials";
import { getAllMaterials } from "../../api/admin/materials/additem";
import { itemAdding } from "../../api/admin/materials/additem";

const Materials = () => {
  const [activeTab, setActiveTab] = useState("Materials");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isPopupVisible2, setIsPopupVisible2] = useState(false);
 
 
  const navigate = useNavigate();
  const handlePopupToggle = () => {
    setIsPopupVisible(!isPopupVisible);
  };
  const handlePopupToggle2 = () => {
    setIsPopupVisible2(!isPopupVisible2);
  };





  const [materialForm, setMaterialForm] = useState({
    material: "",
    ratePerKg: "",
    includingTax: "",
    bendingCostschannelPerMeter: "",
    bendingCostsgutterPerMeter: "",
  });

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setMaterialForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  
// Submit Materials
const handleMaterialSubmit = async (e) => {
e.preventDefault();
try {
  await addMaterial(materialForm);
  alert("Material added successfully!");
  setMaterialForm({
    material: "",
    ratePerKg: "",
    includingTax: "",
    bendingCostschannelPerMeter: "",
    bendingCostsgutterPerMeter: "",
  });
} catch (error) {
  alert(error || "An error occurred while adding material.");
}
};  

// --------------------------------------------------


const [materials, setMaterials] = useState([]);

// Fetch materials when component mounts
useEffect(() => {
const fetchMaterials = async () => {
  try {
    const materialsData = await getAllMaterials();
    setMaterials(materialsData); // Store materials in state
    console.log("Fetched materials:", materialsData);
  } catch (error) {
    console.error("Error fetching materials:", error);
  }
};

fetchMaterials();
}, []);



const [itemForm, setItemForm] = useState({
categoryId: "",
item: "",
quantity: "",
ratePerMeter: "",
stdKg: "",
kgPerMeter: "",
surfaceAreaPerMeter: "",
paintingCostOrZinkDippingCost: "",
finalPerMeter: "",
});

// Function to handle form submission
const itemhandleSubmit = async (e) => {
e.preventDefault(); // Prevent page reload

// ✅ Validation: Ensure required fields are filled
if (!itemForm.categoryId || !itemForm.item || !itemForm.quantity) {
  alert("Please fill all required fields.");
  return;
}

// ✅ Convert numeric values to numbers
const formattedData = {
  ...itemForm,
  quantity: Number(itemForm.quantity) || 0,
  ratePerMeter: Number(itemForm.ratePerMeter) || 0,
  stdKg: Number(itemForm.stdKg) || 0,
  kgPerMeter: Number(itemForm.kgPerMeter) || 0,
  surfaceAreaPerMeter: Number(itemForm.surfaceAreaPerMeter) || 0,
  paintingCostOrZinkDippingCost: Number(itemForm.paintingCostOrZinkDippingCost) || 0,
  finalPerMeter: Number(itemForm.finalPerMeter) || 0,
};

console.log("Submitting item form:", formattedData); // Debugging

try {
  const response = await itemAdding(formattedData);
  console.log("Item added successfully:", response);
  alert("Item added successfully!");
} catch (error) {
  console.error("Error adding item:", error);
  alert("Failed to add item. Please try again.");
}
};







 
  return (
    <>
      <div className="flex h-screen  bg-gray-100">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
 
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="px-5 mt-3">
           
          </div>
 
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4">
            {/* Tab Content */}
            <div>
          
              <div>
                <form onSubmit={handleMaterialSubmit}>
                <h2 className="text-2xl font-bold mb-4">Materials</h2>
                <div className="flex flex-col gap-3  ">
                    <label className="text-sm font-medium text-[#15164A]">
                     Material Name
                    </label>
                    <input
        type="text"
        name="material"
        className="flex-1 p-2 border border-gray-300 rounded-md w-80"
        placeholder="Material Name"
        value={materialForm.material}
        onChange={handleMaterialChange}
      />
                  </div>
 
                <div className="grid grid-cols-1 md:grid-cols-3  md:pt-10 gap-3 ">
                  {/* Row 1 */}
                  <div className="flex flex-col gap-3  ">
                    <label className="text-sm font-medium text-[#15164A]">
                      Rate Per Meter
                    </label>
                    <input
          type="number"
          name="ratePerKg"
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="1"
          value={materialForm.ratePerKg}
          onChange={handleMaterialChange}
        />
                  </div>
                  <div className="flex flex-col gap-3 ">
                    <label className="text-sm font-medium text-[#15164A]">
                      Including Tax
                    </label>
                    <input
          type="number"
          name="includingTax"
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="1"
          value={materialForm.includingTax}
          onChange={handleMaterialChange}
        />
                  </div>
                  {/* <div className="flex flex-col gap-3 ">
                    <label className="text-sm font-medium text-[#15164A]">
                      Last Updated Date
                    </label>
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                      placeholder="1"
                   
                    />
                  </div> */}
 
                  {/* Row 2 */}
                </div>
                <div className="flex justify-left items-center  md:pt-5 gap-28 ">
                  <div className="flex flex-col ">
                    <label className="text-sm font-medium text-[#15164A]">
                      Bending Cost For C Channel Per Meter
                    </label>
                    <input
          type="number"
          name="bendingCostschannelPerMeter"
          className="flex-1 p-2 border border-gray-300 rounded-md w-[480px] mt-3"
          value={materialForm.bendingCostschannelPerMeter}
          onChange={handleMaterialChange}
          placeholder="Cost per meter"
        />
                  </div>
 
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-[#15164A]">
                      Bending Cost For Gutter Per Meter
                    </label>
                    <input
          type="number"
          name="bendingCostsgutterPerMeter"
          className="flex-1 p-2 border border-gray-300 rounded-md w-[480px]"
          value={materialForm.bendingCostsgutterPerMeter}
          onChange={handleMaterialChange}
          placeholder="Cost per meter"
        />
                  </div>
                </div>
                <div className="flex justify-center items-center gap-4 md:pt-10">
                  <button className="bg-blue-600 px-5  text-white py-2 rounded-md">
                    Add
                  </button>
                  <button className="bg-red-600 px-5 text-white py-2 rounded-md">
                    Cancel
                  </button>
                </div>
 

</form>

 
                <div
                onClick={() => navigate("/rates/existingmaterial")}
                className="cursor-pointer"
              >

                
                  <h5 className="text-right">Finding existing materials</h5>
               
                </div>

                <hr className="border-t border-gray-300 my-4" />


                {/* Items List */}
                {/* <div className="mt-6 grid sm:grid-cols-2 grid-cols-1 gap-2">
                  <div className="border p-4 rounded-lg">
                    <label className="block mb-2">
                      <input type="radio" name="item" className="mr-2" />
                      ISA 25*25*6mm
                    </label>
                  </div>
                </div> */}
                     <h2 className="text-2xl font-bold mb-4">Item</h2>
                     <form className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* First Column */}
      <div className="col-span-1 space-y-3">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Material Name</label>
          <select
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            value={itemForm.categoryId}
            onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
          >
            <option value="">Select</option>
            {materials.map((material) => (
              <option key={material._id} value={material._id}>
                {material.material}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Rate Per Meter</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.ratePerMeter}
            onChange={(e) => setItemForm({ ...itemForm, ratePerMeter: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Surface Area Per Meter</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.surfaceAreaPerMeter}
            onChange={(e) => setItemForm({ ...itemForm, surfaceAreaPerMeter: e.target.value })}
          />
        </div>
      </div>

      {/* Second Column */}
      <div className="col-span-1 space-y-3">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Item Name</label>
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="Item Name"
            value={itemForm.item}
            onChange={(e) => setItemForm({ ...itemForm, item: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Std.Kg</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.stdKg}
            onChange={(e) => setItemForm({ ...itemForm, stdKg: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Painting Cost/Zinc Dipping Cost</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.paintingCostOrZinkDippingCost}
            onChange={(e) => setItemForm({ ...itemForm, paintingCostOrZinkDippingCost: e.target.value })}
          />
        </div>
      </div>

      {/* Third Column */}
      <div className="col-span-1 md:space-y-3">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Quantity</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            value={itemForm.quantity}
            onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
            placeholder="1"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Kg/Meter</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.kgPerMeter}
            onChange={(e) => setItemForm({ ...itemForm, kgPerMeter: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Final Rate Per Meter</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.finalPerMeter}
            onChange={(e) => setItemForm({ ...itemForm, finalPerMeter: e.target.value })}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center items-center md:pt-10">
        <button
          className="bg-blue-600 px-5 text-white py-2 rounded-md"
          onClick={itemhandleSubmit}
        >
          Add
        </button>
        <button
          type="button"
          className="bg-red-600 px-5 text-white py-2 rounded-md ml-3"
          onClick={() => setItemForm({
            materialName: "",
            item: "",
            quantity: "",
            ratePerMeter: "",
            stdKg: "",
            kgPerMeter: "",
            surfaceAreaPerMeter: "",
            paintingCostOrZinkDippingCost: "",
            finalPerMeter: "",
          })}
        >
          Cancel
        </button>
      </div>
    </form>
               
              </div>
            
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
 
export default Materials;
 