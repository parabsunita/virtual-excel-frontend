import React from "react";
import ReactDOM from "react-dom/client";

import "antd/dist/reset.css"; // ✅ Ant Design base styles
import "./index.css"; // ✅ Tailwind styles included
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
