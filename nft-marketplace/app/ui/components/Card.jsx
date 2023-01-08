import React from "react";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "../common/RoutePaths";

import {
  marketplaceAddress
} from '../../../config'

export const Card = ({
  children,
  groupedByHouse = false,
  num_tokens = 0,
  min_price = 0,
  max_price = 0,
  setSelectedHouse = () => {},
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
    <div className={`cursor-pointer ${className}`} onClick={() => num_tokens == 0 ? window.open(`${RoutePaths.DETAILS}/${itemId}`, target="_blank") : setSelectedHouse(itemName)}>
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
      <div className="rounded-b-xl bg-white p-4" style={{"padding": "30px"}}>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino">{itemName} ({itemCountry})</p>
        </div>
        {groupedByHouse ? 
          <div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b>Total price:</b> CHF 1'250'000.–</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b>Availability:</b>{num_tokens > 1 ? <span> {num_tokens} / 500 tokens</span> : <span> 1 token</span>}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b>{(badge === "owned" || badge === "staked") ? "Book value:" : "Token price:"}</b>{num_tokens > 1 ? <span> ${min_price} - ${max_price}</span> : <span> ${max_price}</span>}</p>
            </div>
          </div>
        :
          <div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b>Total price:</b> CHF 1'250'000.–</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-p text-rhino"><b>{(badge === "owned" || badge === "staked") ? "Book value:" : "Token price:"}</b> {itemPrice} USDC</p>
            </div>
          </div>
        }
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b>Rent per token: </b> CHF {monthlyRevenue} / month</p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b>Rent start date: </b> 01.05.2023</p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-p text-rhino"><b>Est. IRR: </b> <span style={{fontSize: "20px"}}>~ 8%</span></p>
        </div>
      </div>
    </div>
  );
}
