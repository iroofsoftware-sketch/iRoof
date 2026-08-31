const AuxzonFooter = () => {
  return (
    <div className="w-full py-2 px-6 flex items-center justify-center bg-white border-t border-gray-200 mt-auto">
      <p className="text-xs text-gray-400 tracking-wide">
        Powered by{" "}
        <a
          href="https://www.auxzons.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#2a2291] hover:text-blue-700 transition-colors duration-200"
        >
          Auxzon Solutions Pvt. Ltd.
        </a>
        {" "}· © {new Date().getFullYear()} All rights reserved
      </p>
    </div>
  );
};
export default AuxzonFooter;
