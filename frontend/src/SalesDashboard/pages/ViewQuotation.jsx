import { useState } from "react";
import Header from "../../SalesDashboard/components/Header";
import Sidebar from "../../SalesDashboard/components/Sidebar";
import logo from "../../SalesDashboard/assets/images/logo.png";
import share from "../../SalesDashboard/assets/icons/share.png";
import download from "../../SalesDashboard/assets/icons/download.png";

function ViewQuotation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ">
        <Header toggleSidebar={toggleSidebar} />

        {/* Content Area */}
        <div className="p-6 bg-gray-100">
          {/* Logo Header */}

          {/* Quotation Details */}
          <div className="mt-6 bg-white p-8 rounded-md shadow-md">
            <div className="bg-[#2C2393] flex justify-between items-center px-10 py-6 rounded-md shadow-md">
              <div>
                {" "}
                <img className="w-32" src={logo} alt="Logo" />
              </div>
              <div className="md:pr-40">
                <h1 className="text-white font-normal text-4xl ">
                  IROOFING ENTERPRISES
                </h1>
              </div>
            </div>

            <div className="p-5">
              <p className="text-gray-800 text-lg">
                <strong>To,</strong>
              </p>
              <div className="ml-4 text-gray-600">
                <p>Amal</p>
                <p>Location</p>
                <p>Phone Number</p>
              </div>

              <p className="mt-6 text-gray-800 text-lg">
                <strong>Sub:</strong> Construction of Truss Less Roofing -{" "}
                <span className="font-semibold">Project Name</span>
              </p>
              <p className="mt-2 text-gray-800">
                <strong>Ref:</strong> Estimate No.{" "}
                <span className="font-semibold">
                  IRE/TS/STC/(Quotation number)/(Financial year)
                </span>
              </p>
              <p className="mt-2 text-gray-800">
                <strong>Date:</strong> -
              </p>

              <p className="mt-6 font-sans">
                Dear Sir,
                <br />
                <br />
                We are extremely thankful to you for giving us the opportunity
                to submit our proposal for your project. Kindly review our
                techno-commercial offer for material supply and installation. We
                hope that you will find our proposal satisfactory and wish to
                thank you again for your interest shown in our company. Assuring
                you our best service and looking forward to associate with you.
              </p>

              <p className="mt-6">
                <strong>Thanking you,</strong>
              </p>
              <div className="mt-6 text-gray-800">
                <p>Yours Faithfully,</p>
                <p className="font-semibold">Johny Menacherry</p>
                <p>Managing Partner</p>
                <p>Mob: +91 9633508983</p>
                <p>
                  Mail:
                  <a
                    href="mailto:iroofingprojects@gmail.com"
                    className="text-blue-700 underline"
                  >
                    iroofingprojects@gmail.com
                  </a>
                </p>
                <p className="px-9">
                  <a
                    href="mailto:iroofingprojects@gmail.com"
                    className="text-blue-700 underline"
                  >
                    {" "}
                    iroofingenterprises@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
          {/* -------------------------------------------------------------- */}
          <div className="mt-6 bg-white p-8 rounded-md shadow-md">
            <p className="mt-6">
              <strong className="underline text-black">
                Quotation Details: To be filled according to the requirement
              </strong>
              <div className="leading-relaxed py-10 space-y-4">
                <p>
                  Total span :<span className="px-5">00m</span>
                </p>
                <p>
                  Total length :<span className="px-5">00m</span>
                </p>
                <p>
                  Total height :<span className="px-5">00m</span>
                </p>
                <p>
                  Total Area :<span className="px-5">00m</span>
                </p>
                <p>
                  Total Sheeting :<span className="px-5">00m</span>
                </p>
                <p>
                  Total Cost :<span className="px-5">00m</span>
                </p>
              </div>
            </p>

            <p className="mt-6">
              <strong className="underline text-black">Scope of Work:</strong>
              <ul className="list-disc pl-6 mt-4">
                <li className="text-justify">
                  Provision of coil, production of panels with the specified
                  width, and fabrication of self-supported, truss-less arch
                  roofing using Galvalume material in off-white, blue, green, or
                  terracotta colors with the specified thickness.
                </li>
                <li>
                  High-grade (8.8) bolts will be used at the edges to secure the
                  sheets to the structural beams.
                </li>
                <li>
                  Worker insurance and transportation are included in the scope.
                </li>
                <li>Structural fabrication and erection are included.</li>
                <li>
                  One coat of epoxy coating for structural members is provided,
                  while enamel painting for structural members can be added at
                  an additional cost upon request.
                </li>
                <li>
                  Supply and installation of foundation bolts are covered.
                </li>
                <li>Gutter works with adequate drops are included.</li>
              </ul>
            </p>

            <p className="mt-6">
              <div className="flex justify-center items-center">
                <strong className="underline text-black text-xl">
                  Important Notes for the Client:
                </strong>
              </div>

              <ul className="list-disc pl-6 mt-4">
                <li>
                  Zinc dipping for MS gutters can be provided at an additional
                  cost of ₹35 per kg + 18% GST for enhanced corrosion
                  resistance.
                </li>
                <li>
                  Civil works, including earthwork excavation, PCC, and RCC
                  concreting, fall under the client's scope.
                </li>
                <li>
                  Structural details and drawings will be shared only upon
                  confirmation and receipt of advance payment.
                </li>
                <li>
                  Installation of downspouts using PVC pipes (plumbing works) is
                  the client's responsibility.
                </li>
                <li>
                  Unloading charges arising from union-related issues will be
                  borne by the client.
                </li>
                <li>
                  The specified area is approximate; the final invoice will be
                  based on the actual dimensions of the completed roof.
                  Variations in the quoted area will be adjusted at ₹170 per
                  square foot + 18% GST. All other costs remain unchanged.
                </li>
                <li>
                  The client must ensure the availability of electricity and
                  water within 10 meters of the work site.
                </li>
                <li>
                  Proper access for machinery, tools, and manpower must be
                  provided by the client.
                </li>
                <li>
                  The client shall arrange safe storage for machinery and tools,
                  as well as appropriate resting and restroom facilities for
                  workers at the site.
                </li>
                <li>
                  The quoted rates include the required materials, machinery,
                  labor, and consumables for the project. Excess materials or
                  site waste remain the property of I Roofing Enterprises and
                  will be removed after project completion.
                </li>
                <li>
                  Additional charges will apply for any required lighting
                  fixtures/hangers and solar panel fixing clamps.
                </li>
                <li>
                  Work will commence only after the advance payment is received.
                </li>
                <li className="text-red-600">
                  For any additional works not covered in the current quotation,
                  I Roofing Enterprises will provide a separate quotation
                  through a third party.
                </li>
              </ul>
            </p>
          </div>

          {/* ----------------------------- */}

          <div className="mt-6 bg-white p-8 rounded-md shadow-md">
            <p className="mt-6">
              <strong className="underline text-black">
                Material Specification
              </strong>
              <ul className="list-disc pl-6 mt-4 space-y-4">
                <li className="text-justify">AZ 150 Gsm Galvalume Sheet</li>
                <li>Brand: - Dongkuk or Bhushan or JSW</li>
                <li>
                  Thickness: - 0.6 mm/0.8 mm /0.9 mm/1 mm/1.1 mm/1.2 mm/1.3
                  mm/1.4 mm
                </li>
                <li>Sheet Profile:- 305 mm/ 701 mm/ 601 mm</li>
                <li>Color:- Off-white, Blue, Grey or Terracotta.</li>
                <li>Tolerance: - +/- 0.02mm</li>
              </ul>
            </p>

            <p className="mt-6">
              <strong className="underline text-black">Payment Terms:</strong>
              <ul className="list-disc pl-6 mt-4 space-y-4">
                <li className="text-justify">
                  50% advance along with purchase order.
                </li>
                <li>30% on material delivery.</li>
                <li>20% after completion of roofing work.</li>
                <li>
                  Please contact accounts (Jini - 95444 52700) for any further
                  clarifications or doubts.
                </li>
              </ul>
            </p>
            <div className="flex justify-center items-center py-14 ">
              <div className="bg-[#ddd9c3] py-10 px-24">
                <h2 className="underline text-black font-bold text-xl">
                  Our Bank Details:-I Roofing Enterprises
                </h2>
                <p className="font-semibold text-lg">A/c no. 856830150000004</p>
                <p className="font-semibold text-lg">
                  IFSC Code: - BKID0008568
                </p>
                <p className="font-semibold text-lg">GSTIN:-32AAEFI5566M123</p>
                <p className="font-semibold text-lg">
                  BANK OF INDIA, UDYOGAMANDAL
                </p>
                <p className="font-semibold text-lg">
                  Mob No: 9633508932, 9037635433
                </p>
              </div>
            </div>
          </div>

          {/* -------------------------------- */}
        </div>
        <div className="flex justify-end items-center gap-3 px-14 py-10 md:pr-28">
          <button className="border border-black p-2 flex justify-center items-center gap-1 text-[#5B5B5B] px-5 rounded-md">
            <img src={share} alt="" />
            Share
          </button>

          <button className="border border-black p-2 flex justify-center items-center gap-1 text-[#5B5B5B] px-5 rounded-md ">
            <img src={download} alt="" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewQuotation;
