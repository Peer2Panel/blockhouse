import React from 'react';
import { RoutePaths } from "./RoutePaths";
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { Link } from "react-router-dom";
import LanguageSelector from './LanguageSelector';
import i18n from 'meteor/universe:i18n';

export const NavBar = ({ connection, onConnect, loggedInAddress }) => {

  let navigation = [
    { name: i18n.getTranslation("Common.Explore"), href: RoutePaths.ROOT},
    { name: i18n.getTranslation("Common.Create"), href: RoutePaths.MINT_NFT },
  ];

  const admin = "0xd7dc5f52b0f586c5e1676cd0c9eb9db286341e74";
  if(loggedInAddress && (loggedInAddress.toLowerCase() == admin.toLowerCase())){
  }
  else{
    navigation = [navigation[0]];
  }
  return (
    <Disclosure as="nav" className="bg-rhino text-white py-2.5">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="flex-1 flex items-center justify-between sm:items-stretch">
                <div className="flex-shrink-0 flex items-center">
                  <Link to={RoutePaths.ROOT}><img id="logo" style={{maxWidth: "250px", position: "absolute"}} src="/images/Blockhouse_logo.png" alt="Meteor NFT"/></Link>
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex items-center space-x-4">
                    {navigation.map((item) => (
                      <Link className="px-3 py-2 border-y-2 border-transparent hover:border-b-orange text-p font-medium" to={item.href} key={item.href}>
                        {item.name}
                      </Link>
                    ))}

                    <div className="border-l border-lilac opacity-50 h-9"></div>

                    {connection ? (
                      <Link className="flex items-center border-y-2 border-transparent hover:border-b-orange px-3 py-2 text-p font-medium" to={`${RoutePaths.ACCOUNT}/${loggedInAddress}`}>
                        <img className="w-8 h-8 mr-2 rounded-full" src="/images/default-profile-avatar.png" alt="Profile avatar"/>
                        Account
                      </Link>
                    ) : (
                      <Link className="px-3 py-2 text-p font-medium" to={"#"} onClick={()=>onConnect()}>
                        {i18n.getTranslation("Common.Connect")}
                      </Link>
                    )}
                    <div style={{marginLeft: "0px"}}>
                      <LanguageSelector />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md border-2 border-charade">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6 text-charade" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6 text-charade" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu items */}
          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-charade">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.href}
                  as={Link}
                  to={item.href}
                  className="block px-3 py-2 text-p font-medium"
                >
                  {item.name}
                </Disclosure.Button>
              ))}

              {connection ? (
                <Disclosure.Button
                  as={Link}
                  to={`${RoutePaths.ACCOUNT}/${loggedInAddress}`}
                  className="flex items-center px-3 py-2 text-p font-medium"
                >
                  <img className="w-8 h-8 mr-2 rounded-full" src="/images/default-profile-avatar.png" alt="Profile avatar"/>
                  Account
                </Disclosure.Button>
              ) : (
                <Disclosure.Button
                  onClick={()=>onConnect()}
                  className="block px-3 py-2 text-p font-medium"
                >
                  {i18n.getTranslation("Common.Connect")}
                </Disclosure.Button>
              )}
              <Disclosure.Button>
                <div style={{marginLeft: "0px"}}>
                  <LanguageSelector />
                </div>
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
