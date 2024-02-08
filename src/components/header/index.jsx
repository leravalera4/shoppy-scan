import React from "react";
import localFont from "next/font/local";
import header from "../../app/images/header.png"
import Image from "next/image";


const noir = localFont({
    src: [
      {
        path: "../../app/fonts/NoirPro-Light.ttf",
        weight: "200",
        style: "normal",
      },
      {
        path: "../../app/fonts/NoirPro-Regular.ttf",
        weight: "400",
        style: "normal",
      },
      {
        path: "../../app/fonts/NoirPro-Bold.ttf",
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
      <Image alt="header" src={header} width={80} height={80}/>
        <h1 className={noir.className}>Shoppy Scan</h1>
      </header>
    </div>
  );
};

export default Header;
