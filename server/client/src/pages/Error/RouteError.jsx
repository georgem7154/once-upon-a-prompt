import React from 'react';
import { Link } from 'react-router-dom';

const RouteError = () => {
  return (
    <div className="fixed overflow-hidden w-full h-screen">
      <div className="bg-cover bg-center overflow-hidden bg-[url('/routenotfound.jpg')] w-full h-screen">
        <div className="text-white h-screen w-screen flex flex-col justify-center items-center">
          <div className="font-mystery text-9xl max-sm:text-7xl">ERROR</div>
          <div className="font-press text-red-600">PAGE NOT FOUND</div>
          <Link to='/'><div className="font-mystery mt-5 cursor-pointer hover:font-press">GO TO HOMEPAGE🏠</div></Link>
        </div>
      </div>
    </div>
  );
};

export default RouteError;