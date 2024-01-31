import React from "react";
import Lordicon from './Icon'
import localFont from "next/font/local";
import { UserButton, useUser } from "@clerk/nextjs";



const noir = localFont({
    src: [
      {
        path: "./fonts/NoirPro-Light.ttf",
        weight: "200",
        style: "normal",
      },
      {
        path: "./fonts/NoirPro-Regular.ttf",
        weight: "400",
        style: "normal",
      },
      {
        path: "./fonts/NoirPro-Bold.ttf",
        weight: "700",
        style: "normal",
      },
    ],
  });



const Header = () => {
  // const {user,isLoaded} = useUser();
  return (
    <div>
      <header style={{boxShadow:"rgba(37,39,89,0.08) 0px 8px 8px 0",display:"flex",alignItems:'center',paddingLeft:'80px'}}>
        <Lordicon/>
        <h1 className={noir.className}>Shoppy Scan</h1>
        {/* {isLoaded && user && (
          <UserButton afterSignOutUrl="/"/>
        )} */}
      </header>
    </div>
  );
};

export default Header;
