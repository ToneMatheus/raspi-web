import React from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import BackgroundVideo from './BackgroundVideo';

const LayoutWithNav: React.FC = () => {
  return (
    <div>
      <BackgroundVideo />
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* <Navigation /> */}
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutWithNav;
