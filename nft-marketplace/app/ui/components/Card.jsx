import React from "react";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "../common/RoutePaths";

import {
  marketplaceAddress
} from '../../../config'

export const Card = ({
  children,
  className = '',
  itemImg = null,
  itemName = null,
  itemPrice = null,
  itemId = null,
  badge = '',
  loggedInAddress = '',
  nft = null,
  serialNumber = 'N/A',
  monthlyRevenue = '',
  itemCountry = 'Other',
  remaining_payments = 240
}) => {
  const badgeBackgroundColor = (badge === "owned") ? "bg-burst" : (badge === "for sale") ? "bg-dodger" : "bg-rhino";
  return (
    <div className={`cursor-pointer ${className}`} onClick={() => window.open(`${RoutePaths.DETAILS}/${itemId}`, target="_blank")}>
      <div className="relative rounded-t-lg max-h-80 flex items-center overflow-hidden">
        {badge && (
          <p className={`absolute top-0 left-0 text-small text-white font-medium uppercase rounded-br-lg py-1 px-2 ${badgeBackgroundColor}`}>{badge}</p>
        )}
        <img 
        style={{
          objectFit: "cover",
          height: "200px",
          background: "white"
        }}
        className="w-full" src={itemImg.replace("ipfs.infura.io", "blockhouse.infura-ipfs.io")} />
      </div>
      <div className="rounded-b-xl bg-white p-4">
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino">{itemName} ({itemCountry})</p>
          <p className="text-p text-manatee">HouseT #{itemId}</p>
        </div>
        
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b>{(badge === "owned" || badge === "staked") ? "Book value:" : "Listing price:"}</b> {itemPrice} USDC</p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b>Est. income: </b> ~ ${monthlyRevenue}/month</p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b>Remaining payments: </b> {remaining_payments}</p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b>Est. IRR: </b> <span style={{fontSize: "20px"}}>~ 14%</span></p>
        </div>
      </div>
    </div>
  );
}
