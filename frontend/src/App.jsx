import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

import MainRoutes from "./routes/MainRoutes";
import { Provider } from "react-redux";
import store from "./redux/store/store";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <ToastContainer />
          <MainRoutes />
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
