import React from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

const LayoutWithNav: React.FC = () => {
  return (
    <div>
      <Navigation />
      <Outlet />
    </div>
  );
};

export default LayoutWithNav;
